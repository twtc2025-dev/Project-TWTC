import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Zap, Play, Clock, ZapOff } from 'lucide-react';
import { AnimatedCounter } from './ui/animated-counter';
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
  energy: number;
  maxEnergy: number;
}

export function CoinClicker({ 
  onMine, 
  clickPower, 
  isAutoMining, 
  balance, 
  lastMiningTime, 
  miningActive,
  onStartCycle,
  energy,
  maxEnergy
}: CoinClickerProps) {
  const [clickEffect, setClickEffect] = useState<{ id: number; x: number; y: number }[]>([]);
  const [timeLeft, setTimeLeft] = useState('');
  const [progress, setProgress] = useState(0);

  const MINING_CYCLE_MS = 4 * 60 * 60 * 1000;

  useEffect(() => {
    if (miningActive) {
      const interval = setInterval(() => {
        const now = Date.now();
        const elapsed = now - lastMiningTime;
        const diff = MINING_CYCLE_MS - elapsed;
        
        const currentProgress = Math.min((elapsed / MINING_CYCLE_MS) * 100, 100);
        setProgress(currentProgress);

        if (diff <= 0) {
          setTimeLeft('00:00:00');
          setProgress(100);
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
      setProgress(0);
    }
  }, [miningActive, lastMiningTime]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!miningActive || energy <= 0) return;
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

  const energyPercent = (energy / maxEnergy) * 100;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <div className="text-center mb-6 space-y-1">
        <p className="text-sm text-muted-foreground">Your Balance:</p>
        <div className="flex items-center justify-center gap-2">
          <img src={exampleImage} alt="Coin" className="h-8 w-8 rounded-full" />
          <h2 className="text-4xl font-bold text-glow">
            <AnimatedCounter 
              value={balance} 
              type="mining"
              showSparkles={true}
              className="text-white"
            />
          </h2>
        </div>
      </div>

      <div className="w-full px-8 mb-8 space-y-4">
        {/* Mining Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
            <span>Progress</span>
            <span>{progress.toFixed(1)}%</span>
          </div>
          <div className="relative h-4 w-full bg-white/10 rounded-full overflow-hidden border border-white/5 shadow-inner">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", bounce: 0, duration: 1 }}
              className={`h-full bg-gradient-to-r ${
                progress === 100 
                ? 'from-green-400 to-green-600 shadow-[0_0_15px_rgba(74,222,128,0.5)]' 
                : 'from-purple-600 via-cyan-500 to-blue-500'
              } relative`}
            >
              <div className="absolute top-0 right-0 h-full w-2 bg-white/30 blur-sm" />
            </motion.div>
          </div>
        </div>

        {/* Energy Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
            <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-yellow-400" /> Energy</span>
            <span>{Math.floor(energy)}/{maxEnergy}</span>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              animate={{ width: `${energyPercent}%` }}
              className={`h-full transition-colors duration-500 ${
                energy < 100 ? 'bg-red-500' : energy < 500 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
            />
          </div>
        </div>
        
        {!miningActive ? (
          <Button 
            onClick={onStartCycle}
            disabled={energy < 100}
            className={`w-full h-14 rounded-2xl font-bold text-lg shadow-lg transition-all ${
              energy >= 100 
              ? 'bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 glow-purple animate-pulse' 
              : 'bg-white/10 text-muted-foreground cursor-not-allowed'
            }`}
          >
            {energy >= 100 ? (
              <><Play className="mr-2 h-5 w-5" /> Start 4h Discovery Cycle</>
            ) : (
              <><ZapOff className="mr-2 h-5 w-5" /> Low Energy (Min 100)</>
            )}
          </Button>
        ) : (
          <div className="flex flex-col items-center gap-1">
             <div className="flex items-center gap-2 px-6 py-3 bg-white/5 rounded-2xl border border-white/10 w-full justify-center">
              <Clock className="h-5 w-5 text-cyan-400" />
              <span className="font-mono text-xl font-bold text-cyan-400">{timeLeft}</span>
            </div>
            {progress === 100 && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-green-400 text-xs font-bold animate-bounce mt-2"
              >
                Mining Complete! Claim Now!
              </motion.p>
            )}
          </div>
        )}
      </div>

      <div className="relative mb-4">
        <motion.div
          whileHover={miningActive && energy > 0 ? { scale: 1.05 } : {}}
          whileTap={miningActive && energy > 0 ? { scale: 0.95 } : {}}
          onClick={handleClick}
          className={`relative h-64 w-64 rounded-full coin-3d overflow-hidden flex items-center justify-center ${
            !miningActive || energy <= 0 ? 'opacity-50 grayscale' : 'cursor-pointer'
          } ${progress === 100 ? 'shadow-[0_0_50px_rgba(74,222,128,0.3)]' : ''}`}
        >
          <div className="relative z-10">
            <span className="text-7xl font-black text-white/20 select-none">TW</span>
          </div>
          <div className="absolute inset-0 coin-shine opacity-40" />
          
          <svg className="absolute inset-0 h-full w-full -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-white/5"
            />
            <motion.circle
              cx="128"
              cy="128"
              r="120"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray="753.98"
              animate={{ strokeDashoffset: 753.98 - (753.98 * progress) / 100 }}
              className={`${progress === 100 ? 'text-green-500' : 'text-cyan-500'} drop-shadow-[0_0_8px_currentColor]`}
            />
          </svg>

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
            className="absolute -top-2 -right-2 bg-green-500 rounded-full p-2 shadow-xl z-20"
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
