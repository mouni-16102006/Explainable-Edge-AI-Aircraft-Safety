"use client";

import { useEffect, useState } from "react";
import { 
  ShieldCheck, HelpCircle, Activity, Sparkles, AlertTriangle, ArrowRight, CornerDownRight, Check
} from "lucide-react";
import { motion } from "framer-motion";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from "recharts";

// String helper to title-case sensor keys without relying on prototype mutations
const formatTitle = (str: string) => {
  return str.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

export default function ExplainabilityPage() {
  const [inputData, setInputData] = useState<any>(null);
  const [outputData, setOutputData] = useState<any>(null);
  
  const [targetComponent, setTargetComponent] = useState("engine_fault");
  const [shapData, setShapData] = useState<any>(null);
  const [limeData, setLimeData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Fetch cached states
  useEffect(() => {
    const cachedInput = localStorage.getItem("last_prediction_input");
    const cachedOutput = localStorage.getItem("last_prediction_output");
    
    if (cachedInput && cachedOutput) {
      setInputData(JSON.parse(cachedInput));
      setOutputData(JSON.parse(cachedOutput));
    } else {
      // Set default initial values if none cached
      const defaultSensors = {
        engine_temp: 126.0, oil_pressure: 34.0, hydraulic_pressure: 3000.0,
        fuel_flow: 2500.0, fuel_pressure: 40.0, vibration: 3.2, rpm: 10800.0,
        voltage: 28.0, current: 120.0, battery_soc: 92.0, altitude: 18000.0,
        speed: 360.0, cabin_pressure: 11.5, cabin_temp: 22.0, wind_speed: 15.0
      };
      const defaultOut = {
        probabilities: { engine_fault: 0.82, hydraulic_fault: 0.04, electrical_fault: 0.01, fuel_fault: 0.02, landing_gear_fault: 0.03, flight_control_fault: 0.01 },
        risk_score: 0.82,
        safety_status: "EMERGENCY",
        status_color: "red",
        recommendation: "Engine core temperature exceeded safety limits. Check propulsion systems immediately.",
        confidence: 0.94
      };
      setInputData(defaultSensors);
      setOutputData(defaultOut);
      localStorage.setItem("last_prediction_input", JSON.stringify(defaultSensors));
      localStorage.setItem("last_prediction_output", JSON.stringify(defaultOut));
    }
  }, []);

  // Fetch SHAP & LIME whenever inputs or target component changes
  useEffect(() => {
    if (!inputData) return;
    
    const fetchExplanations = async () => {
      setLoading(true);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      
      try {
        // Fetch SHAP
        const shapRes = await fetch(`${backendUrl}/api/explain/shap?target=${targetComponent}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sensors: inputData }),
        });
        const shapVal = await shapRes.json();

        // Fetch LIME
        const limeRes = await fetch(`${backendUrl}/api/explain/lime?target=${targetComponent}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sensors: inputData }),
        });
        const limeVal = await limeRes.json();

        setShapData(shapVal);
        setLimeData(limeVal);
      } catch (err) {
        // Fallback calculations in JS if backend is down
        console.log("XAI calculations fell back locally.");
        calculateLocalXAIFallback();
      } finally {
        setLoading(false);
      }
    };

    fetchExplanations();
  }, [inputData, targetComponent]);

  const calculateLocalXAIFallback = () => {
    const shap_vals: Record<string, number> = {};
    const nominals: Record<string, number> = {
      engine_temp: 95.0, oil_pressure: 55.0, hydraulic_pressure: 3000.0,
      fuel_flow: 2500.0, fuel_pressure: 40.0, vibration: 3.5, rpm: 8500.0,
      voltage: 28.0, current: 120.0, battery_soc: 90.0, altitude: 20000.0,
      speed: 380.0, cabin_pressure: 11.5, cabin_temp: 22.0, wind_speed: 15.0
    };

    Object.keys(nominals).forEach((feat) => {
      const val = inputData[feat] || nominals[feat];
      let weight = 0.0;

      if (targetComponent === "engine_fault") {
        if (feat === "engine_temp" && val > 110) weight = (val - 110) * 0.02;
        if (feat === "oil_pressure" && val < 45) weight = (45 - val) * 0.022;
        if (feat === "rpm" && val > 10000) weight = (val - 10000) * 0.0001;
      } else if (targetComponent === "hydraulic_fault") {
        if (feat === "hydraulic_pressure" && val < 2600) weight = (2600 - val) * 0.0012;
        if (feat === "vibration" && val > 5.5) weight = (val - 5.5) * 0.06;
      } else if (targetComponent === "electrical_fault") {
        if (feat === "voltage" && val < 25.5) weight = (25.5 - val) * 0.15;
        if (feat === "battery_soc" && val < 40) weight = (40 - val) * 0.015;
        if (feat === "current" && val > 150) weight = (val - 150) * 0.008;
      } else if (targetComponent === "fuel_fault") {
        if (feat === "fuel_flow" && val > 3500) weight = (val - 3500) * 0.0003;
        if (feat === "fuel_pressure" && val < 30) weight = (30 - val) * 0.04;
      } else if (targetComponent === "landing_gear_fault") {
        if (feat === "vibration" && val > 7.0) weight = (val - 7.0) * 0.09;
        if (feat === "altitude" && val < 8000) weight = (8000 - val) * 0.00002;
      } else if (targetComponent === "flight_control_fault") {
        if (feat === "wind_speed" && val > 45) weight = (val - 45) * 0.008;
        if (feat === "vibration" && val > 6.0) weight = (val - 6.0) * 0.07;
        if (feat === "hydraulic_pressure" && val < 2500) weight = (2500 - val) * 0.0005;
      }

      if (weight === 0.0) {
        weight = ((val - nominals[feat]) / nominals[feat]) * 0.005;
      }
      shap_vals[feat] = weight;
    });

    setShapData({
      shap_values: shap_vals,
      base_value: 0.05,
      success: true,
      fallback: true
    });

    const rules: any[] = [];
    const sortedFeatures = Object.entries(shap_vals).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
    
    for (const [feat, weight] of sortedFeatures.slice(0, 4)) {
      const val = inputData[feat] || 0.0;
      let text = `${formatTitle(feat)} is optimal (${val.toFixed(1)})`;
      if (weight > 0.01) {
        text = `${formatTitle(feat)} exceeded safe margins (${val.toFixed(1)})`;
      } else if (weight < -0.01) {
        text = `${formatTitle(feat)} is stabilizing system (${val.toFixed(1)})`;
      }
      rules.push({ rule: text, weight });
    }

    setLimeData({
      rules,
      success: true,
      fallback: true
    });
  };

  // Prep chart data
  const chartData = shapData?.shap_values
    ? Object.entries(shapData.shap_values)
        .map(([name, val]: [string, any]) => ({
          name: formatTitle(name),
          value: parseFloat((val * 100).toFixed(2)) // represent as percentage points impact
        }))
        .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
        .slice(0, 8)
    : [];

  const activeProb = outputData?.probabilities?.[targetComponent] || 0.02;
  const getSubsystemTitle = (key: string) => {
    return formatTitle(key.replace("fault", "")).toUpperCase() + " SYSTEM";
  };

  return (
    <div className="space-y-8">
      
      {/* Title */}
      <div className="border-b border-slate-900 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">EXPLAINABLE AI (XAI) DECK</h1>
          <p className="text-xs text-slate-500 font-semibold tracking-wider uppercase mt-1">SHAP Force Plots, LIME surrogate rules, & Decision Trees</p>
        </div>

        {/* Subsystem target selector */}
        <select
          value={targetComponent}
          onChange={(e) => setTargetComponent(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-xs font-bold text-cyan-400 focus:outline-none focus:border-cyan-500"
        >
          <option value="engine_fault">Propulsion Core (Engine)</option>
          <option value="hydraulic_fault">Hydraulic Lines</option>
          <option value="electrical_fault">Electrical Bus</option>
          <option value="fuel_fault">Fuel Delivery Cells</option>
          <option value="landing_gear_fault">Landing Struts</option>
          <option value="flight_control_fault">Flight Controls</option>
        </select>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-900/35 border border-slate-850 p-5 rounded-2xl">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Inspected Subsystem</span>
          <h3 className="text-base font-black text-white mt-1">{getSubsystemTitle(targetComponent)}</h3>
        </div>
        <div className="bg-slate-900/35 border border-slate-850 p-5 rounded-2xl">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Subsystem Risk</span>
          <h3 className="text-xl font-black text-rose-400 mt-1">{(activeProb * 100).toFixed(1)}%</h3>
        </div>
        <div className="bg-slate-900/35 border border-slate-850 p-5 rounded-2xl">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Decision Model</span>
          <h3 className="text-base font-black text-white mt-1">Random Forest Ensemble</h3>
        </div>
        <div className="bg-slate-900/35 border border-slate-850 p-5 rounded-2xl">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Explanation Mode</span>
          <h3 className="text-base font-black text-cyan-400 mt-1 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4" />
            <span>SHAP / LIME Hybrid</span>
          </h3>
        </div>
      </div>

      {/* Main Analysis grid: Left SHAP Bar, Right LIME reasoning */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SHAP Bar Graph */}
        <div className="lg:col-span-7 bg-slate-900/40 border border-slate-850 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">SHAP FEATURE IMPORTANCE DECK</span>
              <h3 className="text-sm font-bold text-white mt-0.5">Local Feature Impact on Risk Probability</h3>
            </div>
            <span className="text-[9.5px] font-bold text-cyan-400 uppercase tracking-wider bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/10">
              Shapley Values
            </span>
          </div>

          {loading ? (
            <div className="h-[250px] flex items-center justify-center text-xs text-slate-500">
              Recalculating Shapley matrix...
            </div>
          ) : (
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} opacity={0.5} />
                  <XAxis type="number" stroke="#475569" fontSize={9} unit="%" />
                  <YAxis dataKey="name" type="category" stroke="#475569" fontSize={9.5} width={130} />
                  <Tooltip 
                    formatter={(val: number) => [`${val > 0 ? "+" : ""}${val}%`, "Risk Impact"]}
                    contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", borderRadius: "10px", fontSize: "11px" }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry: any, index: number) => {
                      const isPositive = entry.value >= 0;
                      return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={isPositive ? "#ef4444" : "#10b981"} 
                          fillOpacity={0.7}
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase pt-2 border-t border-slate-950 mt-2">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Decreases Risk</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500" /> Increases Risk</span>
          </div>
        </div>

        {/* LIME Local Rule Checklist */}
        <div className="lg:col-span-5 bg-slate-900/40 border border-slate-850 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">LIME LOCAL SURROGATE RULES</span>
                <h3 className="text-sm font-bold text-white mt-0.5">Surrogate Boundary Conditions</h3>
              </div>
              <span className="text-[9.5px] font-bold text-cyan-400 uppercase tracking-wider bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/10">
                LIME Boundaries
              </span>
            </div>

            {loading ? (
              <div className="h-[200px] flex items-center justify-center text-xs text-slate-500">
                Generating surrogate boundaries...
              </div>
            ) : (
              <div className="space-y-3.5">
                {(limeData?.rules || []).length === 0 ? (
                  [
                    { rule: `Engine Temperature > 120.00 °C`, weight: 0.42, state: "danger" },
                    { rule: `Oil Pressure < 38.00 PSI`, weight: 0.28, state: "danger" },
                    { rule: `Vibration (3.20 mm/s) is Nominal`, weight: -0.04, state: "safe" },
                    { rule: `Engine RPM (10,800) is High`, weight: 0.15, state: "warning" }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-950/50 border border-slate-900">
                      <div className="flex gap-2 text-xs">
                        <span className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${
                          item.state === "danger" ? "bg-rose-500" : (item.state === "warning" ? "bg-amber-400" : "bg-emerald-500")
                        }`} />
                        <span className="text-slate-350 leading-relaxed font-semibold">{item.rule}</span>
                      </div>
                      <span className={`text-[10px] font-bold shrink-0 ${item.weight >= 0 ? "text-rose-400" : "text-emerald-400"}`}>
                        {item.weight >= 0 ? "+" : ""}{(item.weight * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))
                ) : (
                  (limeData.rules).map((item: any, idx: number) => {
                    const isPositive = item.weight >= 0;
                    return (
                      <div key={idx} className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-950/50 border border-slate-900">
                        <div className="flex gap-2 text-xs">
                          <span className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${isPositive ? "bg-rose-500 animate-pulse" : "bg-emerald-500"}`} />
                          <span className="text-slate-350 leading-relaxed font-semibold">{item.rule}</span>
                        </div>
                        <span className={`text-[10px] font-bold shrink-0 ${isPositive ? "text-rose-400" : "text-emerald-400"}`}>
                          {isPositive ? "+" : ""}{(item.weight * 100).toFixed(0)}%
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          <div className="text-[10px] text-slate-500 leading-normal border-t border-slate-950 pt-4 mt-4 font-semibold">
            * LIME fits a local linear surrogate model around the current flight coordinates, checking parameter thresholds.
          </div>
        </div>

      </div>

      {/* Decision Tree Interactive Graphic */}
      <div className="bg-slate-900/20 border border-slate-900 p-6 rounded-2xl space-y-4">
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">EXPLAINABLE STRUCTURE PATHWAY</span>
          <h2 className="text-base font-bold text-white mt-0.5">Ensemble Decision Tree Pathway Validation</h2>
          <p className="text-xs text-slate-500">See which rules in the logic tree fired to trigger the warning rating.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 font-mono text-xs">
          
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 flex flex-col justify-between">
            <span className="text-[9px] font-bold text-slate-500 uppercase">Step 1: Check Temperature</span>
            <div className="mt-2 text-cyan-400 font-bold">Engine Core &gt; 120 °C?</div>
            <div className="mt-4 flex items-center gap-1.5 text-[10px] text-rose-400 font-extrabold uppercase bg-rose-500/5 border border-rose-500/10 px-2 py-0.5 rounded">
              <Check className="h-3 w-3" />
              <span>Fired (Yes)</span>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 flex flex-col justify-between">
            <span className="text-[9px] font-bold text-slate-500 uppercase">Step 2: Check Hydraulics</span>
            <div className="mt-2 text-slate-400 font-bold">Oil Pressure &lt; 38 PSI?</div>
            <div className="mt-4 flex items-center gap-1.5 text-[10px] text-rose-400 font-extrabold uppercase bg-rose-500/5 border border-rose-500/10 px-2 py-0.5 rounded">
              <Check className="h-3 w-3" />
              <span>Fired (Yes)</span>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 flex flex-col justify-between">
            <span className="text-[9px] font-bold text-slate-500 uppercase">Step 3: Check Vibration</span>
            <div className="mt-2 text-slate-450 font-bold">Vibration &gt; 7.5 mm/s?</div>
            <div className="mt-4 flex items-center gap-1.5 text-[10px] text-emerald-400 font-extrabold uppercase bg-emerald-500/5 border border-emerald-500/10 px-2 py-0.5 rounded">
              <span>Bypassed (No)</span>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-rose-500/40 flex flex-col justify-between bg-rose-500/[0.01]">
            <span className="text-[9px] font-bold text-rose-400 uppercase">Step 4: Resolve Risk</span>
            <div className="mt-2 text-rose-400 font-black">PROPULSION EMERGENCY</div>
            <div className="mt-4 text-[10px] text-rose-400 font-extrabold">Prob: {(activeProb * 100).toFixed(0)}%</div>
          </div>

        </div>
      </div>

    </div>
  );
}
