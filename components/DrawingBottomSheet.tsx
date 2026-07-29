import React, { useState, useEffect, useRef } from 'react';
import { useDrawings } from '../hooks/useDrawings';
import { 
  X, Crosshair, MousePointer, TrendingUp, Minus, Milestone, ArrowUpRight, ArrowRight, Columns, Rows,
  Sigma, Orbit, Square, Circle, Triangle, Type, Brush, Highlighter, Eraser,
  Undo, Redo, Lock, EyeOff, Trash2, ChevronDown, ChevronUp, PencilRuler
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GestureManager } from '../services/GestureManager';

interface DrawingBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  drawingMode: string | null;
  setDrawingMode: (mode: string | null) => void;
}

export const DrawingBottomSheet: React.FC<DrawingBottomSheetProps> = ({
  isOpen,
  onClose,
  drawingMode,
  setDrawingMode,
}) => {
  const {
    undo,
    redo,
    clearAll,
    lockAll,
    hideAll,
  } = useDrawings();

  const [expandedCategory, setExpandedCategory] = useState<string | null>('trend');
  const sheetRef = useRef<HTMLDivElement>(null);

  const categories = [
    {
      id: 'cursor',
      name: 'Cursor Tools',
      icon: MousePointer,
      tools: [
        { id: 'cursor', name: 'Crosshair / Pointer', icon: Crosshair }
      ]
    },
    {
      id: 'trend',
      name: 'Trend Lines',
      icon: TrendingUp,
      tools: [
        { id: 'trendline', name: 'Trend Line', icon: TrendingUp },
        { id: 'ray', name: 'Ray', icon: ArrowUpRight },
        { id: 'horizontal', name: 'Horizontal Line', icon: Minus },
        { id: 'vertical', name: 'Vertical Line', icon: Milestone },
        { id: 'arrow', name: 'Arrow Line', icon: ArrowRight },
        { id: 'priceChannel', name: 'Parallel Channel', icon: Columns },
        { id: 'parallelLine', name: 'Regression Channel', icon: Rows }
      ]
    },
    {
      id: 'fib',
      name: 'Fibonacci Tools',
      icon: Sigma,
      tools: [
        { id: 'fib', name: 'Retracement', icon: Sigma },
        { id: 'arc', name: 'Fibonacci Arc', icon: Orbit }
      ]
    },
    {
      id: 'shapes',
      name: 'Geometric Shapes',
      icon: Square,
      tools: [
        { id: 'rectangle', name: 'Rectangle', icon: Square },
        { id: 'circle', name: 'Circle', icon: Circle },
        { id: 'triangle', name: 'Triangle', icon: Triangle }
      ]
    },
    {
      id: 'annotation',
      name: 'Annotations',
      icon: Type,
      tools: [
        { id: 'text', name: 'Text Note', icon: Type }
      ]
    },
    {
      id: 'brush',
      name: 'Brushes & Eraser',
      icon: Brush,
      tools: [
        { id: 'brush', name: 'Brush', icon: Brush },
        { id: 'highlighter', name: 'Highlighter', icon: Highlighter },
        { id: 'eraser', name: 'Eraser', icon: Eraser }
      ]
    }
  ];

  const handleToolSelect = (toolId: string) => {
    if (toolId === 'cursor') {
      setDrawingMode(null);
    } else {
      setDrawingMode(toolId);
    }
    onClose();
  };

  const toggleCategory = (catId: string) => {
    setExpandedCategory(expandedCategory === catId ? null : catId);
  };

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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        <motion.div
          ref={sheetRef}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="w-full max-w-md bg-[#141922] border-t border-white/10 rounded-t-[2rem] p-6 max-h-[85vh] flex flex-col z-[160] shadow-[0_-8px_32px_rgba(0,0,0,0.5)]"
          style={{ paddingBottom: 'calc(var(--safe-bottom) + 24px)' }}
        >
          {/* Draggable drag indicator handle */}
          <div className="w-12 h-1.5 bg-white/15 rounded-full mx-auto mb-5 cursor-grab active:cursor-grabbing flex-shrink-0" />

          {/* Header */}
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <div>
              <h3 className="text-lg font-black italic uppercase tracking-tight text-white flex items-center gap-2">
                <PencilRuler className="w-4 h-4 text-red-500" />
                Drawing Canvas Tools
              </h3>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-0.5">
                Analyze and mark key chart levels
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-white/5 rounded-full hover:bg-white/10 active:scale-95 transition-all"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Quick Management Buttons */}
          <div className="grid grid-cols-5 gap-2 mb-4 bg-[#0b0e14]/50 p-2.5 rounded-2xl flex-shrink-0 border border-white/5">
            <button
              onClick={() => { undo(); onClose(); }}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#141922] hover:bg-white/5 text-gray-400 hover:text-white transition-colors h-14"
            >
              <Undo className="w-4 h-4 mb-1" />
              <span className="text-[7.5px] font-black uppercase tracking-wider text-gray-500">Undo</span>
            </button>
            <button
              onClick={() => { redo(); onClose(); }}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#141922] hover:bg-white/5 text-gray-400 hover:text-white transition-colors h-14"
            >
              <Redo className="w-4 h-4 mb-1" />
              <span className="text-[7.5px] font-black uppercase tracking-wider text-gray-500">Redo</span>
            </button>
            <button
              onClick={() => { lockAll(); onClose(); }}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#141922] hover:bg-white/5 text-gray-400 hover:text-white transition-colors h-14"
            >
              <Lock className="w-4 h-4 mb-1" />
              <span className="text-[7.5px] font-black uppercase tracking-wider text-gray-500">Lock All</span>
            </button>
            <button
              onClick={() => { hideAll(); onClose(); }}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#141922] hover:bg-white/5 text-gray-400 hover:text-white transition-colors h-14"
            >
              <EyeOff className="w-4 h-4 mb-1" />
              <span className="text-[7.5px] font-black uppercase tracking-wider text-gray-500">Hide All</span>
            </button>
            <button
              onClick={() => { clearAll(); onClose(); }}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-red-600/10 border border-red-500/10 hover:bg-red-600/20 text-red-500 transition-colors h-14"
            >
              <Trash2 className="w-4 h-4 mb-1 text-red-500" />
              <span className="text-[7.5px] font-black uppercase tracking-wider text-red-500">Clear</span>
            </button>
          </div>

          {/* Collapsible Categories list */}
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pb-6">
            {categories.map((cat) => {
              const isExpanded = expandedCategory === cat.id;
              const CatIcon = cat.icon;

              return (
                <div key={cat.id} className="border border-white/5 bg-[#0b0e14]/30 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => toggleCategory(cat.id)}
                    className="w-full flex items-center justify-between p-4 bg-[#0b0e14]/50 hover:bg-[#0b0e14] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-white/5 text-gray-400">
                        <CatIcon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-black uppercase tracking-wider text-white">
                        {cat.name}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="p-3 bg-[#0b0e14]/15 grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                      {cat.tools.map((tool) => {
                        const ToolIcon = tool.icon;
                        const isToolActive = (tool.id === 'cursor' && !drawingMode) || drawingMode === tool.id;

                        return (
                          <button
                            key={tool.id}
                            onClick={() => handleToolSelect(tool.id)}
                            className={`flex items-center gap-2.5 px-3 rounded-xl border text-[11px] font-black uppercase tracking-wider transition-all h-12 text-left ${
                              isToolActive
                                ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-900/15'
                                : 'bg-[#141922] border-white/5 text-gray-400 hover:text-white'
                            }`}
                          >
                            <div className={`p-1.5 rounded-lg ${isToolActive ? 'bg-white/10' : 'bg-white/5'}`}>
                              <ToolIcon className="w-4 h-4" />
                            </div>
                            <span className="truncate">{tool.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
export default DrawingBottomSheet;
