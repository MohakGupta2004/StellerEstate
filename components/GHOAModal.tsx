'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Send, Eye, EyeOff, Radio, TrendingUp, TrendingDown, Minus, Shield, AlertTriangle, Skull } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DossierSection {
  label: string;
  content: string;
  flag: 'OK' | 'WARNING' | 'DANGER' | 'UNKNOWN';
}

export interface PlanetDossier {
  caseId: string;
  clearanceLevel: string;
  sections: DossierSection[];
  verdict: 'BUY' | 'AVOID' | 'PROCEED WITH CAUTION';
  verdictReason: string;
  classified: string;
  agent: string;
}

// Keep AuditReport as alias so PlanetExplorer import doesn't break
export type AuditReport = PlanetDossier;

interface GHOAModalProps {
  report: PlanetDossier | null;
  isOpen: boolean;
  onClose: () => void;
}

type ChatMessage = { role: 'user' | 'ai'; text: string; time: string };

const FLAG = {
  OK:      { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', icon: TrendingUp  },
  WARNING: { color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/25',   icon: Minus       },
  DANGER:  { color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/25',     icon: TrendingDown },
  UNKNOWN: { color: 'text-slate-400',   bg: 'bg-slate-500/10',   border: 'border-slate-500/25',   icon: Minus       },
} as const;

const VERDICT_STYLE = {
  'BUY':                    { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', glow: 'shadow-emerald-500/20' },
  'AVOID':                  { color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/30',     glow: 'shadow-red-500/20'     },
  'PROCEED WITH CAUTION':   { color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/30',   glow: 'shadow-amber-500/20'   },
} as const;

const SECTION_ICONS: Record<string, React.ElementType> = {
  'STRUCTURAL CONDITION': Shield,
  'OCCUPANCY STATUS': Radio,
  'HAZARD ASSESSMENT': AlertTriangle,
  'INVESTMENT OUTLOOK': TrendingUp,
};

export const GHOAModal: React.FC<GHOAModalProps> = ({ report, isOpen, onClose }) => {
  const [phase, setPhase] = useState<'scanning' | 'revealed'>('scanning');
  const [classifiedRevealed, setClassifiedRevealed] = useState(false);
  const [appealMessage, setAppealMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && report) {
      setPhase('scanning');
      setClassifiedRevealed(false);
      setChatHistory([]);
      const t = setTimeout(() => setPhase('revealed'), 2200);
      return () => clearTimeout(t);
    }
  }, [isOpen, report]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chatHistory]);

  const getTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const handleAppeal = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!appealMessage.trim() || isSubmitting || !report) return;
    const userMsg = appealMessage;
    setAppealMessage('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg, time: getTime() }]);
    setIsSubmitting(true);
    try {
      const res = await fetch('/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'appeal', dossier: report, message: userMsg }),
      });
      const data = await res.json();
      setChatHistory(prev => [...prev, { role: 'ai', text: data.response || 'Signal classified.', time: getTime() }]);
    } catch {
      setChatHistory(prev => [...prev, { role: 'ai', text: 'TRANSMISSION LOST. We know where you live.', time: getTime() }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!report) return null;

  const verdictStyle = VERDICT_STYLE[report.verdict] ?? VERDICT_STYLE['PROCEED WITH CAUTION'];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: -32, scale: 0.93 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -32, scale: 0.93 }}
            transition={{ type: 'spring', damping: 24, stiffness: 280 }}
            className="fixed top-[3vh] left-1/2 -translate-x-1/2 z-[201] w-[95vw] sm:max-w-[680px] max-h-[92vh] flex flex-col bg-[#07080a] border border-amber-500/15 rounded-xl overflow-hidden shadow-[0_0_80px_rgba(245,158,11,0.07),0_32px_64px_rgba(0,0,0,0.6)]"
          >
            {/* Header */}
            <div className="relative border-b border-amber-500/10 px-6 py-4 bg-amber-950/10 overflow-hidden">
              {/* Scanning grid overlay */}
              <AnimatePresence>
                {phase === 'scanning' && (
                  <motion.div
                    key="grid"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundImage: 'linear-gradient(rgba(245,158,11,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.04) 1px, transparent 1px)',
                      backgroundSize: '24px 24px',
                    }}
                  />
                )}
              </AnimatePresence>

              {/* Scan line */}
              <AnimatePresence>
                {phase === 'scanning' && (
                  <motion.div
                    key="scanline"
                    initial={{ top: 0 }}
                    animate={{ top: '100%' }}
                    transition={{ duration: 2, ease: 'linear', repeat: Infinity }}
                    className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent z-10 pointer-events-none"
                  />
                )}
              </AnimatePresence>

              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="w-9 h-9 bg-amber-500/10 border border-amber-500/25 rounded-sm flex items-center justify-center">
                      <Skull className="w-5 h-5 text-amber-400/80" />
                    </div>
                    {phase === 'scanning' && (
                      <motion.div
                        animate={{ opacity: [0, 0.5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.2 }}
                        className="absolute inset-0 bg-amber-400/20 blur-md rounded-sm"
                      />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-black uppercase tracking-[0.15em] text-amber-200/90">
                        Property Intelligence Dossier
                      </h2>
                      <span className="text-[7px] font-black uppercase tracking-widest bg-amber-500/15 border border-amber-500/25 text-amber-400 px-1.5 py-0.5 rounded-sm">
                        {report.clearanceLevel}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[8px] font-mono text-amber-500/40 uppercase">Case {report.caseId}</span>
                      <span className="text-amber-500/20">·</span>
                      <span className="text-[8px] font-mono text-amber-500/40 uppercase">{report.agent}</span>
                    </div>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-amber-500/5 rounded transition-colors group">
                  <X className="w-4 h-4 text-amber-500/40 group-hover:text-amber-400 group-hover:rotate-90 transition-all duration-200" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0 custom-scrollbar">
              <AnimatePresence mode="wait">
                {phase === 'scanning' ? (
                  <motion.div
                    key="scanning"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-16 space-y-8"
                  >
                    {/* Radar rings */}
                    <div className="relative w-24 h-24 flex items-center justify-center">
                      {[0, 1, 2].map(i => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0.2, opacity: 0.8 }}
                          animate={{ scale: 2.5, opacity: 0 }}
                          transition={{ duration: 2, repeat: Infinity, delay: i * 0.65, ease: 'easeOut' }}
                          className="absolute inset-0 border border-amber-500/30 rounded-full"
                        />
                      ))}
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-2 border border-amber-500/20 border-t-amber-400/60 rounded-full"
                      />
                      <div className="w-2 h-2 bg-amber-400/60 rounded-full" />
                    </div>

                    <div className="text-center space-y-2">
                      <motion.p
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ repeat: Infinity, duration: 1.3 }}
                        className="text-xs font-mono uppercase tracking-[0.4em] text-amber-400/80"
                      >
                        Accessing Classified Records
                      </motion.p>
                      {['Querying galactic property registry...', 'Decrypting occupancy files...', 'Compiling threat assessment...'].map((line, i) => (
                        <motion.p
                          key={i}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.5 + 0.2 }}
                          className="text-[9px] font-mono text-amber-500/25 uppercase tracking-widest"
                        >
                          {line}
                        </motion.p>
                      ))}
                    </div>

                    <div className="w-48 h-px bg-amber-500/10 overflow-hidden">
                      <motion.div
                        initial={{ width: '0%' }} animate={{ width: '100%' }}
                        transition={{ duration: 2, ease: 'easeInOut' }}
                        className="h-full bg-gradient-to-r from-amber-700/40 to-amber-400/60"
                      />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="revealed"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="space-y-3"
                  >
                    {/* Section cards */}
                    {report.sections.map((section, i) => {
                      const cfg = FLAG[section.flag] ?? FLAG.UNKNOWN;
                      const Icon = SECTION_ICONS[section.label] ?? Shield;
                      const FlagIcon = cfg.icon;
                      return (
                        <motion.div
                          key={section.label}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1, type: 'spring', damping: 24 }}
                          className="border border-white/5 bg-white/[0.02] rounded-sm p-4 space-y-2 hover:border-amber-500/10 transition-colors duration-300"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Icon className="w-3.5 h-3.5 text-amber-500/40 shrink-0" />
                              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-amber-200/40 font-mono">
                                {section.label}
                              </span>
                            </div>
                            <div className={cn('flex items-center gap-1 px-1.5 py-0.5 border rounded-sm', cfg.bg, cfg.border)}>
                              <FlagIcon className={cn('w-2.5 h-2.5', cfg.color)} />
                              <span className={cn('text-[7px] font-black uppercase tracking-widest', cfg.color)}>
                                {section.flag}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-white/70 leading-relaxed pl-5">{section.content}</p>
                        </motion.div>
                      );
                    })}

                    {/* Classified section */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: report.sections.length * 0.1, type: 'spring', damping: 24 }}
                      className="border border-amber-500/20 bg-amber-500/5 rounded-sm p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Eye className="w-3.5 h-3.5 text-amber-400/60 shrink-0" />
                          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-amber-400/70 font-mono">
                            Classified Intel
                          </span>
                        </div>
                        <button
                          onClick={() => setClassifiedRevealed(v => !v)}
                          className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 border border-amber-500/25 rounded-sm hover:bg-amber-500/20 transition-colors group"
                        >
                          {classifiedRevealed
                            ? <EyeOff className="w-2.5 h-2.5 text-amber-400" />
                            : <Eye className="w-2.5 h-2.5 text-amber-400" />
                          }
                          <span className="text-[7px] font-black uppercase tracking-widest text-amber-400">
                            {classifiedRevealed ? 'Redact' : 'Reveal'}
                          </span>
                        </button>
                      </div>
                      <div className="pl-5 relative">
                        <AnimatePresence mode="wait">
                          {classifiedRevealed ? (
                            <motion.p
                              key="revealed-text"
                              initial={{ opacity: 0, filter: 'blur(4px)' }}
                              animate={{ opacity: 1, filter: 'blur(0px)' }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.4 }}
                              className="text-sm text-amber-200/80 leading-relaxed"
                            >
                              {report.classified}
                            </motion.p>
                          ) : (
                            <motion.div
                              key="redacted"
                              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                              className="space-y-1.5"
                            >
                              {[100, 80, 60].map((w, i) => (
                                <div key={i} className={`h-3 bg-amber-900/40 rounded-sm`} style={{ width: `${w}%` }} />
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>

                    {/* Verdict */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: report.sections.length * 0.1 + 0.15 }}
                      className={cn('border rounded-sm p-4 flex items-center justify-between gap-4 shadow-lg', verdictStyle.bg, verdictStyle.border, verdictStyle.glow)}
                    >
                      <div className="space-y-0.5">
                        <p className="text-[8px] font-black uppercase tracking-[0.35em] font-mono text-white/30">Agent Verdict</p>
                        <p className="text-sm text-white/60 leading-snug">{report.verdictReason}</p>
                      </div>
                      <div className={cn('shrink-0 text-lg font-black uppercase tracking-tight text-right font-mono', verdictStyle.color)}>
                        {report.verdict}
                      </div>
                    </motion.div>

                    {/* Dispute channel */}
                    <div className="space-y-3 pt-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-px bg-white/5" />
                        <span className="text-[8px] font-mono uppercase tracking-widest text-white/15">Dispute Findings</span>
                        <div className="flex-1 h-px bg-white/5" />
                      </div>

                      {chatHistory.length > 0 && (
                        <div ref={scrollRef} className="space-y-3 max-h-[180px] overflow-y-auto custom-scrollbar pr-1">
                          {chatHistory.map((msg, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: msg.role === 'user' ? 12 : -12 }}
                              animate={{ opacity: 1, x: 0 }}
                              className={cn('flex flex-col max-w-[85%] gap-0.5', msg.role === 'user' ? 'ml-auto items-end' : 'items-start')}
                            >
                              <span className="text-[7px] font-mono opacity-20 px-1">
                                {msg.role === 'user' ? 'You' : report.agent} · {msg.time}
                              </span>
                              <p className={cn(
                                'text-sm px-3.5 py-2.5 rounded-sm leading-relaxed',
                                msg.role === 'user'
                                  ? 'bg-amber-500/15 border border-amber-500/20 text-amber-100/90'
                                  : 'bg-white/5 border border-white/5 text-white/60'
                              )}>
                                {msg.text}
                              </p>
                            </motion.div>
                          ))}
                          {isSubmitting && (
                            <div className="flex gap-1.5 px-2">
                              {[0, 0.2, 0.4].map((d, i) => (
                                <motion.div
                                  key={i}
                                  animate={{ y: [0, -3, 0] }}
                                  transition={{ repeat: Infinity, duration: 0.6, delay: d }}
                                  className="w-1.5 h-1.5 bg-amber-400/40 rounded-full"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <form onSubmit={handleAppeal} className="relative">
                        <div className="absolute inset-0 bg-white/[0.02] border border-white/5 rounded -z-10 focus-within:border-amber-500/20 transition-colors duration-200" />
                        <Input
                          placeholder="Challenge the assessment..."
                          className="bg-transparent border-none text-white/70 placeholder:text-white/15 h-12 px-4 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
                          value={appealMessage}
                          onChange={e => setAppealMessage(e.target.value)}
                        />
                        <Button
                          type="submit" size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 transition-all w-8 h-8"
                          disabled={!appealMessage.trim() || isSubmitting}
                        >
                          <Send className="w-3.5 h-3.5" />
                        </Button>
                      </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="border-t border-white/5 p-4 grid grid-cols-2 gap-3 shrink-0">
              <Button
                variant="outline"
                className="border-white/8 text-white/30 hover:bg-white/5 hover:text-white/50 font-bold uppercase text-[9px] tracking-[0.25em] rounded-none h-11"
                onClick={onClose}
              >
                Dismiss
              </Button>
              <Button
                className={cn(
                  'font-black uppercase text-[9px] tracking-[0.25em] rounded-none h-11 transition-all',
                  report.verdict === 'BUY'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                    : report.verdict === 'AVOID'
                    ? 'bg-white/5 text-white/20 cursor-not-allowed'
                    : 'bg-amber-600/80 hover:bg-amber-600 text-white'
                )}
                disabled={report.verdict === 'AVOID'}
                onClick={onClose}
              >
                {report.verdict === 'BUY' ? 'Make Offer' : report.verdict === 'AVOID' ? 'Avoid Planet' : 'Proceed Anyway'}
              </Button>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
              .custom-scrollbar::-webkit-scrollbar { width: 3px; }
              .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
              .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(245,158,11,0.15); border-radius: 9999px; }
            ` }} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
