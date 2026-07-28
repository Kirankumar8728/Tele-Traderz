import React from 'react';
import { Timeframe } from '../types';
import { AlertCircle } from 'lucide-react';
import TimeframeSelector from './TimeframeSelector';

interface MobileChartProps {
  timeframe: Timeframe;
  onTimeframeChange: (timeframe: Timeframe) => void;
  selectedSymbol: string;
  onMarketSelectorOpen: () => void;
  onIndicatorsClick: () => void;
  onDrawingsClick: () => void;
  onSettingsClick: () => void;
  isLoading: boolean;
  chartError: string | null;
  onRetry: () => void;
  lastPrice: number;
  drawingMode: string | null;
  setDrawingMode: (mode: string | null) => void;
  children?: React.ReactNode;
}

export const MobileChart: React.FC<MobileChartProps> = ({
  timeframe,
  onTimeframeChange,
  selectedSymbol,
  onMarketSelectorOpen,
  onIndicatorsClick,
  onDrawingsClick,
  onSettingsClick,
  isLoading,
  chartError,
  onRetry,
  lastPrice,
  drawingMode,
  setDrawingMode,
  children,
}) => {
  return (
    <div className="flex-1 flex flex-col relative bg-[#07090e] select-none min-h-0 w-full overflow-hidden">
      {/* Main canvas area */}
      <div className="flex-1 min-h-0 relative w-full bg-black/20">
        <div className="absolute inset-0 z-10 w-full h-full" id="mobile-chart-canvas">
          {children}
        </div>

        {/* Loading feed indicator */}
        {isLoading && !chartError && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0b0e14]/90 backdrop-blur-sm z-30">
            <div className="flex flex-col items-center gap-3">
              <div className="w-9 h-9 border-[3.5px] border-red-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-[9px] font-black text-white uppercase tracking-widest leading-none">
                Loading Feed...
              </span>
            </div>
          </div>
        )}

        {/* Error overlay */}
        {chartError && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0b0e14]/90 backdrop-blur-sm z-30 p-6">
            <div className="flex flex-col items-center gap-4 max-w-xs text-center">
              <AlertCircle className="w-12 h-12 text-red-500" />
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Feed Connection Offline</h3>
                <p className="text-[9px] font-bold text-gray-500 uppercase mt-1 leading-relaxed">{chartError}</p>
              </div>
              <button
                onClick={onRetry}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 active:scale-95 text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg"
              >
                Reconnect Feed
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
export default MobileChart;
