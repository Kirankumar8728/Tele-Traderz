export class GestureManager {
  private static instance: GestureManager;

  private constructor() {}

  public static getInstance(): GestureManager {
    if (!GestureManager.instance) {
      GestureManager.instance = new GestureManager();
    }
    return GestureManager.instance;
  }

  /**
   * Tracks a vertical swipe-down gesture on an element to trigger a callback
   */
  public registerSwipeDown(element: HTMLElement, onSwipeDown: () => void, threshold = 80): () => void {
    let startY = 0;
    let currentY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      currentY = e.touches[0].clientY;
      const diffY = currentY - startY;
      
      // Visual feedback: translate bottom sheet downwards slightly if dragging down
      if (diffY > 0 && element) {
        element.style.transform = `translateY(${diffY}px)`;
        element.style.transition = 'none';
      }
    };

    const handleTouchEnd = () => {
      const diffY = currentY - startY;
      if (diffY > threshold) {
        onSwipeDown();
      } else {
        // Reset position
        if (element) {
          element.style.transform = '';
          element.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
        }
      }
      startY = 0;
      currentY = 0;
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }
}
