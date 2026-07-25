"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Activity, ShieldAlert, Cpu, MapPin, Brain, User, LogOut, Menu, X, Radio
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [wsConnected, setWsConnected] = useState(false);

  // Poll local storage for logged-in user and watch socket connection status
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        // ignore
      }
    }

    const checkWs = () => {
      // Check if global socket is open (stored on window or active)
      const wsStatus = (window as any).isTelemetrySocketOpen;
      setWsConnected(!!wsStatus);
    };

    checkWs();
    const interval = setInterval(checkWs, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/");
    window.location.reload();
  };

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: Activity },
    { name: "AI Prediction", href: "/prediction", icon: Brain },
    { name: "Explainability", href: "/explainability", icon: ShieldAlert },
    { name: "Edge AI", href: "/edge-ai", icon: Cpu },
    { name: "Live Map", href: "/live-map", icon: MapPin },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold tracking-wider text-white flex items-center gap-2">
            <span className="text-cyan-400 font-extrabold">✈</span> AEROSENTINEL
          </span>
          <span className="hidden sm:inline-block rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-xs font-semibold text-cyan-400 border border-cyan-500/20">
            EDGE AI v1.4
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 shadow-lg shadow-cyan-500/5"
                    : "text-slate-400 hover:text-white hover:bg-slate-900/50"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Telemetry Indicator + Auth */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Live Feed Status */}
          <div className="flex items-center space-x-2 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-medium">
            <Radio className={`h-3 w-3 ${wsConnected ? "text-emerald-400 animate-pulse" : "text-rose-500"}`} />
            <span className={wsConnected ? "text-emerald-400" : "text-slate-400"}>
              {wsConnected ? "LIVE TELEMETRY" : "LINK OFFLINE"}
            </span>
          </div>

          {/* User Account / Login */}
          {user ? (
            <div className="flex items-center space-x-3">
              <div className="flex flex-col text-right">
                <span className="text-xs font-semibold text-white leading-tight">{user.name}</span>
                <span className="text-[10px] text-slate-500 font-medium capitalize">{user.role}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-all"
                title="Log Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              className="flex items-center space-x-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-all shadow-md shadow-cyan-900/20"
            >
              <User className="h-4 w-4" />
              <span>Pilot Sign In</span>
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center space-x-2">
          {/* Status Indicator (Mobile) */}
          <div className="flex items-center justify-center p-1.5 rounded-lg bg-slate-900 border border-slate-800">
            <Radio className={`h-4 w-4 ${wsConnected ? "text-emerald-400 animate-pulse" : "text-rose-500"}`} />
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white focus:outline-none"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800/80 bg-slate-950 px-4 py-3 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-base font-semibold ${
                  isActive
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-900/50"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
          
          <div className="border-t border-slate-800 pt-3 mt-3">
            {user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-cyan-900/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{user.name}</div>
                    <div className="text-xs text-slate-500 capitalize">{user.role}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 text-slate-400 hover:text-rose-400 px-3 py-2 rounded-lg text-sm font-semibold"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <Link
                href="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center space-x-2 w-full bg-cyan-600 hover:bg-cyan-500 text-white py-2.5 rounded-lg text-base font-bold transition-all"
              >
                <User className="h-5 w-5" />
                <span>Pilot Sign In</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
