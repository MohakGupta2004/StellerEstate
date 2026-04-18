'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Rocket } from 'lucide-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

interface NavbarProps {
  onExplore: () => void;
  onHome: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onExplore, onHome }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 glass border-none"
    >
      <div
        className="flex items-center gap-2 cursor-pointer group"
        onClick={onHome}
      >
        <Rocket className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
        <span className="text-xl font-bold tracking-tighter uppercase">StellerState</span>
      </div>

      <div className="hidden md:flex items-center gap-8 text-sm font-medium uppercase tracking-widest text-muted-foreground">
        <button onClick={onExplore} className="hover:text-white transition-colors">
          Explore
        </button>
      </div>

      {/* Wallet connect — styled to match app theme */}
      <style>{`
        .wallet-adapter-button {
          background: transparent !important;
          border: 1px solid rgba(255,255,255,0.2) !important;
          border-radius: 9999px !important;
          font-size: 11px !important;
          font-weight: 600 !important;
          letter-spacing: 0.12em !important;
          text-transform: uppercase !important;
          padding: 8px 20px !important;
          height: auto !important;
          color: rgba(255,255,255,0.7) !important;
          transition: all 0.2s !important;
        }
        .wallet-adapter-button:hover:not([disabled]) {
          background: rgba(255,255,255,0.08) !important;
          color: #fff !important;
        }
        .wallet-adapter-button-trigger {
          background: transparent !important;
        }
        .wallet-adapter-modal-wrapper {
          background: rgba(10,5,25,0.96) !important;
          border: 1px solid rgba(139,92,246,0.2) !important;
          border-radius: 16px !important;
        }
        .wallet-adapter-modal-title {
          color: white !important;
          font-size: 18px !important;
          font-weight: 700 !important;
        }
        .wallet-adapter-modal-list li {
          background: rgba(255,255,255,0.04) !important;
          border: 1px solid rgba(255,255,255,0.06) !important;
          border-radius: 12px !important;
        }
        .wallet-adapter-modal-list li:hover {
          background: rgba(139,92,246,0.1) !important;
          border-color: rgba(139,92,246,0.25) !important;
        }
      `}</style>

      {mounted && <WalletMultiButton />}
    </motion.nav>
  );
};
