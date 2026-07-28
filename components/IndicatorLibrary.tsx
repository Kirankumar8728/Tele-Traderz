// IndicatorLibrary.tsx
import React, { useState } from 'react';
import { useIndicators } from '../hooks/useIndicators';
import { IndicatorMeta, INDICATOR_METAS } from '../services/IndicatorManager';
import { Search, Star, Trash2, Settings, Plus, Play, RefreshCw, Eye, EyeOff } from 'lucide-react';

export const DEFAULT_PARAMS_MAP: Record<string, { label: string; value: number }[]> = {
  MA: [
    { label: 'MA 1', value: 5 },
    { label: 'MA 2', value: 10 },
    { label: 'MA 3', value: 20 },
    { label: 'MA 4', value: 60 },
  ],
  EMA: [
    { label: 'EMA 1', value: 6 },
    { label: 'EMA 2', value: 12 },
    { label: 'EMA 3', value: 20 },
  ],
  SMA: [
    { label: 'SMA 1', value: 5 },
    { label: 'SMA 2', value: 10 },
    { label: 'SMA 3', value: 20 },
    { label: 'SMA 4', value: 60 },
  ],
  BOLL: [
    { label: 'Period', value: 20 },
    { label: 'Standard Deviation', value: 2 },
  ],
  SAR: [
    { label: 'Start', value: 0.02 },
    { label: 'Increment', value: 0.02 },
    { label: 'Max', value: 0.2 },
  ],
  BBI: [
    { label: 'Period 1', value: 3 },
    { label: 'Period 2', value: 6 },
    { label: 'Period 3', value: 12 },
    { label: 'Period 4', value: 24 },
  ],
  MACD: [
    { label: 'Short Period', value: 12 },
    { label: 'Long Period', value: 26 },
    { label: 'Signal Period', value: 9 },
  ],
  RSI: [
    { label: 'RSI 1', value: 6 },
    { label: 'RSI 2', value: 12 },
    { label: 'RSI 3', value: 24 },
  ],
  KDJ: [
    { label: 'N', value: 9 },
    { label: 'M1', value: 3 },
    { label: 'M2', value: 3 },
  ],
  WR: [
    { label: 'WR 1', value: 10 },
    { label: 'WR 2', value: 6 },
  ],
  CCI: [
    { label: 'Period', value: 14 },
  ],
  TRIX: [
    { label: 'TRIX Period', value: 12 },
    { label: 'MATRIX Period', value: 9 },
  ],
  DMA: [
    { label: 'Short Period', value: 10 },
    { label: 'Long Period', value: 50 },
    { label: 'M Period', value: 10 },
  ],
  DMI: [
    { label: 'DI Period', value: 14 },
    { label: 'ADX Period', value: 6 },
  ],
  PSY: [
    { label: 'PSY Period', value: 12 },
    { label: 'MAPSY Period', value: 6 },
  ],
  BIAS: [
    { label: 'BIAS 1', value: 6 },
    { label: 'BIAS 2', value: 12 },
    { label: 'BIAS 3', value: 24 },
  ],
  ROC: [
    { label: 'ROC Period', value: 12 },
    { label: 'MAROC Period', value: 6 },
  ],
  MTM: [
    { label: 'MTM Period', value: 12 },
    { label: 'MAMTM Period', value: 6 },
  ],
  CR: [
    { label: 'CR Period', value: 26 },
    { label: 'MA 1', value: 10 },
    { label: 'MA 2', value: 20 },
    { label: 'MA 3', value: 40 },
    { label: 'MA 4', value: 60 },
  ],
  EMV: [
    { label: 'EMV Period', value: 14 },
    { label: 'MAEMV Period', value: 9 },
  ],
  VOL: [
    { label: 'MA 1', value: 5 },
    { label: 'MA 2', value: 10 },
  ],
  OBV: [
    { label: 'OBV Period', value: 30 },
  ],
  VR: [
    { label: 'VR Period', value: 26 },
    { label: 'MAVR Period', value: 6 },
  ],
  ATR: [
    { label: 'ATR Period', value: 14 },
  ],
};

export const IndicatorLibrary: React.FC = () => {
  const {
    activeIndicators,
    favorites,
    recentlyUsed,
    allIndicators,
    filteredIndicators,
    searchQuery,
    setSearchQuery,
    addIndicator,
    removeIndicator,
    toggleFavorite,
    setParams,
    toggleVisibility,
  } = useIndicators();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingParamsList, setEditingParamsList] = useState<{ label: string; value: number }[]>([]);

  const categories = ['all', 'active', 'favorites', 'Trend', 'Oscillators', 'Volume', 'Volatility'];

  const displayedIndicators = filteredIndicators.filter(ind => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'favorites') return favorites.includes(ind.type);
    return ind.category === activeCategory;
  });

  const handleEditClick = (id: string, currentParams: any[]) => {
    setEditingId(id);
    const ind = activeIndicators.find(i => i.id === id);
    if (!ind) return;
    
    const defaultParams = DEFAULT_PARAMS_MAP[ind.type] || [];
    const list = defaultParams.map((def, idx) => {
      const actualVal = (currentParams && currentParams[idx] !== undefined) 
        ? currentParams[idx] 
        : def.value;
      return {
        label: def.label,
        value: actualVal
      };
    });
    
    if (list.length === 0 && currentParams && currentParams.length > 0) {
      currentParams.forEach((val, idx) => {
        list.push({
          label: `Param ${idx + 1}`,
          value: val
        });
      });
    }
    
    setEditingParamsList(list);
  };

  const handleParamValueChange = (idx: number, newVal: number) => {
    setEditingParamsList(prev => prev.map((item, i) => i === idx ? { ...item, value: newVal } : item));
  };

  const handleSaveParamsList = (id: string) => {
    const numericArray = editingParamsList.map(item => item.value);
    setParams(id, numericArray);
    setEditingId(null);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden text-gray-300">
      {/* Search and Category Filters */}
      <div className="p-4 space-y-3 bg-[#0b0e14]">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search indicators..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold outline-none focus:border-red-500/50 transition-all placeholder:text-gray-600"
          />
        </div>

        <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setEditingId(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap border ${
                activeCategory === cat
                  ? 'bg-red-600 border-red-500 text-white shadow'
                  : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {cat === 'all' && 'All'}
              {cat === 'active' && 'Active indicators'}
              {cat === 'favorites' && 'Favorites'}
              {cat !== 'all' && cat !== 'active' && cat !== 'favorites' && cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main List Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-2 pb-24">
        {activeCategory === 'active' ? (
          activeIndicators.length > 0 ? (
            activeIndicators.map(ind => {
              const defaultParams = DEFAULT_PARAMS_MAP[ind.type] || [];
              return (
                <div key={ind.id} className="bg-[#141922]/40 border border-white/5 rounded-2xl p-4 flex flex-col gap-3 group transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-black text-white uppercase">{ind.type}</p>
                        <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-white/5 text-gray-500 uppercase">
                          Active
                        </span>
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 mt-0.5">{ind.name}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleVisibility(ind.id)}
                        className={`p-2 rounded-xl border transition-all ${
                          ind.visible === false
                            ? 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20'
                            : 'bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                        title={ind.visible === false ? "Show Indicator" : "Hide Indicator"}
                      >
                        {ind.visible === false ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleEditClick(ind.id, ind.params || defaultParams.map(p => p.value) || [])}
                        className={`p-2 rounded-xl border transition-all ${
                          editingId === ind.id
                            ? 'bg-red-500/10 border-red-500/20 text-red-500'
                            : 'bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                        title="Edit Parameters"
                      >
                        <Settings className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => removeIndicator(ind.id)}
                        className="p-2 bg-red-600/10 hover:bg-red-600 border border-red-500/15 hover:border-red-500 text-red-500 hover:text-white rounded-xl transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {editingId === ind.id && (
                    <div className="space-y-3 border-t border-white/5 pt-3 animate-in fade-in duration-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Parameters</p>
                      <div className="grid grid-cols-2 gap-2 animate-in slide-in-from-top-1 duration-100">
                        {editingParamsList.map((param, idx) => (
                          <div key={idx} className="flex flex-col gap-1 bg-black/20 p-2 rounded-xl border border-white/5">
                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-wider">{param.label}</span>
                            <input
                              type="number"
                              step="any"
                              value={param.value}
                              onChange={(e) => handleParamValueChange(idx, Number(e.target.value))}
                              className="w-full bg-transparent text-xs font-bold text-white outline-none"
                            />
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-[9px] font-black uppercase text-gray-400 transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveParamsList(ind.id)}
                          className="px-4 py-1.5 bg-red-600 hover:bg-red-700 border border-red-500 rounded-lg text-[9px] font-black uppercase text-white shadow-lg shadow-red-600/10 transition-all"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center opacity-30">
              <RefreshCw className="w-10 h-10 text-gray-500 mb-2 animate-spin-slow" />
              <p className="text-xs font-black text-white uppercase tracking-wider">No active indicators</p>
              <p className="text-[10px] font-bold text-gray-400 mt-1 max-w-[200px]">Add indicators from other categories to see them active here.</p>
            </div>
          )
        ) : (
          displayedIndicators.length > 0 ? (
            displayedIndicators.map(meta => {
              const isFav = favorites.includes(meta.type);
              return (
                <div
                  key={meta.type}
                  className="bg-[#141922]/40 hover:bg-[#141922] border border-white/5 rounded-2xl p-4 flex items-center justify-between group transition-all"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-black text-white uppercase">{meta.type}</p>
                      <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-white/5 text-gray-500 uppercase">
                        {meta.category}
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 mt-0.5">{meta.name}</p>
                  </div>

                  <div className="flex gap-1.5">
                    <button
                      onClick={() => toggleFavorite(meta.type)}
                      className={`p-2 rounded-xl border transition-all ${
                        isFav
                          ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                          : 'bg-white/5 border-white/5 text-gray-600 hover:text-amber-500 hover:border-amber-500/20'
                      }`}
                    >
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </button>
                    <button
                      onClick={() => addIndicator(meta.type)}
                      className="p-2 bg-red-600 hover:bg-red-700 rounded-xl border border-red-500 text-white transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center opacity-30">
              <Search className="w-10 h-10 text-gray-500 mb-2" />
              <p className="text-xs font-black text-white uppercase tracking-wider">No indicators found</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default IndicatorLibrary;
