import { Rect } from "../types";

interface Props {
    rect: Rect | null;
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

export function Panel({ rect }: Props) {
    if (!rect) {
        return (
            <aside style={panelStyle}>
                <p style={{ color: "#666", fontSize: 13 }}>Nothing selected</p>
            </aside>
        );
    }

    return (
        <aside style={panelStyle}>
            <h3 style={{ fontSize: 13, color: "#aaa", marginBottom: 4 }}>
                Properties
            </h3>
            {/* TODO: wire up controlled inputs for x, y, width, height, fill */}
            <p style={{ color: "#666", fontSize: 12 }}>
                Selected: {rect.id}
            </p>
        </aside>
    );
}