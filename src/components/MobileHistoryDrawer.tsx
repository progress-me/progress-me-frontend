import { useSwipeDrawer } from "@/hooks/useSwipeDrawer";
import { useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "./ui/button";

interface MobileHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  children: React.ReactNode;
}

export function MobileHistoryDrawer({
  isOpen,
  onClose,
  onOpen,
  children,
}: MobileHistoryDrawerProps) {
  const stableOnOpen = useCallback(() => onOpen(), [onOpen]);
  const stableOnClose = useCallback(() => onClose(), [onClose]);

  const { drawerRef, backdropRef } = useSwipeDrawer({
    isOpen,
    onOpen: stableOnOpen,
    onClose: stableOnClose,
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return createPortal(
    <div className="md:hidden">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="fixed inset-0 z-50 bg-black/50"
        style={{ opacity: 0, pointerEvents: "none" }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="fixed inset-0 z-50 flex flex-col bg-background"
        style={{ transform: "translateX(-100%)" }}
      >
        <div className="flex h-14 items-center justify-between border-b px-4">
          <h2 className="text-lg font-semibold">Chat History</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
