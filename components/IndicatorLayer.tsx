// IndicatorLayer.tsx
import React, { useState } from 'react';
import { Eye, EyeOff, Settings, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

interface IndicatorLayerProps {
  activeIndicators: any[];
  displayedLegendIndicators: any[];
  toggleIndicatorVisibility: (id: string) => void;
  handleEditLegendClick: (id: string, params: any[], type: string) => void;
  removeIndicatorFromChart: (id: string) => void;
  activeDataIndex: number | null;
  renderIndicatorValues: (ind: any, index: number | null) => React.ReactNode;
  isIndicatorLegendExpanded: boolean;
  setIsIndicatorLegendExpanded: (expanded: boolean | ((prev: boolean) => boolean)) => void;
  DEFAULT_PARAMS_MAP: Record<string, any[]>;
}

export const IndicatorLayer: React.FC<IndicatorLayerProps> = ({
  activeIndicators,
  displayedLegendIndicators,
  toggleIndicatorVisibility,
  handleEditLegendClick,
  removeIndicatorFromChart,
  activeDataIndex,
  renderIndicatorValues,
  isIndicatorLegendExpanded,
  setIsIndicatorLegendExpanded,
  DEFAULT_PARAMS_MAP,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);

  if (activeIndicators.length === 0) return null;

  if (isMinimized) {
    return (
      <div className="absolute top-3 left-3 z-20 pointer-events-auto animate-in fade-in duration-200">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-[#0b0e14]/90 hover:bg-[#141922] backdrop-blur-md border border-white/10 hover:border-red-500/50 px-2 py-1 rounded-xl text-gray-400 hover:text-white transition-all shadow-lg flex items-center gap-1.5 cursor-pointer group"
          title="Maximize Indicator Legend"
        >
          <ChevronDown className="w-3.5 h-3.5 text-red-500 group-hover:scale-110 transition-transform" />
          <span className="text-[9px] font-mono font-bold uppercase text-gray-400 group-hover:text-white">
            ({activeIndicators.length})
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="absolute top-3 left-3 z-20 flex flex-col items-start gap-1 pointer-events-auto max-w-[90%] md:max-w-[70%] animate-in fade-in duration-200">
      {/* Small Triangle Button to Minimize Indicator Legend */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setIsMinimized(true)}
          className="bg-[#0b0e14]/90 hover:bg-[#141922] backdrop-blur-md border border-white/10 hover:border-red-500/50 p-1 rounded-lg text-gray-400 hover:text-white transition-all shadow-md flex items-center justify-center cursor-pointer group"
          title="Minimize Indicator Legend"
        >
          <ChevronUp className="w-3.5 h-3.5 text-red-500 group-hover:scale-110 transition-transform" />
        </button>
      </div>

      <div className="flex flex-col gap-1 w-full">
        {displayedLegendIndicators.map(ind => (
          <div 
            key={ind.id} 
            className={`bg-[#0b0e14]/90 backdrop-blur-md border border-white/5 px-2.5 py-1.5 rounded-xl text-[9px] font-mono font-black tracking-wider uppercase flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 shadow-lg hover:border-white/10 transition-all duration-150 ${
              ind.visible === false ? 'opacity-40' : 'opacity-100'
            }`}
          >
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-white font-bold">{ind.type}</span>
              <span className="text-gray-500 font-medium lowercase">
                ({ind.params?.join(',') || DEFAULT_PARAMS_MAP[ind.type]?.map((p: any) => p.value).join(',') || ''})
              </span>
              
              <div className="flex items-center gap-0.5 border-l border-white/10 pl-1.5 ml-1">
                <button
                  onClick={() => toggleIndicatorVisibility(ind.id)}
                  className="p-0.5 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-all cursor-pointer"
                  title={ind.visible === false ? "Show" : "Hide"}
                >
                  {ind.visible === false ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
                <button
                  onClick={() => handleEditLegendClick(ind.id, ind.params || DEFAULT_PARAMS_MAP[ind.type]?.map((p: any) => p.value) || [], ind.type)}
                  className="p-0.5 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-all cursor-pointer"
                  title="Edit Parameters"
                >
                  <Settings className="w-3 h-3" />
                </button>
                <button
                  onClick={() => removeIndicatorFromChart(ind.id)}
                  className="p-0.5 hover:bg-red-500/10 rounded text-gray-400 hover:text-red-500 transition-all cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>

            {ind.visible !== false && (
              <div className="sm:border-l sm:border-white/10 sm:pl-2.5 flex-1 min-w-0">
                {renderIndicatorValues(ind, activeDataIndex)}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {activeIndicators.length > 3 && (
        <button
          onClick={() => setIsIndicatorLegendExpanded(prev => !prev)}
          className="bg-[#0b0e14]/85 hover:bg-red-600/10 hover:border-red-500/20 backdrop-blur-md border border-white/5 px-2.5 py-1 rounded-xl text-[8px] font-black uppercase text-red-500 hover:text-red-400 transition-all shadow-lg cursor-pointer flex items-center gap-1 mt-1"
        >
          {isIndicatorLegendExpanded ? 'Less' : `+${activeIndicators.length - 3} more`}
        </button>
      )}
    </div>
  );
};
export default IndicatorLayer;
