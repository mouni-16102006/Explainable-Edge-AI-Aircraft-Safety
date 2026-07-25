"use client";

import { motion } from "framer-motion";
import { 
  Cpu, Cloud, Zap, Shield, Radio, ArrowRight, Gauge, Layers, Info
} from "lucide-react";

export default function EdgeAIPage() {
  const comparisonData = [
    {
      metric: "Latency",
      edgeVal: "< 1.8 ms",
      cloudVal: "350 - 800 ms",
      desc: "Edge AI guarantees instantaneous safety response. Cloud routing relies on slow satellite links.",
      isEdgeBetter: true
    },
    {
      metric: "Offline Autonomy",
      edgeVal: "100% Operational",
      cloudVal: "0% (No Sat Link)",
      desc: "Edge runs locally on physical avionics. Cloud ceases prediction if connection drops.",
      isEdgeBetter: true
    },
    {
      metric: "SATCOM Bandwidth",
      edgeVal: "Zero Bytes",
      cloudVal: "15.4 GB / Hour",
      desc: "Edge digests raw 1Hz feeds locally. Cloud requires streaming high-density data over satellite.",
      isEdgeBetter: true
    },
    {
      metric: "Data Security",
      edgeVal: "Contained Onboard",
      cloudVal: "Transmitted (SATCOM)",
      desc: "Edge prevents eavesdropping or jamming of telemetry signals during transmission.",
      isEdgeBetter: true
    },
    {
      metric: "Avionic Power Draw",
      edgeVal: "12 Watts (NPU)",
      cloudVal: "Virtual Zero (On Plane)",
      desc: "Edge hardware consumes minor direct bus power. Cloud uses remote server clusters.",
      isEdgeBetter: false
    }
  ];

  return (
    <div className="space-y-12">
      
      {/* Title */}
      <div className="border-b border-slate-900 pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">AVIONIC EDGE COMPUTING ARCHITECTURE</h1>
        <p className="text-xs text-slate-500 font-semibold tracking-wider uppercase mt-1">Local NPU Inference vs Satellite Cloud Pipelines</p>
      </div>

      {/* Explanatory intro */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-slate-900/20 border border-slate-900 p-8 rounded-2xl">
        <div className="space-y-4">
          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block">WHY EDGE AI?</span>
          <h2 className="text-xl font-bold text-white leading-snug">
            Safety calculations cannot wait for satellite round-trips.
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            In military aviation and civil commercial transport, a hydraulic leak or propulsion flameout demands millisecond action. 
            AeroSentinel embeds optimized random forests, CNN classifiers, and SHAP estimators directly onto hardware architectures (e.g. ARM Cortex-M7, Jetson Orin Nano, or custom FGPA arrays) sitting directly on the aircraft's ARINC-429 telemetry data bus.
          </p>
          <div className="flex gap-4 pt-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-cyan-400" />
              <span className="text-[11px] font-bold text-slate-350">1.8ms Edge Loop</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-400" />
              <span className="text-[11px] font-bold text-slate-350">Fail-Safe Offline Mode</span>
            </div>
          </div>
        </div>

        {/* Dynamic visual box */}
        <div className="relative h-[200px] bg-slate-950 border border-slate-850 rounded-xl overflow-hidden flex items-center justify-center">
          {/* Animated Wave connecting edge to plane */}
          <div className="absolute inset-0 bg-[radial-gradient(#0891b2_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
          
          <div className="flex items-center justify-between gap-12 z-10 w-[80%]">
            
            {/* Plane Edge Node */}
            <div className="text-center space-y-2 flex flex-col items-center">
              <div className="h-14 w-14 rounded-full bg-cyan-950/80 border-2 border-cyan-400 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-400/20">
                <Cpu className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-bold text-cyan-400 uppercase">Onboard NPU</span>
              <span className="text-[9px] text-slate-500 font-bold uppercase">&lt;2ms latency</span>
            </div>

            {/* Connecting arrows */}
            <div className="flex-1 flex flex-col items-center justify-center relative">
              <span className="text-[8px] font-bold text-slate-600 uppercase mb-1">ARINC Bus</span>
              <div className="w-full h-0.5 bg-slate-800 relative">
                <span className="absolute h-2 w-2 rounded-full bg-cyan-400 -top-[3px] left-0 animate-ping" />
              </div>
            </div>

            {/* Subsystems */}
            <div className="text-center space-y-2 flex flex-col items-center">
              <div className="h-14 w-14 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                <Layers className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Avionics Bus</span>
              <span className="text-[9px] text-slate-500 font-bold uppercase">Direct Stream</span>
            </div>

          </div>
        </div>

      </div>

      {/* Cloud vs Edge Comparison Table */}
      <div className="bg-slate-900/30 border border-slate-850 p-6 rounded-2xl">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-4">
          EDGE VS SATELLITE CLOUD BENCHMARK
        </span>
        
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300">
            <thead>
              <tr className="border-b border-slate-850 text-[10px] font-bold text-slate-500 uppercase">
                <th className="py-3 px-4">Evaluation Dimension</th>
                <th className="py-3 px-4">AeroSentinel Edge AI</th>
                <th className="py-3 px-4">Traditional Cloud AI</th>
                <th className="py-3 px-4">Operational Impact</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((row, idx) => (
                <tr key={idx} className="border-b border-slate-900 hover:bg-slate-950/30 transition-colors">
                  <td className="py-4.5 px-4 font-bold text-white">{row.metric}</td>
                  <td className="py-4.5 px-4">
                    <span className={`font-black ${row.isEdgeBetter ? "text-emerald-400" : "text-slate-400"}`}>
                      {row.edgeVal}
                    </span>
                  </td>
                  <td className="py-4.5 px-4">
                    <span className={`font-bold ${!row.isEdgeBetter && row.metric === "Avionic Power Draw" ? "text-emerald-400" : "text-rose-500"}`}>
                      {row.cloudVal}
                    </span>
                  </td>
                  <td className="py-4.5 px-4 text-slate-450 leading-relaxed">{row.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Architecture diagrams */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-slate-900/25 border border-slate-900 p-5 rounded-2xl space-y-3">
          <div className="h-9 w-9 rounded-lg bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyan-400">
            <Radio className="h-4.5 w-4.5" />
          </div>
          <h3 className="text-sm font-bold text-white">1. Sensor Acquisition</h3>
          <p className="text-xs text-slate-500 leading-normal">
            Physical temperature probes, hydraulic pressure transducers, and wing accel gauges sample readings at 100Hz into avionic multiplexers.
          </p>
        </div>

        <div className="bg-slate-900/25 border border-slate-900 p-5 rounded-2xl space-y-3">
          <div className="h-9 w-9 rounded-lg bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyan-400">
            <Cpu className="h-4.5 w-4.5" />
          </div>
          <h3 className="text-sm font-bold text-white">2. Local NPU Inference</h3>
          <p className="text-xs text-slate-500 leading-normal">
            Telemetry variables flow into an onboard micro-NPU. Random Forest ensembles evaluate fault states and failure risks within 1.8 milliseconds.
          </p>
        </div>

        <div className="bg-slate-900/25 border border-slate-900 p-5 rounded-2xl space-y-3">
          <div className="h-9 w-9 rounded-lg bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyan-400">
            <Gauge className="h-4.5 w-4.5" />
          </div>
          <h3 className="text-sm font-bold text-white">3. Cockpit Advisories</h3>
          <p className="text-xs text-slate-500 leading-normal">
            Inference probability indices trigger visual warning indicators on flight decks and audio safety alerts, bypassing SATCOM needs.
          </p>
        </div>

      </div>

    </div>
  );
}
