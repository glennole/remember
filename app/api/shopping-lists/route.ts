import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET /api/shopping-lists - Get all shopping lists for the current user
export async function GET() {
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

    const shoppingLists = await prisma.shoppingList.findMany({
      where: { userId: user.id },
      include: {
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Transform the data to include computed fields
    const listsWithStats = shoppingLists.map((list: any) => ({
      id: list.id,
      name: list.name,
      createdAt: list.createdAt,
      updatedAt: list.updatedAt,
      itemCount: list.items.length,
      completedItems: list.items.filter((item: any) => item.completed).length,
    }));

    return NextResponse.json(listsWithStats);
  } catch (error) {
    console.error("Error fetching shopping lists:", error);
    return NextResponse.json({ error: "Failed to fetch shopping lists" }, { status: 500 });
  }
}

// POST /api/shopping-lists - Create a new shopping list
export async function POST(req: NextRequest) {
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

    const shoppingList = await prisma.shoppingList.create({
      data: {
        name: name.trim(),
        userId: user.id,
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({
      id: shoppingList.id,
      name: shoppingList.name,
      createdAt: shoppingList.createdAt,
      updatedAt: shoppingList.updatedAt,
      itemCount: 0,
      completedItems: 0,
    });
  } catch (error) {
    console.error("Error creating shopping list:", error);
    return NextResponse.json({ error: "Failed to create shopping list" }, { status: 500 });
  }
} 