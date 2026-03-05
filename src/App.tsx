import { useState } from "react";
import { PixiCanvas } from "./components/PixiCanvas";
import { Panel } from "./components/Panel";
import { generateRects } from "./seed";
import { Rect } from "./types";

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;

const initialRects: Rect[] = generateRects(200, CANVAS_WIDTH, CANVAS_HEIGHT);

export function App() {
    const [rects, setRects] = useState<Rect[]>(initialRects);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const selectedRect = rects.find((r) => r.id === selectedId) ?? null;

    return (
        <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
            <PixiCanvas
                rects={rects}
                selectedId={selectedId}
                onSelect={setSelectedId}
            />
            <Panel rect={selectedRect} />
        </div>
    );
}