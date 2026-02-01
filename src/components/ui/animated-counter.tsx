import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  showSparkles?: boolean;
  type?: 'mining' | 'task' | 'boost';
}

export function AnimatedCounter({ 
  value, 
  duration = 0.8, 
  className = "", 
  prefix = "", 
  showSparkles = false,
  type = 'mining'
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValue = useRef(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);

  useEffect(() => {
    if (value === prevValue.current) return;

    setIsAnimating(true);
    const startValue = prevValue.current;
    const endValue = value;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = (currentTime - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);

      // Non-linear easing (Ease-Out: 70% fast, 30% slow)
      // We use a cubic bezier approximation: 1 - (1 - x)^3
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      
      const nextValue = startValue + (endValue - startValue) * easedProgress;
      setDisplayValue(nextValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
        prevValue.current = endValue;
        setIsAnimating(false);
        if (showSparkles && endValue > startValue) {
          setSparkleKey(prev => prev + 1);
        }
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration, showSparkles]);

  const getColorClass = () => {
    if (!isAnimating) return "";
    switch (type) {
      case 'mining': return "text-cyan-400";
      case 'task': return "text-green-400";
      case 'boost': return "text-purple-400";
      default: return "";
    }
  };

  const getAnimationClass = () => {
    if (!isAnimating) return "";
    if (type === 'boost') return "animate-pulse scale-105";
    return "scale-105";
  };

  return (
    <div className={`relative inline-flex items-center justify-center transition-all duration-300 ${getAnimationClass()}`}>
      <span className={`text-pixel text-twtc-cyan transition-colors duration-300 ${className}`}>
        {prefix}{displayValue.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
      </span>
      
      {/* Flash Glow Effect */}
      <AnimatePresence>
        {isAnimating && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.3, scale: 1.2 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 blur-lg pointer-events-none rounded-full ${
              type === 'mining' ? 'bg-cyan-500' : type === 'task' ? 'bg-green-500' : 'bg-purple-500'
            }`}
          />
        )}
      </AnimatePresence>

      {/* Sparkles Effect */}
      <AnimatePresence>
        {sparkleKey > 0 && (
          <motion.div
            key={sparkleKey}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.2, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 0.6 }}
            className="absolute -top-4 -right-4 pointer-events-none"
          >
            <Sparkles className={`h-6 w-6 ${type === 'task' ? 'text-yellow-400' : 'text-cyan-400'}`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
