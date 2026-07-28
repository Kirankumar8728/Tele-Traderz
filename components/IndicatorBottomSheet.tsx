import React, { useState, useEffect, useRef } from 'react';
import { useIndicators } from '../hooks/useIndicators';
import { Search, Star, Trash2, Settings, Plus, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GestureManager } from '../services/GestureManager';

interface IndicatorBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IndicatorBottomSheet: React.FC<IndicatorBottomSheetProps> = ({ isOpen, onClose }) => {
  const {
    activeIndicators,
    favorites,
    filteredIndicators,
    searchQuery,
    setSearchQuery,
    addIndicator,
    removeIndicator,
    toggleFavorite,
    setParams,
  } = useIndicators();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [paramInput, setParamInput] = useState<string>('');
  const sheetRef = useRef<HTMLDivElement>(null);

  const categories = ['all', 'favorites', 'Trend', 'Oscillators', 'Volume', 'Volatility'];

  const displayedIndicators = filteredIndicators.filter((ind) => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'favorites') return favorites.includes(ind.type);
    return ind.category === activeCategory;
  });

  const handleEditClick = (id: string, currentParams: any) => {
    setEditingId(id);
    setParamInput(JSON.stringify(currentParams || []));
  };

  const handleSaveParams = (id: string) => {
    try {
      const parsed = JSON.parse(paramInput);
      setParams(id, parsed);
      setEditingId(null);
    } catch (e) {
      alert('Invalid parameters format. Must be a valid JSON array.');
    }
  };

  // Register swipe-down listener
  useEffect(() => {
    if (isOpen && sheetRef.current) {
      const cleanup = GestureManager.getInstance().registerSwipeDown(sheetRef.current, onClose, 80);
      return cleanup;
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[150] flex items-end justify-center select-none">
        {/* Click outside backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        {/* Sliding Panel */}
        <motion.div
          ref={sheetRef}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="w-full max-w-md bg-[#141922] border-t border-white/10 rounded-t-[2rem] p-6 pb-[env(safe-area-inset-bottom,24px)] max-h-[85vh] flex flex-col z-[160] shadow-[0_-8px_32px_rgba(0,0,0,0.5)]"
        >
          {/* Draggable Drag-Indicator Handle */}
          <div className="w-12 h-1.5 bg-white/15 rounded-full mx-auto mb-5 cursor-grab active:cursor-grabbing flex-shrink-0" />

          {/* Header */}
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <div>
              <h3 className="text-lg font-black italic uppercase tracking-tight text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-red-500" />
                Technical Indicators
              </h3>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-0.5">
                Optimize overlays & market trends
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-white/5 rounded-full hover:bg-white/10 active:scale-95 transition-all"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Search bar */}
          <div className="relative mb-3 flex-shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search indicators (e.g. RSI, EMA)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pl-10 pr-4 text-xs font-bold outline-none focus:border-red-500/50 focus:bg-black/60 transition-all placeholder:text-gray-600 text-white"
            />
          </div>

          {/* Categories Tab scrolling */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 mb-2 flex-shrink-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap border ${
                  activeCategory === cat
                    ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-900/20'
                    : 'bg-[#0b0e14]/50 border-white/5 text-gray-500 hover:text-white hover:bg-white/5'
                }`}
              >
                {cat === 'all' && 'All'}
                {cat === 'favorites' && '★ Favorites'}
                {cat !== 'all' && cat !== 'favorites' && cat}
              </button>
            ))}
          </div>

          {/* Active Indicators container */}
          {activeIndicators.length > 0 && (
            <div className="mb-4 space-y-2 bg-[#0b0e14]/50 border border-white/5 rounded-2xl p-3 flex-shrink-0">
              <span className="text-[9px] font-black uppercase tracking-widest text-red-500 block px-1">
                Active ({activeIndicators.length})
              </span>
              <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto no-scrollbar">
                {activeIndicators.map((ind) => (
                  <div
                    key={ind.id}
                    className="bg-[#141922] border border-white/5 rounded-xl p-3 flex flex-col gap-2 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-black text-white uppercase">{ind.type}</p>
                        <p className="text-[9px] font-bold text-gray-500 uppercase">{ind.name}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditClick(ind.id, ind.params)}
                          className="p-2 hover:bg-white/5 text-gray-400 hover:text-white rounded-lg transition-all"
                          title="Edit Parameters"
                        >
                          <Settings className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => removeIndicator(ind.id)}
                          className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {editingId === ind.id && (
                      <div className="space-y-2 border-t border-white/5 pt-2 animate-in fade-in duration-100">
                        <p className="text-[8px] font-bold text-gray-500 uppercase">
                          Values (JSON array format, e.g. [14, 20]):
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={paramInput}
                            onChange={(e) => setParamInput(e.target.value)}
                            className="flex-1 bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 text-[11px] font-mono font-bold outline-none focus:border-red-500/50 text-white"
                          />
                          <button
                            onClick={() => handleSaveParams(ind.id)}
                            className="px-3 bg-red-600 rounded-lg text-[9px] font-black uppercase text-white shadow-lg shadow-red-600/10"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available Indicators scrolling content */}
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pb-8">
            {displayedIndicators.length > 0 ? (
              displayedIndicators.map((meta) => {
                const isFav = favorites.includes(meta.type);
                return (
                  <div
                    key={meta.type}
                    className="bg-[#0b0e14]/45 border border-white/5 rounded-2xl p-4 flex items-center justify-between group active:bg-white/[0.02] transition-all"
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

                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleFavorite(meta.type)}
                        className={`p-2 rounded-xl border transition-all ${
                          isFav
                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                            : 'bg-white/5 border-white/5 text-gray-600 hover:text-amber-500 hover:border-amber-500/20'
                        }`}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                      <button
                        onClick={() => addIndicator(meta.type)}
                        className="p-2 bg-red-600 hover:bg-red-700 rounded-xl border border-red-500 text-white active:scale-95 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center opacity-30">
                <Search className="w-10 h-10 text-gray-500 mb-2" />
                <p className="text-xs font-black text-white uppercase tracking-wider">
                  No indicators found
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
export default IndicatorBottomSheet;
