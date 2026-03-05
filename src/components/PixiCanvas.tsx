import * as PIXI from "pixi.js";
import { forwardRef, memo, useEffect, useRef, useState } from "react";
import { useRenderLog } from "../hooks/useRenderLog";
import { Rect } from "../types";

const GRID_SIZE = 20;

function snapToGrid(value: number): number {
  const snapped = Math.round(value / GRID_SIZE) * GRID_SIZE;
  return snapped;
}

interface Props {
  rects: Rect[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onMoveRect: (
    id: string,
    x: number,
    y: number,
    prev?: { x: number; y: number },
  ) => void;
}

type DragState = {
  id: string;
  startX: number;
  startY: number;
  /** Initial position when drag started (preserved for delta + future undo). */
  rectX: number;
  rectY: number;
  /** Current position during drag (last position; committed on pointerup). */
  lastX: number;
  lastY: number;
  hasMoved: boolean;
};

function focusCanvasContainer(
  containerRef: React.RefObject<HTMLDivElement | null>,
) {
  containerRef.current?.focus();
}

const PixiCanvasInner = forwardRef<HTMLDivElement, Props>(function PixiCanvas(
  { rects, selectedId, onSelect, onMoveRect },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const setRef = (el: HTMLDivElement | null) => {
    (containerRef as React.MutableRefObject<HTMLDivElement | null>).current =
      el;
    if (typeof ref === "function") ref(el);
    else if (ref)
      (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
  };
  const appRef = useRef<PIXI.Application | null>(null);
  const [pixiReady, setPixiReady] = useState(false);
  const graphicsRef = useRef<Map<string, PIXI.Graphics>>(new Map());
  const dragRef = useRef<DragState | null>(null);
  const onMoveRectRef = useRef(onMoveRect);
  const onSelectRef = useRef(onSelect);
  const prevRectsRef = useRef<Rect[] | null>(null);
  const prevSelectedIdRef = useRef<string | null>(null);
  onMoveRectRef.current = onMoveRect;
  onSelectRef.current = onSelect;

  useRenderLog("PixiCanvas", {
    rectsLen: rects.length,
    selectedId,
    pixiReady,
  });

  useEffect(() => {
    const container = containerRef.current!;
    let cancelled = false;

    (async () => {
      const app = new PIXI.Application();
      await app.init({
        width: container.clientWidth,
        height: container.clientHeight,
        background: 0x2c2c2c,
        antialias: true,
        resizeTo: container,
      });

      if (cancelled) {
        app.destroy(true, { children: true });
        return;
      }

      container.appendChild(app.canvas);
      appRef.current = app;
      setPixiReady(true);

      app.stage.eventMode = "static";
      app.stage.hitArea = app.screen;
      app.stage.on("pointerdown", () => {
        focusCanvasContainer(containerRef);
        onSelectRef.current(null);
      });

      const onPointerMove = (e: PIXI.FederatedPointerEvent) => {
        const drag = dragRef.current;
        if (!drag) return;
        drag.hasMoved = true;
        const local = app.stage.toLocal(e.global);
        const newX = drag.rectX + (local.x - drag.startX);
        const newY = drag.rectY + (local.y - drag.startY);
        drag.lastX = newX;
        drag.lastY = newY;
        const gfx = graphicsRef.current.get(drag.id);
        if (gfx) {
          gfx.x = newX;
          gfx.y = newY;
        }
      };
      const onPointerUp = () => {
        const drag = dragRef.current;
        if (drag) {
          if (onSelectRef.current) onSelectRef.current(drag.id);
          if (drag.hasMoved && onMoveRectRef.current) {
            const snappedX = snapToGrid(drag.lastX);
            const snappedY = snapToGrid(drag.lastY);
            onMoveRectRef.current(drag.id, snappedX, snappedY, {
              x: drag.rectX,
              y: drag.rectY,
            });
          }
        }
        dragRef.current = null;
      };
      app.stage.on("pointermove", onPointerMove);
      app.stage.on("pointerup", onPointerUp);
      app.stage.on("pointerupoutside", onPointerUp);
    })();

    return () => {
      cancelled = true;
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
        appRef.current = null;
        graphicsRef.current.clear();
        setPixiReady(false);
      }
    };
  }, []);

  useEffect(() => {
    const app = appRef.current;
    if (!app) return;

    const stage = app.stage;
    const existing = graphicsRef.current;
    const nextIds = new Set(rects.map((r) => r.id));

    for (const [id, gfx] of existing) {
      if (!nextIds.has(id)) {
        stage.removeChild(gfx);
        gfx.destroy();
        existing.delete(id);
      }
    }

    const rectsChanged = prevRectsRef.current !== rects;
    const selectionChanged = prevSelectedIdRef.current !== selectedId;
    const prevSelectedId = prevSelectedIdRef.current;

    for (const rect of rects) {
      let gfx = existing.get(rect.id);
      if (!gfx) {
        gfx = new PIXI.Graphics();
        gfx.eventMode = "static";
        gfx.cursor = "grab";
        gfx.on("pointerdown", (e: PIXI.FederatedPointerEvent) => {
          e.stopPropagation();
          focusCanvasContainer(containerRef);
          onSelectRef.current(rect.id);
          const local = app.stage.toLocal(e.global);
          dragRef.current = {
            id: rect.id,
            startX: local.x,
            startY: local.y,
            rectX: rect.x,
            rectY: rect.y,
            lastX: rect.x,
            lastY: rect.y,
            hasMoved: false,
          };
        });
        stage.addChild(gfx);
        existing.set(rect.id, gfx);
      } else {
        gfx.cursor = "grab";
        gfx.off("pointerdown");
        gfx.on("pointerdown", (e: PIXI.FederatedPointerEvent) => {
          e.stopPropagation();
          focusCanvasContainer(containerRef);
          onSelectRef.current(rect.id);
          const local = app.stage.toLocal(e.global);
          dragRef.current = {
            id: rect.id,
            startX: local.x,
            startY: local.y,
            rectX: rect.x,
            rectY: rect.y,
            lastX: rect.x,
            lastY: rect.y,
            hasMoved: false,
          };
        });
      }
      const needRedraw =
        rectsChanged ||
        (selectionChanged &&
          (rect.id === selectedId || rect.id === prevSelectedId));
      if (needRedraw) {
        const isDragging = dragRef.current?.id === rect.id;
        const pos = isDragging ? { x: gfx.x, y: gfx.y } : undefined;
        drawRect(gfx, rect, rect.id === selectedId, pos);
      }
    }

    prevRectsRef.current = rects;
    prevSelectedIdRef.current = selectedId;
  }, [rects, selectedId, onSelect, pixiReady]);

  return (
    <div
      ref={setRef}
      tabIndex={0}
      style={{ flex: 1, overflow: "hidden", position: "relative" }}
      aria-label="Canvas"
    />
  );
});

export const PixiCanvas = memo(PixiCanvasInner);

export function drawRect(
  gfx: PIXI.Graphics,
  rect: Rect,
  selected: boolean,
  position?: { x: number; y: number },
) {
  gfx.clear();
  gfx.rect(0, 0, rect.width, rect.height).fill(rect.fill);
  if (selected) {
    gfx
      .rect(0, 0, rect.width, rect.height)
      .stroke({ width: 2, color: 0xffffff });
  }
  gfx.x = position?.x ?? rect.x;
  gfx.y = position?.y ?? rect.y;
}
