"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowRight, ShieldAlert, Cpu, Database, Gauge, CheckCircle2, ChevronRight, Activity, Terminal
} from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const [activeStat, setActiveStat] = useState(0);
  const stats = [
    { label: "AI Prediction Accuracy", value: "99.8%" },
    { label: "Edge Telemetry Latency", value: "<1.8ms" },
    { label: "Active Flights Tracked", value: "1,452" },
    { label: "Prevented Component Failures", value: "324" }
  ];

  // Rotate featured stats
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStat((prev) => (prev + 1) % stats.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative py-12 md:py-20 overflow-hidden">
      
      {/* Background meteor / floating particle lines */}
      <div className="absolute top-10 right-20 w-80 h-80 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />
      
      {/* Hero Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column: Title & pitch */}
        <div className="lg:col-span-7 space-y-8 z-10 text-left">
          
          {/* Tagline Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3.5 py-1.5 text-xs font-semibold text-cyan-400 tracking-wide backdrop-blur"
          >
            <Activity className="h-3.5 w-3.5 animate-pulse text-cyan-400" />
            <span>FAA CLASS 1 COMPLIANT PREDICTIVE FLIGHT ENGINE</span>
          </motion.div>

          {/* Title */}
          <div className="space-y-4">
            <motion.h1 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-none"
            >
              AeroSentinel
            </motion.h1>
            <motion.h2
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
            >
              Explainable Edge AI Decision Support for Real-Time Aircraft Safety
            </motion.h2>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-slate-400 text-sm sm:text-base max-w-xl leading-relaxed"
          >
            Deploy predictive machine learning models directly onto avionic edge nodes. Foresee critical subsystem fatigue (Engines, Hydraulics, Control Flaps) at millisecond latency, and audit decisions dynamically using SHAP and LIME Explainable AI rules.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-wrap gap-4"
          >
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-cyan-500/10 hover:shadow-cyan-400/20 transition-all border border-cyan-400/20"
            >
              <span>Launch Safety Console</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/prediction"
              className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-slate-350 hover:text-white px-5 py-3 rounded-xl border border-slate-800 transition-all"
            >
              <span>Manual Predictor</span>
            </Link>
          </motion.div>

          {/* Rotating Live Statistics */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="border-t border-slate-900 pt-8"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {stats.map((stat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="text-xl sm:text-2xl font-black text-cyan-400 tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>

        {/* Right Column: Holographic animated UI (3D model placeholder/diagram) */}
        <div className="lg:col-span-5 relative flex justify-center items-center">
          
          {/* Radar Sweep and sky grid background */}
          <div className="relative w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] rounded-full border border-cyan-500/10 flex items-center justify-center bg-slate-950/20">
            {/* Radar Sweeping Hand */}
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-500/20 border-r-cyan-500/5 animate-spin" style={{ animationDuration: "8s" }} />
            <div className="absolute inset-10 rounded-full border border-cyan-500/10" />
            <div className="absolute inset-24 rounded-full border border-cyan-500/5" />
            
            {/* Compass ticks */}
            <div className="absolute top-2 font-mono text-[9px] text-cyan-500/40">N 000°</div>
            <div className="absolute bottom-2 font-mono text-[9px] text-cyan-500/40">S 180°</div>
            <div className="absolute right-2 font-mono text-[9px] text-cyan-500/40">E 090°</div>
            <div className="absolute left-2 font-mono text-[9px] text-cyan-500/40">W 270°</div>

            {/* Flying Aircraft SVG overlay */}
            <motion.div 
              animate={{ 
                y: [0, -10, 0],
                rotateX: [0, 4, 0],
                rotateY: [0, 2, 0] 
              }}
              transition={{ 
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute z-10 w-48 text-cyan-400 filter drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]"
            >
              <svg viewBox="0 0 24 24" className="w-full h-full fill-none stroke-current" strokeWidth="0.8">
                {/* Airplane wireframe */}
                <path d="M12 2L2 22h8l2-4 2 4h8L12 2zM12 18V2" />
                <path d="M6 14l6-6 6 6" />
                <circle cx="12" cy="10" r="1.5" className="fill-cyan-500 animate-ping" />
              </svg>
            </motion.div>

            {/* Floating Telemetry Glass cards */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute top-10 -left-6 bg-slate-950/80 border border-slate-800/80 p-3 rounded-xl shadow-2xl backdrop-blur-md w-40"
            >
              <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 uppercase">
                <span>Core Temp</span>
                <span className="text-emerald-400">95.4 C</span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-emerald-400 h-full w-[78%]" />
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-12 -right-8 bg-slate-950/80 border border-slate-800/80 p-3 rounded-xl shadow-2xl backdrop-blur-md w-44"
            >
              <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 uppercase">
                <span>Vibration</span>
                <span className="text-amber-400">4.8 mm/s</span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-amber-400 h-full w-[65%]" />
              </div>
            </motion.div>

          </div>

        </div>

      </div>

      {/* Feature grid Section */}
      <div className="mt-24 md:mt-32 border-t border-slate-900 pt-20">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Comprehensive Predictive Intelligence
          </h2>
          <p className="text-sm text-slate-500">
            AeroSentinel integrates four main pillars of avionics machine learning.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-16">
          
          {/* Card 1: Edge AI */}
          <div className="bg-slate-900/30 border border-slate-850 p-6 rounded-2xl space-y-4 hover:border-slate-800 transition-all group">
            <div className="h-10 w-10 rounded-xl bg-cyan-950 border border-cyan-800/50 flex items-center justify-center text-cyan-400">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Edge AI Architecture</h3>
            <p className="text-xs text-slate-450 leading-relaxed">
              Process predictions locally on hardware adjacent to avionic buses, reducing communication latency to under 2ms.
            </p>
            <Link href="/edge-ai" className="text-xs font-bold text-cyan-400 group-hover:text-cyan-300 flex items-center gap-1">
              <span>Explore Architecture</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Card 2: Explainable AI */}
          <div className="bg-slate-900/30 border border-slate-850 p-6 rounded-2xl space-y-4 hover:border-slate-800 transition-all group">
            <div className="h-10 w-10 rounded-xl bg-cyan-950 border border-cyan-800/50 flex items-center justify-center text-cyan-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">SHAP / LIME Auditing</h3>
            <p className="text-xs text-slate-450 leading-relaxed">
              Deconstruct complex neural networks into individual sensor contribution weights, explaining exactly WHY a system is degrading.
            </p>
            <Link href="/explainability" className="text-xs font-bold text-cyan-400 group-hover:text-cyan-300 flex items-center gap-1">
              <span>View Explanations</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Card 3: Live Telemetry */}
          <div className="bg-slate-900/30 border border-slate-850 p-6 rounded-2xl space-y-4 hover:border-slate-800 transition-all group">
            <div className="h-10 w-10 rounded-xl bg-cyan-950 border border-cyan-800/50 flex items-center justify-center text-cyan-400">
              <Gauge className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Interactive Digital Twin</h3>
            <p className="text-xs text-slate-450 leading-relaxed">
              Monitor flights via a 3D wireframe aircraft. Interrogate subsystems (engines, stabilizers) with immediate hover feedback.
            </p>
            <Link href="/dashboard" className="text-xs font-bold text-cyan-400 group-hover:text-cyan-300 flex items-center gap-1">
              <span>Open Digital Twin</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Card 4: Safety Database */}
          <div className="bg-slate-900/30 border border-slate-850 p-6 rounded-2xl space-y-4 hover:border-slate-800 transition-all group">
            <div className="h-10 w-10 rounded-xl bg-cyan-950 border border-cyan-800/50 flex items-center justify-center text-cyan-400">
              <Database className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Compliance Logs</h3>
            <p className="text-xs text-slate-450 leading-relaxed">
              Download formal PDF/Excel logs of avionic predictions, satisfying FAA safety validation directives and maintenance logs.
            </p>
            <Link href="/admin" className="text-xs font-bold text-cyan-400 group-hover:text-cyan-300 flex items-center gap-1">
              <span>Access Logs</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}
