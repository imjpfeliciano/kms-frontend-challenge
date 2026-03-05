import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RectsProvider } from "../context/RectsContext";
import type { Rect } from "../types";
import { PixiCanvas, drawRect } from "./PixiCanvas";

vi.mock("pixi.js", async () => {
  const m = await import("../test/mocks/pixi");
  return { Application: m.MockApplication, Graphics: m.MockGraphics };
});

vi.mock("../seed", () => ({
  generateRects: () => [
    { id: "r1", x: 0, y: 0, width: 40, height: 30, fill: 0xff0000 },
  ],
}));

describe("PixiCanvas", () => {
  it("renders a focusable canvas container with aria-label", async () => {
    render(
      <RectsProvider>
        <PixiCanvas />
      </RectsProvider>,
    );
    const canvasEl = await screen.findByRole("generic", { name: "Canvas" });
    expect(canvasEl).toBeInTheDocument();
    expect(canvasEl).toHaveAttribute("tabindex", "0");
    expect(canvasEl).toHaveStyle({ flex: "1", overflow: "hidden" });
  });

  it("forwards ref to the container div", async () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <RectsProvider>
        <PixiCanvas ref={ref} />
      </RectsProvider>,
    );
    await waitFor(() => {
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
    expect(ref.current?.getAttribute("aria-label")).toBe("Canvas");
  });
});

describe("drawRect", () => {
  const rect: Rect = {
    id: "rect-1",
    x: 10,
    y: 20,
    width: 80,
    height: 60,
    fill: 0xff6b6b,
  };

  it("clears the graphics and draws rect at position", () => {
    const gfx = {
      clear: vi.fn(),
      rect: vi.fn().mockReturnThis(),
      fill: vi.fn().mockReturnThis(),
      stroke: vi.fn().mockReturnThis(),
      x: 0,
      y: 0,
    };
    drawRect(gfx as never, rect, false);

    expect(gfx.clear).toHaveBeenCalledTimes(1);
    expect(gfx.rect).toHaveBeenCalledWith(0, 0, 80, 60);
    expect(gfx.fill).toHaveBeenCalledWith(0xff6b6b);
    expect(gfx.stroke).not.toHaveBeenCalled();
    expect(gfx.x).toBe(10);
    expect(gfx.y).toBe(20);
  });

  it("draws stroke when selected is true", () => {
    const gfx = {
      clear: vi.fn(),
      rect: vi.fn().mockReturnThis(),
      fill: vi.fn().mockReturnThis(),
      stroke: vi.fn().mockReturnThis(),
      x: 0,
      y: 0,
    };
    drawRect(gfx as never, rect, true);

    expect(gfx.stroke).toHaveBeenCalledWith({ width: 2, color: 0xffffff });
    expect(gfx.x).toBe(10);
    expect(gfx.y).toBe(20);
  });

  it("uses position override when provided", () => {
    const gfx = {
      clear: vi.fn(),
      rect: vi.fn().mockReturnThis(),
      fill: vi.fn().mockReturnThis(),
      stroke: vi.fn(),
      x: 0,
      y: 0,
    };
    drawRect(gfx as never, rect, false, { x: 50, y: 100 });

    expect(gfx.x).toBe(50);
    expect(gfx.y).toBe(100);
  });
});
