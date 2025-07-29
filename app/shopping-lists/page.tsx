"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ShoppingList {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  itemCount: number;
  completedItems: number;
}

export default function ShoppingListsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchLists();
    }
  }, [status, router]);

  const fetchLists = async () => {
    try {
      const response = await fetch("/api/shopping-lists");
      if (response.ok) {
        const data = await response.json();
        setLists(data);
      } else {
        console.error("Failed to fetch shopping lists");
      }
    } catch (error) {
      console.error("Error fetching shopping lists:", error);
    } finally {
      setLoading(false);
    }
  };

  const createNewList = async () => {
    if (!newListName.trim()) return;
    
    setCreating(true);
    try {
      const response = await fetch("/api/shopping-lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newListName.trim() }),
      });
      
      if (response.ok) {
        const newList = await response.json();
        setLists([newList, ...lists]);
        setNewListName("");
        setShowCreateForm(false);
      } else {
        console.error("Failed to create shopping list");
      }
    } catch (error) {
      console.error("Error creating shopping list:", error);
    } finally {
      setCreating(false);
    }
  };

  const handleCreateClick = () => {
    setShowCreateForm(true);
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
    setNewListName("");
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Shopping Lists</h1>
        {!showCreateForm && (
          <button
            onClick={handleCreateClick}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create New List
          </button>
        )}
      </div>

      {/* Create new list form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New Shopping List</h2>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="List name"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === "Enter" && createNewList()}
            />
            <button
              onClick={createNewList}
              disabled={creating || !newListName.trim()}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create"}
            </button>
            <button
              onClick={handleCancelCreate}
              className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {lists.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">No shopping lists yet</h2>
          <p className="text-gray-600 mb-6">Create your first shopping list to get started!</p>
          <button
            onClick={handleCreateClick}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            Create Your First List
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {lists.map((list) => (
            <Link
              key={list.id}
              href={`/shopping-list/${list.id}`}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer border border-gray-200"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{list.name}</h3>
                <span className="text-sm text-gray-500">
                  {new Date(list.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Items:</span>
                  <span className="font-medium">{list.itemCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Completed:</span>
                  <span className="font-medium text-green-600">{list.completedItems}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Remaining:</span>
                  <span className="font-medium text-orange-600">
                    {list.itemCount - list.completedItems}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{
                      width: list.itemCount > 0 ? `${(list.completedItems / list.itemCount) * 100}%` : '0%'
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {list.itemCount > 0 ? Math.round((list.completedItems / list.itemCount) * 100) : 0}% complete
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 