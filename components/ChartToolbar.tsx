// ChartToolbar.tsx
import React, { useState } from 'react';
import { Timeframe } from '../types';
import TimeframeSelector from './TimeframeSelector';
import { useToolbar } from '../hooks/useToolbar';
import { useDeriv } from '../hooks/useDeriv';
import { 
  ChevronDown, Search, LineChart, Star, Pencil, Layout, RefreshCw, 
  Camera, Maximize, Settings, Sun, Moon, Bell, Sparkles, HelpCircle, Brain
} from 'lucide-react';

interface ChartToolbarProps {
  timeframe: Timeframe;
  onTimeframeChange: (tf: Timeframe) => void;
  selectedSymbol: string;
  onMarketSelectorOpen: () => void;
  onTabChange: (tab: 'indicators' | 'drawings' | 'settings' | 'alerts' | 'templates' | 'ai') => void;
  activeSidebarTab: string;
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  onSymbolSelect: (symbol: string) => void;
  onRefresh: () => void;
  onIndicatorsClick?: () => void;
  onDrawingsClick?: () => void;
  onSettingsClick?: () => void;
  onAIClick?: () => void;
}

const FAVORITE_SYMBOLS = [
  { symbol: '1HZ100V', label: 'Vol 100' },
  { symbol: '1HZ75V', label: 'Vol 75' },
  { symbol: '1HZ50V', label: 'Vol 50' },
  { symbol: '1HZ25V', label: 'Vol 25' },
  { symbol: '1HZ10V', label: 'Vol 10' }
];

export const ChartToolbar: React.FC<ChartToolbarProps> = ({
  timeframe,
  onTimeframeChange,
  selectedSymbol,
  onMarketSelectorOpen,
  onTabChange,
  activeSidebarTab,
  isSidebarOpen,
  setSidebarOpen,
  onSymbolSelect,
  onRefresh,
  onIndicatorsClick,
  onDrawingsClick,
  onSettingsClick,
  onAIClick,
}) => {
  const {
    isFullscreen,
    toggleFullscreen,
    takeScreenshot,
    theme,
    toggleTheme,
  } = useToolbar();

  const { markets = [] } = useDeriv();

  const handleTabClick = (tab: 'indicators' | 'drawings' | 'settings' | 'alerts' | 'templates' | 'ai') => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    if (isMobile) {
      if ((tab === 'indicators' || tab === 'templates') && onIndicatorsClick) {
        onIndicatorsClick();
        return;
      }
      if (tab === 'drawings' && onDrawingsClick) {
        onDrawingsClick();
        return;
      }
      if (tab === 'settings' && onSettingsClick) {
        onSettingsClick();
        return;
      }
      if (tab === 'ai' && onAIClick) {
        onAIClick();
        return;
      }
    }

    onTabChange(tab);
    if (!isSidebarOpen || activeSidebarTab !== tab) {
      setSidebarOpen(true);
    } else {
      setSidebarOpen(false);
    }
  };

  const getSymbolDisplayName = (symbol: string) => {
    const currentMarket = (markets || []).find(m => m.underlying_symbol === symbol);
    if (currentMarket?.underlying_symbol_name) {
      return currentMarket.underlying_symbol_name;
    }

    const exactMappings: Record<string, string> = {
      '1HZ10V': 'Volatility 10 (1s) Index',
      '1HZ25V': 'Volatility 25 (1s) Index',
      '1HZ50V': 'Volatility 50 (1s) Index',
      '1HZ75V': 'Volatility 75 (1s) Index',
      '1HZ100V': 'Volatility 100 (1s) Index',
      '1HZ150V': 'Volatility 150 (1s) Index',
      '1HZ250V': 'Volatility 250 (1s) Index',
      'R_10': 'Volatility 10 Index',
      'R_25': 'Volatility 25 Index',
      'R_50': 'Volatility 50 Index',
      'R_75': 'Volatility 75 Index',
      'R_100': 'Volatility 100 Index',
    };

    if (exactMappings[symbol]) {
      return exactMappings[symbol];
    }

    if (symbol.startsWith('1HZ')) {
      const num = symbol.replace('1HZ', '').replace('V', '');
      return `Volatility ${num} (1s) Index`;
    }
    if (symbol.startsWith('R_')) {
      const num = symbol.replace('R_', '');
      if (num.endsWith('V')) {
        return `Volatility ${num.slice(0, -1)} (1s) Index`;
      }
      return `Volatility ${num} Index`;
    }

    return symbol;
  };

  const displaySymbolName = getSymbolDisplayName(selectedSymbol);

  return (
    <div className="h-12 bg-[#0b0e14] border-b border-white/5 flex items-center justify-between px-3 select-none flex-shrink-0 z-40 overflow-x-auto no-scrollbar">
      {/* Left/Main side: Asset, Timeframe, and Indicators grouped together */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Asset selector */}
        <button
          onClick={onMarketSelectorOpen}
          className="flex items-center gap-2 bg-[#1e2530] border border-white/5 px-3 py-1.5 rounded-lg hover:bg-[#283141] transition-all flex-shrink-0"
        >
          <div className="flex flex-col items-start leading-none">
            <span className="text-[7px] font-black text-red-500 uppercase tracking-widest leading-none mb-0.5">Asset</span>
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-black text-white">{displaySymbolName}</span>
              <ChevronDown className="w-3 h-3 text-red-500" />
            </div>
          </div>
        </button>

        {/* Favorite Symbols */}
        <div className="hidden xl:flex items-center gap-1 pl-1 border-l border-white/5 flex-shrink-0">
          {FAVORITE_SYMBOLS.map(fav => (
            <button
              key={fav.symbol}
              onClick={() => onSymbolSelect(fav.symbol)}
              className={`px-2.5 py-1 text-[10px] font-black rounded-md uppercase transition-all ${
                selectedSymbol === fav.symbol
                  ? 'bg-red-600/10 text-red-500 border border-red-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {fav.label}
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-white/5 mx-0.5 flex-shrink-0" />

        {/* Timeframe Selector */}
        <TimeframeSelector timeframe={timeframe} onTimeframeChange={onTimeframeChange} />

        <div className="w-px h-5 bg-white/5 mx-0.5 flex-shrink-0" />

        {/* Indicators Tab Trigger */}
        <button
          onClick={() => handleTabClick('indicators')}
          className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition-all border flex-shrink-0 ${
            isSidebarOpen && activeSidebarTab === 'indicators'
              ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-900/20'
              : 'bg-[#1e2530] border-white/5 text-gray-400 hover:text-white hover:bg-[#283141]'
          }`}
        >
          <LineChart className="w-3.5 h-3.5 text-red-500" />
          <span>Indicators</span>
        </button>

        {/* Drawing templates trigger */}
        <button
          onClick={() => handleTabClick('templates')}
          className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition-all border flex-shrink-0 ${
            isSidebarOpen && activeSidebarTab === 'templates'
              ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-900/20'
              : 'bg-[#1e2530] border-white/5 text-gray-400 hover:text-white hover:bg-[#283141]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
          <span className="hidden md:inline">Templates</span>
        </button>

        {/* AI Analysis Tab Trigger */}
        <button
          onClick={() => handleTabClick('ai')}
          className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition-all border flex-shrink-0 ${
            isSidebarOpen && activeSidebarTab === 'ai'
              ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-900/20'
              : 'bg-[#1e2530] border-white/5 text-gray-400 hover:text-white hover:bg-[#283141]'
          }`}
        >
          <Brain className="w-3.5 h-3.5 text-violet-400" />
          <span>AI</span>
        </button>
      </div>

      {/* Right side: Utilities */}
      <div className="flex items-center gap-1.5 flex-shrink-0 pl-4">
        {/* Screenshot */}
        <button
          onClick={() => takeScreenshot(document.querySelector('.klinecharts-container') as HTMLDivElement | null)}
          className="p-2 text-gray-400 hover:text-white hover:bg-[#1e2530] rounded-lg transition-all hidden md:block"
          title="Screenshot"
        >
          <Camera className="w-4 h-4" />
        </button>

        {/* Fullscreen */}
        <button
          onClick={() => toggleFullscreen(document.querySelector('.klinecharts-container') as HTMLElement | null)}
          className="p-2 text-gray-400 hover:text-white hover:bg-[#1e2530] rounded-lg transition-all hidden md:block"
          title="Toggle Fullscreen"
        >
          <Maximize className="w-4 h-4" />
        </button>

        {/* Refresh Chart */}
        <button
          onClick={onRefresh}
          className="p-2 text-gray-400 hover:text-white hover:bg-[#1e2530] rounded-lg transition-all"
          title="Refresh Chart"
        >
          <RefreshCw className="w-4 h-4 text-violet-400" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-gray-400 hover:text-white hover:bg-[#1e2530] rounded-lg transition-all"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-blue-500" />}
        </button>

        {/* Settings Tab Trigger */}
        <button
          onClick={() => handleTabClick('settings')}
          className={`p-2 rounded-lg transition-all border ${
            isSidebarOpen && activeSidebarTab === 'settings'
              ? 'bg-red-600 border-red-500 text-white shadow-lg'
              : 'bg-[#1e2530] border-white/5 text-gray-400 hover:text-white hover:bg-[#283141]'
          }`}
          title="Chart Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Notifications */}
        <button
          className="p-2 text-gray-400 hover:text-white hover:bg-[#1e2530] rounded-lg transition-all relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
        </button>
      </div>
    </div>
  );
};

export default ChartToolbar;
