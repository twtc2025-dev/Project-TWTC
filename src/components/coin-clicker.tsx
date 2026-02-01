import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Zap, Play, Clock } from 'lucide-react';
import exampleImage from '../assets/0eb2b2ddc20c81d0c02bee553eb93794b5408429.png';
import { Button } from './ui/button';

interface CoinClickerProps {
  onMine: () => void;
  clickPower: number;
  isAutoMining: boolean;
  balance: number;
  lastMiningTime: number;
  miningActive: boolean;
  onStartCycle: () => void;
}

export function CoinClicker({ 
  onMine, 
  clickPower, 
  isAutoMining, 
  balance, 
  lastMiningTime, 
  miningActive,
  onStartCycle 
}: CoinClickerProps) {
  const [clickEffect, setClickEffect] = useState<{ id: number; x: number; y: number }[]>([]);
  const [timeLeft, setTimeLeft] = useState('');

  const MINING_CYCLE_MS = 4 * 60 * 60 * 1000;

  useEffect(() => {
    if (miningActive) {
      const interval = setInterval(() => {
        const now = Date.now();
        const diff = MINING_CYCLE_MS - (now - lastMiningTime);
        if (diff <= 0) {
          setTimeLeft('00:00:00');
          clearInterval(interval);
        } else {
          const h = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
          const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
          const s = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');
          setTimeLeft(`${h}:${m}:${s}`);
        }
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setTimeLeft('04:00:00');
    }
  }, [miningActive, lastMiningTime]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!miningActive) return;
    onMine();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const effect = { id: Date.now(), x, y };
    setClickEffect(prev => [...prev, effect]);
    setTimeout(() => {
      setClickEffect(prev => prev.filter(eff => eff.id !== effect.id));
    }, 1000);
  };

  return (
    <div className="relative flex flex-col items-center justify-center">
      <div className="text-center mb-6 space-y-1">
        <p className="text-sm text-muted-foreground">Your Balance:</p>
        <div className="flex items-center justify-center gap-2">
          <img src={exampleImage} alt="Coin" className="h-8 w-8 rounded-full" />
          <h2 className="text-4xl font-bold text-glow">
            {balance.toLocaleString('en-US', { maximumFractionDigits: 1 })}
          </h2>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 mb-8 w-full px-8">
        {!miningActive ? (
          <Button 
            onClick={onStartCycle}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 font-bold text-lg shadow-lg glow-purple animate-pulse"
          >
            <Play className="mr-2 h-5 w-5" /> Start 4h Discovery Cycle
          </Button>
        ) : (
          <div className="flex items-center gap-2 px-6 py-3 bg-white/5 rounded-2xl border border-white/10 w-full justify-center">
            <Clock className="h-5 w-5 text-cyan-400" />
            <span className="font-mono text-xl font-bold text-cyan-400">{timeLeft}</span>
          </div>
        )}
      </div>

      <div className="relative mb-4">
        <motion.div
          whileHover={miningActive ? { scale: 1.05 } : {}}
          whileTap={miningActive ? { scale: 0.95 } : {}}
          onClick={handleClick}
          className={`relative h-64 w-64 rounded-full coin-3d overflow-hidden ${!miningActive ? 'opacity-50 grayscale' : 'cursor-pointer'}`}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative z-10">
              <span className="text-7xl font-black text-white/20 select-none">TW</span>
            </div>
          </div>
          <div className="absolute inset-0 coin-shine opacity-40" />
          <motion.div
            className="absolute inset-0 border-8 border-cyan-400/30 rounded-full"
            animate={miningActive ? { rotate: 360 } : {}}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            style={{ borderStyle: 'dashed' }}
          />
          {clickEffect.map((effect) => (
            <motion.div
              key={effect.id}
              initial={{ opacity: 1, scale: 1, x: effect.x - 128, y: effect.y - 128 }}
              animate={{ opacity: 0, scale: 2, y: effect.y - 200 }}
              transition={{ duration: 0.8 }}
              className="absolute pointer-events-none text-cyan-400 font-bold text-2xl"
              style={{ left: 128, top: 128 }}
            >
              +{clickPower.toFixed(1)}
            </motion.div>
          ))}
        </motion.div>
        {isAutoMining && (
          <motion.div
            className="absolute -top-2 -right-2 bg-green-500 rounded-full p-2 shadow-xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Zap className="h-4 w-4 text-white" />
          </motion.div>
        )}
      </div>
      {!miningActive && (
        <p className="text-sm text-purple-400 font-medium animate-bounce mt-2 text-center px-4">
          Watching a 60s Tourism ad is required to start your discovery journey.
        </p>
      )}
    </div>
  );
}
