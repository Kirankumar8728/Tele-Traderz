import React, { useState, useEffect } from 'react';
import { AppView } from '../types';
import { 
  TrendingUp, 
  History, 
  Wallet, 
  Users, 
  User, 
  ChevronLeft, 
  ChevronRight, 
  Sun, 
  Moon, 
  LogOut,
  Globe,
  Settings,
  HelpCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  isAuthenticated: boolean;
  onLogout: () => void;
  theme: 'dark' | 'light';
  onThemeToggle: () => void;
  username?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  isAuthenticated,
  onLogout,
  theme,
  onThemeToggle,
  username = 'Trader'
}) => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar_collapsed');
      return saved === 'true';
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', String(isCollapsed));
  }, [isCollapsed]);

  const menuItems = [
    { id: AppView.TRADE, label: 'Trade', icon: <TrendingUp className="w-5 h-5" /> },
    { id: AppView.HISTORY, label: 'History', icon: <History className="w-5 h-5" /> },
    { id: AppView.CASHIER, label: 'Cashier', icon: <Wallet className="w-5 h-5" /> },
    { id: AppView.REFER, label: 'Refer', icon: <Users className="w-5 h-5" /> },
    { id: AppView.PROFILE, label: 'Profile', icon: <User className="w-5 h-5" /> },
  ];

  return (
    <motion.div
      animate={{ width: isCollapsed ? 72 : 240 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="hidden md:flex flex-col h-full bg-[#0c0f17] border-r border-white/5 flex-shrink-0 z-30 select-none relative justify-between overflow-hidden"
    >
      {/* Header section with branding */}
      <div className="flex flex-col">
        <div className="h-16 flex items-center px-4 justify-between border-b border-white/5">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col"
            >
              <h1 className="text-sm font-extrabold italic tracking-wider text-red-500 leading-none">BYNEX</h1>
              <p className="text-[7.5px] font-black uppercase text-gray-500 tracking-[0.25em] mt-1">PRO TERMINAL</p>
            </motion.div>
          )}

          {isCollapsed && (
            <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20 mx-auto">
              <span className="text-xs font-black italic text-red-500">B</span>
            </div>
          )}

          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Collapsed Expand Trigger */}
        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(false)}
            className="absolute top-14 right-[-10px] p-1 rounded-full bg-red-600 text-white hover:bg-red-500 transition-colors shadow-md z-40 scale-75"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Navigation list */}
        <div className="px-3 py-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center gap-3.5 h-[44px] px-3.5 rounded-xl transition-all relative group ${
                  isActive 
                    ? 'bg-red-600/10 text-red-500 border border-red-500/20 font-bold' 
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.02] border border-transparent'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeSidebarTabGlow"
                    className="absolute left-0 top-2 bottom-2 w-1 bg-red-500 rounded-full"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                
                <div className={`transition-transform duration-200 ${isActive ? 'scale-105' : 'group-hover:scale-105'}`}>
                  {item.icon}
                </div>

                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs font-medium uppercase tracking-wide truncate"
                  >
                    {item.label}
                  </motion.span>
                )}

                {/* Collapsed Tooltip */}
                {isCollapsed && (
                  <div className="absolute left-16 px-2.5 py-1.5 bg-black rounded-lg text-[10px] font-bold uppercase text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap translate-x-2 group-hover:translate-x-0 border border-white/5 shadow-2xl z-50">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer controls section */}
      <div className="flex flex-col border-t border-white/5 p-3 space-y-3">
        {/* Theme Toggler */}
        <button
          onClick={onThemeToggle}
          className="w-full flex items-center gap-3.5 h-[42px] px-3.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.02] transition-colors group relative"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-500 animate-pulse" /> : <Moon className="w-5 h-5 text-indigo-400" />}
          {!isCollapsed && (
            <span className="text-xs font-medium uppercase tracking-wide">
              {theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
            </span>
          )}
          {isCollapsed && (
            <div className="absolute left-16 px-2.5 py-1.5 bg-black rounded-lg text-[10px] font-bold uppercase text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap translate-x-2 group-hover:translate-x-0 border border-white/5 shadow-2xl z-50">
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </div>
          )}
        </button>

        {/* User profile / Logout */}
        {isAuthenticated ? (
          <div className="flex flex-col gap-2">
            {!isCollapsed && (
              <div className="px-3 py-2 bg-white/[0.02] border border-white/5 rounded-xl flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-red-600/10 border border-red-500/20 flex items-center justify-center font-bold text-red-500 text-xs">
                  {username.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-bold text-white truncate uppercase">{username}</span>
                  <span className="text-[7.5px] text-gray-500 font-bold uppercase tracking-widest leading-none mt-0.5">Trader</span>
                </div>
              </div>
            )}
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3.5 h-[42px] px-3.5 rounded-xl text-red-400 hover:text-red-500 hover:bg-red-500/5 transition-all group relative"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              {!isCollapsed && (
                <span className="text-xs font-bold uppercase tracking-wider">
                  Log Out
                </span>
              )}
              {isCollapsed && (
                <div className="absolute left-16 px-2.5 py-1.5 bg-black rounded-lg text-[10px] font-bold uppercase text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap translate-x-2 group-hover:translate-x-0 border border-white/5 shadow-2xl z-50">
                  Log Out
                </div>
              )}
            </button>
          </div>
        ) : (
          <div className="px-1 text-center py-1">
            {!isCollapsed && (
              <p className="text-[8px] font-bold uppercase text-gray-500 tracking-wider mb-2">PRO TERMINAL ACCESS</p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Sidebar;
