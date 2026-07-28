// DrawingToolbar.tsx
import React, { useState } from 'react';
import { useDrawings } from '../hooks/useDrawings';
import { IndicatorManager } from '../services/IndicatorManager';
import { 
  Crosshair, MousePointer, TrendingUp, Minus, Milestone, ArrowUpRight, ArrowRight, Columns, Rows, Grid,
  Sigma, Orbit, Activity, Split, Milestone as MilestoneIcon, Square, Circle, Triangle, Hexagon,
  Type, MessageSquare, Tag, FileText, Ruler, Scale, Percent, Brush, Highlighter, Eraser,
  Lock, Unlock, Eye, EyeOff, Trash2, Undo, Redo, Copy, RefreshCw, Layers
} from 'lucide-react';

interface ToolItem {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  shortcut?: string;
  klineOverlay?: string;
}

interface ToolGroup {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  tools: ToolItem[];
}

interface DrawingToolbarProps {
  drawingMode: string | null;
  setDrawingMode: (mode: string | null) => void;
}

export const DrawingToolbar: React.FC<DrawingToolbarProps> = ({ drawingMode, setDrawingMode }) => {
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [activeGroupTop, setActiveGroupTop] = useState<number>(0);

  const {
    drawings,
    selectedId,
    undo,
    redo,
    clearAll,
    lockAll,
    unlockAll,
    hideAll,
    showAll,
    removeDrawing,
    toggleLock,
    toggleVisibility
  } = useDrawings();

  const areAllHidden = drawings.length > 0 && drawings.every(d => !d.visible);

  const handleToggleHideAll = () => {
    if (areAllHidden) {
      showAll();
      IndicatorManager.getInstance().showAll();
    } else {
      hideAll();
      IndicatorManager.getInstance().hideAll();
    }
  };

  const groups: ToolGroup[] = [
    {
      id: 'cursor',
      name: 'Cursor Tools',
      icon: MousePointer,
      tools: [
        { id: 'cursor', name: 'Crosshair', icon: Crosshair, shortcut: 'C' }
      ]
    },
    {
      id: 'trend',
      name: 'Trend Lines',
      icon: TrendingUp,
      tools: [
        { id: 'trendline', name: 'Trend Line', icon: TrendingUp, shortcut: 'T', klineOverlay: 'segment' },
        { id: 'ray', name: 'Ray', icon: ArrowUpRight, shortcut: 'Alt+R', klineOverlay: 'rayLine' },
        { id: 'horizontal', name: 'Horizontal Line', icon: Minus, shortcut: 'Alt+H', klineOverlay: 'horizontalLine' },
        { id: 'vertical', name: 'Vertical Line', icon: Milestone, shortcut: 'Alt+V', klineOverlay: 'verticalLine' },
        { id: 'arrow', name: 'Arrow Line', icon: ArrowRight, shortcut: 'Alt+A', klineOverlay: 'arrow' },
        { id: 'priceChannel', name: 'Parallel Channel', icon: Columns, shortcut: 'Alt+P', klineOverlay: 'priceChannelLine' },
        { id: 'parallelLine', name: 'Regression Channel', icon: Rows, shortcut: 'Alt+K', klineOverlay: 'parallelLine' }
      ]
    },
    {
      id: 'fib',
      name: 'Fibonacci Tools',
      icon: Sigma,
      tools: [
        { id: 'fib', name: 'Retracement', icon: Sigma, shortcut: 'Alt+F', klineOverlay: 'fibonacciLine' },
        { id: 'arc', name: 'Fibonacci Arc', icon: Orbit, shortcut: 'Alt+O', klineOverlay: 'arc' }
      ]
    },
    {
      id: 'shapes',
      name: 'Geometric Shapes',
      icon: Square,
      tools: [
        { id: 'rectangle', name: 'Rectangle', icon: Square, shortcut: 'Alt+G', klineOverlay: 'rectangle' },
        { id: 'circle', name: 'Circle', icon: Circle, shortcut: 'Alt+C', klineOverlay: 'circle' },
        { id: 'triangle', name: 'Triangle', icon: Triangle, shortcut: 'Alt+T', klineOverlay: 'triangle' }
      ]
    },
    {
      id: 'annotation',
      name: 'Annotations',
      icon: Type,
      tools: [
        { id: 'text', name: 'Text Note', icon: Type, shortcut: 'Alt+N', klineOverlay: 'text' }
      ]
    },
    {
      id: 'brush',
      name: 'Brushes',
      icon: Brush,
      tools: [
        { id: 'brush', name: 'Brush', icon: Brush, shortcut: 'B' },
        { id: 'highlighter', name: 'Highlighter', icon: Highlighter, shortcut: 'H' },
        { id: 'eraser', name: 'Eraser', icon: Eraser, shortcut: 'E' }
      ]
    }
  ];

  const handleToolSelect = (toolId: string) => {
    if (toolId === 'cursor') {
      setDrawingMode(null);
    } else {
      setDrawingMode(toolId);
    }
    setActiveGroup(null);
  };

  const getActiveIcon = () => {
    if (!drawingMode) return <Crosshair className="w-4 h-4 text-red-500" />;
    for (const group of groups) {
      const found = group.tools.find(t => t.id === drawingMode);
      if (found) {
        const Icon = found.icon;
        return <Icon className="w-4 h-4 text-red-500" />;
      }
    }
    return <Crosshair className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className="w-11 bg-[#0b0e14] border-r border-white/5 flex flex-col justify-between items-center py-2 flex-shrink-0 relative z-50 h-full overflow-y-auto no-scrollbar">
      {/* Top section: Drawing Tools */}
      <div className="flex flex-col gap-1.5 w-full px-1">
        {groups.map(group => {
          const isGroupActive = group.tools.some(t => t.id === drawingMode || (t.id === 'cursor' && !drawingMode));
          const GroupIcon = group.icon;

          return (
            <div key={group.id} className="relative w-full">
              <button
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setActiveGroupTop(rect.top);
                  setActiveGroup(activeGroup === group.id ? null : group.id);
                }}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all border ${
                  isGroupActive
                    ? 'bg-red-600/10 border-red-500/30 text-red-500'
                    : 'bg-transparent border-transparent text-gray-500 hover:text-white hover:bg-white/5'
                }`}
                title={group.name}
              >
                <GroupIcon className="w-4 h-4" />
              </button>

              {/* Hover/click expansion drawer */}
              {activeGroup === group.id && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setActiveGroup(null)} />
                  <div 
                    className="fixed left-11 bg-[#141922] border border-white/10 rounded-xl shadow-2xl p-1.5 w-48 flex flex-col gap-0.5 z-[100] animate-in fade-in slide-in-from-left-2 duration-150"
                    style={{ top: `${activeGroupTop}px` }}
                  >
                    <p className="text-[9px] font-black uppercase text-gray-500 tracking-wider px-2 py-1 border-b border-white/5 mb-1">
                      {group.name}
                    </p>
                    {group.tools.map(tool => {
                      const isToolActive = (tool.id === 'cursor' && !drawingMode) || drawingMode === tool.id;
                      const ToolIcon = tool.icon;

                      return (
                        <button
                          key={tool.id}
                          onClick={() => handleToolSelect(tool.id)}
                          className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                            isToolActive
                              ? 'bg-red-600 text-white'
                              : 'text-gray-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <ToolIcon className="w-3.5 h-3.5" />
                            <span>{tool.name}</span>
                          </div>
                          {tool.shortcut && (
                            <span className="text-[8px] opacity-40 font-mono">{tool.shortcut}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Middle: Divider */}
      <div className="w-6 h-px bg-white/5 my-1" />

      {/* Bottom section: Layers & Management */}
      <div className="flex flex-col gap-1.5 w-full px-1">
        {/* Undo */}
        <button
          onClick={undo}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 transition-all border border-transparent"
          title="Undo Drawing (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </button>

        {/* Redo */}
        <button
          onClick={redo}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 transition-all border border-transparent"
          title="Redo Drawing (Ctrl+Y)"
        >
          <Redo className="w-4 h-4" />
        </button>

        <div className="w-6 h-px bg-white/5 my-0.5" />

        {/* Lock All Toggles */}
        <button
          onClick={lockAll}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 transition-all border border-transparent"
          title="Lock All Drawings"
        >
          <Lock className="w-4 h-4" />
        </button>

        {/* Hide All Toggles */}
        <button
          onClick={handleToggleHideAll}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all border border-transparent ${
            areAllHidden 
              ? 'text-red-500 bg-red-500/10 hover:bg-red-500/20' 
              : 'text-gray-500 hover:text-white hover:bg-white/5'
          }`}
          title={areAllHidden ? "Show All Drawings" : "Hide All Drawings"}
        >
          {areAllHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>

        {/* Delete All */}
        <button
          onClick={clearAll}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-all border border-transparent"
          title="Delete All Drawings"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default DrawingToolbar;
