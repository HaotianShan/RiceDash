"use client";

import { useState, useEffect, useMemo } from "react";
import { SessionProvider } from "next-auth/react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
import { MapPin, Clock, User, Phone, ShoppingBag, Navigation, CheckCircle, XCircle, ArrowRight, DollarSign, ListOrdered, RefreshCw, AlertCircle, Maximize2, Minimize2, Zap, Target } from "lucide-react";

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

// Servery coordinates from the database/constants
const SERVERY_COORDINATES = {
  "Baker": { lat: 29.7164, lng: -95.4018 },
  "North": { lat: 29.7184, lng: -95.4018 },
  "Seibel": { lat: 29.7174, lng: -95.4008 },
  "South": { lat: 29.7164, lng: -95.4008 },
  "West": { lat: 29.7174, lng: -95.4028 },
};

// --- CHILD COMPONENTS ---

// Enhanced header with prominent status and earnings
const DashboardHeader = ({ isOnline, onToggle, orderCount, onRefresh, isLoading, totalEarnings }: { 
  isOnline: boolean; 
  onToggle: (checked: boolean) => void; 
  orderCount: number;
  onRefresh: () => void;
  isLoading: boolean;
  totalEarnings: number;
}) => (
  <div className="mb-8">
    {/* Main Status Bar */}
    <div className={cn(
      "relative overflow-hidden rounded-2xl p-6 mb-6 transition-all duration-500",
      isOnline 
        ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25" 
        : "bg-gradient-to-r from-gray-400 to-gray-500 text-white"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={cn(
            "p-3 rounded-xl",
            isOnline ? "bg-white/20 backdrop-blur-sm" : "bg-white/10"
          )}>
            <Zap className={cn("w-8 h-8", isOnline && "animate-pulse")} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {isOnline ? "You're Online & Ready!" : "You're Offline"}
            </h1>
            <p className="text-white/90 mt-1">
              {isOnline 
                ? `${orderCount} orders available • Ready to deliver` 
                : "Go online to start receiving orders"
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {isOnline && (
            <div className="text-right">
              <p className="text-white/80 text-sm">Today's Earnings</p>
              <p className="text-3xl font-bold">${totalEarnings.toFixed(2)}</p>
            </div>
          )}
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefresh} 
              disabled={isLoading}
              className={cn(
                "flex items-center gap-2 border-white/30 text-white hover:bg-white/10",
                isOnline ? "bg-white/10" : "bg-white/5"
              )}
            >
              <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
              Refresh
            </Button>
            <div className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-xl">
              <div className="flex items-center space-x-2">
                <div className={cn("w-3 h-3 rounded-full", isOnline ? 'bg-green-300 animate-pulse' : 'bg-red-300')} />
                <Label htmlFor="online-status" className="font-medium text-white">
                  {isOnline ? 'Online' : 'Offline'}
                </Label>
              </div>
              <Switch 
                id="online-status" 
                checked={isOnline} 
                onCheckedChange={onToggle}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Enhanced order queue item with better visual hierarchy
const OrderQueueItem = ({ order, isSelected, onSelect }: { order: Order; isSelected: boolean; onSelect: () => void; }) => (
  <button
    onClick={onSelect}
    className={cn(
      "w-full text-left p-5 border-2 rounded-xl transition-all duration-300 group",
      isSelected 
        ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-400 shadow-lg shadow-blue-100" 
        : "bg-white hover:bg-gray-50 hover:border-gray-300 hover:shadow-md"
    )}
  >
    {/* Header with earnings and status */}
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className={cn(
          "px-4 py-2 rounded-lg font-bold text-xl",
          isSelected ? "bg-green-100 text-green-700" : "bg-green-50 text-green-600"
        )}>
          ${order.totalAmount.toFixed(2)}
        </div>
        <Badge 
          variant={
            order.status === "Pending" ? "default" : 
            order.status === "Accepted" ? "secondary" : 
            "outline"
          }
          className={cn(
            order.status === "Pending" && "bg-orange-100 text-orange-700 border-orange-200"
          )}
        >
          {order.status}
        </Badge>
      </div>
      <div className="text-right">
        <div className={cn(
          "text-sm font-medium",
          order.minutesAgo <= 5 ? "text-red-600" : order.minutesAgo <= 15 ? "text-orange-600" : "text-gray-500"
        )}>
          {order.minutesAgo}m ago
        </div>
        <div className="text-xs text-gray-400">
          {new Date(order.orderTimestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
    
    {/* Route information - most important */}
    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3 text-gray-700">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-blue-500" />
          <span className="font-semibold">{order.serveryName} Servery</span>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-400" />
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <MapPin className="w-4 h-4 text-green-500 flex-shrink-0" />
          <span className="font-medium truncate">{order.deliveryLocation}</span>
        </div>
      </div>
    </div>
    
    {/* Quick stats */}
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-4 text-gray-600">
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" /> 
          <span className="font-medium">{order.estimatedDeliveryTime}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Navigation className="w-4 h-4" /> 
          <span className="font-medium">{order.distance}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 text-gray-500">
        <ShoppingBag className="w-4 h-4" />
        <span className="font-medium">{order.orderItems.length} items</span>
      </div>
    </div>
    
    {/* Customer info */}
    <div className="mt-3 pt-3 border-t border-gray-100">
      <div className="flex items-center gap-2 text-gray-600">
        <User className="w-4 h-4" />
        <span className="font-medium">{order.customerName}</span>
        {order.customerPhone && (
          <>
            <span className="text-gray-400">•</span>
            <Phone className="w-4 h-4" />
            <span className="text-sm">{order.customerPhone}</span>
          </>
        )}
      </div>
    </div>
  </button>
);

// The panel showing full details of the selected order
const OrderDetailPanel = ({ order, onAccept, onComplete, onReject, isAcceptingOrder }: {
  order: Order | null;
  onAccept: (id: string) => void;
  onComplete: (id: string) => void;
  onReject: (id: string) => void;
  isAcceptingOrder: boolean;
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
              <span className="text-sm font-medium text-orange-800">Expires In</span>
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
              <div key={index} className="p-3 bg-gray-50 rounded-md border">
                <span className="font-medium">{item.quantity}x {item.name}</span>
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
            <Button 
              onClick={() => onAccept(order.id)} 
              disabled={isAcceptingOrder}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4 mr-2" /> 
              {isAcceptingOrder ? "Accepting..." : "Accept Order"}
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

// Fullscreen Map Component
const FullscreenMap = ({ 
  isOpen, 
  onClose, 
  selectedOrder, 
  userLocation 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  selectedOrder: Order | null;
  userLocation: { lat: number; lng: number };
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full h-full max-w-7xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-white/95 backdrop-blur-sm border-b p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Delivery Route</h3>
              {selectedOrder && (
                <p className="text-sm text-gray-600">
                  {selectedOrder.serveryName} Servery → {selectedOrder.deliveryLocation}
                </p>
              )}
            </div>
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Minimize2 className="w-4 h-4" />
              Close
            </Button>
          </div>
        </div>
        
        {/* Map */}
        <div className="w-full h-full pt-16">
          <MapSelector
            className="w-full h-full"
            showDirections={!!selectedOrder}
            origin={selectedOrder ? (selectedOrder.serveryName === "Baker" ? "Baker College - Housing and Dining Lot" : `${selectedOrder.serveryName} Servery`) : undefined}
            destination={selectedOrder ? selectedOrder.deliveryCoords : undefined}
            travelMode="driving"
            markers={selectedOrder ? [
              { position: userLocation, label: 'YOU', title: 'Your Location' },
              { position: SERVERY_COORDINATES[selectedOrder.serveryName], label: 'PICKUP', title: `${selectedOrder.serveryName} Servery` },
              { position: selectedOrder.deliveryCoords, label: 'DROP-OFF', title: selectedOrder.deliveryLocation },
            ] : [{ position: userLocation, label: 'YOU', title: 'Your Location' }]}
          />
        </div>
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function DasherDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [userLocation, setUserLocation] = useState({ lat: 29.7174, lng: -95.4018 }); // Default Rice Uni
  const [isAcceptingOrder, setIsAcceptingOrder] = useState(false);

  const selectedOrder = useMemo(() => orders.find(o => o.id === selectedOrderId), [orders, selectedOrderId]);
  
  // Calculate total earnings for today
  const totalEarnings = useMemo(() => {
    return orders
      .filter(order => order.status === "Delivered")
      .reduce((sum, order) => sum + order.totalAmount, 0);
  }, [orders]);

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
    if (isAcceptingOrder) return; // Prevent double clicks
    
    setIsAcceptingOrder(true);
    try {
      // Here you would call your API to accept the order
      // For now, we'll just update the local state
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: "Accepted" } : o));
      toast.success("Order accepted successfully!");
    } catch (error) {
      toast.error("Failed to accept order");
    } finally {
      setIsAcceptingOrder(false);
    }
  };

  const handleCompleteOrder = async (orderId: string) => {
    try {
      // Here you would call your API to complete the order
      // The order will be removed from the database, so we remove it from local state
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
      <div className="min-h-screen bg-gray-50">
        <SessionProvider><Navbar /></SessionProvider>
        
        <main className="container mx-auto px-4 py-6">
          <DashboardHeader
            isOnline={isOnline}
            onToggle={setIsOnline}
            orderCount={isOnline ? sortedOrders.length : 0}
            onRefresh={fetchOrders}
            isLoading={isLoading}
            totalEarnings={totalEarnings}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-280px)]">
            
            {/* Left Panel: Order Queue */}
            <div className="lg:col-span-1 h-full">
              <Card className="h-full flex flex-col shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span className="flex items-center gap-2">
                      <ListOrdered className="w-5 h-5 text-blue-600" />
                      Available Orders
                    </span>
                    {isOnline && sortedOrders.length > 0 && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        {sortedOrders.length}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto space-y-4 p-4">
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
                <Card className="h-full shadow-lg border-0">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-lg">
                        <MapPin className="w-5 h-5 text-green-600" />
                        Delivery Route
                      </span>
                      {selectedOrder && (
                        <Button
                          onClick={() => setIsMapFullscreen(true)}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Maximize2 className="w-4 h-4" />
                          Fullscreen
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <MapSelector
                      className="w-full h-full rounded-b-lg cursor-pointer"
                      showDirections={!!selectedOrder}
                      origin={selectedOrder ? (selectedOrder.serveryName === "Baker" ? "Baker College - Housing and Dining Lot" : `${selectedOrder.serveryName} Servery`) : undefined}
                      destination={selectedOrder ? selectedOrder.deliveryCoords : undefined}
                      travelMode="driving"
                      markers={selectedOrder ? [
                          { position: userLocation, label: 'YOU', title: 'Your Location' },
                          { position: SERVERY_COORDINATES[selectedOrder.serveryName], label: 'PICKUP', title: `${selectedOrder.serveryName} Servery` },
                          { position: selectedOrder.deliveryCoords, label: 'DROP-OFF', title: selectedOrder.deliveryLocation },
                      ] : [{ position: userLocation, label: 'YOU', title: 'Your Location' }]}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
        
        {/* Fullscreen Map Modal */}
        <FullscreenMap
          isOpen={isMapFullscreen}
          onClose={() => setIsMapFullscreen(false)}
          selectedOrder={selectedOrder ?? null}
          userLocation={userLocation}
        />
      </div>
    </>
  );
}