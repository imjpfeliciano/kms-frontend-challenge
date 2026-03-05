## Requirements

### Tasks

[X] Drag to Move
[X] BONUS: Implement snap-to-grid during drag (grid size: 20px)
[X] Avoid unnecessary re-renders when moving the rectangles
[X] Extend the right-side panel to show controlled inputs for panel
[X] BONUS: If implemented snap-to-grid, position edits from the panel should also snap
[X] Implement Undo/redo for rectangle movement (drag or panel edits), it must support cmd/ctrl shorcuts

### Steps:

1. Understand codebase
2. Review single Rect implementation
3. Extend drag n drop functionallity
4. Display basic information about the rect on the panel, after moved
5. Work on optimization for re-renders
6. Implement undo/redo as action buttons from the panel (stack for each action)
7. Implement shorcuts ctrl/cmd z/y (undo/redo)
8. Implement controlled updated (from panel)
9. Support undo/redo actions for any update on the rectangle

### Bonus

10. Support snap-to-grid on drag event
11. Support snap-to-grid on panel fields edition
12. Logs re-renders
