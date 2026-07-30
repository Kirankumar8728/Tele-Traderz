import React from 'react';
import { AppView } from '../types';
import { LineChart, History, Wallet, Users, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface BottomNavigationProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  openPositionsCount?: number;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentView,
  onViewChange,
  openPositionsCount = 0,
}) => {
  const navItems = [
    {
      id: AppView.TRADE,
      label: 'Trade',
      icon: <LineChart className="w-5 h-5" />,
    },
    {
      id: AppView.HISTORY,
      label: 'History',
      icon: <History className="w-5 h-5" />,
      badge: openPositionsCount > 0 ? openPositionsCount : undefined,
    },
    {
      id: AppView.CASHIER,
      label: 'Cashier',
      icon: <Wallet className="w-5 h-5" />,
    },
    {
      id: AppView.REFER,
      label: 'Refer',
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: AppView.PROFILE,
      label: 'Profile',
      icon: <User className="w-5 h-5" />,
    },
  ];

  return (
    <nav 
      className="w-full flex-shrink-0 bg-[#141922] border-t border-white/10 px-1 flex items-center justify-around z-[110] select-none shadow-2xl safe-bottom-nav min-h-[56px] h-14 relative"
      style={{
        paddingBottom: 'max(var(--safe-bottom, 0px), env(safe-area-inset-bottom, 8px))',
        boxSizing: 'content-box'
      }}
    >
      {navItems.map((item) => {
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className="flex-1 flex flex-col items-center justify-center gap-1.5 h-full relative text-gray-500 hover:text-white transition-all active:scale-95"
            id={`nav-tab-${item.label.toLowerCase()}`}
          >
            {/* Active Indicator Background Ripple */}
            {isActive && (
              <motion.div
                layoutId="activeTabGlow"
                className="absolute inset-x-4 top-1 bottom-1 bg-red-600/[0.06] rounded-xl -z-10"
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}

            <div className={`relative ${isActive ? 'text-red-500' : 'text-gray-400'}`}>
              {item.icon}

              {/* Badge Counter */}
              {item.badge !== undefined && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[8px] font-black rounded-full h-4 w-4 flex items-center justify-center border border-[#141922] tabular-nums">
                  {item.badge}
                </span>
              )}
            </div>

            <span
              className={`text-[8.5px] font-black uppercase tracking-wider leading-none transition-colors ${
                isActive ? 'text-red-500 font-extrabold' : 'text-gray-500'
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
export default BottomNavigation;
