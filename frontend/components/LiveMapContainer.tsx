"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default Leaflet marker icons in Next.js / Webpack
const setupLeafletMarkerIcon = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
};

interface MapProps {
  gpsLat?: number;
  gpsLng?: number;
  heading?: number;
  safetyStatus?: string;
}

export default function LiveMapContainer({ gpsLat = 37.7749, gpsLng = -122.4194, heading = 270, safetyStatus = "NORMAL" }: MapProps) {
  const [airplaneIcon, setAirplaneIcon] = useState<L.DivIcon | null>(null);

  useEffect(() => {
    setupLeafletMarkerIcon();
    
    // Create custom SVG avionic airplane marker rotating with heading angle
    const icon = L.divIcon({
      html: `
        <div style="transform: rotate(${heading}deg); transition: transform 0.8s ease;">
          <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="${
            safetyStatus === "NORMAL" ? "#22d3ee" : (safetyStatus === "WARNING" ? "#f59e0b" : "#ef4444")
          }" stroke-width="2" style="filter: drop-shadow(0 0 6px rgba(34,211,238,0.5));">
            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L14 19v-5.5L21 16z" fill="rgba(34,211,238,0.1)"/>
          </svg>
        </div>
      `,
      className: "custom-airplane-icon",
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
    setAirplaneIcon(icon);
  }, [heading, safetyStatus]);

  // Flight path points (e.g. SFO to Seattle)
  const flightPath: [number, number][] = [
    [37.7749, -122.4194], // SFO
    [38.5758, -121.4788], // Sacramento
    [40.7608, -111.8910], // Salt Lake City
    [43.6150, -116.2023], // Boise
    [45.5152, -122.6784], // Portland
    [47.6062, -122.3321], // Seattle
  ];

  // Emergency Airports list
  const airfields = [
    { name: "San Francisco Int'l (KSFO)", coords: [37.7749, -122.4194] as [number, number], code: "SFO", runway: "11,870 FT" },
    { name: "Sacramento Int'l (KSMF)", coords: [38.6954, -121.5908] as [number, number], code: "SMF", runway: "8,600 FT" },
    { name: "Boise Air Terminal (KBOI)", coords: [43.5644, -116.2228] as [number, number], code: "BOI", runway: "10,000 FT" },
    { name: "Seattle-Tacoma Int'l (KSEA)", coords: [47.4502, -122.3088] as [number, number], code: "SEA", runway: "11,900 FT" }
  ];

  // Severe Turbulence Warning Zone
  const stormCoords = [41.2,-115.5] as [number, number];

  return (
    <div className="w-full h-full min-h-[450px] rounded-2xl border border-slate-900 overflow-hidden relative shadow-2xl">
      <MapContainer
        center={[gpsLat, gpsLng]}
        zoom={5}
        scrollWheelZoom={true}
        style={{ width: "100%", height: "100%", background: "#020617" }}
      >
        {/* Sleek CARTO Dark Matter Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Flight Route Dotted Polyline */}
        <Polyline 
          positions={flightPath} 
          pathOptions={{ color: "#475569", weight: 2, dashArray: "5, 10" }} 
        />

        {/* Severe Storm Warning Area */}
        <Circle 
          center={stormCoords} 
          radius={120000} 
          pathOptions={{ color: "#ef4444", fillColor: "#ef4444", fillOpacity: 0.1, weight: 1 }}
        />

        {/* Active GPS Airplane Marker */}
        {airplaneIcon && (
          <Marker position={[gpsLat, gpsLng]} icon={airplaneIcon}>
            <Popup className="custom-popup">
              <div className="text-xs font-semibold space-y-1">
                <div className="font-extrabold text-cyan-400">FLIGHT SENTINEL A-44</div>
                <div>Lat: {gpsLat.toFixed(4)}</div>
                <div>Lng: {gpsLng.toFixed(4)}</div>
                <div>Heading: {heading}°</div>
                <div className={safetyStatus === "NORMAL" ? "text-emerald-400" : "text-rose-400"}>
                  Safety: {safetyStatus}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Emergency Airfields Markers */}
        {airfields.map((field) => (
          <Marker key={field.code} position={field.coords}>
            <Popup>
              <div className="text-xs space-y-0.5">
                <div className="font-bold text-slate-800">{field.name}</div>
                <div>Airport Code: <b>{field.code}</b></div>
                <div>Primary Runway: <b>{field.runway}</b></div>
              </div>
            </Popup>
          </Marker>
        ))}

      </MapContainer>

      {/* Floating Map Legend overlay */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-slate-950/90 border border-slate-850 p-3 rounded-xl shadow-2xl backdrop-blur-md text-[10px] space-y-2">
        <span className="font-bold text-slate-400 block uppercase tracking-wider mb-1">Live Map Legend</span>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-glow" />
          <span className="text-slate-300 font-semibold">Active Aircraft Coordinates</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
          <span className="text-slate-400 font-semibold">Emergency Runway Ports</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-500/20 border border-rose-500" />
          <span className="text-slate-400 font-semibold">Thunderstorm Warning Cell</span>
        </div>
      </div>

    </div>
  );
}
