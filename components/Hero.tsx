import React from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface HeroProps {
  onStart: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStart }) => {
  return (
    <div className="relative h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="z-10"
      >
        <motion.h1 
          className="text-4xl sm:text-6xl md:text-8xl font-bold tracking-tighter uppercase mb-4 text-glow px-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Own a piece <br className="hidden sm:block" /> of the universe.
        </motion.h1>
        
        <motion.p 
          className="text-lg md:text-2xl text-muted-foreground mb-8 md:mb-12 max-w-2xl mx-auto font-light px-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Because Earth is overrated and the neighbors are too loud. 
          Secure your galactic deed today.
        </motion.p>

        <motion.div 
          className="flex flex-col sm:flex-row items-center justify-center gap-4 px-6 sm:px-0"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Button 
            size="lg" 
            className="w-full sm:w-auto rounded-full px-8 py-6 text-lg font-medium bg-white text-black hover:bg-white/90 group"
            onClick={onStart}
          >
            Start Buying Planets
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="w-full sm:w-auto rounded-full px-8 py-6 text-lg font-medium hover:text-white border-white/20 hover:bg-white/10"
            onClick={onStart}
          >
            Browse Planets
          </Button>
        </motion.div>

        <motion.p 
          className="mt-8 md:mt-12 text-[10px] sm:text-xs uppercase tracking-[0.3em] text-muted-foreground/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Trusted by 0+ space owners 🚀
        </motion.p>
      </motion.div>

      {/* Background Decorative Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
    </div>
  );
};
