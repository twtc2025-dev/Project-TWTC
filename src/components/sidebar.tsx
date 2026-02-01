import { motion } from 'framer-motion';
import { Star, Zap, Users, ClipboardList, TrendingUp, Cpu, User, ChevronRight, LayoutGrid, Gamepad2, Settings, History, Shield, Trophy, HelpCircle, Gift } from 'lucide-react';
import { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { cn } from "../lib/utils";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: any) => void;
}

const menuItems = [
  { 
    id: 'mine', 
    label: 'Mine', 
    icon: Gamepad2, 
    subItems: [
      { label: 'Auto Mine', icon: TrendingUp },
      { label: 'Energy Shop', icon: Zap },
      { label: 'Statistics', icon: History }
    ]
  },
  { 
    id: 'mates', 
    label: 'Mates', 
    icon: Users, 
    subItems: [
      { label: 'Referrals', icon: Gift },
      { label: 'Leaderboard', icon: Trophy },
      { label: 'Groups', icon: LayoutGrid }
    ]
  },
  { 
    id: 'tasks', 
    label: 'Tasks', 
    icon: ClipboardList, 
    subItems: [
      { label: 'Daily', icon: Settings },
      { label: 'Special', icon: Star },
      { label: 'Archive', icon: History }
    ]
  },
  { 
    id: 'boost', 
    label: 'Boost', 
    icon: Zap, 
    subItems: [
      { label: 'Video Ads', icon: Zap },
      { label: 'Multipliers', icon: TrendingUp },
      { label: 'Quizzes', icon: HelpCircle }
    ]
  },
  { 
    id: 'staking', 
    label: 'Equipment', 
    icon: Cpu, 
    subItems: [
      { label: 'Upgrades', icon: TrendingUp },
      { label: 'Repairs', icon: Settings },
      { label: 'Market', icon: LayoutGrid }
    ]
  },
  { 
    id: 'profile', 
    label: 'Profile', 
    icon: User, 
    subItems: [
      { label: 'KYC', icon: Shield },
      { label: 'Settings', icon: Settings },
      { label: 'History', icon: History }
    ]
  }
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <aside className="hidden md:flex flex-col w-[80px] lg:w-[100px] h-screen fixed left-0 top-0 bg-slate-950/80 border-r border-slate-800/50 backdrop-blur-xl z-50 py-8 items-center gap-8">
      {/* Brand Logo */}
      <div className="mb-4">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <TrendingUp className="text-white h-6 w-6" />
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 flex flex-col gap-4">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <Popover key={item.id}>
              <PopoverTrigger asChild>
                <button
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "relative flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all duration-300 group",
                    isActive 
                      ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30" 
                      : "text-slate-500 hover:text-slate-300 hover:bg-slate-900/50"
                  )}
                >
                  <Icon className={cn("h-6 w-6 mb-1 transition-transform", isActive && "scale-110")} />
                  <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
                  
                  {isActive && (
                    <motion.div 
                      layoutId="activeGlow"
                      className="absolute inset-0 rounded-2xl shadow-[0_0_20px_rgba(79,70,229,0.3)] pointer-events-none"
                    />
                  )}
                  
                  <ChevronRight className={cn(
                    "absolute -right-2 h-3 w-3 opacity-0 transition-all",
                    isActive && "opacity-100 right-0",
                    hoveredItem === item.id && "opacity-50"
                  )} />
                </button>
              </PopoverTrigger>

              <PopoverContent 
                side="right" 
                align="center" 
                sideOffset={12}
                className="w-48 p-2 bg-slate-900/90 border-slate-800 backdrop-blur-xl shadow-2xl rounded-2xl"
              >
                <div className="flex flex-col gap-1">
                  <p className="px-3 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 mb-1">
                    {item.label} Options
                  </p>
                  {item.subItems.map((sub, idx) => {
                    const SubIcon = sub.icon;
                    return (
                      <button
                        key={idx}
                        className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-xl transition-colors group"
                        onClick={() => {
                          onTabChange(item.id);
                        }}
                      >
                        <SubIcon className="h-4 w-4 text-slate-500 group-hover:text-indigo-400" />
                        {sub.label}
                      </button>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          );
        })}
      </nav>

      {/* Footer / Settings */}
      <div className="mt-auto">
        <button className="p-3 text-slate-500 hover:text-white transition-colors">
          <Settings className="h-5 w-5" />
        </button>
      </div>
    </aside>
  );
}
