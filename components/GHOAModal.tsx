'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skull, MessageSquare, Send, X, ShieldAlert, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GHOAModalProps {
  citation: string | null;
  isOpen: boolean;
  onClose: () => void;
}

type ChatMessage = {
  role: 'user' | 'ai';
  text: string;
  time: string;
};

export const GHOAModal: React.FC<GHOAModalProps> = ({ citation, isOpen, onClose }) => {
  const [appealMessage, setAppealMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const getTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const handleAppeal = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!appealMessage.trim() || isSubmitting) return;

    const userMsg = appealMessage;
    setAppealMessage('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg, time: getTime() }]);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'appeal', citation, message: userMsg }),
      });
      const data = await response.json();
      setChatHistory(prev => [...prev, { role: 'ai', text: data.response || "The Void remains silent.", time: getTime() }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'ai', text: "ERROR: Signal lost. Liability increased by 400%.", time: getTime() }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!citation) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Modal Panel - anchored to top */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-[3vh] left-1/2 -translate-x-1/2 z-[201] w-[95vw] sm:max-w-[700px] max-h-[70vh] flex flex-col bg-black border border-red-500/30 text-red-500 rounded-xl overflow-hidden shadow-[0_0_80px_rgba(255,0,51,0.2)] crt-overlay"
          >
        
        {/* Aesthetic HUD Header */}
        <div className="bg-red-950/20 border-b border-red-500/20 p-8 relative overflow-hidden group">
          <div className="hud-bracket hud-bracket-tl text-red-400" />
          <div className="hud-bracket hud-bracket-tr text-red-400" />
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="p-3 bg-red-500/10 rounded-sm border border-red-500/40 relative z-10">
                  <Skull className="w-8 h-8 text-red-400 animate-pulse" />
                </div>
                <div className="absolute inset-0 bg-red-500/20 blur-xl animate-pulse" />
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-[-0.05em] uppercase italic leading-none glitch-text text-red-400">
                  Notice of Non-Compliance
                </h2>
                <div className="flex items-center gap-4 mt-2">
                  <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-red-300/80">
                    Interdimensional Bureaucracy // ID: {Math.random().toString(36).substr(2, 6).toUpperCase()}
                  </p>
                  <div className="h-[1px] flex-1 bg-red-500/20" />
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-3 hover:bg-red-500/10 rounded-full transition-all group/btn">
              <X className="w-6 h-6 group-hover/btn:rotate-90 transition-transform" />
            </button>
          </div>
        </div>

        <div className="p-8 space-y-8 flex-1 flex flex-col min-h-0">
          {/* High-Fidelity Citation Card */}
          <motion.div 
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-red-500/[0.03] border border-red-500/10 p-6 rounded-sm space-y-5 relative overflow-hidden shrink-0"
          >
            {/* Stamp Effect */}
            <div className="absolute -top-4 -right-4 text-[80px] font-black italic opacity-[0.03] pointer-events-none select-none rotate-12 uppercase">
              Censored
            </div>
            
            <div className="flex items-start gap-6 relative z-10">
              <div className="p-2 bg-red-500/10 rounded border border-red-400/30">
                <ShieldAlert className="w-6 h-6 shrink-0 text-red-400" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] uppercase font-black tracking-widest text-red-300/60">Signal Source: Void Superintendent</span>
                  <div className="h-[2px] w-12 bg-red-400/30" />
                </div>
                <p className="text-xl font-medium leading-[1.3] text-white">
                  {citation}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Redesigned Appeal Interface */}
          <div className="space-y-5 flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-red-300/60">
                <Cpu className="w-3 h-3" />
                <span>Signal Packet Exchange</span>
              </div>
              <div className="text-[9px] font-mono text-red-400/50 uppercase tracking-tighter">
                Port: 8080 // Status: Disputed
              </div>
            </div>

            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar relative min-h-[150px]"
            >
              {chatHistory.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-20 px-16 space-y-4">
                  <MessageSquare className="w-12 h-12 mb-2" />
                  <p className="text-xs font-mono leading-relaxed">
                    COMMUNICATION CHANNEL OPENED.<br />
                    EXPECT ZERO MERCY.
                  </p>
                </div>
              )}
              {chatHistory.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "flex flex-col max-w-[90%] gap-1",
                    msg.role === 'user' ? "ml-auto items-end" : "items-start"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-[8px] uppercase font-black tracking-widest opacity-30">
                      {msg.role === 'user' ? 'Earth-Unit' : 'Void-Core'}
                    </span>
                    <span className="text-[8px] font-mono opacity-20">{msg.time}</span>
                  </div>
                  <p className={cn(
                    "p-4 px-5 text-sm leading-relaxed border",
                    msg.role === 'user' 
                      ? "bg-red-500 text-black font-bold border-red-400 rounded-sm rounded-tr-none shadow-[4px_4px_0_rgba(255,0,51,0.2)]" 
                      : "bg-red-950/30 border-red-900/50 text-red-100/90 rounded-sm rounded-tl-none"
                  )}>
                    {msg.text}
                  </p>
                </motion.div>
              ))}
              {isSubmitting && (
                <div className="flex items-center gap-3 text-[10px] text-red-500/40 font-mono tracking-widest px-2 animate-pulse">
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-red-500 rounded-full animate-bounce" />
                    <div className="w-1 h-1 bg-red-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1 h-1 bg-red-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                  SUPERINTENDENT ANALYZING...
                </div>
              )}
            </div>

            <form onSubmit={handleAppeal} className="relative group shrink-0">
              <div className="absolute inset-0 bg-red-500/5 rounded border border-red-500/10 -z-10 group-focus-within:border-red-500/30 transition-all" />
              <Input 
                placeholder="Submit your pathetic appeal..."
                className="bg-transparent border-none text-red-100 placeholder:text-red-900/40 h-16 px-6 focus-visible:ring-0 focus-visible:ring-offset-0"
                value={appealMessage}
                onChange={(e) => setAppealMessage(e.target.value)}
              />
              <Button 
                type="submit"
                size="icon"
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-black border border-red-500/20 transition-all"
                disabled={!appealMessage.trim() || isSubmitting}
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-red-500/10 relative shrink-0">
             <div className="hud-bracket hud-bracket-bl text-red-500/20" />
             <div className="hud-bracket hud-bracket-br text-red-500/20" />
             
            <Button 
              variant="outline" 
              className="border-red-500/20 text-red-500/60 hover:bg-red-500/10 hover:text-red-500 font-black uppercase text-[11px] tracking-[0.2em] rounded-none h-14"
              onClick={onClose}
            >
              Surrender to Fate
            </Button>
            <Button 
              className="bg-red-600 hover:bg-red-500 text-white font-black uppercase text-[11px] tracking-[0.2em] rounded-none h-14 shadow-[0_4px_20px_rgba(220,38,38,0.3)] group/trans"
              disabled
            >
              <span className="group-disabled:opacity-50">Evade Entropy</span>
            </Button>
          </div>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 0, 51, 0.05); }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 0, 51, 0.2); }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 0, 51, 0.4); }
        `}} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
