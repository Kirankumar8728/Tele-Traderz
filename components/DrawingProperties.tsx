// DrawingProperties.tsx
import React, { useState } from 'react';
import { useDrawings } from '../hooks/useDrawings';
import { IndicatorManager } from '../services/IndicatorManager';
import { 
  Palette, Trash2, Lock, Unlock, Eye, EyeOff, Copy, Clipboard, Layers,
  Search, Star, Undo2, Redo2, ArrowUp, ArrowDown, Folder, Sparkles, Plus, AlertCircle 
} from 'lucide-react';

export const DrawingProperties: React.FC = () => {
  const {
    drawings,
    selectedId,
    updateDrawing,
    toggleLock,
    toggleVisibility,
    duplicateDrawing,
    copyDrawing,
    pasteDrawing,
    removeDrawing,
    clearAll,
    lockAll,
    unlockAll,
    hideAll,
    showAll,
    undo,
    redo,
    moveUp,
    moveDown,
    selectDrawing,
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

  const [activeSubTab, setActiveSubTab] = useState<'properties' | 'layers'>('layers');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [starredDrawings, setStarredDrawings] = useState<string[]>([]);

  const selectedDrawing = drawings.find(d => d.id === selectedId);

  // Categorize drawings
  const getCategory = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('line') || t.includes('segment') || t.includes('ray')) return 'Lines';
    if (t.includes('rectangle') || t.includes('circle') || t.includes('triangle') || t.includes('polygon') || t.includes('arc')) return 'Shapes';
    if (t.includes('fibonacci')) return 'Fibs';
    return 'Annotations';
  };

  const toggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStarredDrawings(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Filtered drawings for the Drawing Manager Tree list
  const filteredDrawings = drawings.filter(d => {
    const nameMatch = (d.label || d.type || '').toLowerCase().includes(searchQuery.toLowerCase());
    const categoryMatch = selectedCategory === 'all' || getCategory(d.type) === selectedCategory;
    const favoriteMatch = selectedCategory !== 'favorites' || starredDrawings.includes(d.id);
    return nameMatch && (selectedCategory === 'favorites' ? favoriteMatch : categoryMatch);
  });

  const currentColor = selectedDrawing?.styles?.line?.color || '#ef4444';
  const currentWidth = selectedDrawing?.styles?.line?.size || 2;

  const handleColorChange = (color: string) => {
    if (!selectedDrawing) return;
    updateDrawing(selectedDrawing.id, {
      styles: {
        ...selectedDrawing.styles,
        line: {
          ...selectedDrawing.styles?.line,
          color,
        },
        polygon: {
          ...selectedDrawing.styles?.polygon,
          color: color + '33', // 20% opacity fill for shapes
        },
      },
    });
  };

  const handleWidthChange = (width: number) => {
    if (!selectedDrawing) return;
    updateDrawing(selectedDrawing.id, {
      styles: {
        ...selectedDrawing.styles,
        line: {
          ...selectedDrawing.styles?.line,
          size: width,
        },
      },
    });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden text-gray-300">
      {/* Drawing Manager Sub Tabs Header */}
      <div className="flex bg-[#0b0e14]/90 border-b border-white/5 p-2 gap-1.5 flex-shrink-0">
        <button
          onClick={() => setActiveSubTab('layers')}
          className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all text-center border ${
            activeSubTab === 'layers'
              ? 'bg-red-600/10 border-red-500/25 text-red-500'
              : 'bg-transparent border-transparent text-gray-500 hover:text-white'
          }`}
        >
          Drawing Tree ({drawings.length})
        </button>
        <button
          onClick={() => {
            if (selectedId) setActiveSubTab('properties');
          }}
          disabled={!selectedId}
          className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all text-center border ${
            !selectedId 
              ? 'opacity-35 cursor-not-allowed text-gray-600 border-transparent'
              : activeSubTab === 'properties'
                ? 'bg-red-600/10 border-red-500/25 text-red-500'
                : 'bg-transparent border-transparent text-gray-500 hover:text-white'
          }`}
        >
          Properties
        </button>
      </div>

      {/* SUB-TAB 1: OBJECT TREE & ACTIVE DRAWINGS MANAGER */}
      {activeSubTab === 'layers' && (
        <div className="flex-1 flex flex-col min-h-0 bg-[#07090e]">
          {/* Action Header bar: bulk operations, undo, redo */}
          <div className="p-2.5 bg-[#0b0e14] border-b border-white/5 flex items-center justify-between gap-1 flex-shrink-0">
            <div className="flex gap-1">
              <button
                onClick={undo}
                className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-gray-400 hover:text-white transition-all"
                title="Undo Drawing"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={redo}
                className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-gray-400 hover:text-white transition-all"
                title="Redo Drawing"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex gap-1">
              <button
                onClick={lockAll}
                className="p-1 px-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-[8px] font-black uppercase text-gray-400 hover:text-white transition-all"
                title="Lock All"
              >
                Lock All
              </button>
              <button
                onClick={handleToggleHideAll}
                className={`p-1 px-2 border rounded-lg text-[8px] font-black uppercase transition-all ${
                  areAllHidden 
                    ? 'bg-red-600/15 border-red-500/20 text-red-500 hover:bg-red-600/25' 
                    : 'bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
                title={areAllHidden ? "Show All Drawings" : "Hide All Drawings"}
              >
                {areAllHidden ? "Show All" : "Hide All"}
              </button>
              <button
                onClick={clearAll}
                className="p-1 px-2 bg-red-600/10 hover:bg-red-600/25 border border-red-500/10 rounded-lg text-[8px] font-black uppercase text-red-500 transition-all"
                title="Delete All"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Search and Categories inside Drawing tree */}
          <div className="p-3.5 space-y-2 bg-[#0b0e14]/55 border-b border-white/5 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <input
                type="text"
                placeholder="Search drawings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-[10px] font-bold outline-none focus:border-red-500/50 transition-all placeholder:text-gray-600"
              />
            </div>

            {/* Sub-categories row */}
            <div className="flex gap-1 overflow-x-auto no-scrollbar pt-0.5">
              {['all', 'favorites', 'Lines', 'Shapes', 'Fibs'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all whitespace-nowrap border ${
                    selectedCategory === cat
                      ? 'bg-red-600 border-red-500 text-white'
                      : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {cat === 'all' ? 'All' : cat === 'favorites' ? '★ Favs' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Tree list of Active Drawings */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-1.5 pb-24">
            {filteredDrawings.length > 0 ? (
              filteredDrawings.map((draw, index) => {
                const isSelected = draw.id === selectedId;
                const isStarred = starredDrawings.includes(draw.id);

                return (
                  <div
                    key={draw.id}
                    onClick={() => {
                      selectDrawing(draw.id);
                      setActiveSubTab('properties');
                    }}
                    className={`border rounded-2xl p-3 flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-red-600/10 border-red-500/30'
                        : 'bg-[#141922]/30 hover:bg-[#141922] border-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => toggleStar(draw.id, e)}
                        className={`text-xs transition-colors ${isStarred ? 'text-amber-500' : 'text-gray-600 hover:text-amber-500'}`}
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                      </button>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black text-white uppercase">{draw.label || draw.type}</span>
                          <span className="text-[7px] font-black px-1.5 py-0.5 rounded bg-white/5 text-gray-500 uppercase">
                            {getCategory(draw.type)}
                          </span>
                        </div>
                        <p className="text-[8px] font-mono text-gray-500 mt-0.5">ID: {draw.id.slice(-6)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      {/* Layer order re-ordering buttons */}
                      <button
                        onClick={() => moveUp(draw.id)}
                        disabled={index === 0}
                        className={`p-1 rounded hover:bg-white/5 transition-all ${index === 0 ? 'opacity-20 cursor-not-allowed' : 'text-gray-400 hover:text-white'}`}
                        title="Move layer up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => moveDown(draw.id)}
                        disabled={index === filteredDrawings.length - 1}
                        className={`p-1 rounded hover:bg-white/5 transition-all ${index === filteredDrawings.length - 1 ? 'opacity-20 cursor-not-allowed' : 'text-gray-400 hover:text-white'}`}
                        title="Move layer down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>

                      {/* Lock Toggle */}
                      <button
                        onClick={() => toggleLock(draw.id)}
                        className={`p-1.5 rounded transition-all ${draw.locked ? 'text-red-500 hover:bg-red-500/10' : 'text-gray-500 hover:text-white'}`}
                        title={draw.locked ? 'Unlock drawing' : 'Lock drawing'}
                      >
                        {draw.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      </button>

                      {/* Visibility Toggle */}
                      <button
                        onClick={() => toggleVisibility(draw.id)}
                        className={`p-1.5 rounded transition-all ${!draw.visible ? 'text-red-500 hover:bg-red-500/10' : 'text-gray-500 hover:text-white'}`}
                        title={draw.visible ? 'Hide drawing' : 'Show drawing'}
                      >
                        {draw.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>

                      {/* Deletion */}
                      <button
                        onClick={() => removeDrawing(draw.id)}
                        className="p-1.5 hover:bg-red-500/10 text-red-500 rounded transition-all"
                        title="Delete drawing"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center opacity-30">
                <Folder className="w-10 h-10 text-gray-500 mb-2" />
                <p className="text-[10px] font-black text-white uppercase tracking-wider">No active drawings</p>
                <p className="text-[8px] font-bold text-gray-500 uppercase max-w-xs mt-1">Draw trendlines or rectangles to list them here</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: SELECTED DRAWING PROPERTIES PANEL */}
      {activeSubTab === 'properties' && selectedDrawing && (
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-6 bg-[#07090e]">
          {/* Selected Header */}
          <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Active Selection</span>
              <p className="text-sm font-black text-white uppercase mt-0.5">{selectedDrawing.label}</p>
              <span className="text-[9px] text-gray-500 font-mono">ID: {selectedDrawing.id}</span>
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={() => toggleLock(selectedDrawing.id)}
                className={`p-2.5 rounded-xl border transition-all ${
                  selectedDrawing.locked
                    ? 'bg-red-500/10 border-red-500/20 text-red-500'
                    : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                }`}
                title={selectedDrawing.locked ? 'Unlock Drawing' : 'Lock Drawing'}
              >
                {selectedDrawing.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              </button>
              <button
                onClick={() => toggleVisibility(selectedDrawing.id)}
                className={`p-2.5 rounded-xl border transition-all ${
                  !selectedDrawing.visible
                    ? 'bg-red-500/10 border-red-500/20 text-red-500'
                    : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                }`}
                title={selectedDrawing.visible ? 'Hide Drawing' : 'Show Drawing'}
              >
                {selectedDrawing.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Colors Selection */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5" />
              Color Style
            </h3>
            <div className="grid grid-cols-6 gap-2">
              {['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ffffff'].map(color => (
                <button
                  key={color}
                  onClick={() => handleColorChange(color)}
                  className={`w-full aspect-square rounded-xl border-2 transition-all ${
                    currentColor === color ? 'border-white scale-105' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Width selection */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Line Thickness
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map(width => (
                <button
                  key={width}
                  onClick={() => handleWidthChange(width)}
                  className={`h-11 rounded-xl border transition-all flex items-center justify-center ${
                    currentWidth === width
                      ? 'bg-white/10 border-white/30 text-white'
                      : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <div className="w-8 bg-current rounded-full" style={{ height: width }} />
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-white/5" />

          {/* Operations */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => copyDrawing(selectedDrawing.id)}
                className="py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all"
              >
                <Copy className="w-3.5 h-3.5 text-gray-400" />
                Copy
              </button>
              <button
                onClick={() => duplicateDrawing(selectedDrawing.id)}
                className="py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all"
              >
                <Clipboard className="w-3.5 h-3.5 text-gray-400" />
                Duplicate
              </button>
            </div>

            <button
              onClick={() => {
                removeDrawing(selectedDrawing.id);
                setActiveSubTab('layers');
              }}
              className="w-full py-3.5 bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/10 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Drawing
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DrawingProperties;
