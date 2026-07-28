import React, { useState } from 'react';
import { Timeframe } from '../types';
import { ChevronDown } from 'lucide-react';

interface TimeframeSelectorProps {
  currentTimeframe?: Timeframe;
  timeframe?: Timeframe;
  onTimeframeChange: (timeframe: Timeframe) => void;
  onIndicatorsClick?: () => void;
  onDrawingsClick?: () => void;
  onSettingsClick?: () => void;
}

export const TimeframeSelector: React.FC<TimeframeSelectorProps> = ({
  currentTimeframe,
  timeframe,
  onTimeframeChange,
}) => {
  const activeTimeframe = currentTimeframe || timeframe || '1m';
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  // Group all supported Deriv timeframes
  const groups = [
    {
      name: 'Ticks',
      items: [
        { id: '1t' as Timeframe, label: '1 Tick', short: '1t' },
      ]
    },
    {
      name: 'Minutes',
      items: [
        { id: '1m' as Timeframe, label: '1 Minute', short: '1m' },
        { id: '2m' as Timeframe, label: '2 Minutes', short: '2m' },
        { id: '3m' as Timeframe, label: '3 Minutes', short: '3m' },
        { id: '5m' as Timeframe, label: '5 Minutes', short: '5m' },
        { id: '10m' as Timeframe, label: '10 Minutes', short: '10m' },
        { id: '15m' as Timeframe, label: '15 Minutes', short: '15m' },
        { id: '30m' as Timeframe, label: '30 Minutes', short: '30m' },
      ]
    },
    {
      name: 'Hours',
      items: [
        { id: '1h' as Timeframe, label: '1 Hour', short: '1h' },
        { id: '2h' as Timeframe, label: '2 Hours', short: '2h' },
        { id: '4h' as Timeframe, label: '4 Hours', short: '4h' },
        { id: '8h' as Timeframe, label: '8 Hours', short: '8h' },
      ]
    },
    {
      name: 'Days',
      items: [
        { id: '24h' as Timeframe, label: '1 Day', short: '1d' },
      ]
    }
  ];

  // Find active label for display
  const allItems = groups.flatMap(g => g.items);
  const activeItem = allItems.find(item => item.id === activeTimeframe) || { label: activeTimeframe, short: activeTimeframe };

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({
      top: rect.bottom,
      left: rect.left,
    });
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <div className="relative flex-shrink-0">
      <button
        onClick={handleButtonClick}
        className="flex items-center gap-2 bg-[#1e2530] border border-white/5 px-3 py-1.5 rounded-lg hover:bg-[#283141] transition-all flex-shrink-0 active:scale-95"
      >
        <div className="flex flex-col items-start leading-none">
          <span className="text-[7px] font-black text-red-500 uppercase tracking-widest leading-none mb-0.5">Chart Time</span>
          <span className="text-[10px] font-black text-white uppercase tracking-wider">
            {activeItem.short}
          </span>
        </div>
        <ChevronDown className="w-3 h-3 text-gray-500" />
      </button>

      {dropdownOpen && (
        <>
          <div className="fixed inset-0 z-[120]" onClick={() => setDropdownOpen(false)} />
          <div 
            className="fixed bg-[#141922] border border-white/10 rounded-xl shadow-2xl p-2 w-64 z-[130] animate-in fade-in slide-in-from-top-2 duration-150 max-h-[80vh] overflow-y-auto no-scrollbar"
            style={{
              top: coords ? `${coords.top + 6}px` : '48px',
              left: coords ? `${coords.left}px` : '180px',
            }}
          >
            <div className="space-y-3">
              {groups.map((group) => (
                <div key={group.name} className="space-y-1">
                  <p className="text-[9px] font-black uppercase text-gray-500 tracking-wider px-1.5 pt-1 border-t border-white/5 first:border-t-0 first:pt-0 mt-1 first:mt-0">
                    {group.name}
                  </p>
                  <div className="grid grid-cols-2 gap-1">
                    {group.items.map((item) => {
                      const isActive = activeTimeframe === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            onTimeframeChange(item.id);
                            setDropdownOpen(false);
                          }}
                          className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all text-left flex items-center justify-between ${
                            isActive
                              ? 'bg-red-600 text-white shadow-lg shadow-red-950/25'
                              : 'text-gray-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <span>{item.label}</span>
                          <span className="text-[8px] opacity-60 font-mono font-bold ml-1">{item.short}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TimeframeSelector;
