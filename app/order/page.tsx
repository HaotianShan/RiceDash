"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import { SessionProvider } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MapPin, Clock, ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import GoogleMap from "@/components/google-map";

// Define the servery types (matching database enum)
type ServeryName = "Baker" | "North" | "Seibel" | "South" | "West";

// Define menu items structure
interface MenuItem {
  id: string;
  name: string;
  category: string;
  price?: number;
}

// Define cart item structure
interface CartItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
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

// Function to determine meal time based on current time
function getMealTime(): "breakfast" | "lunchDinner" {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 11) {
    return "breakfast";
  }
  return "lunchDinner";
}

// Cart component
function Cart({ cart, onUpdateQuantity, onRemoveItem, onClearCart }: {
  cart: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
}) {
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (cart.length === 0) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg text-center">
        <ShoppingCart className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500 text-sm">Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">Your Order</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearCart}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Clear
        </Button>
      </div>
      
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {cart.map((item) => (
          <div key={item.id} className="bg-white p-3 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1">
                <p className="font-medium text-sm">{item.name}</p>
                <p className="text-xs text-gray-500">{item.category}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveItem(item.id)}
                className="text-red-600 hover:text-red-700 p-1"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                  className="w-6 h-6 p-0"
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  className="w-6 h-6 p-0"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
              <span className="text-sm font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="border-t pt-3">
        <div className="flex justify-between items-center">
          <span className="font-semibold">Total:</span>
          <span className="font-bold text-lg">${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

export default function OrderPage() {
  const [selectedServery, setSelectedServery] = useState<ServeryName | "">("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const mealTime = getMealTime();
  const availableMenuItems = selectedServery ? menuData[selectedServery][mealTime] : [];

  // Cart management functions
  const addToCart = (item: MenuItem) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, {
        id: item.id,
        name: item.name,
        category: item.category,
        quantity: 1,
        price: item.price || 0
      }]);
    }
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.id !== id));
    } else {
      setCart(cart.map(item =>
        item.id === id ? { ...item, quantity } : item
      ));
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedServery || cart.length === 0) {
      alert("Please select a pickup location and add items to your cart");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

      const result = await response.json();
      console.log("Order submitted successfully:", result);
      
      setSubmitSuccess(true);
      // Reset form after successful submission
      setTimeout(() => {
        setSelectedServery("");
        setCart([]);
        setSubmitSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error("Error submitting order:", error);
      alert(`Failed to submit order: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <SessionProvider>
        <Navbar />
      </SessionProvider>
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-200px)]">
          
          {/* Left Column - Menu Selection (3/12 width) */}
          <div className="lg:col-span-3">
            <Card className="h-full shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Get a Meal
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Pickup Location */}
                  <div className="space-y-2">
                    <Label htmlFor="servery" className="text-gray-700 font-medium">Pickup Location</Label>
                    <Select value={selectedServery} onValueChange={(value: ServeryName) => {
                      setSelectedServery(value);
                    }}>
                      <SelectTrigger className="border-gray-300 focus:border-blue-500">
                        <SelectValue placeholder="Select a servery" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Baker">🍽️ Baker Servery</SelectItem>
                        <SelectItem value="North">🍽️ North Servery</SelectItem>
                        <SelectItem value="Seibel">🍽️ Seibel Servery</SelectItem>
                        <SelectItem value="South">🍽️ South Servery</SelectItem>
                        <SelectItem value="West">🍽️ West Servery</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Menu Items */}
                  {selectedServery && (
                    <div className="space-y-3">
                      <Label className="text-gray-700 font-medium">Available Items</Label>
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {availableMenuItems.map((item) => (
                          <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-sm text-gray-800">{item.name}</p>
                                <p className="text-xs text-gray-500">{item.category}</p>
                                <p className="text-xs text-green-600 font-medium">${(item.price || 0).toFixed(2)}</p>
                              </div>
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => addToCart(item)}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Meal Time Indicator */}
                  <div className="bg-gradient-to-r from-blue-50 to-orange-50 p-4 rounded-lg border">
                    <p className="text-sm text-gray-800">
                      <strong>Current meal:</strong> {mealTime === "breakfast" ? "🌅 Breakfast" : "🍽️ Lunch/Dinner"}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Menu items update based on time of day
                    </p>
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3" 
                    disabled={!selectedServery || cart.length === 0 || isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : `Place Order (${cart.length} items)`}
                  </Button>

                  {/* Success Message */}
                  {submitSuccess && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-green-800 font-medium">
                        ✅ Order submitted successfully!
                      </p>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Cart (3/12 width) */}
          <div className="lg:col-span-3">
            <Card className="h-full shadow-lg">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Your Cart
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Cart 
                  cart={cart}
                  onUpdateQuantity={updateQuantity}
                  onRemoveItem={removeFromCart}
                  onClearCart={clearCart}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Map (6/12 width) */}
          <div className="lg:col-span-6">
            <Card className="h-full shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Your Location & Nearby Serveries
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-[calc(100%-80px)]">
                <GoogleMap className="w-full h-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
