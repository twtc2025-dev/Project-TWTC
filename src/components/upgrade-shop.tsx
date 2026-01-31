import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Cpu, Monitor, Zap, Rocket, Star } from 'lucide-react';

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  costMultiplier: number;
  baseProduction: number;
  count: number;
  iconKey: string;
  tier: 'basic' | 'advanced' | 'elite' | 'legendary';
}

interface UpgradeShopProps {
  upgrades: Upgrade[];
  coins: number;
  onPurchase: (upgradeId: string) => void;
  getUpgradeIcon: (iconKey: string) => React.ComponentType<{ className?: string }> | null;
}

export function UpgradeShop({ upgrades, coins, onPurchase, getUpgradeIcon }: UpgradeShopProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(2) + 'K';
    }
    return num.toFixed(0);
  };

  const getCost = (upgrade: Upgrade) => {
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.count));
  };

  const getTierColor = (tier: Upgrade['tier']) => {
    switch (tier) {
      case 'basic':
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      case 'advanced':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'elite':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'legendary':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    }
  };

  const getTierIcon = (tier: Upgrade['tier']) => {
    switch (tier) {
      case 'basic':
        return null;
      case 'advanced':
        return <Zap className="h-3 w-3" />;
      case 'elite':
        return <Rocket className="h-3 w-3" />;
      case 'legendary':
        return <Star className="h-3 w-3" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mining Equipment Shop</CardTitle>
        <p className="text-sm text-muted-foreground">
          Purchase mining equipment to increase your passive income
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {upgrades.map((upgrade) => {
          const cost = getCost(upgrade);
          const canAfford = coins >= cost;
          const Icon = getUpgradeIcon(upgrade.iconKey);
          const tierIcon = getTierIcon(upgrade.tier);
          
          return (
            <div
              key={upgrade.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center space-x-4 flex-1">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                  {Icon && <Icon className="h-5 w-5 text-primary" />}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{upgrade.name}</h4>
                    <Badge variant="outline" className={getTierColor(upgrade.tier)}>
                      {tierIcon}
                      {upgrade.tier}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {upgrade.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Owned: {upgrade.count}</span>
                    <span>Produces: {formatNumber(upgrade.baseProduction)}/s each</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <Button
                  onClick={() => onPurchase(upgrade.id)}
                  disabled={!canAfford}
                  variant={canAfford ? "default" : "secondary"}
                  size="sm"
                >
                  ₿{formatNumber(cost)}
                </Button>
                {!canAfford && (
                  <div className="mt-1">
                    <Progress 
                      value={(coins / cost) * 100} 
                      className="w-20 h-1"
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}