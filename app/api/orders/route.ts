import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq, desc } from "drizzle-orm";
import postgres from "postgres";
import { orders } from "@/lib/db/schema";
import { auth } from "@/app/(auth)/auth";

// Establish the database connection
const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client, { schema: { orders } });

export async function POST(request: NextRequest) {
  try {
    // Get the current session
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { servery, orderItems, mealTime, totalAmount } = body;

    // Validate required fields
    if (!servery || !orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields: servery, orderItems" },
        { status: 400 }
      );
    }

    // Validate servery name matches database enum
    const validServeries = ["Baker", "North", "Seibel", "South", "West"];
    if (!validServeries.includes(servery)) {
      return NextResponse.json(
        { error: "Invalid servery name" },
        { status: 400 }
      );
    }

    // Create order data
    const orderData = {
      customerId: session.user.id,
      serveryName: servery as "Baker" | "North" | "Seibel" | "South" | "West",
      orderItemsJSON: {
        items: orderItems,
        mealTime,
        timestamp: new Date().toISOString()
      },
      totalAmount: totalAmount ? totalAmount.toString() : "0.00",
      deliveryLocation: "Rice University Campus", // Default delivery location
    };

    // Insert order into database
    const newOrder = await db.insert(orders).values(orderData).returning();

    return NextResponse.json(
      { 
        success: true, 
        order: newOrder[0],
        message: "Order submitted successfully" 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the current session
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get user's orders
    const userOrders = await db.select().from(orders).where(eq(orders.customerId, session.user.id)).orderBy(desc(orders.orderTimestamp));

    return NextResponse.json({ orders: userOrders });

  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
