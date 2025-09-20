import React from 'react';
import Image from 'next/image';

// --- Helper Components & Icons ---
// To make this a single, self-contained file, I'm including SVG icons directly.
// In a real project, you would use a library like lucide-react.

const ClockIcon = ({ className }: { className: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const TruckIcon = ({ className }: { className: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11" />
    <path d="M14 9h4l4 4v4h-8v-4h-4V9Z" />
    <circle cx="7.5" cy="18.5" r="2.5" />
    <circle cx="17.5" cy="18.5" r="2.5" />
  </svg>
);

const UsersIcon = ({ className }: { className: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);


// --- Main Hero Section Component ---
const HeroSection = () => {
  return (
    // The background gradient is softened for a cleaner, more modern look.
    <div className="relative w-full min-h-[90vh] lg:min-h-screen flex items-center bg-gradient-to-br from-blue-50 via-gray-50 to-orange-50 overflow-hidden py-20 sm:py-0">
      <div className="container px-4 mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* --- Left Column: Text Content --- */}
          <div className="space-y-8 text-center lg:text-left">
            <div className="space-y-4">
              {/*
                FIX: For gradient text to work, you need `text-transparent` to hide the original text color
                and allow the background gradient (clipped to the text) to show through.
              */}
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
                <span className="bg-gradient-to-r from-blue-800 to-blue-500 text-transparent bg-clip-text">
                  Food delivery
                </span>
                <br />
                <span className="text-orange-500">
                  for Rice students
                </span>
              </h1>
              <p className="text-lg text-slate-600 max-w-lg mx-auto lg:mx-0">
                Get your favorite meals from all 5 Rice serveries delivered
                right to your dorm. By students, for students.
              </p>
            </div>

            {/*
              UI IMPROVEMENT: Added clear hierarchy to buttons.
              - "Order Now" is the primary action (solid fill).
              - "Become a Dasher" is the secondary action (outline style).
              - Added transitions and focus styles for better accessibility and user experience.
            */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a href="/order" className="px-8 py-3 bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-800 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 text-center">
                Order Now
              </a>
              <a href="/dasher" className="px-8 py-3 bg-transparent border-2 border-blue-700 text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-all focus:outline-none focus:ring-4 focus:ring-blue-300 text-center">
                Become a Dasher
              </a>
            </div>

            {/* UI IMPROVEMENT: Increased spacing and refined icon styles */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              <div className="text-center p-2">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                  <ClockIcon className="w-7 h-7 text-white" />
                </div>
                <p className="text-sm font-bold text-slate-800">Fast Delivery</p>
                <p className="text-xs text-slate-500">15-30 mins</p>
              </div>
              <div className="text-center p-2">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                  <TruckIcon className="w-7 h-7 text-white" />
                </div>
                <p className="text-sm font-bold text-slate-800">Student Drivers</p>
                <p className="text-xs text-slate-500">Rice only</p>
              </div>
              <div className="text-center p-2">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                  <UsersIcon className="w-7 h-7 text-white" />
                </div>
                <p className="text-sm font-bold text-slate-800">All Serveries</p>
                <p className="text-xs text-slate-500">5 locations</p>
              </div>
            </div>
          </div>

          {/* --- Right Column: Image --- */}
          <div className="relative hidden lg:block">
            <Image
              src="/assets/hero-food.jpg"
              alt="Rice University students enjoying food delivery"
              className="rounded-2xl shadow-2xl w-full h-auto object-cover transform rotate-3"
              width={1920}
              height={1080}
            />

            {/* UI IMPROVEMENT: Used a semi-transparent background for a modern glassmorphism effect. */}
            <div className="absolute -bottom-6 -right-6 bg-white/70 backdrop-blur-md rounded-xl p-4 shadow-lg border border-gray-200 transform -rotate-3">
              <p className="text-base font-bold text-blue-800">
                🍚 Rice favorite!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// This would be your main App component rendering the section
export default function App() {
  return (
    <main>
      <HeroSection />
    </main>
  );
}
