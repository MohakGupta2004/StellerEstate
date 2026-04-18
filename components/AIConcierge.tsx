"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Send, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ChatMessage = { role: "user" | "ai"; text: string };

const SUGGESTIONS = [
  "Best planet under $10k?",
  "Something cold & remote",
  "Most luxurious option?",
];

// Stable star positions (seeded, not random per render)
const STARS = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  x: ((i * 37 + 11) % 97) + 1.5,
  y: ((i * 53 + 7) % 94) + 3,
  r: i % 5 === 0 ? 1.5 : i % 3 === 0 ? 1 : 0.75,
  dur: 1.8 + (i % 5) * 0.4,
  delay: (i % 7) * 0.3,
}));

export const AIConcierge: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chatHistory, isLoading]);

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && !hasOpened) {
      setHasOpened(true);
      setChatHistory([
        {
          role: "ai",
          text: "Welcome to SpaceEstate! 🪐 I'm VOID, your AI real estate agent. Tell me what you're looking for — budget, vibe, climate — and I'll find your perfect planet.",
        },
      ]);
    }
  }, [isOpen, hasOpened]);

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!message.trim() || isLoading) return;
    const userMsg = message.trim();
    setMessage("");
    setChatHistory((prev) => [...prev, { role: "user", text: userMsg }]);
    setIsLoading(true);
    try {
      const res = await fetch("/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "chat", message: userMsg, chatHistory }),
      });
      const data = await res.json();
      setChatHistory((prev) => [
        ...prev,
        { role: "ai", text: data.reply || "Signal lost in the void..." },
      ]);
    } catch {
      setChatHistory((prev) => [
        ...prev,
        { role: "ai", text: "Connection to the void failed. Try again!" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes void-orbit {
          from { transform: rotate(0deg) translateX(34px) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(34px) rotate(-360deg); }
        }
        @keyframes void-orbit-inner {
          from { transform: rotate(180deg) translateX(24px) rotate(-180deg); }
          to   { transform: rotate(540deg) translateX(24px) rotate(-540deg); }
        }
        .void-dot-outer {
          animation: void-orbit 5s linear infinite;
          position: absolute; top: 50%; left: 50%;
          margin-top: -3px; margin-left: -3px;
        }
        .void-dot-inner {
          animation: void-orbit-inner 3.5s linear infinite;
          position: absolute; top: 50%; left: 50%;
          margin-top: -2px; margin-left: -2px;
        }
        .void-scrollbar::-webkit-scrollbar { width: 3px; }
        .void-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .void-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139,92,246,0.18);
          border-radius: 99px;
        }
        @keyframes signal-in {
          from { opacity: 0; filter: blur(6px); transform: translateX(-6px); }
          to   { opacity: 1; filter: blur(0); transform: translateX(0); }
        }
        .signal-in { animation: signal-in 0.35s ease forwards; }
      `}</style>

      {/* ── FAB ── */}
      <div className="fixed bottom-6 right-6 z-[150]" style={{ width: 64, height: 64 }}>
        {/* Orbital dots — only when closed */}
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              key="orbitals"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute inset-0 pointer-events-none"
            >
              <div className="void-dot-outer">
                <div
                  className="rounded-full"
                  style={{
                    width: 6, height: 6,
                    background: "radial-gradient(circle, #a78bfa, #7c3aed)",
                    boxShadow: "0 0 6px rgba(167,139,250,0.8)",
                  }}
                />
              </div>
              <div className="void-dot-inner">
                <div
                  className="rounded-full"
                  style={{
                    width: 4, height: 4,
                    background: "radial-gradient(circle, #67e8f9, #0891b2)",
                    boxShadow: "0 0 5px rgba(103,232,249,0.7)",
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse ring */}
        {!isOpen && !hasOpened && (
          <motion.div
            className="absolute inset-[-8px] rounded-full border border-violet-500/20 pointer-events-none"
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
          />
        )}

        {/* Button core */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.9 }}
          className="relative w-full h-full rounded-full flex items-center justify-center cursor-pointer overflow-hidden"
          style={{
            background: isOpen
              ? "rgba(15,10,30,0.9)"
              : "radial-gradient(circle at 38% 32%, #6d28d9 0%, #1e0540 55%, #04020d 100%)",
            boxShadow: isOpen
              ? "0 0 0 1px rgba(139,92,246,0.2), 0 8px 30px rgba(0,0,0,0.5)"
              : "0 0 0 1px rgba(139,92,246,0.3), 0 0 30px rgba(109,40,217,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          {/* Inner sheen */}
          {!isOpen && (
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%)",
              }}
            />
          )}

          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="x"
                initial={{ rotate: -45, opacity: 0, scale: 0.6 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 45, opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.18 }}
              >
                <X className="w-5 h-5 text-white/50" />
              </motion.div>
            ) : (
              <motion.div
                key="icon"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="flex flex-col items-center gap-[3px]"
              >
                {/* VOID eye icon - two arcs and a dot */}
                <div
                  className="w-5 h-5 rounded-full border border-white/60 flex items-center justify-center"
                  style={{ boxShadow: "0 0 8px rgba(167,139,250,0.6)" }}
                >
                  <motion.div
                    className="w-2 h-2 rounded-full bg-white"
                    animate={{ scale: [1, 1.25, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{ boxShadow: "0 0 4px rgba(255,255,255,0.8)" }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Label bubble */}
      <AnimatePresence>
        {!isOpen && !hasOpened && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ delay: 0.6 }}
            className="fixed bottom-[26px] right-[88px] z-[150] pointer-events-none"
          >
            <div
              className="text-white/60 text-xs font-medium px-3.5 py-2 rounded-full whitespace-nowrap"
              style={{
                background: "rgba(10,5,25,0.85)",
                border: "1px solid rgba(139,92,246,0.2)",
                backdropFilter: "blur(12px)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
              }}
            >
              Ask VOID about planets
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Chat Panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: "spring", damping: 28, stiffness: 340 }}
            className="fixed bottom-[88px] right-6 z-[150] w-[370px] max-w-[calc(100vw-3rem)] h-[540px] flex flex-col rounded-2xl overflow-hidden"
            style={{
              background: "rgba(6, 4, 16, 0.94)",
              backdropFilter: "blur(30px)",
              border: "1px solid rgba(139,92,246,0.12)",
              boxShadow:
                "0 0 0 1px rgba(139,92,246,0.06), 0 30px 90px rgba(0,0,0,0.75), 0 0 80px rgba(109,40,217,0.06)",
            }}
          >
            {/* Star field */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {STARS.map((s) => (
                <motion.div
                  key={s.id}
                  className="absolute rounded-full bg-white"
                  style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.r, height: s.r }}
                  animate={{ opacity: [0.08, 0.35, 0.08] }}
                  transition={{ duration: s.dur, repeat: Infinity, delay: s.delay, ease: "easeInOut" }}
                />
              ))}
            </div>

            {/* Header */}
            <div
              className="relative flex-shrink-0 px-5 py-4 z-10"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(109,40,217,0.08) 0%, rgba(109,40,217,0.02) 100%)",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              <div className="flex items-center gap-3">
                {/* VOID avatar */}
                <div className="relative w-9 h-9 flex-shrink-0">
                  <motion.div
                    className="absolute inset-[-5px] rounded-full border border-violet-500/20"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.div
                    className="absolute inset-[-9px] rounded-full border border-cyan-500/10"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
                  />
                  <div
                    className="absolute inset-0 rounded-full flex items-center justify-center"
                    style={{
                      background:
                        "radial-gradient(circle at 38% 32%, #5b21b6 0%, #0d0520 100%)",
                      boxShadow: "0 0 12px rgba(109,40,217,0.35), inset 0 1px 0 rgba(255,255,255,0.08)",
                    }}
                  >
                    <motion.div
                      className="w-2 h-2 rounded-full bg-white"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.85, 1, 0.85] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                      style={{ boxShadow: "0 0 5px rgba(255,255,255,0.7)" }}
                    />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-white/90 text-sm font-semibold tracking-wide leading-none mb-1">
                    VOID
                  </p>
                  <div className="flex items-center gap-1.5">
                    <motion.div
                      className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1.8, repeat: Infinity }}
                    />
                    <span className="text-[9px] uppercase tracking-[0.22em] text-emerald-400/60 font-medium">
                      Signal Active
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/5 transition-colors group"
                >
                  <X className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-5 space-y-5 void-scrollbar z-10"
            >
              {chatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex gap-2.5",
                    msg.role === "user" ? "justify-end" : "justify-start items-end"
                  )}
                >
                  {/* VOID avatar micro */}
                  {msg.role === "ai" && (
                    <div
                      className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mb-0.5"
                      style={{
                        background: "radial-gradient(circle at 38% 32%, #5b21b6, #050210)",
                        boxShadow: "0 0 6px rgba(109,40,217,0.4)",
                        border: "1px solid rgba(139,92,246,0.2)",
                      }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-white/80" />
                    </div>
                  )}

                  <motion.div
                    initial={
                      msg.role === "ai"
                        ? { opacity: 0, x: -8, filter: "blur(4px)" }
                        : { opacity: 0, y: 6 }
                    }
                    animate={{ opacity: 1, x: 0, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.28, ease: "easeOut" }}
                    className={cn(
                      "max-w-[80%] px-4 py-2.5 text-sm leading-relaxed rounded-2xl",
                      msg.role === "user"
                        ? "rounded-br-[4px] text-white"
                        : "rounded-bl-[4px] text-white/75"
                    )}
                    style={
                      msg.role === "user"
                        ? {
                            background:
                              "linear-gradient(140deg, #6d28d9 0%, #4c1d95 100%)",
                            boxShadow:
                              "0 2px 16px rgba(109,40,217,0.25), inset 0 1px 0 rgba(255,255,255,0.08)",
                          }
                        : {
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.06)",
                          }
                    }
                  >
                    {msg.text}
                  </motion.div>
                </div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-end gap-2.5"
                >
                  <div
                    className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{
                      background: "radial-gradient(circle at 38% 32%, #5b21b6, #050210)",
                      boxShadow: "0 0 6px rgba(109,40,217,0.4)",
                      border: "1px solid rgba(139,92,246,0.2)",
                    }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white/80" />
                  </div>
                  <div
                    className="px-4 py-3 rounded-2xl rounded-bl-[4px]"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div className="flex gap-1.5 items-center h-4">
                      {[0, 0.18, 0.36].map((d, idx) => (
                        <motion.div
                          key={idx}
                          className="rounded-full bg-violet-400/50"
                          style={{ width: 5, height: 5 }}
                          animate={{ y: [0, -5, 0], opacity: [0.35, 1, 0.35] }}
                          transition={{
                            duration: 0.75,
                            repeat: Infinity,
                            delay: d,
                            ease: "easeInOut",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Quick suggestions */}
            <AnimatePresence>
              {chatHistory.length <= 1 && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="px-4 pb-3 flex gap-1.5 flex-wrap z-10"
                >
                  {SUGGESTIONS.map((s, i) => (
                    <motion.button
                      key={s}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      onClick={() => {
                        setMessage(s);
                        setTimeout(() => {
                          const form = document.getElementById(
                            "void-chat-form"
                          ) as HTMLFormElement;
                          if (form) form.requestSubmit();
                        }, 50);
                      }}
                      className="flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-full transition-all cursor-pointer group"
                      style={{
                        background: "rgba(109,40,217,0.07)",
                        border: "1px solid rgba(139,92,246,0.14)",
                        color: "rgba(196,181,253,0.55)",
                      }}
                    >
                      <ChevronRight className="w-2.5 h-2.5 opacity-50 group-hover:opacity-80 transition-opacity" />
                      {s}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input */}
            <form
              id="void-chat-form"
              onSubmit={sendMessage}
              className="px-4 pb-4 pt-2 flex-shrink-0 z-10"
              style={{ borderTop: "1px solid rgba(255,255,255,0.03)" }}
            >
              <div
                className="flex items-center gap-2 rounded-xl px-4 py-1 transition-all duration-300"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: inputFocused
                    ? "1px solid rgba(139,92,246,0.35)"
                    : "1px solid rgba(255,255,255,0.06)",
                  boxShadow: inputFocused
                    ? "0 0 0 3px rgba(109,40,217,0.08)"
                    : "none",
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  placeholder="Ask about any planet..."
                  className="flex-1 bg-transparent text-white/85 text-sm placeholder:text-white/18 outline-none py-3"
                  style={{ caretColor: "#a78bfa" }}
                />
                <AnimatePresence mode="wait">
                  <motion.button
                    key={message.trim() ? "active" : "idle"}
                    type="submit"
                    disabled={!message.trim() || isLoading}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    whileTap={message.trim() ? { scale: 0.85 } : {}}
                    className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer"
                    style={
                      message.trim()
                        ? {
                            background:
                              "linear-gradient(140deg, #6d28d9, #4338ca)",
                            boxShadow: "0 0 14px rgba(109,40,217,0.4)",
                          }
                        : { background: "transparent" }
                    }
                  >
                    <Send
                      className="w-3.5 h-3.5 transition-colors"
                      style={{ color: message.trim() ? "white" : "rgba(255,255,255,0.18)" }}
                    />
                  </motion.button>
                </AnimatePresence>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
