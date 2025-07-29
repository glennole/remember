import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../../../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// PUT /api/shopping-lists/[id]/items/[itemId] - Update a shopping list item
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, amount, completed } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id, itemId } = await params;

    // Verify the shopping list belongs to the user
    const shoppingList = await prisma.shoppingList.findFirst({
      where: { 
        id: id,
        userId: user.id 
      }
    });

    if (!shoppingList) {
      return NextResponse.json({ error: "Shopping list not found" }, { status: 404 });
    }

    // Verify the item belongs to the shopping list
    const item = await prisma.shoppingListItem.findFirst({
      where: { 
        id: itemId,
        shoppingListId: id 
      }
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const updateData: any = {};
    
    if (name !== undefined && typeof name === "string" && name.trim().length > 0) {
      updateData.name = name.trim();
    }
    
    if (amount !== undefined && typeof amount === "string" && amount.trim().length > 0) {
      updateData.amount = amount.trim();
    }
    
    if (completed !== undefined && typeof completed === "boolean") {
      updateData.completed = completed;
    }

    const updatedItem = await prisma.shoppingListItem.update({
      where: { id: itemId },
      data: updateData
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Error updating shopping list item:", error);
    return NextResponse.json({ error: "Failed to update shopping list item" }, { status: 500 });
  }
}

// DELETE /api/shopping-lists/[id]/items/[itemId] - Delete a shopping list item
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id, itemId } = await params;

    // Verify the shopping list belongs to the user
    const shoppingList = await prisma.shoppingList.findFirst({
      where: { 
        id: id,
        userId: user.id 
      }
    });

    if (!shoppingList) {
      return NextResponse.json({ error: "Shopping list not found" }, { status: 404 });
    }

    // Verify the item belongs to the shopping list
    const item = await prisma.shoppingListItem.findFirst({
      where: { 
        id: itemId,
        shoppingListId: id 
      }
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    await prisma.shoppingListItem.delete({
      where: { id: itemId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting shopping list item:", error);
    return NextResponse.json({ error: "Failed to delete shopping list item" }, { status: 500 });
  }
} 