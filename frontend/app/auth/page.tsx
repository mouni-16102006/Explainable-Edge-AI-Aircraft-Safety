"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, User, Lock, Mail, ChevronRight, LogIn, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("pilot");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";
    const body = isLogin 
      ? { username, password } 
      : { username, password, name, role };

    try {
      const response = await fetch(`${backendUrl}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Authentication failed");
      }

      // Save token and user details
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      router.push("/dashboard");
      // Force reload to update navbar state
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err: any) {
      setError(err.message || "Could not connect to authentication services.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (type: "admin" | "pilot") => {
    if (type === "admin") {
      setUsername("admin@aerosentinel.com");
      setPassword("admin123");
    } else {
      setUsername("pilot@aerosentinel.com");
      setPassword("pilot123");
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center py-6 px-4">
      
      {/* Container */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl border border-slate-900 bg-slate-950/80 p-8 shadow-2xl backdrop-blur-xl"
      >
        
        {/* Header Logo */}
        <div className="flex flex-col items-center space-y-2 mb-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-wide">
            AEROSENTINEL SECURE LOGON
          </h2>
          <p className="text-xs text-slate-500 font-semibold uppercase">
            Authorized Flight Deck Access Only
          </p>
        </div>

        {/* Error Dialog */}
        {error && (
          <div className="mb-6 flex items-start gap-2.5 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3.5 text-xs text-rose-400 font-semibold">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Full Name</label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Captain Vance"
                  className="w-full bg-slate-900 border border-slate-850 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-650 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Flight Email</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="pilot@airline.com"
                className="w-full bg-slate-900 border border-slate-850 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-650 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Access Passkey</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 h-4 w-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-850 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-650 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Command Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-900 border border-slate-850 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="pilot">Aircraft Pilot / Flight Crew</option>
                <option value="admin">System Admin / Flight Inspector</option>
              </select>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-2.5 rounded-lg text-sm shadow-md transition-all disabled:opacity-50"
          >
            <span>{loading ? "Authenticating..." : isLogin ? "Secure Login" : "Create Account"}</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </form>

        {/* Tab Toggle */}
        <div className="mt-6 text-center text-xs text-slate-500">
          {isLogin ? "Need pilot clearance credentials?" : "Already have command credentials?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-cyan-400 font-bold hover:underline"
          >
            {isLogin ? "Request Access" : "Sign In"}
          </button>
        </div>

        {/* Quick Demo Logon - Seeded Credentials */}
        {isLogin && (
          <div className="mt-8 border-t border-slate-900 pt-6">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block text-center mb-3">
              Developer Quick Fill (Seeded Credentials)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleQuickFill("pilot")}
                className="flex-1 bg-slate-900 hover:bg-slate-800 border border-slate-850 px-3 py-2 rounded-lg text-[10px] text-slate-400 font-bold text-center"
              >
                Pilot Deck (vance)
              </button>
              <button
                onClick={() => handleQuickFill("admin")}
                className="flex-1 bg-slate-900 hover:bg-slate-800 border border-slate-850 px-3 py-2 rounded-lg text-[10px] text-slate-400 font-bold text-center"
              >
                Admin Deck (jenkins)
              </button>
            </div>
          </div>
        )}

      </motion.div>
    </div>
  );
}
