import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Trophy, Target, Zap, Coins, Clock, Star } from 'lucide-react';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  target: number;
  current: number;
  completed: boolean;
  claimed?: boolean;
  reward: number;
  iconKey: string;
  category: 'mining' | 'earning' | 'time' | 'upgrades';
}

interface AchievementsProps {
  achievements: Achievement[];
  onClaim: (achievementId: string) => void;
  getAchievementIcon: (iconKey: string) => React.ComponentType<{ className?: string }> | null;
}

export function Achievements({ achievements, onClaim, getAchievementIcon }: AchievementsProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(2) + 'K';
    }
    return num.toFixed(0);
  };

  const getCategoryColor = (category: Achievement['category']) => {
    switch (category) {
      case 'mining':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'earning':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'time':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'upgrades':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  const completedAchievements = achievements.filter(a => a.completed && !a.claimed);
  const incompleteAchievements = achievements.filter(a => !a.completed);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Achievements
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Complete challenges to earn bonus coins
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Completed achievements ready to claim */}
        {completedAchievements.map((achievement) => {
          const Icon = getAchievementIcon(achievement.iconKey);
          
          return (
            <div
              key={achievement.id}
              className="flex items-center justify-between p-4 border-2 border-green-500/50 rounded-lg bg-green-500/5"
            >
              <div className="flex items-center space-x-4 flex-1">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500/20">
                  {Icon && <Icon className="h-5 w-5 text-green-500" />}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-green-700 dark:text-green-300">
                      {achievement.name}
                    </h4>
                    <Badge variant="outline" className={getCategoryColor(achievement.category)}>
                      {achievement.category}
                    </Badge>
                    <Badge className="bg-green-500">
                      <Trophy className="h-3 w-3 mr-1" />
                      Complete!
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {achievement.description}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <button
                  onClick={() => onClaim(achievement.id)}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                >
                  Claim ₿{formatNumber(achievement.reward)}
                </button>
              </div>
            </div>
          );
        })}

        {/* Incomplete achievements */}
        {incompleteAchievements.map((achievement) => {
          const Icon = getAchievementIcon(achievement.iconKey);
          const progress = Math.min((achievement.current / achievement.target) * 100, 100);
          
          return (
            <div
              key={achievement.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center space-x-4 flex-1">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                  {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{achievement.name}</h4>
                    <Badge variant="outline" className={getCategoryColor(achievement.category)}>
                      {achievement.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {achievement.description}
                  </p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progress: {formatNumber(achievement.current)} / {formatNumber(achievement.target)}</span>
                      <span>Reward: ₿{formatNumber(achievement.reward)}</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {achievements.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No achievements available yet.</p>
            <p className="text-sm">Keep mining to unlock challenges!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}