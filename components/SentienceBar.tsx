'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Activity, Globe, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SentienceBarProps {
  text: string;
  isThinking?: boolean;
}

export const SentienceBar: React.FC<SentienceBarProps> = ({ text, isThinking }) => {
  const [metrics, setMetrics] = useState({
    entropy: 0.42,
    sync: 98.4,
    coords: "0.0, 0.0"
  });

  // Simple animation for mock metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        entropy: Math.min(0.99, Math.max(0.1, prev.entropy + (Math.random() - 0.5) * 0.05)),
        sync: Math.min(100, Math.max(90, prev.sync + (Math.random() - 0.5) * 0.5)),
        coords: `${(Math.random() * 99).toFixed(1)}, ${(Math.random() * 99).toFixed(1)}`
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] px-8 pb-4 pointer-events-none">
      <div className="container mx-auto">
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="relative bg-black/40 backdrop-blur-3xl border border-cyan-500/20 shadow-[0_0_50px_rgba(0,247,255,0.05)] rounded-sm overflow-hidden pointer-events-auto crt-overlay"
        >
          {/* Header Status Bar */}
          <div className="flex items-center justify-between px-6 py-2 border-b border-cyan-500/10 bg-cyan-950/10">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-300 drop-shadow-[0_0_5px_rgba(34,211,238,0.4)]">Sentient Link Active</span>
              </div>
              <div className="hidden md:flex items-center gap-4 text-[9px] font-black text-cyan-400/70 uppercase tracking-widest">
                <span className="flex items-center gap-1"><Activity className="w-3 h-3"/> ENT: {(metrics.entropy * 100).toFixed(1)}%</span>
                <span className="flex items-center gap-1"><Globe className="w-3 h-3"/> SYNC: {metrics.sync.toFixed(1)}%</span>
                <span className="flex items-center gap-1"><Wifi className="w-3 h-3"/> COORDS: {metrics.coords}</span>
              </div>
            </div>
            <div className="text-[8px] font-mono text-cyan-500/30">
              BUILD // VER. 1.5.2 // VOID_CORE
            </div>
          </div>

          <div className="flex items-center gap-6 px-6 py-5">
            <div className="flex items-center gap-4 shrink-0 pr-6 border-r border-cyan-500/10">
              <div className="relative">
                <div className={cn(
                  "p-3 rounded border border-cyan-500/20 bg-cyan-500/5 transition-all duration-700",
                  isThinking && "border-purple-500/40 bg-purple-500/10 scale-110"
                )}>
                  <Cpu className={cn(
                    "w-6 h-6 text-cyan-400 transition-colors duration-700",
                    isThinking && "text-purple-400 animate-spin"
                  )} />
                </div>
                {isThinking && (
                  <motion.div 
                    layoutId="thinking-glow-v2"
                    className="absolute inset-0 bg-purple-500/30 blur-2xl rounded-full"
                  />
                )}
              </div>
            </div>

            <div className="flex-1 overflow-hidden relative flex flex-col justify-center gap-1">
               <div className="text-[9px] uppercase tracking-[0.6em] font-black text-cyan-400/50 mb-1">
                AI Transmission Sequence
              </div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={text}
                  initial={{ y: 20, opacity: 0, filter: 'blur(10px)' }}
                  animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                  exit={{ y: -20, opacity: 0, filter: 'blur(10px)' }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 150, 
                    damping: 25,
                    filter: { duration: 0.3 }
                  }}
                  className="font-mono text-base sm:text-lg text-white font-bold tracking-tight italic drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                >
                  <span className="text-cyan-400 mr-3 animate-pulse">»</span>
                  {text}
                </motion.p>
              </AnimatePresence>
            </div>

            {isThinking && (
              <div className="flex flex-col items-end gap-1">
                 <div className="flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: [4, 12, 4] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                      className="w-1 bg-purple-500/60"
                    />
                  ))}
                </div>
                <span className="text-[8px] text-purple-400 font-black uppercase tracking-widest animate-pulse mt-1">
                  Parsing History
                </span>
              </div>
            )}
          </div>

          {/* HUD Corner Accents */}
          <div className="hud-bracket hud-bracket-bl text-cyan-500/40 scale-50" />
          <div className="hud-bracket hud-bracket-br text-cyan-500/40 scale-50" />

          {/* Aesthetic Scanner Line */}
          <motion.div 
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent"
          />
        </motion.div>
      </div>
    </div>
  );
};
