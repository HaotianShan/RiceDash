"use client";

import { useState, useEffect, useMemo } from "react";
import { SessionProvider } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Toaster, toast } from "sonner";

// UI Components
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import MapSelector from "@/components/map-selector";

// Icons
import { MapPin, Clock, User, Phone, ShoppingBag, Navigation, CheckCircle, XCircle, ArrowRight, DollarSign, ListOrdered, RefreshCw, AlertCircle } from "lucide-react";

// --- TYPE DEFINITIONS ---
interface OrderItem {
  name: string;
  quantity: number;
  price?: number;
}

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  serveryName: "Baker" | "North" | "Seibel" | "South" | "West";
  orderItems: OrderItem[];
  totalAmount: number;
  deliveryLocation: string;
  orderTimestamp: string;
  status: "Pending" | "Accepted" | "Delivered" | "Cancelled";
  paymentStatus: "Pending" | "Paid" | "Refunded";
  minutesAgo: number;
  pickupCoords: { lat: number; lng: number };
  deliveryCoords: { lat: number; lng: number };
  estimatedDeliveryTime: string;
  distance: string;
}

// --- CHILD COMPONENTS ---

// Header with stats and online/offline toggle
const DashboardHeader = ({ isOnline, onToggle, orderCount, onRefresh, isLoading }: { 
  isOnline: boolean; 
  onToggle: (checked: boolean) => void; 
  orderCount: number;
  onRefresh: () => void;
  isLoading: boolean;
}) => (
  <div className="mb-6">
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dasher Dashboard</h1>
        <p className="text-gray-500 mt-1">
          {isOnline ? `There are ${orderCount} orders from the last 30 minutes.` : "You are offline. Go online to see new orders."}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh} 
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          Refresh
        </Button>
        <div className="flex items-center gap-4 p-3 bg-white border rounded-lg">
          <div className="flex items-center space-x-2">
            <div className={cn("w-3 h-3 rounded-full transition-colors", isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500')} />
            <Label htmlFor="online-status" className="font-medium">{isOnline ? 'Online' : 'Offline'}</Label>
          </div>
          <Switch id="online-status" checked={isOnline} onCheckedChange={onToggle} />
        </div>
      </div>
    </div>
    <Separator className="mt-6" />
  </div>
);

// A single compact item in the order queue
const OrderQueueItem = ({ order, isSelected, onSelect }: { order: Order; isSelected: boolean; onSelect: () => void; }) => (
  <button
    onClick={onSelect}
    className={cn(
      "w-full text-left p-4 border rounded-lg transition-all duration-200",
      isSelected ? "bg-blue-50 border-blue-400 shadow-md" : "bg-white hover:bg-gray-50 hover:border-gray-300"
    )}
  >
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-3">
        <p className="font-bold text-lg text-green-600">${order.totalAmount.toFixed(2)}</p>
        <Badge 
          variant={
            order.status === "Pending" ? "default" : 
            order.status === "Accepted" ? "secondary" : 
            "outline"
          }
        >
          {order.status}
        </Badge>
      </div>
      <div className="text-right">
        <p className="text-xs text-gray-500">{order.minutesAgo}m ago</p>
        <p className="text-xs text-gray-400">{new Date(order.orderTimestamp).toLocaleTimeString()}</p>
      </div>
    </div>
    
    <div className="space-y-2 text-sm">
      <div className="flex items-center gap-2 text-gray-700">
        <MapPin className="w-4 h-4 text-blue-500" />
        <span className="font-medium">{order.serveryName} Servery</span>
        <ArrowRight className="w-4 h-4 text-gray-400" />
        <span className="font-medium truncate">{order.deliveryLocation}</span>
      </div>
      
      <div className="flex items-center gap-4 text-gray-500">
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" /> 
          {order.estimatedDeliveryTime}
        </div>
        <div className="flex items-center gap-1.5">
          <Navigation className="w-4 h-4" /> 
          {order.distance}
        </div>
        <div className="flex items-center gap-1.5">
          <ShoppingBag className="w-4 h-4" /> 
          {order.orderItems.length} items
        </div>
      </div>
      
      <div className="flex items-center gap-2 text-gray-600">
        <User className="w-4 h-4" />
        <span className="font-medium">{order.customerName}</span>
        {order.customerPhone && (
          <>
            <span className="text-gray-400">•</span>
            <Phone className="w-4 h-4" />
            <span className="text-xs">{order.customerPhone}</span>
          </>
        )}
      </div>
    </div>
  </button>
);

// The panel showing full details of the selected order
const OrderDetailPanel = ({ order, onAccept, onComplete, onReject }: {
  order: Order | null;
  onAccept: (id: string) => void;
  onComplete: (id: string) => void;
  onReject: (id: string) => void;
}) => {
  if (!order) {
    return (
      <Card className="h-full flex items-center justify-center shadow-sm">
        <div className="text-center">
          <ListOrdered className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-700">Select an Order</h3>
          <p className="text-sm text-gray-500 mt-1">Choose an order from the list to see its details.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Order #{order.id.slice(-8)}
              <Badge variant={order.status === "Pending" ? "default" : "secondary"}>
                {order.status}
              </Badge>
            </CardTitle>
            <CardDescription>
              From <span className="font-semibold">{order.serveryName} Servery</span>
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-green-600">${order.totalAmount.toFixed(2)}</p>
            <p className="text-xs text-gray-500">{order.minutesAgo}m ago</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-4 overflow-y-auto">
        {/* Order Timing */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Order Time</span>
            </div>
            <p className="text-sm text-blue-700">{new Date(order.orderTimestamp).toLocaleString()}</p>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2 mb-1">
              <Navigation className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">Est. Delivery</span>
            </div>
            <p className="text-sm text-orange-700">{order.estimatedDeliveryTime}</p>
          </div>
        </div>

        {/* Customer Info */}
        <div>
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <User className="w-4 h-4" />
            Customer Details
          </h4>
          <div className="p-3 bg-gray-50 rounded-md border text-sm space-y-2">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-gray-500" /> 
              <span className="font-medium">{order.customerName}</span>
            </div>
            {order.customerPhone && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-500" /> 
                <span>{order.customerPhone}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-gray-500" /> 
              <span>{order.deliveryLocation}</span>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div>
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            Order Items ({order.orderItems.length})
          </h4>
          <div className="space-y-2">
            {order.orderItems.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-md border">
                <div>
                  <span className="font-medium">{item.quantity}x {item.name}</span>
                </div>
                {item.price && (
                  <span className="font-medium text-gray-600">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Payment Status */}
        <div className="p-3 bg-gray-50 rounded-md border">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Payment Status:</span>
            <Badge variant={order.paymentStatus === "Paid" ? "default" : "secondary"}>
              {order.paymentStatus}
            </Badge>
          </div>
        </div>
      </CardContent>
      
      <div className="p-4 border-t bg-gray-50/50">
        {order.status === "Pending" && (
          <div className="flex gap-3">
            <Button onClick={() => onAccept(order.id)} className="flex-1 bg-green-600 hover:bg-green-700">
              <CheckCircle className="w-4 h-4 mr-2" /> Accept Order
            </Button>
            <Button onClick={() => onReject(order.id)} variant="outline">
              <XCircle className="w-4 h-4 mr-2" /> Reject
            </Button>
          </div>
        )}
        {order.status === "Accepted" && (
          <Button onClick={() => onComplete(order.id)} className="w-full bg-blue-600 hover:bg-blue-700">
            <CheckCircle className="w-4 h-4 mr-2" /> Mark as Delivered
          </Button>
        )}
        {order.status === "Delivered" && (
          <div className="text-center py-2">
            <Badge variant="default" className="bg-green-100 text-green-800">
              <CheckCircle className="w-4 h-4 mr-1" />
              Order Completed
            </Badge>
          </div>
        )}
      </div>
    </Card>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function DasherDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState({ lat: 29.7174, lng: -95.4018 }); // Default Rice Uni

  const selectedOrder = useMemo(() => orders.find(o => o.id === selectedOrderId), [orders, selectedOrderId]);

  // Fetch orders from API
  const fetchOrders = async () => {
    if (!isOnline) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/dasher/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
        // Auto-select first order if none selected
        if (data.length > 0 && !selectedOrderId) {
          setSelectedOrderId(data[0].id);
        }
      } else {
        toast.error("Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch orders when going online
  useEffect(() => {
    if (isOnline) {
      fetchOrders();
      // Set up auto-refresh every 30 seconds when online
      const interval = setInterval(fetchOrders, 30000);
      return () => clearInterval(interval);
    } else {
      setOrders([]);
      setSelectedOrderId(null);
    }
  }, [isOnline]);

  // Actions
  const handleAcceptOrder = async (orderId: string) => {
    try {
      // Here you would call your API to accept the order
      // For now, we'll just update the local state
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: "Accepted" } : o));
      toast.success("Order accepted successfully!");
    } catch (error) {
      toast.error("Failed to accept order");
    }
  };

  const handleCompleteOrder = async (orderId: string) => {
    try {
      // Here you would call your API to complete the order
      setOrders(orders.filter(o => o.id !== orderId));
      setSelectedOrderId(orders.length > 1 ? orders.filter(o => o.id !== orderId)[0].id : null);
      toast.success("Order marked as delivered!");
    } catch (error) {
      toast.error("Failed to complete order");
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    try {
      // Here you would call your API to reject the order
      setOrders(orders.filter(o => o.id !== orderId));
      setSelectedOrderId(orders.length > 1 ? orders.filter(o => o.id !== orderId)[0].id : null);
      toast.success("Order rejected");
    } catch (error) {
      toast.error("Failed to reject order");
    }
  };
  
  const sortedOrders = useMemo(() => 
    [...orders].sort((a, b) => a.minutesAgo - b.minutesAgo), 
    [orders]
  );

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gray-50">
        <SessionProvider><Navbar /></SessionProvider>
        
        <main className="container mx-auto px-4 py-6">
          <DashboardHeader
            isOnline={isOnline}
            onToggle={setIsOnline}
            orderCount={isOnline ? sortedOrders.length : 0}
            onRefresh={fetchOrders}
            isLoading={isLoading}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-220px)]">
            
            {/* Left Panel: Order Queue */}
            <div className="lg:col-span-1 h-full">
              <Card className="h-full flex flex-col shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Recent Orders
                    {isOnline && sortedOrders.length > 0 && (
                      <Badge variant="secondary">{sortedOrders.length}</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto space-y-3 p-3">
                  {isLoading ? (
                    <div className="text-center pt-16">
                      <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
                      <p className="text-gray-500 font-medium">Loading orders...</p>
                    </div>
                  ) : isOnline && sortedOrders.length > 0 ? (
                    sortedOrders.map((order) => (
                      <OrderQueueItem
                        key={order.id}
                        order={order}
                        isSelected={selectedOrderId === order.id}
                        onSelect={() => setSelectedOrderId(order.id)}
                      />
                    ))
                  ) : (
                    <div className="text-center pt-16">
                      <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium">
                        {isOnline ? 'No orders from the last 30 minutes' : 'You are offline'}
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        {isOnline ? 'Check back soon for new orders!' : 'Go online to see orders.'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Panel: Details and Map */}
            <div className="lg:col-span-2 h-full grid grid-rows-2 gap-6">
              <div className="row-span-1">
                <OrderDetailPanel
                  order={selectedOrder ?? null}
                  onAccept={handleAcceptOrder}
                  onComplete={handleCompleteOrder}
                  onReject={handleRejectOrder}
                />
              </div>
              <div className="row-span-1">
                <Card className="h-full shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Delivery Route
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <MapSelector
                      className="w-full h-full rounded-b-lg"
                      showDirections={!!selectedOrder}
                      origin={selectedOrder ? userLocation : undefined}
                      destination={selectedOrder ? selectedOrder.pickupCoords : undefined}
                      travelMode="driving"
                      markers={selectedOrder ? [
                          { position: userLocation, label: 'YOU', title: 'Your Location' },
                          { position: selectedOrder.pickupCoords, label: 'PICKUP', title: `${selectedOrder.serveryName} Servery` },
                          { position: selectedOrder.deliveryCoords, label: 'DROP-OFF', title: selectedOrder.deliveryLocation },
                      ] : [{ position: userLocation, label: 'YOU', title: 'Your Location' }]}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}