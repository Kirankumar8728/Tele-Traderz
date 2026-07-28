import React from 'react';
import { PencilRuler, Sparkles, Sliders } from 'lucide-react';
import { motion } from 'framer-motion';

interface QuickActionsProps {
  onDrawingsClick: () => void;
  onIndicatorsClick: () => void;
  onSettingsClick: () => void;
  drawingMode: string | null;
  setDrawingMode: (mode: string | null) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onDrawingsClick,
  onIndicatorsClick,
  onSettingsClick,
  drawingMode,
  setDrawingMode,
}) => {
  return (
    <div className="absolute bottom-6 right-4 z-[90] flex flex-col gap-2.5 pointer-events-none select-none">
      {/* If in active drawing mode, display a Cancel/Cursor reset indicator button */}
      {drawingMode && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          onClick={() => setDrawingMode(null)}
          className="pointer-events-auto h-11 px-4 bg-amber-600 hover:bg-amber-500 rounded-full flex items-center justify-center text-white text-[9px] font-black uppercase tracking-wider border border-amber-500/20 shadow-lg active:scale-95 transition-all shadow-amber-900/15"
        >
          Cancel Drawing ({drawingMode})
        </motion.button>
      )}

      {/* Primary Draw Tools FAB */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onDrawingsClick}
        className="pointer-events-auto w-14 h-14 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center text-white border border-red-500/20 shadow-2xl transition-all shadow-red-900/30"
        title="Drawing Tools"
      >
        <PencilRuler className="w-5.5 h-5.5 text-white" />
      </motion.button>
    </div>
  );
};
export default QuickActions;
