"use client";

import { useEffect, useState } from "react";

interface GoogleMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{
    position: { lat: number; lng: number };
    title: string;
    label?: string;
  }>;
  className?: string;
  showDirections?: boolean;
  origin?: { lat: number; lng: number } | string;
  destination?: { lat: number; lng: number } | string;
  travelMode?: 'driving' | 'walking' | 'bicycling' | 'transit';
}

export default function GoogleMap({ 
  center = { lat: 29.7174, lng: -95.4018 }, // Rice University center
  zoom = 16,
  markers = [],
  className = "w-full h-full",
  showDirections = false,
  origin,
  destination,
  travelMode = 'driving'
}: GoogleMapProps) {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapUrl, setMapUrl] = useState<string>("");

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(userPos);
        },
        (error) => {
          console.warn("Could not get user location:", error);
          setUserLocation(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    } else {
      setUserLocation(null);
    }
  }, [center]);

  useEffect(() => {
    if (!userLocation && !(showDirections && origin && destination)) return;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      setError("Google Maps API key is not configured. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables.");
      setIsLoading(false);
      return;
    }

    try {
      let baseUrl: string;
      const params = new URLSearchParams({
        key: apiKey,
        maptype: "roadmap"
      });

      if (showDirections && origin && (destination || userLocation)) {
        // Use directions mode to show route from origin to destination
        baseUrl = "https://www.google.com/maps/embed/v1/directions";
        const resolvedOrigin = typeof origin === 'string' ? origin : `${origin.lat},${origin.lng}`;
        params.append('origin', resolvedOrigin);
        const resolvedDestination = destination ?? userLocation!;
        const destinationStr = typeof resolvedDestination === 'string' ? resolvedDestination : `${resolvedDestination.lat},${resolvedDestination.lng}`;
        params.append('destination', destinationStr);
        params.append('mode', travelMode);
        params.append('units', 'imperial'); // Use imperial units for US
      } else {
        // Use view mode to show Rice University campus
        baseUrl = "https://www.google.com/maps/embed/v1/view";
        params.append('center', "29.7174,-95.4018"); // Rice University center coordinates
        params.append('zoom', "17"); // Closer zoom to see campus details
      }

      const embedUrl = `${baseUrl}?${params.toString()}`;
      setMapUrl(embedUrl);
      setIsLoading(false);
    } catch (err) {
      console.error("Error creating map URL:", err);
      setError("Failed to create map URL. Please check your configuration.");
      setIsLoading(false);
    }
  }, [userLocation, zoom, markers, showDirections, origin, destination, travelMode]);

  if (isLoading) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Google Maps...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center`}>
        <div className="text-center p-8">
          <div className="text-red-500 text-6xl mb-4">🗺️</div>
          <p className="text-red-600 mb-2">Google Maps Error</p>
          <p className="text-gray-600 text-sm">{error}</p>
          <div className="mt-4 p-4 bg-white rounded-lg shadow-md">
            <p className="text-sm text-gray-700">
              <strong>Your Location:</strong> {userLocation ? 
                `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : 
                "Unknown"
              }
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Rice University serveries are located around the campus
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {mapUrl && (
        <iframe
          src={mapUrl}
          className="w-full h-full rounded-lg border-0"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Google Maps - Rice University"
        />
      )}
    

      {/* Removed top-right servery and delivery overlay per design request */}
    </div>
  );
}
