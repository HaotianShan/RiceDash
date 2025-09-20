"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import GoogleMap from "./google-map";

interface MapSelectorProps {
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
  destination?: { lat: number; lng: number };
  travelMode?: 'driving' | 'walking' | 'bicycling' | 'transit';
}

export default function MapSelector({ 
  center = { lat: 29.7174, lng: -95.4018 },
  zoom = 16,
  markers = [],
  className = "w-full h-full",
  showDirections = false,
  origin,
  destination,
  travelMode = 'driving'
}: MapSelectorProps) {
  return (
    <div className={className}>
      {/* Map Container */}
      <Card className="h-[500px] lg:h-[600px]">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="w-5 h-5" />
            Google Maps View
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 h-[calc(100%-72px)]">
          <GoogleMap
            center={center}
            zoom={zoom}
            markers={markers}
            className="w-full h-full"
            showDirections={showDirections}
            origin={origin}
            destination={destination}
            travelMode={travelMode}
          />
        </CardContent>
      </Card>

    </div>
  );
}
