'use client'
import React, { useState, useCallback } from 'react';
import { StarBackground } from '@/components/StarBackground';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { PlanetExplorer } from '@/components/PlanetExplorer';
import { BuyModal } from '@/components/BuyModal';
import { AIConcierge } from '@/components/AIConcierge';
import { ScrollGateHint } from '@/components/ScrollGateHint';
import { useScrollGate } from '@/hooks/useScrollGate';
import { Planet } from '@/lib/planets';
import { motion, AnimatePresence } from 'motion/react';

type View = 'home' | 'explore';

export default function App() {
  const [view, setView] = useState<View>('home');
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);

  const handleExplore = useCallback(() => setView('explore'), []);
  const handleHome = useCallback(() => setView('home'), []);

  const { gateState, reset } = useScrollGate({
    onScrollUp: () => {
      if (view === 'home') {
        handleExplore();
        reset();
      }
    },
    onScrollDown: () => {
      if (view === 'explore') {
        handleHome();
        reset();
      }
    },
    // Disable gate when modals are open
    enabled: !isBuyModalOpen,
  });

  const handleBuy = (planet: Planet) => {
    setSelectedPlanet(planet);
    setIsBuyModalOpen(true);
  };

  return (
    <div className="min-h-screen font-sans selection:bg-white selection:text-black overflow-hidden">
      <StarBackground />
      <Navbar onExplore={handleExplore} onHome={handleHome} />

      <main>
        <AnimatePresence mode="wait">
          {view === 'home' ? (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Hero onStart={handleExplore} />
            </motion.div>
          ) : (
            <motion.div
              key="explore"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <PlanetExplorer onBuy={handleBuy} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BuyModal
        planet={selectedPlanet}
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
      />

      <AIConcierge />

      {/* Scroll gate HUD */}
      <AnimatePresence>
        {!isBuyModalOpen && (
          <ScrollGateHint state={gateState} view={view} />
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 p-6 flex justify-between items-center pointer-events-none z-50">
        <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/40">
          © 2026 SpaceEstate Intergalactic LLC
        </div>
        <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/40">
          No refunds in this dimension
        </div>
      </footer>
    </div>
  );
}
