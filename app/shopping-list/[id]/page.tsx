"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import React from "react";

interface ShoppingItem {
  id: string;
  name: string;
  amount: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ShoppingList {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  items: ShoppingItem[];
}

export default function ShoppingListPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [shoppingList, setShoppingList] = useState<ShoppingList | null>(null);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({ name: "", amount: "" });
  const [addingItem, setAddingItem] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchShoppingList();
    }
  }, [status, router, id]);

  const fetchShoppingList = async () => {
    try {
      const response = await fetch(`/api/shopping-lists/${id}`);
      if (response.ok) {
        const data = await response.json();
        setShoppingList(data);
      } else if (response.status === 404) {
        router.push("/shopping-lists");
      } else {
        console.error("Failed to fetch shopping list");
      }
    } catch (error) {
      console.error("Error fetching shopping list:", error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async () => {
    if (!newItem.name.trim() || !newItem.amount.trim()) return;
    
    setAddingItem(true);
    try {
      const response = await fetch(`/api/shopping-lists/${id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newItem.name.trim(),
          amount: newItem.amount.trim(),
        }),
      });
      
      if (response.ok) {
        const newItemData = await response.json();
        setShoppingList(prev => prev ? {
          ...prev,
          items: [...prev.items, newItemData]
        } : null);
        setNewItem({ name: "", amount: "" });
      } else {
        console.error("Failed to add item");
      }
    } catch (error) {
      console.error("Error adding item:", error);
    } finally {
      setAddingItem(false);
    }
  };

  const toggleItem = async (itemId: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/shopping-lists/${id}/items/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !completed }),
      });
      
      if (response.ok) {
        const updatedItem = await response.json();
        setShoppingList(prev => prev ? {
          ...prev,
          items: prev.items.map(item => 
            item.id === itemId ? updatedItem : item
          )
        } : null);
      } else {
        console.error("Failed to update item");
      }
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/shopping-lists/${id}/items/${itemId}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        setShoppingList(prev => prev ? {
          ...prev,
          items: prev.items.filter(item => item.id !== itemId)
        } : null);
      } else {
        console.error("Failed to delete item");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addItem();
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (!shoppingList) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Shopping list not found</div>
      </div>
    );
  }

  const completedItems = shoppingList.items.filter(item => item.completed).length;
  const totalItems = shoppingList.items.length;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/shopping-lists"
          className="text-blue-600 hover:text-blue-800 transition flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Lists
        </Link>
        <h1 className="text-3xl font-bold">{shoppingList.name}</h1>
      </div>
      
      {/* Add new item form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Item</h2>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Item name"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="text"
            placeholder="Amount"
            value={newItem.amount}
            onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })}
            className="w-32 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            disabled={addingItem || !newItem.name.trim() || !newItem.amount.trim()}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            {addingItem ? "Adding..." : "Add"}
          </button>
        </div>
      </form>

      {/* Shopping list */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Shopping List</h2>
        </div>
        
        {shoppingList.items.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No items in your shopping list yet.</p>
            <p>Add some items above to get started!</p>
          </div>
        ) : (
          <div className="divide-y">
            {shoppingList.items.map((item) => (
              <div
                key={item.id}
                className={`px-6 py-4 flex items-center gap-4 ${
                  item.completed ? "bg-gray-50" : ""
                }`}
              >
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => toggleItem(item.id, item.completed)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                
                {/* Item name */}
                <span
                  className={`flex-1 ${
                    item.completed ? "line-through text-gray-500" : ""
                  }`}
                >
                  {item.name}
                </span>
                
                {/* Amount */}
                <span
                  className={`w-24 text-right ${
                    item.completed ? "text-gray-500" : "font-medium"
                  }`}
                >
                  {item.amount}
                </span>
                
                {/* Delete button */}
                <button
                  onClick={() => deleteItem(item.id)}
                  className="text-red-500 hover:text-red-700 transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {shoppingList.items.length > 0 && (
        <div className="mt-6 bg-white p-4 rounded-lg shadow-md">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">
              Total items: {totalItems}
            </span>
            <span className="text-gray-600">
              Completed: {completedItems}
            </span>
            <span className="text-gray-600">
              Remaining: {totalItems - completedItems}
            </span>
          </div>
        </div>
      )}
    </div>
  );
} 