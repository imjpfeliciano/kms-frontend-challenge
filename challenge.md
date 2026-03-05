# Frontend Engineer Technical Challenge

## Overview

This is a minimal 2D canvas editing tool built with React and PixiJS. A base project has been provided — your job is to extend it with the features described below.

**Time expectation: 3 hours.**

We care more about structure and decision-making than polish or completeness. If you run out of time, note in your README what you would have done next and why.

---

## Getting Started

```bash
yarn install
yarn dev
```

The app will open at `http://localhost:5173`.

---

## What's Already Built

- A PixiJS canvas mounted inside a React component
- 200 rectangles rendered at random positions, each with:
    - `id`, `x`, `y`, `width`, `height`, `fill` (hex color as a number)
- Click a rectangle to select it (white outline); click the background to deselect
- A right-side panel that shows the selected rectangle's ID

---

## Your Tasks

### 1. Drag to Move

Allow the selected rectangle to be dragged around the canvas.

- Click and drag to reposition it
- Movement should feel smooth
- Do not trigger unnecessary React re-renders during the drag

**Bonus:** Implement snap-to-grid during drag (grid size: 20px).


### 2. Property Panel

Extend the right-side panel so that when a rectangle is selected, it shows controlled inputs for:

- X
- Y
- Width
- Height
- Fill color

Requirements:
- Changes must be reflected on the canvas immediately
- Inputs must be properly controlled React inputs
- If you implemented snap-to-grid, position edits from the panel should also snap


### 3. Undo / Redo

Implement undo and redo for:
- Rectangle movement (drag or panel edits)
- Any property panel edits

Requirements:
- **Undo:** `Cmd/Ctrl + Z`
- **Redo:** `Cmd/Ctrl + Y`
- Undo should restore the previous state precisely
- You do not need to undo selection changes

---

## Your README

Please include a `README.md` with your submission covering:

- **Architecture** — high-level description of how the project is structured
- **State** — where state lives and why
- **React ↔ Pixi communication** — how changes flow between the two
- **Undo/redo strategy** — how you modeled history
- **Performance** — what you did to avoid unnecessary work, and what would break at scale
- **If you had more time** — what you'd improve or finish

This is just as important as the code. We read it carefully.

---

## Constraints & Notes

- Do not store transient drag state in React component state
- Do not trigger full React re-renders on every drag frame
- Keep rendering concerns and UI concerns separate
- You may introduce a lightweight state library if you choose — just explain the decision in your README
- Do not over-polish the UI; structure matters more than aesthetics
- Do not add extra features unless you have genuinely finished everything above

---

## Submission

Please submit a link to a **GitHub or GitLab repository** containing your code and README.