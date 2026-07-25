"use client";

import { useEffect, useState } from "react";
import { 
  Users, Terminal, ShieldAlert, Cpu, FileText, Settings, ShieldCheck, Database, CheckCircle
} from "lucide-react";
import { motion } from "framer-motion";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<"users" | "predictions" | "logs" | "models">("predictions");
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  
  // Seeded admin values
  useEffect(() => {
    setUsers([
      { name: "Commander Sarah Jenkins", email: "admin@aerosentinel.com", role: "admin", status: "Active" },
      { name: "Captain Marcus Vance", email: "pilot@aerosentinel.com", role: "pilot", status: "Active" },
      { name: "Flight Inspector Dave Rogers", email: "inspector@aerosentinel.com", role: "pilot", status: "Awaiting Clearance" }
    ]);

    setLogs([
      `[${new Date().toLocaleDateString()} 16:10:45] SYSTEM_INIT: Seeded Random Forest safety weights.`,
      `[${new Date().toLocaleDateString()} 16:11:02] ENGINE: WebSocket telemetry server listening on port 8000.`,
      `[${new Date().toLocaleDateString()} 16:14:20] JWT_AUTH: User pilot@aerosentinel.com successfully validated.`,
      `[${new Date().toLocaleDateString()} 16:15:35] MODEL_VAL: Shapley explainer loaded TreeExplainer framework.`,
      `[${new Date().toLocaleDateString()} 16:22:01] WEBSOCKET: Client connected from 127.0.0.1.`,
      `[${new Date().toLocaleDateString()} 16:22:15] TELEMETRY: Injected 'engine' failure anomaly via client control.`,
      `[${new Date().toLocaleDateString()} 16:22:18] PREDICTION: Propulsion risk spiked to 84.5% - STATUS: EMERGENCY.`,
      `[${new Date().toLocaleDateString()} 16:24:32] REPORTS: PDF Safety audit document compiled (23.4 KB).`
    ]);
  }, []);

  const predictionsList = [
    { id: "TX-4091", time: "16:22:18 UTC", subsystem: "Propulsion Core", risk: "84.5%", state: "EMERGENCY" },
    { id: "TX-4084", time: "15:45:10 UTC", subsystem: "Hydraulic Lines", risk: "32.0%", state: "WARNING" },
    { id: "TX-4071", time: "14:12:02 UTC", subsystem: "Flight Control B", risk: "52.4%", state: "CRITICAL" },
    { id: "TX-4050", time: "11:30:15 UTC", subsystem: "Electrical Bus", risk: "0.8%", state: "NORMAL" }
  ];

  return (
    <div className="space-y-8">
      
      {/* Title */}
      <div className="border-b border-slate-900 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">SYSTEM ADMIN CONSOLE</h1>
          <p className="text-xs text-slate-500 font-semibold tracking-wider uppercase mt-1">Avionics Database Audit & ML Validation Deck</p>
        </div>
        
        {/* Core database info */}
        <div className="flex gap-4 text-xs bg-slate-900 border border-slate-850 px-4 py-2 rounded-xl text-slate-400 font-semibold">
          <div className="flex items-center gap-1.5">
            <Database className="h-4 w-4 text-cyan-400" />
            <span>DB STATUS: <b>ONLINE</b></span>
          </div>
          <div>MODELS: <b>6 ACTIVE</b></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-900 space-x-1 p-0.5 bg-slate-900/40 rounded-xl max-w-md">
        {[
          { id: "predictions", label: "Predictions", icon: ShieldAlert },
          { id: "users", label: "Users", icon: Users },
          { id: "logs", label: "System Logs", icon: Terminal },
          { id: "models", label: "AI Models", icon: Cpu }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center justify-center gap-1.5 flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                isActive
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 shadow shadow-cyan-500/5"
                  : "text-slate-400 hover:text-white hover:bg-slate-900/30"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content panes */}
      <div className="bg-slate-900/30 border border-slate-850 p-6 rounded-2xl">
        
        {activeTab === "predictions" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Historical Prediction Safety Logs</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-350">
                <thead>
                  <tr className="border-b border-slate-850 text-slate-500 uppercase font-bold text-[10px]">
                    <th className="py-3 px-4">Transaction ID</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Subsystem Checked</th>
                    <th className="py-3 px-4">Max Risk Index</th>
                    <th className="py-3 px-4">Threat State</th>
                  </tr>
                </thead>
                <tbody>
                  {predictionsList.map((pred) => (
                    <tr key={pred.id} className="border-b border-slate-900 hover:bg-slate-950/20 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-cyan-400 font-bold">{pred.id}</td>
                      <td className="py-3.5 px-4">{pred.time}</td>
                      <td className="py-3.5 px-4 font-semibold text-white">{pred.subsystem}</td>
                      <td className="py-3.5 px-4">{pred.risk}</td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                          pred.state === "EMERGENCY"
                            ? "bg-rose-500/10 border-rose-500/20 text-rose-450 animate-pulse"
                            : (pred.state === "CRITICAL"
                                ? "bg-orange-500/10 border-orange-500/20 text-orange-450"
                                : (pred.state === "WARNING"
                                    ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
                                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"))
                        }`}>
                          {pred.state}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Onboard Pilot & Admin Registry</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-350">
                <thead>
                  <tr className="border-b border-slate-850 text-slate-500 uppercase font-bold text-[10px]">
                    <th className="py-3 px-4">Full Name</th>
                    <th className="py-3 px-4">Email Username</th>
                    <th className="py-3 px-4">Role Clearance</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, idx) => (
                    <tr key={idx} className="border-b border-slate-900 hover:bg-slate-950/20 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">{user.name}</td>
                      <td className="py-3.5 px-4">{user.email}</td>
                      <td className="py-3.5 px-4 capitalize font-semibold">{user.role}</td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded border ${
                          user.status === "Active"
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : "bg-slate-950 border-slate-800 text-slate-500"
                        }`}>
                          {user.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "logs" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Live System Event Log</h3>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 font-mono text-[11px] text-slate-450 space-y-2 h-[250px] overflow-y-auto">
              {logs.map((log, idx) => (
                <div key={idx} className="leading-relaxed hover:text-white transition-colors">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "models" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Edge Machine Learning Model Cards</h3>
              <p className="text-xs text-slate-500 mt-1">Confusion Matrix & evaluation indexes for active subsystem classifiers.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-3">
                <span className="text-[9px] font-bold text-slate-500 uppercase">CLASSIFIER METRICS</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>Precision: <b>99.7%</b></div>
                  <div>Recall: <b>99.9%</b></div>
                  <div>F1 Score: <b>99.8%</b></div>
                  <div>ROC AUC: <b>0.9998</b></div>
                </div>
              </div>

              {/* Confusion matrix grid */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-2">
                <span className="text-[9px] font-bold text-slate-500 uppercase block">CONFUSION MATRIX</span>
                <div className="grid grid-cols-2 gap-1 text-[10px] text-center font-mono mt-2">
                  <div className="bg-slate-900 p-2 rounded">
                    <span className="block text-slate-500">True Neg</span>
                    <span className="font-extrabold text-emerald-400">1,245</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded">
                    <span className="block text-slate-500">False Pos</span>
                    <span className="font-extrabold text-rose-500">2</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded">
                    <span className="block text-slate-500">False Neg</span>
                    <span className="font-extrabold text-rose-500">1</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded">
                    <span className="block text-slate-500">True Pos</span>
                    <span className="font-extrabold text-emerald-400">252</span>
                  </div>
                </div>
              </div>

              {/* Redundant safety checks info */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 flex flex-col justify-between">
                <span className="text-[9px] font-bold text-slate-500 uppercase block">Firmware updates</span>
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-lg">
                  <CheckCircle className="h-4.5 w-4.5 shrink-0" />
                  <span>MODELS ARE DEPLOYED IN READ-ONLY SILICON</span>
                </div>
                <span className="text-[9px] text-slate-500 leading-normal font-semibold">
                  Dynamic weight rewrites are locked by hardware fuse gates.
                </span>
              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
}
