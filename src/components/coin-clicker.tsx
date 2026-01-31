import { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Zap } from 'lucide-react';
import exampleImage from 'figma:asset/0eb2b2ddc20c81d0c02bee553eb93794b5408429.png';

interface CoinClickerProps {
  onMine: () => void;
  clickPower: number;
  isAutoMining: boolean;
  balance: number;
}

export function CoinClicker({ onMine, clickPower, isAutoMining, balance }: CoinClickerProps) {
  const [clickEffect, setClickEffect] = useState<{ id: number; x: number; y: number }[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onMine();
    
    // Create click effect
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const effect = { id: Date.now(), x, y };
    setClickEffect(prev => [...prev, effect]);
    
    // Remove effect after animation
    setTimeout(() => {
      setClickEffect(prev => prev.filter(eff => eff.id !== effect.id));
    }, 1000);
  };

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Balance Display */}
      <div className="text-center mb-6 space-y-1">
        <p className="text-sm text-muted-foreground">Your Balance:</p>
        <div className="flex items-center justify-center gap-2">
          <img src={exampleImage} alt="W-Coin" className="h-8 w-8 rounded-full" />
          <h2 className="text-4xl font-bold text-glow">
            {balance.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </h2>
        </div>
      </div>

      {/* Feature Buttons */}
      <div className="flex items-center gap-3 mb-8">
        <button className="px-6 py-2.5 rounded-full bg-purple-600/20 border border-purple-500/40 text-purple-400 hover:bg-purple-600/30 transition-all flex items-center gap-2 glow-purple">
          <Sparkles className="h-4 w-4" />
          W-Galaxy
        </button>
        <button className="px-6 py-2.5 rounded-full bg-cyan-600/20 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-600/30 transition-all flex items-center gap-2 glow-cyan">
          <Zap className="h-4 w-4" />
          W-AI
        </button>
      </div>

      {/* 3D Coin */}
      <div className="relative mb-8">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleClick}
          className="relative h-64 w-64 rounded-full coin-3d cursor-pointer overflow-hidden"
        >
          {/* Coin Logo */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative z-10">
              <svg
                viewBox="0 0 100 100"
                className="h-32 w-32 text-gray-200/90"
                fill="currentColor"
              >
                <text
                  x="50"
                  y="65"
                  fontSize="60"
                  fontFamily="Arial, sans-serif"
                  fontWeight="bold"
                  textAnchor="middle"
                  fill="currentColor"
                >
                  W
                </text>
              </svg>
            </div>
          </div>

          {/* Shine Effect */}
          <div className="absolute inset-0 coin-shine opacity-40" />

          {/* Rotating Ring */}
          <motion.div
            className="absolute inset-0 border-8 border-gray-400/30 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            style={{
              borderStyle: 'dashed',
              borderSpacing: '10px'
            }}
          />

          {/* Click effects */}
          {clickEffect.map((effect) => (
            <motion.div
              key={effect.id}
              initial={{ opacity: 1, scale: 1, x: effect.x - 128, y: effect.y - 128 }}
              animate={{ 
                opacity: 0, 
                scale: 1.5, 
                y: effect.y - 178 
              }}
              transition={{ duration: 1 }}
              className="absolute pointer-events-none text-purple-400 font-bold text-xl text-glow"
              style={{ left: 128, top: 128 }}
            >
              +{clickPower}
            </motion.div>
          ))}
        </motion.div>

        {/* Auto Mining Indicator */}
        {isAutoMining && (
          <motion.div
            className="absolute -top-2 -right-2 bg-green-500 rounded-full p-2 glow-purple"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Zap className="h-4 w-4 text-white" />
          </motion.div>
        )}
      </div>
    </div>
  );
}
