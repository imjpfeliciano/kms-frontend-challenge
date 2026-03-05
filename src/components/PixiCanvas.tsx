import { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";
import { Rect } from "../types";

interface Props {
    rects: Rect[];
    selectedId: string | null;
    onSelect: (id: string | null) => void;
}

export function PixiCanvas({ rects, selectedId, onSelect }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const appRef = useRef<PIXI.Application | null>(null);
    const [pixiReady, setPixiReady] = useState(false);
    const graphicsRef = useRef<Map<string, PIXI.Graphics>>(new Map());

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
            app.stage.on("pointerdown", () => onSelect(null));
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

        for (const rect of rects) {
            let gfx = existing.get(rect.id);
            if (!gfx) {
                gfx = new PIXI.Graphics();
                gfx.eventMode = "static";
                gfx.cursor = "pointer";
                gfx.on("pointerdown", (e: PIXI.FederatedPointerEvent) => {
                    e.stopPropagation();
                    onSelect(rect.id);
                });
                stage.addChild(gfx);
                existing.set(rect.id, gfx);
            }
            drawRect(gfx, rect, rect.id === selectedId);
        }
    }, [rects, selectedId, onSelect, pixiReady]);

    return (
        <div
            ref={containerRef}
            style={{ flex: 1, overflow: "hidden", position: "relative" }}
        />
    );
}

export function drawRect(gfx: PIXI.Graphics, rect: Rect, selected: boolean) {
    gfx.clear();
    gfx.rect(0, 0, rect.width, rect.height).fill(rect.fill);
    if (selected) {
        gfx.rect(0, 0, rect.width, rect.height).stroke({ width: 2, color: 0xffffff });
    }
    gfx.x = rect.x;
    gfx.y = rect.y;
}