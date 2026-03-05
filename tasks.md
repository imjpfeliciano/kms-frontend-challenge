## Requirements

### Tasks

- Drag to Move
- BONUS: Implement snap-to-grid during drag (grid size: 20px)
- Avoid unnecessary re-renders when moving the rectangles
- Extend the right-side panel to show controlled inputs for panel
- BONUS: If implemented snap-to-grid, position edits from the panel should also snap
- Implement Undo/redo for rectangle movement (drag or panel edits), it must support cmd/ctrl shorcuts

### Steps

1. **Understand the codebase** — Look around the project, see how the canvas and rectangles are set up, and how clicking to select works.
2. **Review how a single rect works** — Get familiar with how one rectangle is drawn and how selection (the white outline) is shown.
3. **Add drag and drop** — Let the user click and drag a rectangle to move it. Movement should feel smooth; we only update the app state when they release the mouse (so we don’t re-render on every tiny move).
4. **Show rect info on the panel after moving** — When the user finishes a drag, the right panel should show that rectangle’s details (and we can select it right when they press the mouse, so the panel updates as soon as they start dragging).
5. **Cut down unnecessary re-renders** — Use stable callbacks and memo so the canvas and panel don’t re-render when they don’t need to. When only the selection changes, only redraw the rects that actually changed.
6. **Add Undo and Redo buttons** — Put Undo and Redo in the panel. Each action (e.g. a move or a panel edit) pushes a snapshot to a stack so we can go back and forth.
7. **Wire up keyboard shortcuts** — Make Ctrl+Z (or Cmd+Z) undo and Ctrl+Shift+Z / Ctrl+Y (or Cmd+Y) redo when the canvas is focused, and don’t let the browser do its own thing when there’s nothing to undo/redo.
8. **Controlled inputs in the panel** — Add inputs for x, y, width, height, and fill color so the user can edit the selected rect from the panel; changes show up on the canvas right away.
9. **Undo/redo for any rect change** — Store full rect snapshots (position, size, color) so undo/redo works for moves and for any panel edit, not just position.

### Bonus

10. **Snap to grid when dragging** — While dragging, the rect moves smoothly; when the user releases, it snaps to a 20px grid so everything lines up nicely.
11. **Snap to grid in the panel** — When they type in the panel (x, y, width, height), the values snap to the same 20px grid when they leave the field, so it matches the canvas behavior.
12. **Re-render logging** — A small dev-only hook that logs when a component re-renders and which values changed, so we can double-check we’re not re-rendering more than we need.
