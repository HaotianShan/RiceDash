"use client";

import { useState, useEffect, useMemo } from "react";
import { SessionProvider } from "next-auth/react";
import { Toaster, toast } from "sonner";
import { 
  MapPin, 
  Clock, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  UtensilsCrossed,
  PlusCircle,
  X
} from "lucide-react";

// UI Components (assuming these are from shadcn/ui)
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import MapSelector from "@/components/map-selector";
import { Separator } from "@/components/ui/separator";

// --- TYPE DEFINITIONS ---
type ServeryName = "Baker" | "North" | "Seibel" | "South" | "West";

// Rice University serveries coordinates
const RICE_SERVERIES = [
  { name: "Baker Servery", position: { lat: 29.7164, lng: -95.4018 } },
  { name: "North Servery", position: { lat: 29.7184, lng: -95.4018 } },
  { name: "Seibel Servery", position: { lat: 29.7174, lng: -95.4008 } },
  { name: "South Servery", position: { lat: 29.7164, lng: -95.4008 } },
  { name: "West Servery", position: { lat: 29.7174, lng: -95.4028 } },
];

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price?: number; // ignored in UI and pricing
}

interface CartItem extends MenuItem {
  quantity: number;
}


// Define menu data for each servery

const menuData: Record<ServeryName, { breakfast: MenuItem[]; lunchDinner: MenuItem[] }> = {

  "Baker": {
  
  breakfast: [
  
  { id: "plant-egg-scramble", name: "Plant-based egg scramble", category: "Plant-based Options", price: 3.50 },
  
  { id: "plant-tacos", name: "Plant-based tacos", category: "Plant-based Options", price: 4.00 },
  
  { id: "plant-rice", name: "Plant-based rice", category: "Plant-based Options", price: 2.50 },
  
  { id: "plant-beans", name: "Plant-based beans and plantains", category: "Plant-based Options", price: 3.00 },
  
  { id: "scrambled-eggs", name: "Scrambled eggs", category: "Traditional", price: 2.75 },
  
  { id: "egg-whites", name: "Egg whites", category: "Traditional", price: 2.50 },
  
  { id: "bacon", name: "Bacon", category: "Traditional", price: 3.25 },
  
  { id: "sausage", name: "Sausage patties", category: "Traditional", price: 3.00 },
  
  { id: "tacos", name: "Grab-n-go tacos and sandwiches", category: "Traditional", price: 4.50 },
  
  { id: "biscuits", name: "Biscuits and gravy", category: "Traditional", price: 3.75 },
  
  { id: "yogurt", name: "Yogurt and Fruit Bar", category: "Healthy Options", price: 2.25 },
  
  { id: "oatmeal", name: "Warm oatmeal or grits", category: "Healthy Options", price: 2.00 },
  
  { id: "muffins", name: "Fresh muffins and pastries", category: "Bakery", price: 1.75 }
  
  ],
  
  lunchDinner: [
  
  { id: "deli", name: "Self-serve deli sandwich station", category: "Deli", price: 5.50 },
  
  { id: "soup-salad", name: "Soup & Salad Station", category: "Healthy Options", price: 4.25 },
  
  { id: "grill-chicken", name: "Halal chicken", category: "Grill", price: 6.00 },
  
  { id: "fries", name: "French fries", category: "Grill", price: 2.50 },
  
  { id: "plant-burger", name: "Plant-based burgers", category: "Grill", price: 5.75 },
  
  { id: "baked-potato", name: "Baked potatoes", category: "Grill", price: 3.50 },
  
  { id: "sweet-potato", name: "Sweet potatoes", category: "Grill", price: 3.75 },
  
  { id: "pizza", name: "Selection of pizza", category: "Pizza & Pasta", price: 4.50 },
  
  { id: "pasta", name: "Pasta and sauces", category: "Pizza & Pasta", price: 5.00 },
  
  { id: "sweets", name: "Cookies, brownies, cakes and pies", category: "Desserts", price: 2.25 }
  
  ]
  
  },
  
  "North": {
  
  breakfast: [
  
  { id: "plant-egg-scramble", name: "Plant-based egg scramble", category: "Plant-based Options" },
  
  { id: "plant-tacos", name: "Plant-based tacos", category: "Plant-based Options" },
  
  { id: "plant-rice", name: "Plant-based rice", category: "Plant-based Options" },
  
  { id: "plant-beans", name: "Plant-based beans and plantains", category: "Plant-based Options" },
  
  { id: "scrambled-eggs", name: "Scrambled eggs", category: "Traditional" },
  
  { id: "egg-whites", name: "Egg whites", category: "Traditional" },
  
  { id: "bacon", name: "Bacon", category: "Traditional" },
  
  { id: "sausage", name: "Sausage patties", category: "Traditional" },
  
  { id: "tacos", name: "Grab-n-go tacos and sandwiches", category: "Traditional" },
  
  { id: "biscuits", name: "Biscuits and gravy", category: "Traditional" },
  
  { id: "yogurt", name: "Yogurt and Fruit Bar", category: "Healthy Options" },
  
  { id: "oatmeal", name: "Warm oatmeal or grits", category: "Healthy Options" },
  
  { id: "muffins", name: "Fresh muffins and pastries", category: "Bakery" }
  
  ],
  
  lunchDinner: [
  
  { id: "deli", name: "Self-serve deli sandwich station", category: "Deli", price: 5.50 },
  
  { id: "soup-salad", name: "Soup & Salad Station", category: "Healthy Options", price: 4.25 },
  
  { id: "grill-chicken", name: "Halal chicken", category: "Grill", price: 6.00 },
  
  { id: "fries", name: "French fries", category: "Grill", price: 2.50 },
  
  { id: "plant-burger", name: "Plant-based burgers", category: "Grill", price: 5.75 },
  
  { id: "baked-potato", name: "Baked potatoes", category: "Grill", price: 3.50 },
  
  { id: "sweet-potato", name: "Sweet potatoes", category: "Grill", price: 3.75 },
  
  { id: "pizza", name: "Selection of pizza", category: "Pizza & Pasta", price: 4.50 },
  
  { id: "pasta", name: "Pasta and sauces", category: "Pizza & Pasta", price: 5.00 },
  
  { id: "sweets", name: "Cookies, brownies, cakes and pies", category: "Desserts", price: 2.25 }
  
  ]
  
  },
  
  "Seibel": {
  
  breakfast: [
  
  { id: "plant-egg-scramble", name: "Plant-based egg scramble", category: "Plant-based Options" },
  
  { id: "plant-tacos", name: "Plant-based tacos", category: "Plant-based Options" },
  
  { id: "plant-rice", name: "Plant-based rice", category: "Plant-based Options" },
  
  { id: "plant-beans", name: "Plant-based beans and plantains", category: "Plant-based Options" },
  
  { id: "scrambled-eggs", name: "Scrambled eggs", category: "Traditional" },
  
  { id: "egg-whites", name: "Egg whites", category: "Traditional" },
  
  { id: "bacon", name: "Bacon", category: "Traditional" },
  
  { id: "sausage", name: "Sausage patties", category: "Traditional" },
  
  { id: "tacos", name: "Grab-n-go tacos and sandwiches", category: "Traditional" },
  
  { id: "biscuits", name: "Biscuits and gravy", category: "Traditional" },
  
  { id: "yogurt", name: "Yogurt and Fruit Bar", category: "Healthy Options" },
  
  { id: "oatmeal", name: "Warm oatmeal or grits", category: "Healthy Options" },
  
  { id: "muffins", name: "Fresh muffins and pastries", category: "Bakery" }
  
  ],
  
  lunchDinner: [
  
  { id: "deli", name: "Self-serve deli sandwich station", category: "Deli", price: 5.50 },
  
  { id: "soup-salad", name: "Soup & Salad Station", category: "Healthy Options", price: 4.25 },
  
  { id: "grill-chicken", name: "Halal chicken", category: "Grill", price: 6.00 },
  
  { id: "fries", name: "French fries", category: "Grill", price: 2.50 },
  
  { id: "plant-burger", name: "Plant-based burgers", category: "Grill", price: 5.75 },
  
  { id: "baked-potato", name: "Baked potatoes", category: "Grill", price: 3.50 },
  
  { id: "sweet-potato", name: "Sweet potatoes", category: "Grill", price: 3.75 },
  
  { id: "pizza", name: "Selection of pizza", category: "Pizza & Pasta", price: 4.50 },
  
  { id: "pasta", name: "Pasta and sauces", category: "Pizza & Pasta", price: 5.00 },
  
  { id: "sweets", name: "Cookies, brownies, cakes and pies", category: "Desserts", price: 2.25 }
  
  ]
  
  },
  
  "South": {
  
  breakfast: [
  
  { id: "plant-egg-scramble", name: "Plant-based egg scramble", category: "Plant-based Options" },
  
  { id: "plant-tacos", name: "Plant-based tacos", category: "Plant-based Options" },
  
  { id: "plant-rice", name: "Plant-based rice", category: "Plant-based Options" },
  
  { id: "plant-beans", name: "Plant-based beans and plantains", category: "Plant-based Options" },
  
  { id: "scrambled-eggs", name: "Scrambled eggs", category: "Traditional" },
  
  { id: "egg-whites", name: "Egg whites", category: "Traditional" },
  
  { id: "bacon", name: "Bacon", category: "Traditional" },
  
  { id: "sausage", name: "Sausage patties", category: "Traditional" },
  
  { id: "tacos", name: "Grab-n-go tacos and sandwiches", category: "Traditional" },
  
  { id: "biscuits", name: "Biscuits and gravy", category: "Traditional" },
  
  { id: "yogurt", name: "Yogurt and Fruit Bar", category: "Healthy Options" },
  
  { id: "oatmeal", name: "Warm oatmeal or grits", category: "Healthy Options" },
  
  { id: "muffins", name: "Fresh muffins and pastries", category: "Bakery" }
  
  ],
  
  lunchDinner: [
  
  { id: "deli", name: "Self-serve deli sandwich station", category: "Deli", price: 5.50 },
  
  { id: "soup-salad", name: "Soup & Salad Station", category: "Healthy Options", price: 4.25 },
  
  { id: "grill-chicken", name: "Halal chicken", category: "Grill", price: 6.00 },
  
  { id: "fries", name: "French fries", category: "Grill", price: 2.50 },
  
  { id: "plant-burger", name: "Plant-based burgers", category: "Grill", price: 5.75 },
  
  { id: "baked-potato", name: "Baked potatoes", category: "Grill", price: 3.50 },
  
  { id: "sweet-potato", name: "Sweet potatoes", category: "Grill", price: 3.75 },
  
  { id: "pizza", name: "Selection of pizza", category: "Pizza & Pasta", price: 4.50 },
  
  { id: "pasta", name: "Pasta and sauces", category: "Pizza & Pasta", price: 5.00 },
  
  { id: "sweets", name: "Cookies, brownies, cakes and pies", category: "Desserts", price: 2.25 }
  
  ]
  
  },
  
  "West": {
  
  breakfast: [
  
  { id: "plant-egg-scramble", name: "Plant-based egg scramble", category: "Plant-based Options" },
  
  { id: "plant-tacos", name: "Plant-based tacos", category: "Plant-based Options" },
  
  { id: "plant-rice", name: "Plant-based rice", category: "Plant-based Options" },
  
  { id: "plant-beans", name: "Plant-based beans and plantains", category: "Plant-based Options" },
  
  { id: "scrambled-eggs", name: "Scrambled eggs", category: "Traditional" },
  
  { id: "egg-whites", name: "Egg whites", category: "Traditional" },
  
  { id: "bacon", name: "Bacon", category: "Traditional" },
  
  { id: "sausage", name: "Sausage patties", category: "Traditional" },
  
  { id: "tacos", name: "Grab-n-go tacos and sandwiches", category: "Traditional" },
  
  { id: "biscuits", name: "Biscuits and gravy", category: "Traditional" },
  
  { id: "yogurt", name: "Yogurt and Fruit Bar", category: "Healthy Options" },
  
  { id: "oatmeal", name: "Warm oatmeal or grits", category: "Healthy Options" },
  
  { id: "muffins", name: "Fresh muffins and pastries", category: "Bakery" }
  
  ],
  
  lunchDinner: [
  
  { id: "deli", name: "Self-serve deli sandwich station", category: "Deli", price: 5.50 },
  
  { id: "soup-salad", name: "Soup & Salad Station", category: "Healthy Options", price: 4.25 },
  
  { id: "grill-chicken", name: "Halal chicken", category: "Grill", price: 6.00 },
  
  { id: "fries", name: "French fries", category: "Grill", price: 2.50 },
  
  { id: "plant-burger", name: "Plant-based burgers", category: "Grill", price: 5.75 },
  
  { id: "baked-potato", name: "Baked potatoes", category: "Grill", price: 3.50 },
  
  { id: "sweet-potato", name: "Sweet potatoes", category: "Grill", price: 3.75 },
  
  { id: "pizza", name: "Selection of pizza", category: "Pizza & Pasta", price: 4.50 },
  
  { id: "pasta", name: "Pasta and sauces", category: "Pizza & Pasta", price: 5.00 },
  
  { id: "sweets", name: "Cookies, brownies, cakes and pies", category: "Desserts", price: 2.25 }
  
  ]
  
  }
  
  };
  

  
// --- HELPER FUNCTIONS ---
function getMealTime(): "breakfast" | "lunchDinner" {
  const hour = new Date().getHours();
  return (hour >= 6 && hour < 11) ? "breakfast" : "lunchDinner";
}

// --- REUSABLE COMPONENTS ---

const MenuItemCard = ({ item, onAddToCart }: { item: MenuItem; onAddToCart: (item: MenuItem) => void }) => {
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    if (isAdding) return; // Prevent double clicks
    
    setIsAdding(true);
    onAddToCart(item);
    
    // Show success feedback
    setTimeout(() => {
      setIsAdding(false);
    }, 600);
  };

  return (
    <div className="group flex items-center justify-between p-3 transition-all duration-200 bg-white border border-gray-200 hover:border-blue-300 hover:shadow-sm rounded-lg">
      <div className="flex-1 mr-3">
        <h3 className="font-medium text-gray-900 text-sm mb-1">{item.name}</h3>
        <span className="text-xs text-gray-500">{item.category}</span>
      </div>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={handleAddToCart}
        disabled={isAdding}
        className={`h-8 px-3 text-xs transition-all duration-300 ${
          isAdding 
            ? 'text-green-600 border-green-300 bg-green-50' 
            : 'text-blue-600 border-blue-300 hover:bg-blue-50 hover:border-blue-400'
        }`}
      >
        {isAdding ? (
          <>
            <div className="w-3 h-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin mr-1" />
            Adding
          </>
        ) : (
          <>
            <PlusCircle className="w-3 h-3 mr-1" />
            Add
          </>
        )}
      </Button>
    </div>
  );
};

const MenuDisplay = ({ items, onAddToCart }: { items: MenuItem[]; onAddToCart: (item: MenuItem) => void }) => {
  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Today&apos;s Menu</h2>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {items.length} items
        </span>
      </div>
      
      {items.length > 0 ? (
        <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
          {Object.entries(groupedItems).map(([category, categoryItems]) => (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-px bg-gray-300 flex-1"></div>
                <h3 className="text-sm font-semibold text-gray-700 px-3 py-1 bg-gray-50 rounded-full border">
                  {category}
                </h3>
                <div className="h-px bg-gray-300 flex-1"></div>
              </div>
              <div className="space-y-2">
                {categoryItems.map((item) => (
                  <MenuItemCard key={item.id} item={item} onAddToCart={onAddToCart} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <UtensilsCrossed className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No items available</p>
          <p className="text-sm text-gray-400 mt-1">for this mealtime</p>
        </div>
      )}
    </div>
  );
};

const CartDisplay = ({ cart, onUpdateQuantity, onRemoveItem, onClearCart, onSubmit, isSubmitting, selectedServery, distanceMiles, deliveryPrice, isDistanceLoading }: {
  cart: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isSubmitting: boolean;
  selectedServery: ServeryName | "";
  distanceMiles: number | null;
  deliveryPrice: number | null;
  isDistanceLoading: boolean;
}) => {
  const total = deliveryPrice ?? 0;

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Your Order
            {cart.length > 0 && (
              <span className="text-sm font-normal text-gray-500">
                ({cart.reduce((sum, item) => sum + item.quantity, 0)}/10 items)
              </span>
            )}
          </div>
          {cart.length > 0 && (
            <Button variant="ghost" size="sm" onClick={onClearCart} className="text-red-500 hover:text-red-600">
              <Trash2 className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {cart.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Your cart is empty.</p>
            <p className="text-xs text-gray-400 mt-1">Add items from the menu to get started.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Cart Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {cart.map((item) => (
                <div key={item.id} className="group flex items-center justify-between p-3 bg-white border border-gray-200 hover:border-blue-300 hover:shadow-sm rounded-lg transition-all duration-200">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-2">
                    <div className="flex items-center bg-gray-100 rounded-md p-0.5">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} 
                        className="h-6 w-6 hover:bg-red-100 hover:text-red-600 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="text-sm font-medium text-gray-900 w-5 text-center">{item.quantity}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} 
                        className="h-6 w-6 hover:bg-green-100 hover:text-green-600 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onRemoveItem(item.id)} 
                      className="h-6 w-6 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary and Submit */}
            <div className="border-t pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-sm text-gray-600">
                  {isDistanceLoading ? (
                    <span>Calculating distance-based price...</span>
                  ) : distanceMiles != null ? (
                    <span>Distance from pickup: {distanceMiles.toFixed(2)} miles</span>
                  ) : (
                    <span>Enable location to calculate delivery price.</span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="font-semibold text-gray-700">Total: </span>
                    <span className="font-bold text-xl">${total.toFixed(2)}</span>
                  </div>
                  <Button
                    onClick={onSubmit}
                    className="font-semibold px-8"
                    disabled={!selectedServery || cart.length === 0 || isSubmitting || deliveryPrice == null}
                  >
                    {isSubmitting ? "Placing Order..." : `Place Order`}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function OrderPage() {
  const [selectedServery, setSelectedServery] = useState<ServeryName | "">("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [distanceMiles, setDistanceMiles] = useState<number | null>(null);
  const [isDistanceLoading, setIsDistanceLoading] = useState(false);

  const mealTime = getMealTime();
  const availableMenuItems = selectedServery ? menuData[selectedServery][mealTime] : [];

  // Cart management functions
  const addToCart = (item: MenuItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      const totalItems = prevCart.reduce((sum, cartItem) => sum + cartItem.quantity, 0);
      
      // Check if adding this item would exceed the 10-item limit
      if (totalItems >= 10) {
        return prevCart;
      }
      
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1, price: item.price || 0 }];
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
    } else {
      const currentItem = cart.find(item => item.id === id);
      if (currentItem) {
        const totalItems = cart.reduce((sum, cartItem) => sum + cartItem.quantity, 0);
        const quantityDifference = quantity - currentItem.quantity;
        
        // Check if increasing quantity would exceed the 10-item limit
        if (totalItems + quantityDifference > 10) {

          return;
        }
      }
      setCart(cart.map(item => item.id === id ? { ...item, quantity } : item));
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    toast.info("Your cart has been cleared.");
  };

  // Geolocate user for distance-based pricing
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        setUserLocation(null);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  function haversineMiles(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const R = 3958.8; // miles
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  function calculateDeliveryPrice(miles: number | null): number | null {
    if (miles == null || Number.isNaN(miles)) return null;
    if (miles <= 0.3) return 3.0;
    const over = miles - 0.2;
    const increments = Math.ceil(over / 0.1);
    const price = 2.0 + increments * 0.7;
    return Math.round(price * 100) / 100;
  }

  useEffect(() => {
    let isCancelled = false;
    
    const calculateDistance = async () => {
      if (!selectedServery || !userLocation) {
        if (!isCancelled) {
          setDistanceMiles(null);
        }
        return;
      }
      
      const servery = RICE_SERVERIES.find(s => s.name.includes(selectedServery));
      if (!servery) {
        if (!isCancelled) {
          setDistanceMiles(null);
        }
        return;
      }
      
      if (!isCancelled) {
        setIsDistanceLoading(true);
      }
      
      try {
        // Prefer route distance from API
        const origin = selectedServery === "Baker" ? "Baker College - Housing and Dining Lot" : `${selectedServery} Servery`;
        const res = await fetch("/api/distance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ origin, destination: userLocation, mode: "walking" })
        });
        
        if (!isCancelled) {
          if (res.ok) {
            const data = await res.json();
            const milesFromApi: number | undefined = data?.distance?.miles;
            if (typeof milesFromApi === "number" && !Number.isNaN(milesFromApi)) {
              setDistanceMiles(milesFromApi);
            } else {
              const milesFallback = haversineMiles(servery.position, userLocation);
              setDistanceMiles(milesFallback);
            }
          } else {
            const milesFallback = haversineMiles(servery.position, userLocation);
            setDistanceMiles(milesFallback);
          }
        }
      } catch {
        if (!isCancelled) {
          const milesFallback = haversineMiles(servery.position, userLocation);
          setDistanceMiles(milesFallback);
        }
      } finally {
        if (!isCancelled) {
          setIsDistanceLoading(false);
        }
      }
    };
    
    calculateDistance();
    
    return () => {
      isCancelled = true;
    };
  }, [selectedServery, userLocation]);

  const deliveryPrice = useMemo(() => calculateDeliveryPrice(distanceMiles), [distanceMiles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServery || cart.length === 0 || deliveryPrice == null) {
      toast.error("Please select a location, add items, and enable location for pricing.");
      return;
    }
    setIsSubmitting(true);
    try {
      const total = deliveryPrice;
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          servery: selectedServery,
          orderItems: cart,
          mealTime,
          totalAmount: total,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit order");
      }
      
      toast.success("Order submitted successfully!");
      setSelectedServery("");
      setCart([]);
    } catch (error) {
      toast.error(`Failed to submit order: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gray-50">
        <SessionProvider>
          <Navbar />
        </SessionProvider>
        
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            
            {/* Order Creation Section */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Left Column: Menu Selection */}
              <div className="lg:col-span-2">
                <Card className="shadow-md h-[500px] lg:h-[675px] flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UtensilsCrossed className="w-5 h-5" />
                      Create Your Order
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="servery" className="font-semibold text-gray-700">1. Select Pickup Location</Label>
                      <Select value={selectedServery} onValueChange={(value: ServeryName) => setSelectedServery(value)}>
                        <SelectTrigger id="servery"><SelectValue placeholder="Choose a servery..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Baker">🍽️ Baker Servery</SelectItem>
                          <SelectItem value="North">🍽️ North Servery</SelectItem>
                          <SelectItem value="Seibel">🍽️ Seibel Servery</SelectItem>
                          <SelectItem value="South">🍽️ South Servery</SelectItem>
                          <SelectItem value="West">🍽️ West Servery</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-md text-sm">
                      <p><strong>Current Meal:</strong> {mealTime === "breakfast" ? "🌅 Breakfast" : "🍽️ Lunch/Dinner"}</p>
                      <p className="text-xs mt-1">Menus update automatically based on the time of day.</p>
                    </div>

                    {selectedServery && <Separator />}
                    
                    {selectedServery && (
                      <div className="space-y-2">
                        <Label className="font-semibold text-gray-700">2. Add Items to Cart</Label>
                        <MenuDisplay items={availableMenuItems} onAddToCart={addToCart} />
                      </div>
                    )}
                    {!selectedServery && (
                        <div className="text-center py-6 text-gray-500">
                            <p>Please select a servery to view the menu.</p>
                        </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Map */}
              <div className="lg:col-span-3">
                <Card className="shadow-md h-[500px] lg:h-[600px] flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Servery Locations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 flex-1">
                    <MapSelector 
                      className="w-full h-full"
                      showDirections={!!selectedServery}
                      origin={selectedServery 
                        ? (selectedServery === "Baker" 
                            ? "Baker College - Housing and Dining Lot" 
                            : `${selectedServery} Servery`)
                        : undefined}
                      destination={undefined}
                      travelMode="walking"
                      markers={selectedServery ? [
                        {
                          position: RICE_SERVERIES.find(s => s.name.includes(selectedServery))?.position || { lat: 29.7174, lng: -95.4018 },
                          title: `${selectedServery} Servery`,
                          label: "📍"
                        }
                      ] : []}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Full Width Cart Section */}
            <CartDisplay
              cart={cart}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeFromCart}
              onClearCart={clearCart}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              selectedServery={selectedServery}
              distanceMiles={distanceMiles}
              deliveryPrice={deliveryPrice}
              isDistanceLoading={isDistanceLoading}
            />

          </div>
        </main>
      </div>
    </>
  );
}