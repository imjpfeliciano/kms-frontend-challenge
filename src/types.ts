export interface Rect {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: number; // hex color as number, e.g. 0xff6b6b
}

/** Full snapshot of a rect's mutable properties for undo/redo */
export type RectSnapshot = Pick<Rect, "id" | "x" | "y" | "width" | "height" | "fill">;