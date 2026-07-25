"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { 
  MapPin, Activity, Compass, AlertTriangle, ShieldCheck
} from "lucide-react";

// Dynamically import the LiveMapContainer with SSR disabled
const LiveMapContainer = dynamic(() => import("@/components/LiveMapContainer"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-[450px] bg-slate-950 border border-slate-900 rounded-2xl flex items-center justify-center text-xs text-slate-500">
      Initializing Leaflet Avionic Navigation mapping...
    </div>
  )
});

export default function LiveMapPage() {
  const [coords, setCoords] = useState({ lat: 37.7749, lng: -122.4194, heading: 270 });
  const [safetyStatus, setSafetyStatus] = useState("NORMAL");
  const [isLive, setIsLive] = useState(false);
  const [alt, setAlt] = useState(12000);
  const [speed, setSpeed] = useState(340);

  const socketRef = useRef<WebSocket | null>(null);
  const localTimerRef = useRef<NodeJS.Timeout | null>(null);
  const tickRef = useRef(0);

  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
    const wsUrl = backendUrl.replace("http://", "ws://").replace("https://", "wss://") + "/ws/telemetry";

    const connectWs = () => {
      if (localTimerRef.current) {
        clearInterval(localTimerRef.current);
        localTimerRef.current = null;
      }

      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => setIsLive(true);
      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          const { gps_lat, gps_lng, heading, altitude, speed } = data.sensors;
          setCoords({ lat: gps_lat, lng: gps_lng, heading });
          setSafetyStatus(data.prediction.safety_status);
          setAlt(altitude);
          setSpeed(speed);
        } catch (err) {
          // ignore
        }
      };
      ws.onclose = () => {
        setIsLive(false);
        startLocalSimulation();
      };
    };

    const startLocalSimulation = () => {
      if (localTimerRef.current) return;
      localTimerRef.current = setInterval(() => {
        tickRef.current += 1;
        const tick = tickRef.current;
        
        // Flight westward from SF to Seattle/Hawaii path
        const baseLat = 37.7749 + (tick * 0.02);
        const baseLng = -122.4194 - (tick * 0.015);
        const baseHeading = 295 + Math.sin(tick / 10) * 2;
        
        setCoords({ lat: baseLat, lng: baseLng, heading: baseHeading });
        setAlt(12000 + Math.sin(tick / 15) * 50);
        setSpeed(342 + Math.cos(tick / 20) * 2);
        
        // Read possible local anomaly
        const localAnom = (window as any).activeLocalAnomaly;
        setSafetyStatus(localAnom ? "CRITICAL" : "NORMAL");
      }, 1000);
    };

    connectWs();

    return () => {
      if (socketRef.current) socketRef.current.close();
      if (localTimerRef.current) clearInterval(localTimerRef.current);
    };
  }, []);

  return (
    <div className="space-y-8">
      
      {/* Title */}
      <div className="border-b border-slate-900 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">LIVE NAVIGATION & WEATHER MAP</h1>
          <p className="text-xs text-slate-500 font-semibold tracking-wider uppercase mt-1">Avionic GPS Tracking & Airspace Warning Zones</p>
        </div>
        
        {/* Coords bar */}
        <div className="flex gap-4 text-xs font-mono bg-slate-900 border border-slate-850 px-4 py-2 rounded-xl text-slate-400">
          <div className="flex items-center gap-1.5">
            <Compass className="h-4 w-4 text-cyan-400" />
            <span>HEADING: <b>{Math.round(coords.heading)}°</b></span>
          </div>
          <div>LAT: <b>{coords.lat.toFixed(4)}</b></div>
          <div>LNG: <b>{coords.lng.toFixed(4)}</b></div>
        </div>
      </div>

      {/* Main Grid: Left Map, Right telemetry deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Map Container */}
        <div className="lg:col-span-8">
          <LiveMapContainer 
            gpsLat={coords.lat} 
            gpsLng={coords.lng} 
            heading={coords.heading}
            safetyStatus={safetyStatus}
          />
        </div>

        {/* Right Flight Navigation Details */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          
          {/* Active Flight Coordinates */}
          <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl space-y-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">NAVIGATIONAL VECTOR</span>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900">
                <span className="text-[9px] font-bold text-slate-500 uppercase">Altitude</span>
                <span className="text-lg font-black text-white mt-1 block">{Math.round(alt).toLocaleString()} FT</span>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900">
                <span className="text-[9px] font-bold text-slate-500 uppercase">Velocity</span>
                <span className="text-lg font-black text-white mt-1 block">{Math.round(speed)} KTS</span>
              </div>
            </div>

            <div className={`p-4 rounded-xl border flex gap-3 text-xs leading-relaxed ${
              safetyStatus === "NORMAL" 
                ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-350"
                : "bg-rose-500/5 border-rose-500/20 text-rose-350"
            }`}>
              {safetyStatus === "NORMAL" ? (
                <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-400" />
              ) : (
                <AlertTriangle className="h-5 w-5 shrink-0 text-rose-500 animate-pulse" />
              )}
              <div>
                <h4 className="font-bold">Airspace Safety Status: {safetyStatus}</h4>
                <p className="text-[10px] mt-0.5 leading-normal text-slate-400">
                  {safetyStatus === "NORMAL"
                    ? "Aircraft is following Seattle KSFO-KSEA route with no active storm warnings."
                    : "Caution: Subsystem anomalies detected. Confirm secondary communications and track nearest runways."
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Emergency airfield index */}
          <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl flex-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-4">
              NEAREST DIVERSION RUNWAYS
            </span>
            
            <div className="space-y-3.5">
              {[
                { name: "Sacramento Port (SMF)", dist: "45 NM", status: "NOMINAL", active: true },
                { name: "Boise Air Terminal (BOI)", dist: "210 NM", status: "STORM EN-ROUTE", active: false },
                { name: "Portland Field (PDX)", dist: "410 NM", status: "NOMINAL", active: true },
                { name: "Seattle-Tacoma Terminal (SEA)", dist: "540 NM", status: "NOMINAL", active: true }
              ].map((port, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs p-3 rounded-xl bg-slate-950/50 border border-slate-900">
                  <div>
                    <h4 className="font-bold text-white">{port.name}</h4>
                    <span className="text-[9px] font-semibold text-slate-500">Diversion Distance: {port.dist}</span>
                  </div>
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded border ${
                    port.active
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : "bg-rose-500/10 border-rose-500/20 text-rose-450"
                  }`}>
                    {port.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
