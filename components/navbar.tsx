"use client"; // This directive is necessary for using client-side hooks like useSession.

import { Button } from "@/components/ui/button";
import { MapPin, User, ShoppingBag } from "lucide-react";
import { useSession } from "next-auth/react"; // 👈 Import the useSession hook
import Image from "next/image"; // 👈 Import the Next.js Image component

const NavBar = () => {
  // Fetch the user's session data. 'session' will be null if the user is not logged in.
  const { data: session } = useSession();

  return (
    // The main navigation bar container. It's sticky, has a backdrop blur effect, and a bottom border.
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 w-full border-b border-gray-200">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo and Brand Name Section */}
        <a href="/" className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <span className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              RiceDash
            </span>
          </div>
        </a>

        {/* Right-aligned Buttons and Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Location Button */}
          <Button
            variant="ghost"
            size="sm"
            className="hidden md:flex items-center text-gray-600 hover:bg-orange-500 hover:text-white transition-colors duration-200"
          >
            <MapPin className="w-4 h-4 mr-2" />
            Rice University
          </Button>

          {/* Shopping Bag Button */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-gray-600 hover:bg-orange-500 hover:text-white rounded-full transition-colors duration-200"
          >
            <ShoppingBag className="w-5 h-5" />
          </Button>

          {/* 👇 CONDITIONAL AUTHENTICATION BLOCK */}
          {/* If 'session' exists, show the user avatar. Otherwise, show the 'Sign In' button. */}
          {session ? (
            <Button
              variant="ghost"
              className="rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
            >
              <Image
                src={
                  session.user?.image || // Use provider image if available
                  `https://avatar.vercel.sh/${session.user?.email}` // Fallback to Vercel avatars
                }
                alt={session.user?.email ?? "User Avatar"}
                width={36}
                height={36}
                className="rounded-lg"
              />
            </Button>
          ) : (
            <Button
              className="bg-orange-500 text-white hover:bg-orange-600 transition-all duration-300 ease-in-out transform hover:scale-105"
              size="sm"
              asChild
            >
              <a href="/api/auth/signin">
                <User className="w-4 h-4 mr-2" />
                Sign In
              </a>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;