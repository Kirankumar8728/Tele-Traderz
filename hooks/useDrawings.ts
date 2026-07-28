// useDrawings.ts
import { useState, useEffect } from 'react';
import { DrawingManager, Drawing } from '../services/DrawingManager';

export const useDrawings = () => {
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawingMode, setDrawingMode] = useState<string | null>(null);

  useEffect(() => {
    const manager = DrawingManager.getInstance();

    const handleDrawingsChange = (currentDrawings: Drawing[]) => {
      setDrawings(currentDrawings);
      setSelectedId(manager.getSelectedDrawingId());
    };

    manager.registerListener(handleDrawingsChange);

    return () => {
      manager.unregisterListener(handleDrawingsChange);
    };
  }, []);

  const addDrawing = (drawing: Omit<Drawing, 'id'>) => {
    return DrawingManager.getInstance().addDrawing(drawing);
  };

  const removeDrawing = (id: string) => {
    DrawingManager.getInstance().removeDrawing(id);
  };

  const updateDrawing = (id: string, updates: Partial<Drawing>) => {
    DrawingManager.getInstance().updateDrawing(id, updates);
  };

  const selectDrawing = (id: string | null) => {
    DrawingManager.getInstance().selectDrawing(id);
  };

  const toggleLock = (id: string) => {
    DrawingManager.getInstance().toggleLock(id);
  };

  const toggleVisibility = (id: string) => {
    DrawingManager.getInstance().toggleVisibility(id);
  };

  const duplicateDrawing = (id: string) => {
    DrawingManager.getInstance().duplicateDrawing(id);
  };

  const copyDrawing = (id: string) => {
    DrawingManager.getInstance().copy(id);
  };

  const pasteDrawing = () => {
    DrawingManager.getInstance().paste();
  };

  const clearAll = () => {
    DrawingManager.getInstance().clearAll();
  };

  const lockAll = () => {
    DrawingManager.getInstance().lockAll();
  };

  const unlockAll = () => {
    DrawingManager.getInstance().unlockAll();
  };

  const hideAll = () => {
    DrawingManager.getInstance().hideAll();
  };

  const showAll = () => {
    DrawingManager.getInstance().showAll();
  };

  const undo = () => {
    DrawingManager.getInstance().undo();
  };

  const redo = () => {
    DrawingManager.getInstance().redo();
  };

  const moveUp = (id: string) => {
    DrawingManager.getInstance().moveUp(id);
  };

  const moveDown = (id: string) => {
    DrawingManager.getInstance().moveDown(id);
  };

  return {
    drawings,
    selectedId,
    drawingMode,
    setDrawingMode,
    addDrawing,
    removeDrawing,
    updateDrawing,
    selectDrawing,
    toggleLock,
    toggleVisibility,
    duplicateDrawing,
    copyDrawing,
    pasteDrawing,
    clearAll,
    lockAll,
    unlockAll,
    hideAll,
    showAll,
    undo,
    redo,
    moveUp,
    moveDown,
  };
};
