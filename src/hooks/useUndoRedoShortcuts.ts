import { RefObject, useEffect } from "react";

interface UseUndoRedoShortcutsOptions {
  /** Ref to the element that must be focused (or contain focus) for shortcuts to run. */
  focusRef: RefObject<HTMLElement | null>;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

/**
 * Listens for undo/redo keyboard shortcuts and invokes the callbacks when the
 * focused element is the canvas container (or inside it).
 * - Undo: Ctrl+Z (Windows/Linux) or Cmd+Z (macOS)
 * - Redo: Ctrl+Shift+Z / Ctrl+Y (Windows/Linux) or Cmd+Shift+Z / Cmd+Y (macOS)
 */
export function useUndoRedoShortcuts({
  focusRef,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: UseUndoRedoShortcutsOptions): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const el = focusRef.current;
      if (!el) return;
      const isCanvasFocused =
        document.activeElement === el || el.contains(document.activeElement);
      if (!isCanvasFocused) return;

      const meta = e.metaKey;
      const ctrl = e.ctrlKey;
      const mod = meta || ctrl;
      const shift = e.shiftKey;

      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (shift) {
          if (canRedo) onRedo();
        } else {
          if (canUndo) onUndo();
        }
        return;
      }

      if ((meta || ctrl) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        if (canRedo) onRedo();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [focusRef, onUndo, onRedo, canUndo, canRedo]);
}
