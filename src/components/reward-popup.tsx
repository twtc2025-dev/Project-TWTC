import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Sparkles, Trophy } from 'lucide-react';
import { AnimatedCounter } from './ui/animated-counter';

interface RewardPopupProps {
  isOpen: boolean;
  reward: number;
  onClose: () => void;
  title?: string;
}

export function RewardPopup({ isOpen, reward, onClose, title = "Reward Claimed!" }: RewardPopupProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Auto-dismiss after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            className="w-full max-w-sm"
          >
            <Card className="bg-gradient-to-br from-purple-900/90 to-cyan-900/90 border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.3)] overflow-hidden">
              <CardContent className="pt-8 pb-6 text-center space-y-6">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex justify-center"
                >
                  <div className="relative">
                    <Trophy className="h-16 w-16 text-yellow-400" />
                    <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-cyan-400 animate-pulse" />
                  </div>
                </motion.div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white tracking-wide uppercase">{title}</h3>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-4xl font-pixel text-twtc-cyan">
                      +<AnimatedCounter value={reward} type="boost" className="text-4xl" />
                    </span>
                    <span className="text-xl font-bold text-white/60">Coins</span>
                  </div>
                </div>

                <Button 
                  onClick={onClose}
                  className="w-full h-12 bg-white text-black hover:bg-white/90 font-bold text-lg rounded-xl transition-all active:scale-95"
                >
                  CLAIM NOW
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
