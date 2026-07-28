// ChartSettings.tsx
import React from 'react';
import { useToolbar } from '../hooks/useToolbar';
import { ScaleType } from '../services/ChartUIService';
import { Grid, Eye, Compass, RefreshCw, Sparkles } from 'lucide-react';

export const ChartSettings: React.FC = () => {
  const {
    scaleType,
    showGrid,
    setScaleType,
    toggleGrid,
    fitContent,
  } = useToolbar();

  return (
    <div className="flex flex-col h-full overflow-y-auto no-scrollbar text-gray-300 p-4 space-y-6">
      {/* Chart Scale Settings */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5" />
          Scale Settings
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {(['auto', 'log', 'percentage', 'invert'] as ScaleType[]).map(type => (
            <button
              key={type}
              onClick={() => setScaleType(type)}
              className={`px-3 py-2.5 rounded-xl border text-[11px] font-black uppercase tracking-wider transition-all text-center ${
                scaleType === type
                  ? 'bg-red-600 border-red-500 text-white shadow-lg'
                  : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {type === 'auto' && 'Auto Scale'}
              {type === 'log' && 'Log Scale'}
              {type === 'percentage' && 'Percentage'}
              {type === 'invert' && 'Invert Scale'}
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-white/5" />

      {/* Grid Settings */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
          <Grid className="w-3.5 h-3.5" />
          Grid Lines
        </h3>
        <div className="flex items-center justify-between bg-white/5 border border-white/5 rounded-2xl p-4">
          <div>
            <p className="text-xs font-black text-white uppercase">Grid Visibility</p>
            <p className="text-[10px] text-gray-500 font-bold uppercase mt-0.5">Show vertical & horizontal lines</p>
          </div>
          <button
            onClick={toggleGrid}
            className={`px-4 py-2 text-[10px] font-black rounded-xl uppercase transition-all ${
              showGrid
                ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                : 'bg-white/5 text-gray-500 border border-white/5'
            }`}
          >
            {showGrid ? 'Visible' : 'Hidden'}
          </button>
        </div>
      </div>

      <div className="h-px bg-white/5" />

      {/* Navigation & Layout Defaults */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          Controls
        </h3>
        <button
          onClick={fitContent}
          className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-300 flex items-center justify-center gap-2 transition-all"
        >
          <RefreshCw className="w-4 h-4 text-red-500" />
          Fit Content (Reset View)
        </button>
      </div>
    </div>
  );
};

export default ChartSettings;
