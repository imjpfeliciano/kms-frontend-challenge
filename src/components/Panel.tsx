import { useRef, useEffect } from "react";
import { Rect, type RectSnapshot } from "../types";

/** Hex color number (e.g. 0xff6b6b) to CSS #rrggbb string */
function fillToHexString(fill: number): string {
  return "#" + ((fill >>> 0) & 0xffffff).toString(16).padStart(6, "0");
}

/** CSS #rrggbb string to hex color number */
function hexStringToFill(s: string): number {
  const n = parseInt(s.slice(1), 16);
  return Number.isNaN(n) ? 0 : n;
}

const GRID_SIZE = 20;

function snapToGrid(value: number): number {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
}

interface Props {
  rect: Rect | null;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onUpdateRect: (
    id: string,
    updates: Partial<Pick<Rect, "x" | "y" | "width" | "height" | "fill">>
  ) => void;
  onCommitEdit: (id: string, snapshotBeforeEdit: RectSnapshot) => void;
}

function toSnapshot(r: Rect): RectSnapshot {
  return { id: r.id, x: r.x, y: r.y, width: r.width, height: r.height, fill: r.fill };
}

function snapshotEqualsRect(snap: RectSnapshot, r: Rect): boolean {
  return (
    snap.x === r.x &&
    snap.y === r.y &&
    snap.width === r.width &&
    snap.height === r.height &&
    snap.fill === r.fill
  );
}

const panelStyle: React.CSSProperties = {
  width: 240,
  background: "#252525",
  borderLeft: "1px solid #3a3a3a",
  padding: 20,
  display: "flex",
  flexDirection: "column",
  gap: 12,
  overflowY: "auto",
};

const buttonStyle: React.CSSProperties = {
  padding: "8px 12px",
  fontSize: 13,
  cursor: "pointer",
  background: "#3a3a3a",
  color: "#e0e0e0",
  border: "1px solid #4a4a4a",
  borderRadius: 4,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  gap: 2,
};

const buttonDisabledStyle: React.CSSProperties = {
  ...buttonStyle,
  opacity: 0.5,
  cursor: "not-allowed",
};

const inputGroupStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
};

const labelStyle: React.CSSProperties = {
  color: "#888",
  fontSize: 12,
};

const inputStyle: React.CSSProperties = {
  padding: "6px 8px",
  fontSize: 13,
  background: "#1a1a1a",
  border: "1px solid #4a4a4a",
  borderRadius: 4,
  color: "#e0e0e0",
  width: "100%",
  boxSizing: "border-box",
};

export function Panel({
  rect,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onUpdateRect,
  onCommitEdit,
}: Props) {
  const editStartRef = useRef<{ id: string; snapshot: RectSnapshot } | null>(null);

  useEffect(() => {
    return () => {
      if (editStartRef.current) {
        onCommitEdit(editStartRef.current.id, editStartRef.current.snapshot);
        editStartRef.current = null;
      }
    };
  }, [rect?.id, onCommitEdit]);

  const handleFocus = () => {
    if (rect && !editStartRef.current) {
      editStartRef.current = { id: rect.id, snapshot: toSnapshot(rect) };
    }
  };

  const handleBlur = () => {
    if (editStartRef.current && rect && !snapshotEqualsRect(editStartRef.current.snapshot, rect)) {
      onCommitEdit(rect.id, editStartRef.current.snapshot);
    }
    editStartRef.current = null;
  };

  return (
    <aside style={panelStyle}>
      <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
        <button
          type="button"
          style={canUndo ? buttonStyle : buttonDisabledStyle}
          disabled={!canUndo}
          onClick={onUndo}
          aria-label="Undo position"
        >
          <span>Undo</span>
          <small>Ctrl+Z</small>
        </button>
        <button
          type="button"
          style={canRedo ? buttonStyle : buttonDisabledStyle}
          disabled={!canRedo}
          onClick={onRedo}
          aria-label="Redo position"
        >
          <span>Redo</span>
          <small>Ctrl+Y</small>
        </button>
      </div>

      {!rect ? (
        <p style={{ color: "#666", fontSize: 13 }}>Nothing selected</p>
      ) : (
        <>
          <h3 style={{ fontSize: 13, color: "#aaa", marginBottom: 4 }}>
            Properties
          </h3>
          <p style={{ color: "#666", fontSize: 12 }}>Selected: {rect.id}</p>

          <div style={inputGroupStyle}>
            <label style={labelStyle} htmlFor="panel-x">
              X
            </label>
            <input
              id="panel-x"
              type="number"
              style={inputStyle}
              value={rect.x}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (!Number.isNaN(v)) onUpdateRect(rect.id, { x: snapToGrid(v) });
              }}
            />
          </div>
          <div style={inputGroupStyle}>
            <label style={labelStyle} htmlFor="panel-y">
              Y
            </label>
            <input
              id="panel-y"
              type="number"
              style={inputStyle}
              value={rect.y}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (!Number.isNaN(v)) onUpdateRect(rect.id, { y: snapToGrid(v) });
              }}
            />
          </div>
          <div style={inputGroupStyle}>
            <label style={labelStyle} htmlFor="panel-width">
              Width
            </label>
            <input
              id="panel-width"
              type="number"
              min={GRID_SIZE}
              style={inputStyle}
              value={rect.width}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (!Number.isNaN(v) && v >= 1)
                  onUpdateRect(rect.id, { width: Math.max(GRID_SIZE, snapToGrid(v)) });
              }}
            />
          </div>
          <div style={inputGroupStyle}>
            <label style={labelStyle} htmlFor="panel-height">
              Height
            </label>
            <input
              id="panel-height"
              type="number"
              min={GRID_SIZE}
              style={inputStyle}
              value={rect.height}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (!Number.isNaN(v) && v >= 1)
                  onUpdateRect(rect.id, { height: Math.max(GRID_SIZE, snapToGrid(v)) });
              }}
            />
          </div>
          <div style={inputGroupStyle}>
            <label style={labelStyle} htmlFor="panel-fill">
              Fill
            </label>
            <input
              id="panel-fill"
              type="color"
              style={{ ...inputStyle, padding: 2, height: 32, cursor: "pointer" }}
              value={fillToHexString(rect.fill)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onChange={(e) =>
                onUpdateRect(rect.id, { fill: hexStringToFill(e.target.value) })
              }
            />
          </div>
        </>
      )}
    </aside>
  );
}
