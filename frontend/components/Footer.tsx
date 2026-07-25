"use client";

import Link from "next/link";
import { Send, FileText, Shield, Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-900 bg-slate-950 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo and Pitch */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold tracking-wider text-white">
                <span className="text-cyan-400">✈</span> AEROSENTINEL
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Explainable Edge AI safety decision support systems for real-time avionic risk modeling, failure prediction, and telemetry diagnostics. Built for next-generation aerospace compliance.
            </p>
            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
              <Shield className="h-3 w-3 text-cyan-500" />
              <span>Federal Aviation Compliance Grade</span>
            </div>
          </div>
          
          {/* Platform Sections */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Operations</h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">Flight Telemetry Monitor</Link>
              </li>
              <li>
                <Link href="/prediction" className="hover:text-white transition-colors">Predictive Diagnostic Terminal</Link>
              </li>
              <li>
                <Link href="/explainability" className="hover:text-white transition-colors">SHAP / LIME Audit Panel</Link>
              </li>
              <li>
                <Link href="/edge-ai" className="hover:text-white transition-colors">Avionic Edge Computing</Link>
              </li>
            </ul>
          </div>
          
          {/* Documentation & Research */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Resources</h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-cyan-400" />
                <a href="#paper" className="hover:text-white transition-colors">Research Paper (PDF)</a>
              </li>
              <li>
                <a href="#docs" className="hover:text-white transition-colors">Developer APIs</a>
              </li>
              <li>
                <a href="#model-card" className="hover:text-white transition-colors">AI Model Validation Card</a>
              </li>
              <li>
                <a href="#disclaimer" className="hover:text-white transition-colors">Federal Flight Safety Terms</a>
              </li>
            </ul>
          </div>
          
          {/* Newsletter / Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Telemetry Notifications</h3>
            <p className="text-xs text-slate-400">
              Subscribe to avionic firmware updates and critical safety bulletins.
            </p>
            <div className="flex rounded-lg border border-slate-800 bg-slate-900/60 p-1">
              <input
                type="email"
                placeholder="engineering@airline.com"
                className="w-full bg-transparent px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              <button className="rounded-md bg-cyan-600 px-3 text-white hover:bg-cyan-500 transition-colors">
                <Send className="h-3 w-3" />
              </button>
            </div>
            {/* Socials with Inline SVGs */}
            <div className="flex space-x-3 text-slate-400 pt-2">
              <a href="#github" className="hover:text-white transition-colors" title="GitHub">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              </a>
              <a href="#linkedin" className="hover:text-white transition-colors" title="LinkedIn">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.239-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
              <a href="#global" className="hover:text-white transition-colors" title="Global Network">
                <Globe className="h-4 w-4" />
              </a>
            </div>
          </div>
          
        </div>
        
        <div className="mt-8 border-t border-slate-900 pt-8 flex flex-col sm:flex-row items-center justify-between text-center sm:text-left">
          <p className="text-[10px] text-slate-500">
            &copy; {new Date().getFullYear()} AeroSentinel Inc. All rights reserved. Class 1 UAS Flight Safety Advisory System.
          </p>
          <div className="flex space-x-4 text-[10px] text-slate-500 mt-4 sm:mt-0 font-medium">
            <a href="#privacy" className="hover:text-slate-300">Privacy Protocols</a>
            <span>&middot;</span>
            <a href="#terms" className="hover:text-slate-300">Operational Terms</a>
            <span>&middot;</span>
            <a href="#aviation" className="hover:text-slate-300">FAA Disclosures</a>
          </div>
        </div>
        
      </div>
    </footer>
  );
}
