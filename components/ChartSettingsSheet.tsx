import React, { useState, useEffect, useRef } from 'react';
import { useToolbar } from '../hooks/useToolbar';
import { ScaleType } from '../services/ChartUIService';
import { ThemeManager } from '../services/ThemeManager';
import { X, Grid, Compass, RefreshCw, Sparkles, Sliders, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GestureManager } from '../services/GestureManager';

interface ChartSettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChartSettingsSheet: React.FC<ChartSettingsSheetProps> = ({ isOpen, onClose }) => {
  const {
    scaleType,
    showGrid,
    setScaleType,
    toggleGrid,
    fitContent,
  } = useToolbar();

  const [currentTheme, setCurrentTheme] = useState<'dark' | 'light'>('dark');
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentTheme(ThemeManager.getInstance().getTheme());
    const unsubscribe = ThemeManager.getInstance().subscribe((theme) => {
      setCurrentTheme(theme);
    });
    return unsubscribe;
  }, []);

  const handleThemeToggle = () => {
    ThemeManager.getInstance().toggleTheme();
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
          className="w-full max-w-md bg-[#141922] border-t border-white/10 rounded-t-[2rem] p-6 pb-[env(safe-area-inset-bottom,24px)] max-h-[85vh] flex flex-col z-[160] shadow-[0_-8px_32px_rgba(0,0,0,0.5)]"
        >
          {/* Draggable drag indicator handle */}
          <div className="w-12 h-1.5 bg-white/15 rounded-full mx-auto mb-5 cursor-grab active:cursor-grabbing flex-shrink-0" />

          {/* Header */}
          <div className="flex items-center justify-between mb-5 flex-shrink-0">
            <div>
              <h3 className="text-lg font-black italic uppercase tracking-tight text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-red-500" />
                Chart Settings
              </h3>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-0.5">
                Optimize and customize visual parameters
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-white/5 rounded-full hover:bg-white/10 active:scale-95 transition-all"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar space-y-5 pb-6">
            {/* Scale Settings */}
            <div className="space-y-2.5">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-red-500" />
                Scale Coordinates
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {(['auto', 'log', 'percentage', 'invert'] as ScaleType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setScaleType(type);
                    }}
                    className={`px-3 py-3 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all text-center ${
                      scaleType === type
                        ? 'bg-red-600 border-red-500 text-white shadow-lg'
                        : 'bg-black/40 border-white/5 text-gray-400 hover:text-white'
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

            {/* Grid Toggles */}
            <div className="space-y-2.5">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
                <Grid className="w-3.5 h-3.5 text-red-500" />
                Gridlines
              </h4>
              <div className="flex items-center justify-between bg-black/40 border border-white/5 rounded-2xl p-4">
                <div>
                  <p className="text-xs font-black text-white uppercase">Grid Visibility</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase mt-0.5">Show layout axis coordinates</p>
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

            {/* Theme Select */}
            <div className="space-y-2.5">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-red-500" />
                Color Theme
              </h4>
              <div className="flex items-center justify-between bg-black/40 border border-white/5 rounded-2xl p-4">
                <div>
                  <p className="text-xs font-black text-white uppercase">Visual Interface</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase mt-0.5">
                    Toggle eye-safe modes
                  </p>
                </div>
                <button
                  onClick={handleThemeToggle}
                  className="flex items-center gap-2 px-4 py-2 text-[10px] font-black rounded-xl uppercase bg-[#141922] border border-white/5 text-white active:scale-95 transition-all"
                >
                  {currentTheme === 'dark' ? (
                    <>
                      <Moon className="w-3.5 h-3.5 text-red-500" />
                      Dark Mode
                    </>
                  ) : (
                    <>
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      Light Mode
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="h-px bg-white/5" />

            {/* Scale reset fit */}
            <div className="space-y-2.5">
              <button
                onClick={() => {
                  fitContent();
                  onClose();
                }}
                className="w-full py-4 bg-red-600/10 hover:bg-red-600/20 active:scale-95 border border-red-500/20 rounded-2xl text-xs font-black uppercase tracking-widest text-red-500 flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                <RefreshCw className="w-4 h-4" />
                Fit Content (Reset Axis)
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
export default ChartSettingsSheet;
