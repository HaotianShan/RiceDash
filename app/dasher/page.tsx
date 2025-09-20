"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import { SessionProvider } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, User, Phone, ShoppingBag, Navigation, CheckCircle, XCircle } from "lucide-react";
import GoogleMap from "@/components/google-map";

// Mock data for orders - in a real app, this would come from the API
const mockOrders = [
  {
    id: "1",
    customerName: "John Smith",
    customerPhone: "+1 (555) 123-4567",
    serveryName: "Baker",
    orderItems: [
      { name: "Plant-based egg scramble", quantity: 1, price: 3.50 },
      { name: "Fresh muffins", quantity: 2, price: 1.75 }
    ],
    totalAmount: 7.00,
    deliveryLocation: "Lovett College, Room 205",
    orderTimestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    status: "Pending",
    estimatedDeliveryTime: "25 mins",
    distance: "0.3 miles"
  },
  {
    id: "2",
    customerName: "Sarah Johnson",
    customerPhone: "+1 (555) 987-6543",
    serveryName: "North",
    orderItems: [
      { name: "Halal chicken", quantity: 1, price: 6.00 },
      { name: "French fries", quantity: 1, price: 2.50 }
    ],
    totalAmount: 8.50,
    deliveryLocation: "Wiess College, Room 312",
    orderTimestamp: new Date(Date.now() - 8 * 60 * 1000), // 8 minutes ago
    status: "Pending",
    estimatedDeliveryTime: "18 mins",
    distance: "0.5 miles"
  },
  {
    id: "3",
    customerName: "Mike Chen",
    customerPhone: "+1 (555) 456-7890",
    serveryName: "Seibel",
    orderItems: [
      { name: "Selection of pizza", quantity: 1, price: 4.50 },
      { name: "Cookies", quantity: 3, price: 2.25 }
    ],
    totalAmount: 11.25,
    deliveryLocation: "Brown College, Room 108",
    orderTimestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    status: "Pending",
    estimatedDeliveryTime: "12 mins",
    distance: "0.2 miles"
  },
  {
    id: "4",
    customerName: "Emily Davis",
    customerPhone: "+1 (555) 321-0987",
    serveryName: "South",
    orderItems: [
      { name: "Self-serve deli sandwich", quantity: 1, price: 5.50 },
      { name: "Soup & Salad", quantity: 1, price: 4.25 }
    ],
    totalAmount: 9.75,
    deliveryLocation: "Martel College, Room 401",
    orderTimestamp: new Date(Date.now() - 3 * 60 * 1000), // 3 minutes ago
    status: "Pending",
    estimatedDeliveryTime: "8 mins",
    distance: "0.4 miles"
  },
  {
    id: "5",
    customerName: "Alex Rodriguez",
    customerPhone: "+1 (555) 654-3210",
    serveryName: "West",
    orderItems: [
      { name: "Plant-based burgers", quantity: 2, price: 5.75 },
      { name: "Sweet potatoes", quantity: 1, price: 3.75 }
    ],
    totalAmount: 15.25,
    deliveryLocation: "Jones College, Room 156",
    orderTimestamp: new Date(Date.now() - 1 * 60 * 1000), // 1 minute ago
    status: "Pending",
    estimatedDeliveryTime: "5 mins",
    distance: "0.1 miles"
  }
];

// Calculate distance between two points (simplified)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default function DasherDashboard() {
  const [orders, setOrders] = useState(mockOrders);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.warn("Could not get user location:", error);
          // Default to Rice University location
          setUserLocation({
            lat: 29.7174,
            lng: -95.4018,
          });
        }
      );
    } else {
      setUserLocation({
        lat: 29.7174,
        lng: -95.4018,
      });
    }
  }, []);

  const handleAcceptOrder = (orderId: string) => {
    setOrders(orders.map(order => 
      order.id === orderId 
        ? { ...order, status: "Accepted" as const }
        : order
    ));
    setSelectedOrder(orderId);
  };

  const handleCompleteOrder = (orderId: string) => {
    setOrders(orders.filter(order => order.id !== orderId));
    setSelectedOrder(null);
  };

  const handleRejectOrder = (orderId: string) => {
    setOrders(orders.filter(order => order.id !== orderId));
    setSelectedOrder(null);
  };

  // Sort orders by distance (closest first)
  const sortedOrders = [...orders].sort((a, b) => {
    const distanceA = parseFloat(a.distance);
    const distanceB = parseFloat(b.distance);
    return distanceA - distanceB;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Accepted": return "bg-blue-100 text-blue-800";
      case "Delivered": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <SessionProvider>
        <Navbar />
      </SessionProvider>
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dasher Dashboard</h1>
              <p className="text-gray-600">Manage your delivery orders</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm font-medium">{isOnline ? 'Online' : 'Offline'}</span>
              </div>
              <Button
                onClick={() => setIsOnline(!isOnline)}
                className={isOnline ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
              >
                {isOnline ? 'Go Offline' : 'Go Online'}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-300px)]">
          
          {/* Left Column - Orders List (6/12 width) */}
          <div className="lg:col-span-6">
            <Card className="h-full shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Available Orders ({orders.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto">
                  {sortedOrders.map((order) => (
                    <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900">Order #{order.id}</h3>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {order.serveryName} Servery
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {order.estimatedDeliveryTime}
                            </div>
                            <div className="flex items-center gap-1">
                              <Navigation className="w-4 h-4" />
                              {order.distance}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-green-600">${order.totalAmount.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">
                            {Math.floor((Date.now() - order.orderTimestamp.getTime()) / 60000)} min ago
                          </p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Items:</p>
                        <div className="space-y-1">
                          {order.orderItems.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{item.quantity}x {item.name}</span>
                              <span className="text-gray-600">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mb-3 p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">{order.customerName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <Phone className="w-4 h-4" />
                          <span>{order.customerPhone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <MapPin className="w-4 h-4" />
                          <span>{order.deliveryLocation}</span>
                        </div>
                      </div>

                      {order.status === "Pending" && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleAcceptOrder(order.id)}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Accept Order
                          </Button>
                          <Button
                            onClick={() => handleRejectOrder(order.id)}
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      )}

                      {order.status === "Accepted" && (
                        <Button
                          onClick={() => handleCompleteOrder(order.id)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Mark as Delivered
                        </Button>
                      )}
                    </div>
                  ))}
                  
                  {orders.length === 0 && (
                    <div className="text-center py-12">
                      <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No orders available</p>
                      <p className="text-gray-400 text-sm">Check back later for new delivery requests</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Map (6/12 width) */}
          <div className="lg:col-span-6">
            <Card className="h-full shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Delivery Map
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-[calc(100%-80px)]">
                <GoogleMap 
                  className="w-full h-full"
                  markers={orders.map(order => ({
                    position: { lat: 29.7174 + (Math.random() - 0.5) * 0.01, lng: -95.4018 + (Math.random() - 0.5) * 0.01 },
                    title: `Order #${order.id} - ${order.customerName}`,
                    label: order.status === "Accepted" ? "🚚" : "📦"
                  }))}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
