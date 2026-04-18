'use client'
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, MessageSquare, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PLANETS, Planet } from '@/lib/planets';
import { cn } from '@/lib/utils';

interface PlanetExplorerProps {
  onBuy: (planet: Planet) => void;
}

export const PlanetExplorer: React.FC<PlanetExplorerProps> = ({ onBuy }) => {
  const [activeIndex, setActiveIndex] = useState(4); // Start with Mars
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const activePlanet = PLANETS[activeIndex];

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const nextPlanet = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % PLANETS.length);
  }, []);

  const prevPlanet = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + PLANETS.length) % PLANETS.length);
  }, []);

  const planetPositions = useMemo(() => {
    return PLANETS.map((_, index) => {
      const total = PLANETS.length;
      const diff = (index - activeIndex + total) % total;
      
      let normalizedDiff = diff;
      if (diff > total / 2) normalizedDiff = diff - total;

      const angle = (normalizedDiff * (360 / total)) * (Math.PI / 180);
      
      // Responsive radius
      const radius = windowWidth < 1024 ? 180 : 280; 
      
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;
      const scale = Math.max(0.4, (z + radius) / (2 * radius));
      const opacity = Math.max(0.2, (z + radius) / (2 * radius));

      return { x, scale, opacity, z };
    });
  }, [activeIndex, windowWidth]);

  return (
    <div className="relative min-h-screen pt-24 lg:pt-32 pb-20 flex items-center justify-center overflow-hidden">
      <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Planet Carousel */}
        <div className="relative h-[400px] lg:h-[600px] flex flex-col items-center justify-center">
          {/* Orbit Ring Visualization */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] lg:w-[500px] lg:h-[500px] border border-white/5 rounded-full pointer-events-none" />
          
          {/* Carousel Container */}
          <div className="relative w-full h-full flex items-center justify-center perspective-[1500px] transform-gpu">
            {PLANETS.map((planet, index) => {
              const { x, scale, opacity, z } = planetPositions[index];
              const isActive = index === activeIndex;

              return (
                <motion.div
                  key={planet.id}
                  className={cn(
                    "absolute cursor-pointer",
                    isActive ? "z-30" : "z-10"
                  )}
                  initial={false}
                  animate={{
                    x: x,
                    scale: scale,
                    opacity: opacity,
                    translateZ: z,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 150,
                    damping: 25,
                    mass: 1
                  }}
                  onClick={() => setActiveIndex(index)}
                >
                  <div className="relative group">
                    <img
                      src={planet.image}
                      alt={planet.name}
                      className={cn(
                        "w-40 h-40 lg:w-64 lg:h-64 rounded-full object-cover planet-glow border-2 border-white/10",
                        isActive && "border-white/40 shadow-[0_0_60px_rgba(255,255,255,0.25)]"
                      )}
                      loading="eager"
                      referrerPolicy="no-referrer"
                    />
                    {isActive && (
                      <motion.div
                        layoutId="active-glow"
                        className="absolute inset-0 rounded-full bg-white/5 blur-3xl -z-10"
                      />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-6 mt-8 z-40">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button 
                variant="outline" 
                size="icon" 
                className="moon-button rounded-full w-12 h-12"
                onClick={prevPlanet}
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </Button>
            </motion.div>
            
            <div className="flex gap-2">
              {PLANETS.map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all",
                    i === activeIndex ? "bg-white w-4" : "bg-white/20"
                  )} 
                />
              ))}
            </div>

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button 
                variant="outline" 
                size="icon" 
                className="moon-button rounded-full w-12 h-12 "
                onClick={nextPlanet}
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Right Side: Info Panel */}
        <div className="relative z-40">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePlanet.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex flex-col items-center lg:items-start text-center lg:text-left"
            >
              <div className="flex flex-col items-center lg:items-start gap-2 mb-6">
                {activePlanet.badge && (
                  <span className="px-3 py-1 rounded-full bg-white/10 text-[10px] uppercase tracking-widest font-bold text-white border border-white/10">
                    {activePlanet.badge}
                  </span>
                )}
                <h2 className="text-5xl lg:text-8xl font-bold tracking-tighter uppercase text-glow leading-none">
                  {activePlanet.name}
                </h2>
                <p className="text-xl text-muted-foreground font-light italic">
                  "{activePlanet.subtitle}"
                </p>
              </div>

              <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-xl">
                {activePlanet.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 w-full max-w-xl">
                {activePlanet.alienComment && (
                  <div className="glass-dark p-5 rounded-2xl text-left flex gap-4 items-start">
                    <MessageSquare className="w-6 h-6 text-blue-400 shrink-0 mt-1" />
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Alien Review</p>
                      <p className="text-sm italic font-light leading-snug">"{activePlanet.alienComment}"</p>
                    </div>
                  </div>
                )}
                <div className="glass-dark p-5 rounded-2xl text-left flex gap-4 items-start">
                  <ShieldCheck className="w-6 h-6 text-green-400 shrink-0 mt-1" />
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Status</p>
                    <p className="text-sm font-medium">
                      {activePlanet.isSoldOut ? "Sold Out (Earthlings only)" : "Available for Lease"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-8 w-full md:justify-center lg:justify-start">
                <div className="text-center lg:text-left">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Starting Price</p>
                  <p className="text-4xl font-bold tracking-tight">
                    {activePlanet.price === 0 ? "PRICELESS" : `$${activePlanet.price.toLocaleString()}`}
                  </p>
                </div>
                
                <motion.div 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto text-white"
                >
                  <Button 
                    size="lg" 
                    className={cn(
                      "rounded-full px-12 py-8 text-xl font-bold uppercase tracking-widest w-full sm:w-auto text-white",
                      activePlanet.isSoldOut 
                        ? "bg-red-500/20 text-red-500 border border-red-500/50 cursor-not-allowed" 
                        : "moon-button shadow-[0_0_30px_rgba(255,255,255,0.2)] text-white"
                    )}
                    disabled={activePlanet.isSoldOut || activePlanet.isTooHot}
                    onClick={() => onBuy(activePlanet)}
                  >
                    {activePlanet.isSoldOut ? "Sold Out" : "Buy Land Now"}
                  </Button>
                </motion.div>
              </div>

              {activePlanet.reservedBy && (
                <p className="mt-6 text-xs text-muted-foreground flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  Reserved by {activePlanet.reservedBy}
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
