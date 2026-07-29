import React from 'react';
import { Zap, ArrowUpDown } from 'lucide-react';

interface FloatingTradeButtonProps {
  onClick: () => void;
  lastPrice: number;
}

export const FloatingTradeButton: React.FC<FloatingTradeButtonProps> = ({ onClick, lastPrice }) => {
  return (
    <div 
      className="fixed left-0 right-0 px-4 z-[100] pointer-events-none select-none safe-floating-button"
      style={{ bottom: 'var(--floating-button-bottom)' }}
    >
      <button
        onClick={onClick}
        className="pointer-events-auto w-full max-w-sm mx-auto h-13 bg-gradient-to-r from-red-600 to-red-500 active:scale-95 transition-all text-white rounded-2xl flex items-center justify-between px-5 border border-red-500/10 shadow-[0_8px_24px_rgba(239,68,68,0.25)]"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-black text-red-100 uppercase tracking-wider leading-none">
              Trade Options
            </span>
            <span className="text-[7.5px] font-black text-red-200 uppercase tracking-widest mt-0.5 leading-none">
              Rise • Fall • Touch Contracts
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-black tabular-nums">
            {lastPrice > 0 ? lastPrice.toFixed(4) : '---'}
          </span>
          <ArrowUpDown className="w-3.5 h-3.5 text-red-200" />
        </div>
      </button>
    </div>
  );
};
export default FloatingTradeButton;
