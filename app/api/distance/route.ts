import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      origin,
      destination,
      mode = "walking",
    }: {
      origin: { lat: number; lng: number } | string;
      destination: { lat: number; lng: number } | string;
      mode?: "driving" | "walking" | "bicycling" | "transit";
    } = body;

    if (!origin || !destination) {
      return NextResponse.json({ error: "origin and destination are required" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Google Maps API key not configured" }, { status: 500 });
    }

    const originParam =
      typeof origin === "string" ? origin : `${origin.lat},${origin.lng}`;
    const destinationParam =
      typeof destination === "string" ? destination : `${destination.lat},${destination.lng}`;

    const params = new URLSearchParams({
      key: apiKey,
      origins: originParam,
      destinations: destinationParam,
      mode,
      units: "imperial",
    });

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?${params.toString()}`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: `Distance API error: ${text}` }, { status: 502 });
    }
    const data = await res.json();

    const element = data?.rows?.[0]?.elements?.[0];
    const status = element?.status;
    if (status !== "OK") {
      return NextResponse.json({ error: `Distance lookup failed: ${status || "UNKNOWN"}` }, { status: 502 });
    }

    const distanceMeters: number = element.distance.value;
    const durationSeconds: number = element.duration.value;

    const miles = distanceMeters * 0.000621371;
    const minutes = Math.round(durationSeconds / 60);

    return NextResponse.json({
      distance: {
        meters: distanceMeters,
        miles,
        text: element.distance.text,
      },
      duration: {
        seconds: durationSeconds,
        minutes,
        text: element.duration.text,
      },
      origin: data?.origin_addresses?.[0] || originParam,
      destination: data?.destination_addresses?.[0] || destinationParam,
      mode,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}


