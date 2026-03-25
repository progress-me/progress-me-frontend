import { useCallback, useEffect, useRef } from "react";

interface UseSwipeDrawerOptions {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  edgeWidth?: number;
  threshold?: number;
  velocityThreshold?: number;
}

interface SwipeState {
  startX: number;
  startY: number;
  startTime: number;
  currentX: number;
  isTracking: boolean;
  directionLocked: boolean;
  isHorizontal: boolean;
}

export function useSwipeDrawer({
  isOpen,
  onOpen,
  onClose,
  edgeWidth = 24,
  threshold = 80,
  velocityThreshold = 0.3,
}: UseSwipeDrawerOptions) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<SwipeState>({
    startX: 0,
    startY: 0,
    startTime: 0,
    currentX: 0,
    isTracking: false,
    directionLocked: false,
    isHorizontal: false,
  });
  const isOpenRef = useRef(isOpen);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    isOpenRef.current = isOpen;

    if (drawerRef.current) {
      drawerRef.current.style.transition = "transform 0.3s ease";
      drawerRef.current.style.transform = isOpen
        ? "translateX(0)"
        : "translateX(-100%)";
    }
    if (backdropRef.current) {
      backdropRef.current.style.transition = "opacity 0.3s ease";
      backdropRef.current.style.opacity = isOpen ? "1" : "0";
      backdropRef.current.style.pointerEvents = isOpen ? "auto" : "none";
    }
  }, [isOpen]);

  const updateDrawerPosition = useCallback((progress: number) => {
    const clamped = Math.max(0, Math.min(1, progress));
    if (drawerRef.current) {
      drawerRef.current.style.transition = "none";
      drawerRef.current.style.transform = `translateX(${(clamped - 1) * 100}%)`;
    }
    if (backdropRef.current) {
      backdropRef.current.style.transition = "none";
      backdropRef.current.style.opacity = String(clamped);
      backdropRef.current.style.pointerEvents = clamped > 0 ? "auto" : "none";
    }
  }, []);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      const state = stateRef.current;

      if (isOpenRef.current) {
        state.isTracking = true;
      } else if (touch.clientX < edgeWidth) {
        state.isTracking = true;
      } else {
        state.isTracking = false;
        return;
      }

      state.startX = touch.clientX;
      state.startY = touch.clientY;
      state.startTime = Date.now();
      state.currentX = touch.clientX;
      state.directionLocked = false;
      state.isHorizontal = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const state = stateRef.current;
      if (!state.isTracking) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - state.startX;
      const deltaY = touch.clientY - state.startY;

      if (!state.directionLocked) {
        if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
          state.directionLocked = true;
          state.isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);

          if (!state.isHorizontal) {
            state.isTracking = false;
            return;
          }
        } else {
          return;
        }
      }

      if (!state.isHorizontal) return;

      e.preventDefault();
      state.currentX = touch.clientX;

      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const screenWidth = window.innerWidth;
        if (isOpenRef.current) {
          const progress = Math.max(0, 1 + deltaX / screenWidth);
          updateDrawerPosition(progress);
        } else {
          const progress = Math.max(0, deltaX / screenWidth);
          updateDrawerPosition(progress);
        }
      });
    };

    const handleTouchEnd = () => {
      const state = stateRef.current;
      if (!state.isTracking || !state.isHorizontal) {
        state.isTracking = false;
        return;
      }

      cancelAnimationFrame(rafRef.current);

      const deltaX = state.currentX - state.startX;
      const elapsed = Date.now() - state.startTime;
      const velocity = Math.abs(deltaX) / elapsed;

      if (isOpenRef.current) {
        if (
          deltaX < -threshold ||
          (velocity > velocityThreshold && deltaX < 0)
        ) {
          onClose();
        } else {
          updateDrawerPosition(1);
          if (drawerRef.current) {
            drawerRef.current.style.transition = "transform 0.3s ease";
            drawerRef.current.style.transform = "translateX(0)";
          }
          if (backdropRef.current) {
            backdropRef.current.style.transition = "opacity 0.3s ease";
            backdropRef.current.style.opacity = "1";
          }
        }
      } else {
        if (
          deltaX > threshold ||
          (velocity > velocityThreshold && deltaX > 0)
        ) {
          onOpen();
        } else {
          updateDrawerPosition(0);
          if (drawerRef.current) {
            drawerRef.current.style.transition = "transform 0.3s ease";
            drawerRef.current.style.transform = "translateX(-100%)";
          }
          if (backdropRef.current) {
            backdropRef.current.style.transition = "opacity 0.3s ease";
            backdropRef.current.style.opacity = "0";
            backdropRef.current.style.pointerEvents = "none";
          }
        }
      }

      state.isTracking = false;
      state.directionLocked = false;
      state.isHorizontal = false;
    };

    document.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
      cancelAnimationFrame(rafRef.current);
    };
  }, [
    edgeWidth,
    threshold,
    velocityThreshold,
    onOpen,
    onClose,
    updateDrawerPosition,
  ]);

  return { drawerRef, backdropRef };
}
