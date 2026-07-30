import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { GestureManager } from '../services/GestureManager';
import { AISignalPanel } from './AISignalPanel';
import { ChartCache, Candle } from '../services/ChartCache';

interface AIBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  symbol: string;
  timeframe: string;
  candles?: Candle[];
}

export const AIBottomSheet: React.FC<AIBottomSheetProps> = ({
  isOpen,
  onClose,
  symbol,
  timeframe,
  candles,
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const activeCandles = candles || ChartCache.getInstance().getCandles();

  useEffect(() => {
    if (isOpen && sheetRef.current) {
      const cleanup = GestureManager.getInstance().registerSwipeDown(sheetRef.current, onClose, 80);
      return cleanup;
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-end justify-center select-none">
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
          className="w-full max-w-md bg-[#141922] border-t border-white/10 rounded-t-[2rem] p-6 max-h-[85vh] flex flex-col z-[210] shadow-[0_-8px_32px_rgba(0,0,0,0.5)] overflow-hidden"
          style={{ paddingBottom: 'calc(var(--safe-bottom) + 24px)' }}
        >
          {/* Draggable Drag-Indicator Handle */}
          <div className="w-12 h-1.5 bg-white/20 hover:bg-white/40 rounded-full mx-auto mb-4 flex-shrink-0 cursor-grab active:cursor-grabbing transition-colors" />

          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-400" />
              <h3 className="text-base font-bold text-white tracking-wide">AI Signal Analysis</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto no-scrollbar">
            <AISignalPanel symbol={symbol} timeframe={timeframe} candles={activeCandles} />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AIBottomSheet;
