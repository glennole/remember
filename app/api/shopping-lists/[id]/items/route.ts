import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// POST /api/shopping-lists/[id]/items - Add a new item to a shopping list
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, amount } = await req.json();

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Item name is required" }, { status: 400 });
    }

    if (!amount || typeof amount !== "string" || amount.trim().length === 0) {
      return NextResponse.json({ error: "Item amount is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await params;

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

    const item = await prisma.shoppingListItem.create({
      data: {
        name: name.trim(),
        amount: amount.trim(),
        shoppingListId: id,
      }
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("Error adding item to shopping list:", error);
    return NextResponse.json({ error: "Failed to add item to shopping list" }, { status: 500 });
  }
} 