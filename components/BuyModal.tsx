'use client'
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toJpeg } from 'html-to-image';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Planet } from '@/lib/planets';
import { Loader2, CheckCircle2, Download, RefreshCw, ShieldCheck, Globe, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { generateGalacticBlessing } from '@/lib/gemini';
import { cn } from '@/lib/utils';

interface BuyModalProps {
  planet: Planet | null;
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'input' | 'processing' | 'success';

export const BuyModal: React.FC<BuyModalProps> = ({ planet, isOpen, onClose }) => {
  const [step, setStep] = useState<Step>('input');
  const [name, setName] = useState('');
  const [landSize, setLandSize] = useState<'1m' | '10m' | 'whole'>('1m');
  const [processStep, setProcessStep] = useState(0);
  const [blessing, setBlessing] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  const processingMessages = [
    "Connecting to Galactic Bank...",
    "Verifying oxygen rights...",
    "Negotiating with local aliens...",
    "Bribing Intergalactic Authority...",
    "Generating humorous certificate..."
  ];

  const getPrice = () => {
    if (!planet) return 0;
    const base = planet.price;
    if (landSize === '10m') return base * 8;
    if (landSize === 'whole') return base * 1000;
    return base;
  };

  const handleStartPurchase = async () => {
    if (!name) return;
    setStep('processing');
    
    // Get mock blessing
    const b = await generateGalacticBlessing(planet!.name, name);
    setBlessing(b);
  };

  useEffect(() => {
    if (step === 'processing') {
      const interval = setInterval(() => {
        setProcessStep(prev => {
          if (prev >= processingMessages.length - 1) {
            clearInterval(interval);
            setTimeout(() => {
              setStep('success');
              confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#ffffff', '#3b82f6', '#8b5cf6']
              });
            }, 1000);
            return prev;
          }
          return prev + 1;
        });
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [step]);

  const reset = () => {
    setStep('input');
    setProcessStep(0);
    setName('');
    setIsDownloading(false);
    onClose();
  };

  const handleDownload = async () => {
    if (!certificateRef.current) return;
    
    setIsDownloading(true);
    try {
      // Small delay to ensure styles are fully applied
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const dataUrl = await toJpeg(certificateRef.current, { 
        quality: 0.95, 
        backgroundColor: '#0a0a0a',
        pixelRatio: 2 // Higher resolution for download
      });
      
      const link = document.createElement('a');
      link.download = `SpaceEstate-Certificate-${planet?.name}-${name.replace(/\s+/g, '-')}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download certificate', err);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!planet) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => { if (!open) reset(); }}>
      <DialogContent className="w-[95vw] sm:max-w-[500px] glass-dark border-white/10 text-white p-0 overflow-hidden max-h-[95vh] overflow-y-auto">
        <AnimatePresence mode="wait">
          {step === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6 sm:p-8"
            >
              <DialogHeader className="mb-6">
                <DialogTitle className="text-3xl font-bold tracking-tighter uppercase">Claim {planet.name}</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Secure your plot on {planet.name}. No physical visit required (or recommended).
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs uppercase tracking-widest text-muted-foreground">Full Legal Name (for the deed)</Label>
                  <Input 
                    id="name" 
                    placeholder="e.g. Commander Stardust" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-white/5 border-white/10 focus:border-white/30 h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">Select Land Size</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: '100m', label: '100m²', desc: 'Tiny' },
                      { id: '1000m', label: '1000m²', desc: 'Spacious' },
                      { id: 'whole', label: 'Full Planet', desc: 'God Mode' },
                    ].map((size) => (
                      <button
                        key={size.id}
                        onClick={() => setLandSize(size.id as any)}
                        className={cn(
                          "flex flex-col items-center justify-center p-4 rounded-xl border transition-all",
                          landSize === size.id 
                            ? "bg-white text-black border-white" 
                            : "bg-white/5 border-white/10 hover:border-white/30"
                        )}
                      >
                        <span className="font-bold">{size.label}</span>
                        <span className="text-[10px] opacity-60 uppercase">{size.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Total Due</p>
                    <p className="text-2xl font-bold">${getPrice().toLocaleString()}</p>
                  </div>
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto rounded-full px-8 bg-white text-black hover:bg-white/90"
                    disabled={!name}
                    onClick={handleStartPurchase}
                  >
                    Confirm Purchase
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-12 flex flex-col items-center justify-center text-center min-h-[400px]"
            >
              <Loader2 className="w-12 h-12 text-white animate-spin mb-6 opacity-50" />
              <h3 className="text-xl font-medium mb-2">Galactic Transaction in Progress</h3>
              <div className="h-6 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={processStep}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    className="text-muted-foreground text-sm"
                  >
                    {processingMessages[processStep]}
                  </motion.p>
                </AnimatePresence>
              </div>
              
              <div className="w-full max-w-xs bg-white/5 h-1 rounded-full mt-8 overflow-hidden">
                <motion.div 
                  className="bg-white h-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((processStep + 1) / processingMessages.length) * 100}%` }}
                />
              </div>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-0"
            >
              <div className="bg-gradient-to-b from-white/10 to-transparent p-8 text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold tracking-tighter uppercase mb-2">Transaction Complete</h3>
                <p className="text-muted-foreground">Welcome to the elite 0.00001% of space owners.</p>
              </div>

              <div className="p-6 sm:p-8">
                {/* Certificate Preview */}
                <div 
                  ref={certificateRef}
                  className="relative aspect-[1.4/1] w-full bg-[#0a0a0a] border-2 sm:border-4 border-[#d4af37]/30 rounded-lg p-4 sm:p-6 flex flex-col items-center justify-between text-center overflow-hidden shadow-2xl mb-8"
                >
                  <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full border-[10px] sm:border-[20px] border-double border-[#d4af37]" />
                    <Globe className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-64 sm:h-64" />
                  </div>
                  
                  <div className="z-10">
                    <h4 className="text-[#d4af37] font-serif text-sm sm:text-xl tracking-[0.1em] sm:tracking-[0.2em] uppercase mb-1">Certificate of Ownership</h4>
                    <div className="w-16 sm:w-24 h-[1px] bg-[#d4af37]/50 mx-auto" />
                  </div>

                  <div className="z-10 space-y-1 sm:space-y-2">
                    <p className="text-[8px] sm:text-[10px] uppercase tracking-widest opacity-60">This certifies that</p>
                    <p className="text-lg sm:text-2xl font-bold tracking-tight truncate max-w-[200px] sm:max-w-none">{name}</p>
                    <p className="text-[8px] sm:text-[10px] uppercase tracking-widest opacity-60">is the rightful owner of land on</p>
                    <p className="text-xl sm:text-3xl font-bold text-[#d4af37] tracking-tighter uppercase">{planet.name}</p>
                    {blessing && (
                      <div className="pt-1 sm:pt-2 flex items-center justify-center gap-2">
                        <Sparkles className="w-2 h-2 sm:w-3 h-3 text-[#d4af37] opacity-50" />
                        <p className="text-[7px] sm:text-[9px] italic text-[#d4af37]/80 max-w-[150px] sm:max-w-[200px] line-clamp-2">"{blessing}"</p>
                      </div>
                    )}
                  </div>

                  <div className="z-10 w-full flex justify-between items-end text-[6px] sm:text-[8px] uppercase tracking-widest opacity-40">
                    <div className="text-left">
                      <p>Sector: {Math.floor(Math.random() * 9999)}</p>
                      <p>Coord: {Math.random().toFixed(4)}X, {Math.random().toFixed(4)}Y</p>
                    </div>
                    <div className="text-right">
                      <p>ID: SE-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                      <p>Date: {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 z-10 opacity-30">
                    <ShieldCheck className="w-8 h-8 sm:w-12 h-12 text-[#d4af37]" />
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button 
                    className="w-full rounded-full py-6 bg-white text-black hover:bg-white/90 font-bold uppercase tracking-widest disabled:opacity-50"
                    onClick={handleDownload}
                    disabled={isDownloading}
                  >
                    {isDownloading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    {isDownloading ? 'Generating...' : 'Download Certificate'}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full rounded-full py-6 border-white/10 hover:bg-white/10 hover:text-white font-bold uppercase tracking-widest"
                    onClick={reset}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Buy Another Planet
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
