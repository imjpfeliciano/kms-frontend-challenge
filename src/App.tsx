import { useRef } from "react";
import { Panel } from "./components/Panel";
import { PixiCanvas } from "./components/PixiCanvas";
import { RectsProvider, useRects } from "./context/RectsContext";
import { useRenderLog } from "./hooks/useRenderLog";
import { useUndoRedoShortcuts } from "./hooks/useUndoRedoShortcuts";

function AppContent() {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const { rects, selectedId, canUndo, canRedo, onUndo, onRedo } = useRects();

  useRenderLog("App", {
    rectsLen: rects.length,
    selectedId,
  });

  useUndoRedoShortcuts({
    focusRef: canvasContainerRef,
    onUndo,
    onRedo,
    canUndo,
    canRedo,
  });

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <PixiCanvas ref={canvasContainerRef} />
      <Panel />
    </div>
  );
}

export function App() {
  return (
    <RectsProvider>
      <AppContent />
    </RectsProvider>
  );
}
