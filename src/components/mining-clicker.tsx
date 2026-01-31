import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { motion } from 'motion/react';
import { Pickaxe, Zap } from 'lucide-react';

interface MiningClickerProps {
  onMine: () => void;
  clickPower: number;
  isAutoMining: boolean;
}

export function MiningClicker({ onMine, clickPower, isAutoMining }: MiningClickerProps) {
  const [clickEffect, setClickEffect] = useState<{ id: number; x: number; y: number }[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
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
    <Card className="relative overflow-hidden">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Pickaxe className="h-5 w-5" />
          Mining Station
        </CardTitle>
        <div className="flex items-center justify-center gap-2">
          <Badge variant="secondary">
            +{clickPower} per click
          </Badge>
          {isAutoMining && (
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
              <Zap className="h-3 w-3 mr-1" />
              Auto Mining
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <div className="relative">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={handleClick}
              size="lg"
              className="h-32 w-32 rounded-full text-xl font-bold bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 shadow-lg border-4 border-yellow-300"
            >
              <div className="flex flex-col items-center">
                <Pickaxe className="h-8 w-8 mb-2" />
                MINE!
              </div>
            </Button>
          </motion.div>
          
          {/* Click effects */}
          {clickEffect.map((effect) => (
            <motion.div
              key={effect.id}
              initial={{ opacity: 1, scale: 1, x: effect.x, y: effect.y }}
              animate={{ 
                opacity: 0, 
                scale: 1.5, 
                y: effect.y - 50 
              }}
              transition={{ duration: 1 }}
              className="absolute pointer-events-none text-yellow-500 font-bold"
              style={{ left: 0, top: 0 }}
            >
              +{clickPower}
            </motion.div>
          ))}
        </div>
        
        <p className="text-sm text-muted-foreground text-center">
          Click the mining button to earn BitCoins!
          {isAutoMining && <br />}
          {isAutoMining && "Auto-mining is active"}
        </p>
      </CardContent>
    </Card>
  );
}