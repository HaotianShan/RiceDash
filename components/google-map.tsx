"use client";

import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";

// Declare google namespace for TypeScript
declare global {
  interface Window {
    google: typeof google;
  }
}

interface GoogleMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{
    position: { lat: number; lng: number };
    title: string;
    label?: string;
  }>;
  className?: string;
}

// Rice University serveries coordinates
const RICE_SERVERIES = [
  { name: "Baker Servery", position: { lat: 29.7164, lng: -95.4018 } },
  { name: "North Servery", position: { lat: 29.7184, lng: -95.4018 } },
  { name: "Seibel Servery", position: { lat: 29.7174, lng: -95.4008 } },
  { name: "South Servery", position: { lat: 29.7164, lng: -95.4008 } },
  { name: "West Servery", position: { lat: 29.7174, lng: -95.4028 } },
];

export default function GoogleMap({ 
  center = { lat: 29.7174, lng: -95.4018 }, // Rice University center
  zoom = 16,
  markers = [],
  className = "w-full h-full"
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          // Use default Rice University location
          setUserLocation(center);
        }
      );
    } else {
      setUserLocation(center);
    }
  }, [center]);

  useEffect(() => {
    if (!mapRef.current || !userLocation) return;

    const initializeMap = async () => {
      try {
        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
          version: "weekly",
          libraries: ["places"],
        });

        const { Map } = await loader.importLibrary("maps");
        const { Marker } = await loader.importLibrary("marker");

        // Create map
        const mapInstance = new Map(mapRef.current!, {
          center: userLocation,
          zoom: zoom,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
        });

        setMap(mapInstance);

        // Add user location marker
        new Marker({
          position: userLocation,
          map: mapInstance,
          title: "Your Location",
          label: "📍",
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#4285F4",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
        });

        // Add servery markers
        RICE_SERVERIES.forEach((servery) => {
          new Marker({
            position: servery.position,
            map: mapInstance,
            title: servery.name,
            label: "🍽️",
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 6,
              fillColor: "#FF6B35",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
            },
          });
        });

        // Add custom markers if provided
        markers.forEach((marker) => {
          new Marker({
            position: marker.position,
            map: mapInstance,
            title: marker.title,
            label: marker.label || "📍",
          });
        });

        setIsLoading(false);
      } catch (err) {
        console.error("Error loading Google Maps:", err);
        setError("Failed to load map. Please check your Google Maps API key.");
        setIsLoading(false);
      }
    };

    initializeMap();
  }, [userLocation, zoom, markers]);

  if (isLoading) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center`}>
        <div className="text-center p-8">
          <div className="text-red-500 text-6xl mb-4">🗺️</div>
          <p className="text-red-600 mb-2">Map Error</p>
          <p className="text-gray-600 text-sm">{error}</p>
          <div className="mt-4 p-4 bg-white rounded-lg shadow-md">
            <p className="text-sm text-gray-700">
              <strong>Your Location:</strong> {userLocation ? 
                `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : 
                "Unknown"
              }
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Rice University serveries are marked with 🍽️
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg">
        <div className="flex items-center gap-2 text-sm">
          <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
          <span>Your Location</span>
        </div>
        <div className="flex items-center gap-2 text-sm mt-1">
          <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
          <span>Rice Serveries</span>
        </div>
      </div>
    </div>
  );
}
