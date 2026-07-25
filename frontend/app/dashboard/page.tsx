"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { 
  ShieldAlert, Play, RotateCcw, AlertTriangle, CheckCircle, Wifi, WifiOff, Thermometer, Gauge as SpeedIcon, Activity, BatteryCharging, Zap, Wind, Download
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";

// Dynamically import the 3D Aircraft component with SSR disabled
const Aircraft3D = dynamic(() => import("@/components/Aircraft3D"), { ssr: false });

interface PartState {
  name: string;
  color: string;
  risk: number;
  description: string;
}

export default function Dashboard() {
  const [telemetry, setTelemetry] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [selectedPart, setSelectedPart] = useState<PartState>({
    name: "AeroSentinel Core",
    color: "#10B981",
    risk: 0.02,
    description: "Initialize subsystem inspect by clicking a 3D component."
  });
  const [injectedAnomaly, setInjectedAnomaly] = useState<string | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const fallbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const tickCountRef = useRef(0);

  // Setup WebSocket connection & Local Fallback Telemetry Simulator
  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
    const wsUrl = backendUrl.replace("http://", "ws://").replace("https://", "wss://") + "/ws/telemetry";

    const connectWebSocket = () => {
      if (fallbackTimerRef.current) {
        clearInterval(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }

      console.log("Connecting to telemetry websocket:", wsUrl);
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setIsLive(true);
        (window as any).isTelemetrySocketOpen = true;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setTelemetry(data);
          setInjectedAnomaly(data.anomaly_injected);
          updateHistory(data.sensors);
        } catch (e) {
          // parse error
        }
      };

      ws.onclose = () => {
        setIsLive(false);
        (window as any).isTelemetrySocketOpen = false;
        startLocalFallback();
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    const startLocalFallback = () => {
      console.log("Starting client-side telemetry simulator fallback...");
      if (fallbackTimerRef.current) return;

      fallbackTimerRef.current = setInterval(() => {
        tickCountRef.current += 1;
        const tick = tickCountRef.current;
        
        // Generate simulated variables locally
        let engine_temp = 95.0 + Math.sin(tick / 10.0) * 1.8;
        let oil_pressure = 55.0 + Math.cos(tick / 8.0) * 1.2;
        let hydraulic_pressure = 3000.0 + Math.sin(tick / 5.0) * 20.0;
        let fuel_flow = 2500.0 + Math.sin(tick / 15.0) * 40.0;
        let fuel_pressure = 40.0 + Math.cos(tick / 10.0) * 0.8;
        let vibration = 3.2 + Math.abs(Math.sin(tick / 4.0)) * 0.4;
        let rpm = 8500.0 + Math.sin(tick / 6.0) * 80.0;
        let voltage = 28.0 + Math.sin(tick / 20.0) * 0.15;
        let current = 120.0 + Math.cos(tick / 12.0) * 3.0;
        let battery_soc = Math.max(10.0, 95.0 - tick * 0.005);
        let altitude = 12000.0 + Math.sin(tick / 50.0) * 15.0;
        let speed = 340.0 + Math.cos(tick / 40.0) * 1.5;
        let wind_speed = 15.0 + Math.abs(math_mod_sin(tick)) * 4.0;

        // Apply anomaly injection logic locally
        const currentAnomaly = (window as any).activeLocalAnomaly || null;
        setInjectedAnomaly(currentAnomaly);

        if (currentAnomaly === "engine") {
          engine_temp = 128.5 + (tick % 10) * 1.5;
          oil_pressure = 32.0 - (tick % 5) * 1.0;
          rpm = 10800.0;
        } else if (currentAnomaly === "hydraulics") {
          hydraulic_pressure = 2080.0;
          vibration = 7.1;
        } else if (currentAnomaly === "electrical") {
          voltage = 23.5;
          current = 178.0;
          battery_soc = 22.0;
        } else if (currentAnomaly === "fuel") {
          fuel_flow = 4200.0;
          fuel_pressure = 23.0;
        } else if (currentAnomaly === "landing_gear") {
          vibration = 8.5;
          speed = 270.0;
          altitude = 4200.0;
        } else if (currentAnomaly === "flight_controls") {
          wind_speed = 68.0;
          vibration = 7.4;
          hydraulic_pressure = 2300.0;
        }

        const sensors = {
          engine_temp, oil_pressure, hydraulic_pressure, fuel_flow, fuel_pressure,
          vibration, rpm, voltage, current, battery_soc, altitude, speed, wind_speed,
          cabin_pressure: 11.5, cabin_temp: 22.0, gps_lat: 37.7749, gps_lng: -122.4194
        };

        // Standard risk calculations locally
        let engine_r = (engine_temp > 120 ? 0.8 : 0.02) + (oil_pressure < 40 ? 0.15 : 0);
        let hydraulic_r = hydraulic_pressure < 2400 ? 0.75 : 0.03;
        let electrical_r = voltage < 24.2 ? 0.85 : 0.01;
        let fuel_r = fuel_pressure < 25 ? 0.8 : 0.02;
        let landing_r = (altitude < 8000 && vibration > 7.5) ? 0.7 : 0.02;
        let flight_r = (wind_speed > 60 && vibration > 6.0) ? 0.75 : 0.01;

        const probs = {
          engine_fault: engine_r,
          hydraulic_fault: hydraulic_r,
          electrical_fault: electrical_r,
          fuel_fault: fuel_r,
          landing_gear_fault: landing_r,
          flight_control_fault: flight_r
        };

        const max_p = Math.max(...Object.values(probs));
        let safety_status = "NORMAL";
        let status_color = "green";
        let rec = "All systems functioning within nominal parameters.";

        if (max_p > 0.70) {
          safety_status = "EMERGENCY";
          status_color = "red";
          rec = "Failure imminent. Command backup systems, initiate emergency descent procedures.";
        } else if (max_p > 0.40) {
          safety_status = "CRITICAL";
          status_color = "orange";
          rec = "Significant degradation. Initiate sensor verification and prepare safety backups.";
        } else if (max_p > 0.15) {
          safety_status = "WARNING";
          status_color = "yellow";
          rec = "Minor anomalies detected. Monitor subsystem readings closely.";
        }

        setTelemetry({
          sensors,
          prediction: {
            probabilities: probs,
            risk_score: max_p,
            safety_status,
            status_color,
            recommendation: rec,
            confidence: 0.95
          }
        });

        updateHistory(sensors);
      }, 1000);
    };

    const math_mod_sin = (t: number) => Math.abs(Math.sin(t / 5.0));

    connectWebSocket();

    return () => {
      if (socketRef.current) socketRef.current.close();
      if (fallbackTimerRef.current) clearInterval(fallbackTimerRef.current);
    };
  }, []);

  const updateHistory = (newSensors: any) => {
    setHistory((prev) => {
      const next = [...prev, {
        time: new Date().toLocaleTimeString([], { second: "2-digit" }),
        vibration: parseFloat(newSensors.vibration.toFixed(2)),
        voltage: parseFloat(newSensors.voltage.toFixed(2)),
        rpm: Math.round(newSensors.rpm),
        fuel_flow: Math.round(newSensors.fuel_flow)
      }];
      if (next.length > 20) next.shift();
      return next;
    });
  };

  const handleInjectAnomaly = (subsystem: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "inject_anomaly", subsystem }));
    } else {
      // In local mode, store on window variable so our fallback loop reads it
      (window as any).activeLocalAnomaly = subsystem;
      setInjectedAnomaly(subsystem);
    }
  };

  const handleResetTelemetry = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "reset_anomaly" }));
    } else {
      (window as any).activeLocalAnomaly = null;
      setInjectedAnomaly(null);
    }
  };

  // Helper to compile state values
  const sensors = telemetry?.sensors || {};
  const pred = telemetry?.prediction || {
    risk_score: 0.02,
    safety_status: "NORMAL",
    status_color: "green",
    recommendation: "Connecting telemetry deck...",
    probabilities: {},
    confidence: 0.98
  };

  // Compile PDF report trigger
  const handleDownloadReport = async (fmt: string) => {
    if (!telemetry) return;
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const response = await fetch(`${backendUrl}/api/reports/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sensors: telemetry.sensors,
          predictions: telemetry.prediction,
          format: fmt
        })
      });

      if (!response.ok) throw new Error("Export failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `aerosentinel_safety_audit.${fmt}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      alert("Could not generate report from backend. Check backend status.");
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Dashboard Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-900 pb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">AVIONICS SAFETY MONITOR</h1>
          <p className="text-xs text-slate-500 font-semibold tracking-wider uppercase mt-1">Real-Time Edge Diagnostic Deck</p>
        </div>

        {/* Network status and report exports */}
        <div className="flex flex-wrap items-center gap-3">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${
            isLive ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-amber-500/10 border-amber-500/20 text-amber-400"
          }`}>
            {isLive ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            <span>{isLive ? "WS ENGINE CONNECTED" : "CLIENT SIMULATION (LOCAL)"}</span>
          </div>

          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button 
              onClick={() => handleDownloadReport("pdf")}
              className="flex items-center gap-1 hover:bg-slate-800 hover:text-cyan-400 text-slate-400 px-3 py-1 rounded text-xs font-bold transition-all"
            >
              <Download className="h-3 w-3" />
              <span>PDF</span>
            </button>
            <button 
              onClick={() => handleDownloadReport("xlsx")}
              className="flex items-center gap-1 hover:bg-slate-800 hover:text-cyan-400 text-slate-400 px-3 py-1 border-l border-slate-800 rounded text-xs font-bold transition-all"
            >
              <span>Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left 3D Canvas, Right Inspector & Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: 3D Aircraft Digital Twin */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Activity className="h-4 w-4 text-cyan-400" />
              <span>3D Aircraft Digital Twin Model</span>
            </h2>
            {injectedAnomaly && (
              <span className="text-[10px] bg-rose-500/15 border border-rose-500/30 text-rose-400 font-extrabold px-2.5 py-0.5 rounded-full uppercase animate-pulse">
                Anomaly Injected: {injectedAnomaly}
              </span>
            )}
          </div>
          <div className="h-[400px] w-full">
            <Aircraft3D 
              probabilities={pred.probabilities} 
              onPartSelect={(part) => setSelectedPart(part)} 
            />
          </div>
        </div>

        {/* Right: Telemetry Inspector & Fault Injector */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          
          {/* Subsystem Telemetry Inspector */}
          <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl flex-1 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">TELEMETRY DECK INSPECTOR</span>
              <h3 className="text-lg font-black text-white mt-1.5 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: selectedPart.color }} />
                {selectedPart.name}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mt-3">{selectedPart.description}</p>
            </div>

            <div className="border-t border-slate-850 pt-5 mt-5 space-y-3.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-semibold">Subsystem Failure Probability</span>
                <span className="font-extrabold" style={{ color: selectedPart.color }}>
                  {(selectedPart.risk * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-900">
                <div 
                  className="h-full rounded-full transition-all duration-500" 
                  style={{ width: `${selectedPart.risk * 100}%`, backgroundColor: selectedPart.color }} 
                />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                <span>Safe Status</span>
                <span>Degradation Alarm</span>
              </div>
            </div>
          </div>

          {/* Fault Injector Panel */}
          <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">DIAGNOSTIC TEST BENCH</span>
            <h3 className="text-sm font-bold text-white mt-1">Inject Avionics Telemetry Fault</h3>
            
            <div className="grid grid-cols-2 gap-2.5 mt-4">
              {[
                { label: "Propulsion Core", id: "engine" },
                { label: "Hydraulics", id: "hydraulics" },
                { label: "Electrical Bus", id: "electrical" },
                { label: "Fuel Delivery", id: "fuel" },
                { label: "Landing Strut", id: "landing_gear" },
                { label: "Control Surface", id: "flight_controls" }
              ].map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => handleInjectAnomaly(sub.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl text-left text-xs font-bold transition-all ${
                    injectedAnomaly === sub.id
                      ? "bg-rose-500/10 border-rose-500/50 text-rose-400"
                      : "bg-slate-950 hover:bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Play className="h-3 w-3 shrink-0" />
                  <span className="truncate">{sub.label}</span>
                </button>
              ))}
            </div>

            {injectedAnomaly && (
              <button
                onClick={handleResetTelemetry}
                className="w-full flex items-center justify-center gap-2 mt-4 px-4 py-2 border border-dashed border-cyan-500/30 hover:border-cyan-500 bg-cyan-950/20 text-cyan-400 hover:text-white rounded-xl text-xs font-bold transition-all"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset to Nominal Flight Status</span>
              </button>
            )}
          </div>

        </div>

      </div>

      {/* Live Gauges Row */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-5">
        
        {/* Core Flight Parameters (Health, Risk, Speed, Alt, Temperature, Pressure) */}
        {[
          { 
            label: "AIRCRAFT HEALTH", 
            val: `${(100 - (pred.risk_score * 100)).toFixed(1)}%`,
            desc: "Aggregate safety rating",
            color: pred.status_color === "green" ? "text-emerald-400" : (pred.status_color === "yellow" ? "text-yellow-400" : "text-rose-500")
          },
          { 
            label: "SYSTEM FAULT RISK", 
            val: `${(pred.risk_score * 100).toFixed(1)}%`, 
            desc: "Subsystem anomaly prediction",
            color: pred.risk_score > 0.40 ? "text-rose-500" : "text-cyan-400" 
          },
          { 
            label: "AIRSPEED", 
            val: `${Math.round(sensors.speed || 340)} KTS`, 
            desc: "Flight velocity vector",
            color: "text-white"
          },
          { 
            label: "ALTITUDE", 
            val: `${Math.round(sensors.altitude || 12000).toLocaleString()} FT`, 
            desc: "Barometric height limit",
            color: "text-white"
          },
          { 
            label: "ENGINE TEMP", 
            val: `${(sensors.engine_temp || 95).toFixed(1)} °C`, 
            desc: "Turbine core thermal sensor",
            color: (sensors.engine_temp > 120) ? "text-rose-400 animate-pulse" : "text-white"
          },
          { 
            label: "HYDRAULIC PRESS", 
            val: `${Math.round(sensors.hydraulic_pressure || 3000)} PSI`, 
            desc: "Control valve oil pressure",
            color: (sensors.hydraulic_pressure < 2500) ? "text-amber-400 animate-pulse" : "text-white"
          }
        ].map((gauge, idx) => (
          <div key={idx} className="bg-slate-900/35 border border-slate-850 p-4.5 rounded-2xl flex flex-col justify-between space-y-2">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{gauge.label}</span>
            <div className={`text-lg sm:text-xl font-black ${gauge.color} tracking-tight`}>
              {gauge.val}
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">{gauge.desc}</p>
          </div>
        ))}

      </div>

      {/* Decision Support Recommendation Box */}
      <div className={`p-6 rounded-2xl border flex flex-col sm:flex-row items-start gap-4 ${
        pred.safety_status === "NORMAL"
          ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-300"
          : (pred.safety_status === "WARNING"
              ? "bg-yellow-500/5 border-yellow-500/20 text-yellow-300"
              : "bg-rose-500/5 border-rose-500/20 text-rose-350")
      }`}>
        <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-950 flex items-center justify-center">
          {pred.safety_status === "NORMAL" ? (
            <CheckCircle className="h-5 w-5 text-emerald-400" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-amber-500 animate-bounce" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider">Edge AI Advisor Safety Recommendation</span>
            <span className="text-[10px] bg-slate-950/60 px-2 py-0.5 rounded font-black border border-slate-800">
              STATUS: {pred.safety_status}
            </span>
          </div>
          <p className="text-xs font-semibold leading-relaxed mt-2 text-slate-350">
            {pred.recommendation}
          </p>
        </div>
      </div>

      {/* Live Telemetry History Plots (Recharts) */}
      <div className="bg-slate-900/20 border border-slate-900 p-6 rounded-2xl">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-4">
          ROLLING TELEMETRY TIMELINE (LAST 20 SECONDS)
        </span>
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history}>
              <defs>
                <linearGradient id="colorVib" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorRPM" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#eab308" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} />
              <XAxis dataKey="time" stroke="#475569" fontSize={10} />
              <YAxis stroke="#475569" fontSize={10} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "#020617", 
                  borderColor: "#1e293b",
                  borderRadius: "12px",
                  fontSize: "11px"
                }} 
              />
              <Area type="monotone" dataKey="vibration" stroke="#22d3ee" strokeWidth={2} fillOpacity={1} fill="url(#colorVib)" name="Vibration (mm/s)" />
              <Area type="monotone" dataKey="fuel_flow" stroke="#eab308" strokeWidth={1.5} fillOpacity={1} fill="url(#colorRPM)" name="Fuel Flow (kg/h)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
