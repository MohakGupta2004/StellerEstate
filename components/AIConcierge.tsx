"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageCircle, X, Send, Sparkles, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

type ChatMessage = {
  role: "user" | "ai";
  text: string;
};

export const AIConcierge: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Show welcome message on first open
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
        body: JSON.stringify({
          action: "chat",
          message: userMsg,
          chatHistory,
        }),
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
      {/* Floating Action Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-[150] w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg cursor-pointer",
          isOpen
            ? "bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
            : "bg-gradient-to-br from-violet-600 to-cyan-500 shadow-[0_0_40px_rgba(139,92,246,0.4)]"
        )}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={
          !isOpen && !hasOpened
            ? { scale: [1, 1.1, 1], boxShadow: ["0 0 40px rgba(139,92,246,0.4)", "0 0 60px rgba(139,92,246,0.6)", "0 0 40px rgba(139,92,246,0.4)"] }
            : {}
        }
        transition={
          !isOpen && !hasOpened
            ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
            : {}
        }
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <Sparkles className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Label */}
      <AnimatePresence>
        {!isOpen && !hasOpened && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed bottom-10 right-24 z-[150] bg-white/10 backdrop-blur-xl text-white text-sm font-medium px-4 py-2 rounded-full border border-white/10 pointer-events-none"
          >
            Ask AI about planets ✨
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-[150] w-[380px] max-w-[calc(100vw-3rem)] h-[520px] flex flex-col rounded-2xl overflow-hidden border border-white/10 bg-black/80 backdrop-blur-2xl shadow-[0_20px_80px_rgba(0,0,0,0.6)]"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/5 bg-gradient-to-r from-violet-950/40 to-cyan-950/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm tracking-wide">
                    VOID — AI Planet Agent
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] text-emerald-400/80 uppercase tracking-widest font-medium">
                      Online
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth"
            >
              {chatHistory.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className={cn(
                    "flex",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] px-4 py-3 text-sm leading-relaxed",
                      msg.role === "user"
                        ? "bg-gradient-to-br from-violet-600 to-violet-700 text-white rounded-2xl rounded-br-md shadow-lg"
                        : "bg-white/5 text-white/90 border border-white/5 rounded-2xl rounded-bl-md"
                    )}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/5 border border-white/5 rounded-2xl rounded-bl-md px-5 py-3 flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                      <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Quick Suggestions */}
            {chatHistory.length <= 1 && (
              <div className="px-4 pb-3 flex gap-2 flex-wrap">
                {["Best planet under $10k?", "Something cold & quiet", "Most luxurious option?"].map(
                  (suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setMessage(suggestion);
                        // Trigger send after state update
                        setTimeout(() => {
                          const form = document.getElementById("chat-form") as HTMLFormElement;
                          if (form) form.requestSubmit();
                        }, 50);
                      }}
                      className="text-xs px-3 py-1.5 rounded-full bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                    >
                      {suggestion}
                    </button>
                  )
                )}
              </div>
            )}

            {/* Input */}
            <form
              id="chat-form"
              onSubmit={sendMessage}
              className="px-4 pb-4 pt-2 border-t border-white/5"
            >
              <div className="flex gap-2 items-center bg-white/5 rounded-xl border border-white/10 focus-within:border-violet-500/50 transition-colors px-4 py-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask about any planet..."
                  className="flex-1 bg-transparent text-white text-sm placeholder:text-white/30 outline-none py-3"
                />
                <button
                  type="submit"
                  disabled={!message.trim() || isLoading}
                  className={cn(
                    "p-2 rounded-lg transition-all cursor-pointer",
                    message.trim()
                      ? "bg-violet-600 text-white hover:bg-violet-500 shadow-lg"
                      : "text-white/20"
                  )}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
