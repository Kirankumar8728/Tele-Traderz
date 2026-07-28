// DrawingLayer.tsx
import React from 'react';

interface DrawingLayerProps {
  drawingMode: string | null;
  setDrawingMode: (mode: string | null) => void;
}

export const DrawingLayer: React.FC<DrawingLayerProps> = ({ drawingMode, setDrawingMode }) => {
  if (!drawingMode || drawingMode === 'cursor') return null;

  return (
    <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-30 pointer-events-auto">
      <div className="bg-[#0b0e14]/95 border border-white/10 px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md animate-in slide-in-from-bottom duration-200">
        <span className="text-[10px] font-black uppercase tracking-widest text-red-500 animate-pulse">
          Drawing Mode: {drawingMode}
        </span>
        <button
          onClick={() => setDrawingMode(null)}
          className="text-[9px] font-bold text-white bg-red-600 hover:bg-red-700 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default DrawingLayer;
