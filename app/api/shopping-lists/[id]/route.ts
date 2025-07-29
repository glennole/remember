import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET /api/shopping-lists/[id] - Get a specific shopping list with its items
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;

    const shoppingList = await prisma.shoppingList.findFirst({
      where: { 
        id: id,
        userId: user.id 
      },
      include: {
        items: {
          orderBy: { createdAt: "asc" }
        }
      }
    });

    if (!shoppingList) {
      return NextResponse.json({ error: "Shopping list not found" }, { status: 404 });
    }

    return NextResponse.json(shoppingList);
  } catch (error) {
    console.error("Error fetching shopping list:", error);
    return NextResponse.json({ error: "Failed to fetch shopping list" }, { status: 500 });
  }
}

// PUT /api/shopping-lists/[id] - Update a shopping list
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await req.json();

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await params;

    const shoppingList = await prisma.shoppingList.findFirst({
      where: { 
        id: id,
        userId: user.id 
      }
    });

    if (!shoppingList) {
      return NextResponse.json({ error: "Shopping list not found" }, { status: 404 });
    }

    const updatedList = await prisma.shoppingList.update({
      where: { id: id },
      data: { name: name.trim() },
      include: {
        items: {
          orderBy: { createdAt: "asc" }
        }
      }
    });

    return NextResponse.json(updatedList);
  } catch (error) {
    console.error("Error updating shopping list:", error);
    return NextResponse.json({ error: "Failed to update shopping list" }, { status: 500 });
  }
}

// DELETE /api/shopping-lists/[id] - Delete a shopping list
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;

    const shoppingList = await prisma.shoppingList.findFirst({
      where: { 
        id: id,
        userId: user.id 
      }
    });

    if (!shoppingList) {
      return NextResponse.json({ error: "Shopping list not found" }, { status: 404 });
    }

    await prisma.shoppingList.delete({
      where: { id: id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting shopping list:", error);
    return NextResponse.json({ error: "Failed to delete shopping list" }, { status: 500 });
  }
} 