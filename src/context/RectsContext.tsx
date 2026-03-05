import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { generateRects } from "../seed";
import { Rect, RectSnapshot } from "../types";

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;

const initialRects: Rect[] = generateRects(200, CANVAS_WIDTH, CANVAS_HEIGHT);

function toSnapshot(r: Rect): RectSnapshot {
  return {
    id: r.id,
    x: r.x,
    y: r.y,
    width: r.width,
    height: r.height,
    fill: r.fill,
  };
}

function snapshotsEqual(a: RectSnapshot, b: RectSnapshot): boolean {
  return (
    a.id === b.id &&
    a.x === b.x &&
    a.y === b.y &&
    a.width === b.width &&
    a.height === b.height &&
    a.fill === b.fill
  );
}

export interface RectsContextValue {
  rects: Rect[];
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  selectedRect: Rect | null;
  canUndo: boolean;
  canRedo: boolean;
  onMoveRect: (
    id: string,
    x: number,
    y: number,
    prev?: { x: number; y: number }
  ) => void;
  onUpdateRect: (
    id: string,
    updates: Partial<Pick<Rect, "x" | "y" | "width" | "height" | "fill">>
  ) => void;
  onCommitEdit: (id: string, snapshotBeforeEdit: RectSnapshot) => void;
  onUndo: () => void;
  onRedo: () => void;
}

const RectsContext = createContext<RectsContextValue | null>(null);

export function RectsProvider({ children }: { children: ReactNode }) {
  const [rects, setRects] = useState<Rect[]>(initialRects);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [undoStack, setUndoStack] = useState<RectSnapshot[]>([]);
  const [redoStack, setRedoStack] = useState<RectSnapshot[]>([]);

  const selectedRect = useMemo(
    () => rects.find((r) => r.id === selectedId) ?? null,
    [rects, selectedId]
  );

  const canUndo = undoStack.length > 0;
  const canRedo = redoStack.length > 0;

  const onMoveRect = useCallback(
    (id: string, x: number, y: number, prev?: { x: number; y: number }) => {
      setRects((prevRects) => {
        const r = prevRects.find((rect) => rect.id === id);
        if (prev != null && r) {
          setUndoStack((s) => [...s, toSnapshot(r)]);
          setRedoStack([]);
        }
        return prevRects.map((r) => (r.id === id ? { ...r, x, y } : r));
      });
    },
    []
  );

  const onUpdateRect = useCallback(
    (
      id: string,
      updates: Partial<Pick<Rect, "x" | "y" | "width" | "height" | "fill">>
    ) => {
      setRects((prevRects) =>
        prevRects.map((r) => (r.id === id ? { ...r, ...updates } : r))
      );
    },
    []
  );

  const onCommitEdit = useCallback(
    (id: string, snapshotBeforeEdit: RectSnapshot) => {
      setRects((prevRects) => {
        const current = prevRects.find((r) => r.id === id);
        if (!current || snapshotsEqual(current, snapshotBeforeEdit))
          return prevRects;
        setUndoStack((s) => [...s, snapshotBeforeEdit]);
        setRedoStack([]);
        return prevRects;
      });
    },
    []
  );

  const onUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    setRects((prevRects) => {
      const entry = undoStack[undoStack.length - 1];
      const rect = prevRects.find((r) => r.id === entry.id);
      if (!rect) return prevRects;
      setUndoStack((s) => s.slice(0, -1));
      setRedoStack((s) => [...s, toSnapshot(rect)]);
      return prevRects.map((r) =>
        r.id === entry.id ? { ...r, ...entry } : r
      );
    });
  }, [undoStack]);

  const onRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    setRects((prevRects) => {
      const entry = redoStack[redoStack.length - 1];
      const rect = prevRects.find((r) => r.id === entry.id);
      if (!rect) return prevRects;
      setRedoStack((s) => s.slice(0, -1));
      setUndoStack((s) => [...s, toSnapshot(rect)]);
      return prevRects.map((r) =>
        r.id === entry.id ? { ...r, ...entry } : r
      );
    });
  }, [redoStack]);

  const value = useMemo<RectsContextValue>(
    () => ({
      rects,
      selectedId,
      setSelectedId,
      selectedRect,
      canUndo,
      canRedo,
      onMoveRect,
      onUpdateRect,
      onCommitEdit,
      onUndo,
      onRedo,
    }),
    [
      rects,
      selectedId,
      selectedRect,
      canUndo,
      canRedo,
      onMoveRect,
      onUpdateRect,
      onCommitEdit,
      onUndo,
      onRedo,
    ]
  );

  return (
    <RectsContext.Provider value={value}>{children}</RectsContext.Provider>
  );
}

export function useRects(): RectsContextValue {
  const ctx = useContext(RectsContext);
  if (ctx == null) {
    throw new Error("useRects must be used within a RectsProvider");
  }
  return ctx;
}
