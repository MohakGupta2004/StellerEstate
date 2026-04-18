import React, { useState } from 'react';
import { StarBackground } from '@';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { PlanetExplorer } from './components/PlanetExplorer';
import { BuyModal } from './components/BuyModal';
import { Planet } from './lib/planets';
import { motion, AnimatePresence } from 'motion/react';

type View = 'home' | 'explore';

export default function App() {
  const [view, setView] = useState<View>('home');
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);

  const handleExplore = () => setView('explore');
  const handleHome = () => setView('home');

  const handleBuy = (planet: Planet) => {
    setSelectedPlanet(planet);
    setIsBuyModalOpen(true);
  };

  return (
    <div className="min-h-screen font-sans selection:bg-white selection:text-black">
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
