"use client";

import { useState, useEffect, useMemo } from "react";
import { SessionProvider } from "next-auth/react";
import { cn } from "@/lib/utils"; // Assumes you have a utility for classnames

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
import { MapPin, Clock, User, Phone, ShoppingBag, Navigation, CheckCircle, XCircle, ArrowRight, DollarSign, ListOrdered } from "lucide-react";

// --- TYPE DEFINITIONS ---
interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  serveryName: "Baker" | "North" | "Seibel" | "South" | "West";
  orderItems: OrderItem[];
  totalAmount: number;
  deliveryLocation: string;
  orderTimestamp: Date;
  status: "Pending" | "Accepted";
  estimatedDeliveryTime: string;
  distance: string;
  // Added coordinates for a more realistic map
  pickupCoords: { lat: number; lng: number };
  deliveryCoords: { lat: number; lng: number };
}

// --- MOCK DATA (Updated with coordinates) ---
const mockOrders: Order[] = [
  { id: "1", customerName: "John Smith", customerPhone: "+1 (555) 123-4567", serveryName: "Baker", orderItems: [{ name: "Plant-based egg scramble", quantity: 1, price: 3.50 }, { name: "Fresh muffins", quantity: 2, price: 1.75 }], totalAmount: 7.00, deliveryLocation: "Lovett College, Rm 205", orderTimestamp: new Date(Date.now() - 15 * 60 * 1000), status: "Pending", estimatedDeliveryTime: "25 mins", distance: "0.3 miles", pickupCoords: { lat: 29.7202, lng: -95.4018 }, deliveryCoords: { lat: 29.7215, lng: -95.4025 } },
  { id: "2", customerName: "Sarah Johnson", customerPhone: "+1 (555) 987-6543", serveryName: "North", orderItems: [{ name: "Halal chicken", quantity: 1, price: 6.00 }, { name: "French fries", quantity: 1, price: 2.50 }], totalAmount: 8.50, deliveryLocation: "Wiess College, Rm 312", orderTimestamp: new Date(Date.now() - 8 * 60 * 1000), status: "Pending", estimatedDeliveryTime: "18 mins", distance: "0.5 miles", pickupCoords: { lat: 29.7225, lng: -95.3980 }, deliveryCoords: { lat: 29.7180, lng: -95.4005 } },
  { id: "3", customerName: "Mike Chen", customerPhone: "+1 (555) 456-7890", serveryName: "Seibel", orderItems: [{ name: "Selection of pizza", quantity: 1, price: 4.50 }, { name: "Cookies", quantity: 3, price: 2.25 }], totalAmount: 11.25, deliveryLocation: "Brown College, Rm 108", orderTimestamp: new Date(Date.now() - 5 * 60 * 1000), status: "Pending", estimatedDeliveryTime: "12 mins", distance: "0.2 miles", pickupCoords: { lat: 29.7218, lng: -95.3999 }, deliveryCoords: { lat: 29.7200, lng: -95.3985 } },
];

// --- CHILD COMPONENTS ---

// Header with stats and online/offline toggle
const DashboardHeader = ({ isOnline, onToggle, orderCount }: { isOnline: boolean; onToggle: (checked: boolean) => void; orderCount: number }) => (
  <div className="mb-6">
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dasher Dashboard</h1>
        <p className="text-gray-500 mt-1">
          {isOnline ? `There are ${orderCount} orders available.` : "You are offline. Go online to see new orders."}
        </p>
      </div>
      <div className="flex items-center gap-4 p-3 bg-white border rounded-lg">
        <div className="flex items-center space-x-2">
          <div className={cn("w-3 h-3 rounded-full transition-colors", isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500')} />
          <Label htmlFor="online-status" className="font-medium">{isOnline ? 'Online' : 'Offline'}</Label>
        </div>
        <Switch id="online-status" checked={isOnline} onCheckedChange={onToggle} />
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
      <p className="font-bold text-lg text-green-600">${order.totalAmount.toFixed(2)}</p>
      <Badge variant={order.status === "Pending" ? "default" : "secondary"}>{order.status}</Badge>
    </div>
    <div className="space-y-2 text-sm">
      <div className="flex items-center gap-2 text-gray-700">
        <MapPin className="w-4 h-4 text-blue-500" />
        <span className="font-medium">{order.serveryName} Servery</span>
        <ArrowRight className="w-4 h-4 text-gray-400" />
        <span className="font-medium">{order.deliveryLocation}</span>
      </div>
      <div className="flex items-center gap-4 text-gray-500">
        <div className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {order.estimatedDeliveryTime}</div>
        <div className="flex items-center gap-1.5"><Navigation className="w-4 h-4" /> {order.distance}</div>
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
        <CardTitle>Order #{order.id}</CardTitle>
        <CardDescription>From <span className="font-semibold">{order.serveryName} Servery</span></CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-4 overflow-y-auto">
        {/* Customer Info */}
        <div>
          <h4 className="font-semibold text-sm mb-2">Delivery Details</h4>
          <div className="p-3 bg-gray-50 rounded-md border text-sm space-y-2">
            <div className="flex items-center gap-3"><User className="w-4 h-4 text-gray-500" /> <span className="font-medium">{order.customerName}</span></div>
            <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-gray-500" /> <span>{order.customerPhone}</span></div>
            <div className="flex items-center gap-3"><MapPin className="w-4 h-4 text-gray-500" /> <span>{order.deliveryLocation}</span></div>
          </div>
        </div>
        {/* Order Items */}
        <div>
          <h4 className="font-semibold text-sm mb-2">Items</h4>
          <div className="space-y-1">
            {order.orderItems.map((item, index) => (
              <div key={index} className="flex justify-between text-sm p-2 bg-gray-50 rounded-md">
                <span>{item.quantity}x {item.name}</span>
                <span className="font-medium text-gray-600">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <div className="p-4 border-t bg-gray-50/50">
        {order.status === "Pending" && (
          <div className="flex gap-3">
            <Button onClick={() => onAccept(order.id)} className="flex-1 bg-green-600 hover:bg-green-700">
              <CheckCircle className="w-4 h-4 mr-2" /> Accept
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
      </div>
    </Card>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function DasherDashboard() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(mockOrders[0]?.id || null);
  const [isOnline, setIsOnline] = useState(false);
  const [userLocation, setUserLocation] = useState({ lat: 29.7174, lng: -95.4018 }); // Default Rice Uni

  const selectedOrder = useMemo(() => orders.find(o => o.id === selectedOrderId), [orders, selectedOrderId]);

  // Actions
  const handleAcceptOrder = (orderId: string) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: "Accepted" } : o));
  };

  const handleCompleteOrder = (orderId: string) => {
    setOrders(orders.filter(o => o.id !== orderId));
    setSelectedOrderId(orders.length > 1 ? orders.filter(o => o.id !== orderId)[0].id : null);
  };

  const handleRejectOrder = (orderId: string) => {
    setOrders(orders.filter(o => o.id !== orderId));
    setSelectedOrderId(orders.length > 1 ? orders.filter(o => o.id !== orderId)[0].id : null);
  };
  
  const sortedOrders = useMemo(() => [...orders].sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance)), [orders]);

  return (
    <div className="min-h-screen bg-gray-50">
      <SessionProvider><Navbar /></SessionProvider>
      
      <main className="container mx-auto px-4 py-6">
        <DashboardHeader
          isOnline={isOnline}
          onToggle={setIsOnline}
          orderCount={isOnline ? sortedOrders.length : 0}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-220px)]">
          
          {/* Left Panel: Order Queue */}
          <div className="lg:col-span-1 h-full">
            <Card className="h-full flex flex-col shadow-sm">
              <CardHeader><CardTitle>Available Orders</CardTitle></CardHeader>
              <CardContent className="flex-1 overflow-y-auto space-y-3 p-3">
                {isOnline && sortedOrders.length > 0 ? (
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
                    <p className="text-gray-500 font-medium">{isOnline ? 'No orders available' : 'You are offline'}</p>
                    <p className="text-gray-400 text-sm mt-1">{isOnline ? 'Check back soon!' : 'Go online to see orders.'}</p>
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
                <MapSelector
                  className="w-full h-full rounded-lg"
                  showDirections={!!selectedOrder}
                  origin={selectedOrder ? userLocation : undefined}
                  destination={selectedOrder ? selectedOrder.pickupCoords : undefined}
                  travelMode="driving"
                  markers={selectedOrder ? [
                      { position: userLocation, label: 'YOU', title: 'Your Location' },
                      { position: selectedOrder.pickupCoords, label: 'PICKUP', title: selectedOrder.serveryName },
                      { position: selectedOrder.deliveryCoords, label: 'DROP-OFF', title: selectedOrder.deliveryLocation },
                  ] : [{ position: userLocation, label: 'YOU', title: 'Your Location' }]}
                />
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}