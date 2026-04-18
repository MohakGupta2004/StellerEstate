'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toJpeg } from 'html-to-image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Planet } from '@/lib/planets';
import {
  Loader2, CheckCircle2, Download, RefreshCw,
  ShieldCheck, Globe, Sparkles, Wallet, ExternalLink, AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { generateGalacticBlessing } from '@/lib/gemini';
import { cn } from '@/lib/utils';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Transaction, TransactionInstruction, SystemProgram, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import {
  PROGRAM_ID, getTreasuryPDA, getPurchasePDA,
  PLANET_PRICES, LAND_SIZE, LandSize, getPriceForSize, lamportsToSol,
} from '@/lib/solana';
import IDL from '@/lib/contracts.idl.json';

interface BuyModalProps {
  planet: Planet | null;
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'connect' | 'input' | 'approving' | 'processing' | 'success' | 'error';

// Build the buy_planet instruction manually from the IDL discriminator
function buildBuyPlanetIx(
  buyer: PublicKey,
  planetId: string,
  landSize: LandSize,
  purchasePDA: PublicKey,
  treasuryPDA: PublicKey,
) {
  const ixDef = (IDL as any).instructions.find((i: any) => i.name === 'buy_planet');
  const discriminator = Buffer.from(ixDef.discriminator);

  // Encode: discriminator (8) + string length (4, LE) + string bytes + u8
  const planetIdBytes = Buffer.from(planetId);
  const data = Buffer.alloc(8 + 4 + planetIdBytes.length + 1);
  discriminator.copy(data, 0);
  data.writeUInt32LE(planetIdBytes.length, 8);
  planetIdBytes.copy(data, 12);
  data.writeUInt8(landSize, 12 + planetIdBytes.length);

  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: buyer,        isSigner: true,  isWritable: true  }, // buyer
      { pubkey: purchasePDA,  isSigner: false, isWritable: true  }, // purchase PDA
      { pubkey: treasuryPDA,  isSigner: false, isWritable: true  }, // treasury PDA
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, // system_program
    ],
    data,
  });
}

export const BuyModal: React.FC<BuyModalProps> = ({ planet, isOpen, onClose }) => {
  const { publicKey, sendTransaction, connected } = useWallet();
  const { connection } = useConnection();
  const { setVisible: setWalletModalVisible } = useWalletModal();

  const [step, setStep] = useState<Step>('input');
  const [name, setName] = useState('');
  const [landSize, setLandSize] = useState<LandSize>(LAND_SIZE.small);
  const [blessing, setBlessing] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const certificateRef = useRef<HTMLDivElement>(null);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(connected ? 'input' : 'connect');
      setName('');
      setLandSize(LAND_SIZE.small);
      setBlessing('');
      setTxSignature(null);
      setErrorMsg('');
    }
  }, [isOpen, connected]);

  // If wallet connects while modal is open and we're on connect step
  useEffect(() => {
    if (connected && step === 'connect') setStep('input');
  }, [connected, step]);

  const basePrice = planet ? (PLANET_PRICES[planet.id] ?? 0) : 0;
  const totalLamports = getPriceForSize(basePrice, landSize);
  const totalSol = lamportsToSol(totalLamports);

  const handlePurchase = useCallback(async () => {
    if (!planet || !publicKey || !name) return;
    setStep('approving');

    try {
      const [treasuryPDA] = getTreasuryPDA();
      const [purchasePDA] = getPurchasePDA(publicKey, planet.id);

      // Check if already purchased
      const existing = await connection.getAccountInfo(purchasePDA);
      if (existing) {
        throw new Error('You already own land on this planet. Each wallet can only purchase one plot per planet.');
      }

      const ix = buildBuyPlanetIx(publicKey, planet.id, landSize, purchasePDA, treasuryPDA);
      const tx = new Transaction().add(ix);
      tx.feePayer = publicKey;

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;

      // Simulate first to surface real errors
      const sim = await connection.simulateTransaction(tx);
      if (sim.value.err) {
        const logs = sim.value.logs?.join('\n') ?? '';
        console.error('Simulation failed:', sim.value.err, logs);
        throw new Error(`Simulation failed: ${JSON.stringify(sim.value.err)}\n${logs}`);
      }

      // Wallet signs + user approves in their wallet popup
      const sig = await sendTransaction(tx, connection);
      setTxSignature(sig);
      setStep('processing');

      // Confirm on chain
      await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, 'confirmed');

      // Generate blessing in parallel with confirmation
      const b = await generateGalacticBlessing(planet.name, name);
      setBlessing(b);
      setStep('success');

      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ffffff', '#3b82f6', '#8b5cf6'],
      });
    } catch (err: any) {
      const msg = err?.message ?? JSON.stringify(err) ?? 'Unknown error';
      console.error('Transaction failed:', msg, err);
      if (msg.includes('User rejected') || err?.code === 4001) {
        setStep('input');
      } else {
        setErrorMsg(msg);
        setStep('error');
      }
    }
  }, [planet, publicKey, name, landSize, connection, sendTransaction]);

  const reset = () => {
    setStep(connected ? 'input' : 'connect');
    setName('');
    setLandSize(LAND_SIZE.small);
    setTxSignature(null);
    setErrorMsg('');
    onClose();
  };

  const handleDownload = async () => {
    if (!certificateRef.current) return;
    setIsDownloading(true);
    try {
      await new Promise(r => setTimeout(r, 100));
      const dataUrl = await toJpeg(certificateRef.current, {
        quality: 0.95,
        backgroundColor: '#0a0a0a',
        pixelRatio: 2,
        skipFonts: true,
      });
      const link = document.createElement('a');
      link.download = `SpaceEstate-${planet?.name}-${name.replace(/\s+/g, '-')}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download failed', err);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!planet) return null;

  const SIZES = [
    { id: LAND_SIZE.small,  label: '100m²',      desc: 'Tiny',     multiplier: '1×'     },
    { id: LAND_SIZE.medium, label: '1000m²',     desc: 'Spacious', multiplier: '8×'     },
    { id: LAND_SIZE.full,   label: 'Full Planet', desc: 'God Mode', multiplier: '1000×'  },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) reset(); }}>
      <DialogContent className="w-[95vw] sm:max-w-[500px] glass-dark border-white/10 text-white p-0 overflow-hidden max-h-[95vh] overflow-y-auto">
        <AnimatePresence mode="wait">

          {/* ── CONNECT WALLET ── */}
          {step === 'connect' && (
            <motion.div key="connect" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-8 flex flex-col items-center text-center gap-6">
              <div className="w-16 h-16 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                <Wallet className="w-8 h-8 text-violet-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold tracking-tighter uppercase mb-2">Connect Wallet</h3>
                <p className="text-muted-foreground text-sm">You need a Solana wallet to buy planets with real SOL on devnet.</p>
              </div>
              <Button
                size="lg"
                className="rounded-full px-10 bg-violet-600 hover:bg-violet-500 text-white font-bold"
                onClick={() => setWalletModalVisible(true)}
              >
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40">Phantom · Solflare · Backpack supported</p>
            </motion.div>
          )}

          {/* ── INPUT ── */}
          {step === 'input' && (
            <motion.div key="input" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6 sm:p-8">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-3xl font-bold tracking-tighter uppercase">Claim {planet.name}</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Real SOL · Devnet · {publicKey?.toBase58().slice(0, 8)}…
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs uppercase tracking-widest text-muted-foreground">Full Legal Name (for the deed)</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Commander Stardust"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="bg-white/5 border-white/10 focus:border-white/30 h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">Select Land Size</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {SIZES.map(size => (
                      <button
                        key={size.id}
                        onClick={() => setLandSize(size.id)}
                        className={cn(
                          'flex flex-col items-center justify-center p-4 rounded-xl border transition-all',
                          landSize === size.id
                            ? 'bg-white text-black border-white'
                            : 'bg-white/5 border-white/10 hover:border-white/30'
                        )}
                      >
                        <span className="font-bold text-sm">{size.label}</span>
                        <span className="text-[10px] opacity-60 uppercase">{size.desc}</span>
                        <span className="text-[9px] opacity-40 mt-0.5">{size.multiplier}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Total Due</p>
                    <p className="text-3xl font-bold">◎ {totalSol}</p>
                    <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">SOL · devnet</p>
                  </div>
                  <Button
                    size="lg"
                    className="w-full sm:w-auto rounded-full px-8 bg-white text-black hover:bg-white/90"
                    disabled={!name || planet.isSoldOut}
                    onClick={handlePurchase}
                  >
                    {planet.isSoldOut ? 'Sold Out' : 'Confirm & Sign'}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── AWAITING WALLET APPROVAL ── */}
          {step === 'approving' && (
            <motion.div key="approving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-12 flex flex-col items-center text-center gap-6 min-h-[360px] justify-center">
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-16 h-16 rounded-full bg-violet-500/10 border border-violet-500/30 flex items-center justify-center"
              >
                <Wallet className="w-8 h-8 text-violet-400" />
              </motion.div>
              <div>
                <h3 className="text-xl font-bold mb-1">Approve in Wallet</h3>
                <p className="text-muted-foreground text-sm">Check your wallet popup to sign the transaction.</p>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40">◎ {totalSol} SOL will be deducted</p>
            </motion.div>
          )}

          {/* ── PROCESSING (TX SENT, CONFIRMING) ── */}
          {step === 'processing' && (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-12 flex flex-col items-center text-center gap-6 min-h-[360px] justify-center">
              <Loader2 className="w-12 h-12 text-white/50 animate-spin" />
              <div>
                <h3 className="text-xl font-bold mb-1">Confirming on Solana</h3>
                <p className="text-muted-foreground text-sm">Waiting for devnet confirmation…</p>
              </div>
              {txSignature && (
                <a
                  href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-violet-400/70 hover:text-violet-400 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  View on Explorer
                </a>
              )}
            </motion.div>
          )}

          {/* ── SUCCESS ── */}
          {step === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-0">
              <div className="bg-gradient-to-b from-white/10 to-transparent p-8 text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold tracking-tighter uppercase mb-1">Purchase Complete</h3>
                <p className="text-muted-foreground text-sm">◎ {totalSol} SOL deducted from your wallet.</p>
                {txSignature && (
                  <a
                    href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-violet-400/60 hover:text-violet-400 transition-colors mt-2"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {txSignature.slice(0, 20)}…
                  </a>
                )}
              </div>

              <div className="p-6 sm:p-8">
                {/* Certificate */}
                <div
                  ref={certificateRef}
                  className="relative aspect-[1.4/1] w-full bg-[#0a0a0a] border-2 sm:border-4 border-[#d4af37]/30 rounded-lg p-4 sm:p-6 flex flex-col items-center justify-between text-center overflow-hidden shadow-2xl mb-8"
                >
                  <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full border-[10px] sm:border-[20px] border-double border-[#d4af37]" />
                    <Globe className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-64 sm:h-64" />
                  </div>
                  <div className="z-10">
                    <h4 className="text-[#d4af37] font-serif text-sm sm:text-xl tracking-[0.2em] uppercase mb-1">Certificate of Ownership</h4>
                    <div className="w-16 sm:w-24 h-[1px] bg-[#d4af37]/50 mx-auto" />
                  </div>
                  <div className="z-10 space-y-1 sm:space-y-2">
                    <p className="text-[8px] sm:text-[10px] uppercase tracking-widest opacity-60">This certifies that</p>
                    <p className="text-lg sm:text-2xl font-bold tracking-tight truncate max-w-[200px] sm:max-w-none">{name}</p>
                    <p className="text-[8px] sm:text-[10px] uppercase tracking-widest opacity-60">is the rightful owner of land on</p>
                    <p className="text-xl sm:text-3xl font-bold text-[#d4af37] tracking-tighter uppercase">{planet.name}</p>
                    {blessing && (
                      <div className="pt-1 sm:pt-2 flex items-center justify-center gap-2">
                        <Sparkles className="w-2 h-2 sm:w-3 sm:h-3 text-[#d4af37] opacity-50" />
                        <p className="text-[7px] sm:text-[9px] italic text-[#d4af37]/80 max-w-[150px] sm:max-w-[200px] line-clamp-2">"{blessing}"</p>
                      </div>
                    )}
                  </div>
                  <div className="z-10 w-full flex justify-between items-end text-[6px] sm:text-[8px] uppercase tracking-widest opacity-40">
                    <div className="text-left">
                      <p>Tx: {txSignature?.slice(0, 12)}…</p>
                      <p>Network: Solana Devnet</p>
                    </div>
                    <div className="text-right">
                      <p>◎ {totalSol} SOL paid</p>
                      <p>Date: {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 z-10 opacity-30">
                    <ShieldCheck className="w-8 h-8 sm:w-12 sm:h-12 text-[#d4af37]" />
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button className="w-full rounded-full py-6 bg-white text-black hover:bg-white/90 font-bold uppercase tracking-widest" onClick={handleDownload} disabled={isDownloading}>
                    {isDownloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                    {isDownloading ? 'Generating…' : 'Download Certificate'}
                  </Button>
                  <Button variant="outline" className="w-full rounded-full py-6 border-white/10 hover:bg-white/10 font-bold uppercase tracking-widest" onClick={reset}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Buy Another Planet
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── ERROR ── */}
          {step === 'error' && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-10 flex flex-col items-center text-center gap-6">
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Transaction Failed</h3>
                <p className="text-muted-foreground text-sm">{errorMsg}</p>
              </div>
              <div className="flex flex-col gap-3 w-full">
                <Button className="rounded-full bg-white text-black hover:bg-white/90 font-bold uppercase tracking-widest" onClick={() => setStep('input')}>
                  Try Again
                </Button>
                <Button variant="outline" className="rounded-full border-white/10 hover:bg-white/10" onClick={reset}>
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
