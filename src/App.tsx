import { useCallback, useMemo, useRef, useState } from "react";
import { Panel } from "./components/Panel";
import { PixiCanvas } from "./components/PixiCanvas";
import { useRenderLog } from "./hooks/useRenderLog";
import { useUndoRedoShortcuts } from "./hooks/useUndoRedoShortcuts";
import { generateRects } from "./seed";
import { Rect, RectSnapshot } from "./types";

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;

const initialRects: Rect[] = generateRects(200, CANVAS_WIDTH, CANVAS_HEIGHT);

function toSnapshot(r: Rect): RectSnapshot {
  return { id: r.id, x: r.x, y: r.y, width: r.width, height: r.height, fill: r.fill };
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

export function App() {
  const [rects, setRects] = useState<Rect[]>(initialRects);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [undoStack, setUndoStack] = useState<RectSnapshot[]>([]);
  const [redoStack, setRedoStack] = useState<RectSnapshot[]>([]);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const selectedRect = useMemo(
    () => rects.find((r) => r.id === selectedId) ?? null,
    [rects, selectedId]
  );

  useRenderLog("App", {
    rectsLen: rects.length,
    selectedId,
    undoLen: undoStack.length,
    redoLen: redoStack.length,
  });

  const handleMoveRect = useCallback(
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

  const handleUpdateRect = useCallback(
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

  /** Push one undo entry for panel edits: initial state (snapshot) when user commits (blur). */
  const handleCommitEdit = useCallback(
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

  const handleUndo = useCallback(() => {
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

  const handleRedo = useCallback(() => {
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

  useUndoRedoShortcuts({
    focusRef: canvasContainerRef,
    onUndo: handleUndo,
    onRedo: handleRedo,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
  });

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <PixiCanvas
        ref={canvasContainerRef}
        rects={rects}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onMoveRect={handleMoveRect}
      />
      <Panel
        rect={selectedRect}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onUpdateRect={handleUpdateRect}
        onCommitEdit={handleCommitEdit}
      />
    </div>
  );
}
