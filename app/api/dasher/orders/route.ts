import { NextRequest, NextResponse } from "next/server";
import { getRecentOrdersWithCustomers } from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  try {
    const orders = await getRecentOrdersWithCustomers();
    
    
    // Transform the data to include calculated fields
    const transformedOrders = orders.map(order => {
      // Handle orderItemsJSON - it might be an object, array, or string
      let orderItems;
      if (Array.isArray(order.orderItemsJSON)) {
        orderItems = order.orderItemsJSON;
      } else if (typeof order.orderItemsJSON === 'string') {
        try {
          orderItems = JSON.parse(order.orderItemsJSON);
        } catch (error) {
          console.error('Failed to parse orderItemsJSON:', error);
          orderItems = [];
        }
      } else if (typeof order.orderItemsJSON === 'object' && order.orderItemsJSON !== null) {
        // Check if it's the nested structure with items array
        if (order.orderItemsJSON.items && Array.isArray(order.orderItemsJSON.items)) {
          orderItems = order.orderItemsJSON.items;
        } else {
          orderItems = order.orderItemsJSON;
        }
      } else {
        orderItems = [];
      }
      
      // Calculate time since order was placed
      const timeSinceOrder = Date.now() - new Date(order.orderTimestamp).getTime();
      const minutesAgo = Math.floor(timeSinceOrder / (1000 * 60));
      
      // Get servery coordinates (you might want to move this to a constants file)
      const serveryCoords = {
        "Baker": { lat: 29.7164, lng: -95.4018 },
        "North": { lat: 29.7184, lng: -95.4018 },
        "Seibel": { lat: 29.7174, lng: -95.4008 },
        "South": { lat: 29.7164, lng: -95.4008 },
        "West": { lat: 29.7174, lng: -95.4028 },
      };
      
      return {
        id: order.id,
        customerName: `${order.customer.firstName} ${order.customer.lastName}`,
        customerPhone: order.customer.phoneNumber || "No phone provided",
        serveryName: order.serveryName,
        orderItems: orderItems,
        totalAmount: parseFloat(order.totalAmount),
        deliveryLocation: order.deliveryLocation,
        orderTimestamp: order.orderTimestamp,
        status: order.status,
        paymentStatus: order.paymentStatus,
        minutesAgo,
        pickupCoords: serveryCoords[order.serveryName],
        // For now, we'll use a default delivery location - you might want to implement proper geocoding
        deliveryCoords: { lat: 29.7174, lng: -95.4018 }, // Default Rice location
        estimatedDeliveryTime: `${Math.max(5, Math.floor(Math.random() * 20) + 10)} mins`,
        distance: `${(Math.random() * 0.8 + 0.2).toFixed(1)} miles`,
      };
    });
    
    return NextResponse.json(transformedOrders);
  } catch (error) {
    console.error("Error fetching recent orders:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch recent orders",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
