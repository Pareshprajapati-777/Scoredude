import { useRef, useEffect, useCallback } from 'react';

/**
 * Bulletproof hook to manage modal backdrop dismissal:
 * 1. Only closes if the user specifically clicked down (mousedown) AND released (mouseup) directly on the backdrop.
 * 2. Does NOT close when selecting text with mouse (drag selection starting inside input/modal and finishing outside).
 * 3. Does NOT close on right click or context menu (button === 2).
 * 4. Stops click event bubbling to parent containers/overlays.
 * 5. Handles Escape key cleanly.
 */
export function useSafeBackdropDismiss(onClose, isOpen = true) {
  const isBackdropMouseDownRef = useRef(false);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen || !onClose) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleBackdropMouseDown = useCallback((e) => {
    // Only register if mousedown is directly on the backdrop element itself
    // and ONLY with the primary left mouse button (e.button === 0)
    if (e.target === e.currentTarget && e.button === 0) {
      isBackdropMouseDownRef.current = true;
    } else {
      isBackdropMouseDownRef.current = false;
    }
  }, []);

  const handleBackdropMouseUp = useCallback((e) => {
    // Only close if BOTH mousedown AND mouseup occurred directly on the backdrop with left button
    if (
      e.target === e.currentTarget &&
      isBackdropMouseDownRef.current &&
      e.button === 0
    ) {
      e.stopPropagation();
      if (onClose) onClose();
    }
    isBackdropMouseDownRef.current = false;
  }, [onClose]);

  const handleBackdropClick = useCallback((e) => {
    // Stop all clicks on backdrop from propagating to outer overlays
    e.stopPropagation();
  }, []);

  // Props to spread onto the inner modal card to prevent any event leaks
  const modalContentProps = {
    onMouseDown: (e) => e.stopPropagation(),
    onMouseUp: (e) => e.stopPropagation(),
    onClick: (e) => e.stopPropagation(),
    onContextMenu: (e) => e.stopPropagation()
  };

  return {
    backdropProps: {
      onMouseDown: handleBackdropMouseDown,
      onMouseUp: handleBackdropMouseUp,
      onClick: handleBackdropClick,
    },
    modalContentProps
  };
}

export default useSafeBackdropDismiss;
