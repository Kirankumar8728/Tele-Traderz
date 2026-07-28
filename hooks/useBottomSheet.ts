import { useState, useCallback } from 'react';

export type SnapPoint = 'closed' | 'low' | 'mid' | 'high';

export interface BottomSheetState {
  isOpen: boolean;
  snapPoint: SnapPoint;
  open: (point?: SnapPoint) => void;
  close: () => void;
  setSnap: (point: SnapPoint) => void;
  toggle: () => void;
}

export const useBottomSheet = (initialPoint: SnapPoint = 'closed'): BottomSheetState => {
  const [snapPoint, setSnapPoint] = useState<SnapPoint>(initialPoint);

  const open = useCallback((point: SnapPoint = 'mid') => {
    setSnapPoint(point);
  }, []);

  const close = useCallback(() => {
    setSnapPoint('closed');
  }, []);

  const setSnap = useCallback((point: SnapPoint) => {
    setSnapPoint(point);
  }, []);

  const toggle = useCallback(() => {
    setSnapPoint((prev) => (prev === 'closed' ? 'mid' : 'closed'));
  }, []);

  return {
    isOpen: snapPoint !== 'closed',
    snapPoint,
    open,
    close,
    setSnap,
    toggle,
  };
};
