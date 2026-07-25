"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Mic, Volume2, VolumeX, Sparkles, Bot, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  sender: "user" | "aero";
  text: string;
  timestamp: string;
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "aero",
      text: "Hello! I am Aero, your AI flight safety assistant. Ask me anything about avionic sensors, predicted failure metrics, SHAP/LIME explanation data, or edge safety protocols.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMsg, setInputMsg] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat body
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Speech Recognition (STT) setup
  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputMsg(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Text to Speech (TTS) helper
  const speakText = (text: string) => {
    if (!voiceEnabled) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const synthVoice = voices.find(v => v.lang.includes("en-US") && v.name.includes("Google")) || voices[0];
    if (synthVoice) utterance.voice = synthVoice;
    utterance.rate = 1.05;
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMsg.trim()) return;

    const userText = inputMsg;
    setInputMsg("");
    
    // Add user message
    const userMsg: Message = {
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const response = await fetch(`${backendUrl}/api/chatbot/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });
      
      const data = await response.json();
      
      const aeroMsg: Message = {
        sender: "aero",
        text: data.response || "I encountered an error analyzing that flight parameter.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, aeroMsg]);
      speakText(aeroMsg.text);
    } catch (err) {
      const errorMsg: Message = {
        sender: "aero",
        text: "Connection to flight control servers offline. Please try querying when systems reconnect.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Expanded Chat Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="mb-4 flex flex-col w-[350px] sm:w-[380px] h-[500px] rounded-2xl border border-slate-800 bg-slate-950/90 shadow-2xl backdrop-blur-xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-900 bg-slate-900/40 px-4 py-3.5">
              <div className="flex items-center space-x-3">
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/10 border border-cyan-500/20">
                  <span className="h-4 w-4 bg-cyan-400 rounded-full animate-pulse shadow-md shadow-cyan-400/50" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">AERO Pilot Support</h3>
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-[10px] font-semibold text-emerald-400">EDGE AI ONLINE</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className={`p-1.5 rounded-lg border transition-all ${
                    voiceEnabled 
                      ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400" 
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                  title={voiceEnabled ? "Voice Output On" : "Voice Output Off"}
                >
                  {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Message Body */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex gap-2 max-w-[82%] ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    
                    {msg.sender === "aero" ? (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
                        <Bot className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                    
                    <div>
                      <div className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none"
                          : "bg-slate-900 border border-slate-800/80 text-slate-300 rounded-tl-none"
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-slate-500 font-semibold mt-1 block px-1">
                        {msg.timestamp}
                      </span>
                    </div>

                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex gap-2 max-w-[80%]">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
                      <Bot className="h-4 w-4 animate-bounce" />
                    </div>
                    <div className="bg-slate-900 border border-slate-800/80 rounded-2xl rounded-tl-none px-4 py-3 flex items-center space-x-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="border-t border-slate-900 bg-slate-950 p-3 flex items-center space-x-2">
              <button
                type="button"
                onClick={startSpeechRecognition}
                className={`p-2 rounded-lg border transition-all ${
                  isListening
                    ? "bg-rose-500/10 border-rose-500/40 text-rose-400 animate-pulse"
                    : "bg-slate-900 border-slate-850 text-slate-400 hover:text-white"
                }`}
                title="Speak Question"
              >
                <Mic className="h-4 w-4" />
              </button>
              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder="Ask about engine temperature, faults, SHAP..."
                className="flex-1 bg-slate-900 border border-slate-850 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white p-2 rounded-lg transition-all"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Animated Blue Orb Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative group flex h-14 w-14 items-center justify-center rounded-full bg-slate-950 border-2 border-cyan-500/80 shadow-lg shadow-cyan-500/20 overflow-hidden cursor-pointer"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 group-hover:scale-110 transition-transform" />
        
        <div className="relative flex flex-col items-center justify-center gap-0.5 h-10 w-10 rounded-full bg-cyan-400/20 border border-cyan-400/40 shadow-inner shadow-cyan-400/50 animate-pulse">
          <div className="flex gap-2.5">
            <span className="h-1.5 w-1.5 bg-cyan-300 rounded-full shadow-glow animate-ping" />
            <span className="h-1.5 w-1.5 bg-cyan-300 rounded-full shadow-glow animate-ping" />
          </div>
          <div className="flex gap-0.5 items-end h-2 mt-1">
            <span className="w-0.5 h-1 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "100ms" }} />
            <span className="w-0.5 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "200ms" }} />
            <span className="w-0.5 h-1 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>

        <div className="absolute inset-0 border border-cyan-400/25 rounded-full scale-95 group-hover:scale-105 transition-all duration-700 animate-spin" />
      </motion.button>
    </div>
  );
}
