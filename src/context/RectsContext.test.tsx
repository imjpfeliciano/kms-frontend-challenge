import { renderHook, act } from "@testing-library/react";
import { expect, it, describe, vi } from "vitest";
import type { Rect, RectSnapshot } from "../types";
import { RectsProvider, useRects } from "./RectsContext";

const mockRects: Rect[] = [
  {
    id: "rect-0",
    x: 10,
    y: 20,
    width: 80,
    height: 60,
    fill: 0xff0000,
  },
  {
    id: "rect-1",
    x: 100,
    y: 120,
    width: 70,
    height: 50,
    fill: 0x00ff00,
  },
];

vi.mock("../seed", () => ({
  generateRects: () => [
    { id: "rect-0", x: 10, y: 20, width: 80, height: 60, fill: 0xff0000 },
    { id: "rect-1", x: 100, y: 120, width: 70, height: 50, fill: 0x00ff00 },
  ],
}));

function wrapper({ children }: { children: React.ReactNode }) {
  return <RectsProvider>{children}</RectsProvider>;
}

describe("RectsContext", () => {
  describe("useRects", () => {
    it("throws when used outside RectsProvider", () => {
      expect(() => renderHook(() => useRects())).toThrow(
        "useRects must be used within a RectsProvider"
      );
    });

    it("provides initial rects and selection state", () => {
      const { result } = renderHook(() => useRects(), { wrapper });
      expect(result.current.rects).toHaveLength(2);
      expect(result.current.rects[0]).toEqual(mockRects[0]);
      expect(result.current.selectedId).toBeNull();
      expect(result.current.selectedRect).toBeNull();
      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(false);
    });

    it("setSelectedId updates selection", () => {
      const { result } = renderHook(() => useRects(), { wrapper });
      act(() => {
        result.current.setSelectedId("rect-0");
      });
      expect(result.current.selectedId).toBe("rect-0");
      expect(result.current.selectedRect).toEqual(mockRects[0]);
      act(() => {
        result.current.setSelectedId(null);
      });
      expect(result.current.selectedId).toBeNull();
      expect(result.current.selectedRect).toBeNull();
    });
  });

  describe("onMoveRect", () => {
    it("updates rect position and pushes to undo when prev is provided", () => {
      const { result } = renderHook(() => useRects(), { wrapper });
      act(() => {
        result.current.onMoveRect("rect-0", 100, 200, { x: 10, y: 20 });
      });
      expect(result.current.rects[0].x).toBe(100);
      expect(result.current.rects[0].y).toBe(200);
      expect(result.current.canUndo).toBe(true);
      expect(result.current.canRedo).toBe(false);
    });

    it("updates rect position without pushing undo when prev is omitted", () => {
      const { result } = renderHook(() => useRects(), { wrapper });
      act(() => {
        result.current.onMoveRect("rect-0", 50, 60);
      });
      expect(result.current.rects[0].x).toBe(50);
      expect(result.current.rects[0].y).toBe(60);
      expect(result.current.canUndo).toBe(false);
    });
  });

  describe("onUpdateRect", () => {
    it("applies partial updates to the rect", () => {
      const { result } = renderHook(() => useRects(), { wrapper });
      act(() => {
        result.current.onUpdateRect("rect-0", { x: 5, width: 90, fill: 0x0000ff });
      });
      expect(result.current.rects[0].x).toBe(5);
      expect(result.current.rects[0].width).toBe(90);
      expect(result.current.rects[0].fill).toBe(0x0000ff);
      expect(result.current.rects[0].y).toBe(20);
    });
  });

  describe("onCommitEdit", () => {
    it("does not push to undo when current equals snapshotBeforeEdit", () => {
      const { result } = renderHook(() => useRects(), { wrapper });
      const snapshot: RectSnapshot = { ...mockRects[0] };
      act(() => {
        result.current.onCommitEdit("rect-0", snapshot);
      });
      expect(result.current.canUndo).toBe(false);
    });

    it("pushes to undo and clears redo when rect has changed", () => {
      const { result } = renderHook(() => useRects(), { wrapper });
      act(() => {
        result.current.onUpdateRect("rect-0", { x: 99 });
      });
      const snapshotBeforeEdit: RectSnapshot = { ...mockRects[0] };
      act(() => {
        result.current.onCommitEdit("rect-0", snapshotBeforeEdit);
      });
      expect(result.current.canUndo).toBe(true);
      expect(result.current.canRedo).toBe(false);
    });
  });

  describe("undo / redo", () => {
    it("onUndo restores previous state and updates redo stack", () => {
      const { result } = renderHook(() => useRects(), { wrapper });
      act(() => {
        result.current.onMoveRect("rect-0", 100, 200, { x: 10, y: 20 });
      });
      expect(result.current.rects[0].x).toBe(100);
      act(() => {
        result.current.onUndo();
      });
      expect(result.current.rects[0].x).toBe(10);
      expect(result.current.rects[0].y).toBe(20);
      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(true);
    });

    it("onRedo reapplies undone state", () => {
      const { result } = renderHook(() => useRects(), { wrapper });
      act(() => {
        result.current.onMoveRect("rect-0", 100, 200, { x: 10, y: 20 });
      });
      act(() => {
        result.current.onUndo();
      });
      act(() => {
        result.current.onRedo();
      });
      expect(result.current.rects[0].x).toBe(100);
      expect(result.current.rects[0].y).toBe(200);
      expect(result.current.canRedo).toBe(false);
    });

    it("onUndo is no-op when undo stack is empty", () => {
      const { result } = renderHook(() => useRects(), { wrapper });
      const before = result.current.rects[0].x;
      act(() => {
        result.current.onUndo();
      });
      expect(result.current.rects[0].x).toBe(before);
    });

    it("onRedo is no-op when redo stack is empty", () => {
      const { result } = renderHook(() => useRects(), { wrapper });
      const before = result.current.rects[0].x;
      act(() => {
        result.current.onRedo();
      });
      expect(result.current.rects[0].x).toBe(before);
    });
  });
});
