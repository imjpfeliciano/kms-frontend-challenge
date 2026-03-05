import { Rect } from "./types";

const COLORS = [
    0xe74c3c, 0x3498db, 0x2ecc71, 0xf39c12, 0x9b59b6,
    0x1abc9c, 0xe67e22, 0x34495e, 0xe91e63, 0x00bcd4,
];

export function generateRects(
    count: number,
    canvasWidth: number,
    canvasHeight: number
): Rect[] {
    return Array.from({ length: count }, (_, i) => ({
        id: `rect-${i}`,
        x: Math.random() * (canvasWidth - 120),
        y: Math.random() * (canvasHeight - 80),
        width: 60 + Math.random() * 80,
        height: 40 + Math.random() * 60,
        fill: COLORS[i % COLORS.length],
    }));
}