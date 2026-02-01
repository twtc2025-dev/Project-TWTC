import { Users, FileText, Gem, Rocket } from 'lucide-react';
import { Badge } from './ui/badge';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  unclaimedAchievements?: number;
}

export function BottomNav({ activeTab, onTabChange, unclaimedAchievements = 0 }: BottomNavProps) {
  const navItems = [
    { id: 'mine', label: 'Mine', icon: Rocket },
    { id: 'mates', label: 'Mates', icon: Users },
    { id: 'tasks', label: 'Tasks', icon: FileText, badge: unclaimedAchievements },
    { id: 'staking', label: 'Tools', icon: Gem },
    { id: 'boost', label: 'Boost', icon: Rocket },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-purple-500/20 z-50">
      <div className="max-w-md mx-auto px-4 py-3">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
                  isActive 
                    ? 'text-purple-400 glow-purple' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="relative">
                  <Icon className={`h-6 w-6 ${isActive ? 'text-glow' : ''}`} />
                  {item.badge && item.badge > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs border-none">
                      {item.badge}
                    </Badge>
                  )}
                </div>
                <span className="text-xs">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
