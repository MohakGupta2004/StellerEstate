import React from 'react';
import { motion } from 'motion/react';
import { Rocket, Globe, ShoppingCart, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavbarProps {
  onExplore: () => void;
  onHome: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onExplore, onHome }) => {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 glass border-none"
    >
      <div 
        className="flex items-center gap-2 cursor-pointer group"
        onClick={onHome}
      >
        <Rocket className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
        <span className="text-xl font-bold tracking-tighter uppercase">SpaceEstate</span>
      </div>

      <div className="hidden md:flex items-center gap-8 text-sm font-medium uppercase tracking-widest text-muted-foreground">
        <button onClick={onExplore} className="hover:text-white transition-colors">Explore</button>
      </div>

      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          className="rounded-full border-white/20 hover:bg-white/10 hover:text-white text-xs uppercase tracking-widest px-6"
          onClick={onExplore}
        >
          Buy Land
        </Button>
      </div>
    </motion.nav>
  );
};
