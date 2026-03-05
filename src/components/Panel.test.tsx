import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type ReactNode, useEffect } from "react";
import { describe, expect, it, vi } from "vitest";
import { RectsProvider, useRects } from "../context/RectsContext";
import { Panel } from "./Panel";

vi.mock("../seed", () => ({
  generateRects: () => [
    { id: "rect-0", x: 10, y: 20, width: 80, height: 60, fill: 0xff0000 },
    { id: "rect-1", x: 100, y: 120, width: 70, height: 50, fill: 0x00ff00 },
  ],
}));

function renderPanel() {
  return render(
    <RectsProvider>
      <Panel />
    </RectsProvider>,
  );
}

/** Helper that selects a rect on mount so we can test the Properties view */
function WithSelectedRect({
  rectId,
  children,
}: {
  rectId: string;
  children: ReactNode;
}) {
  const { setSelectedId } = useRects();
  useEffect(() => {
    setSelectedId(rectId);
  }, [rectId, setSelectedId]);
  return <>{children}</>;
}

describe("Panel", () => {
  it("renders Nothing selected when no rect is selected", () => {
    renderPanel();
    expect(screen.getByText("Nothing selected")).toBeInTheDocument();
  });

  it("renders Undo and Redo buttons", () => {
    renderPanel();
    expect(screen.getByRole("button", { name: /undo position/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /redo position/i })).toBeInTheDocument();
  });

  it("Undo and Redo are disabled when there is nothing to undo/redo", () => {
    renderPanel();
    expect(screen.getByRole("button", { name: /undo position/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /redo position/i })).toBeDisabled();
  });

  it("shows Properties and selected rect id when a rect is selected", () => {
    render(
      <RectsProvider>
        <WithSelectedRect rectId="rect-0">
          <Panel />
        </WithSelectedRect>
      </RectsProvider>,
    );
    expect(screen.getByText("Properties")).toBeInTheDocument();
    expect(screen.getByText(/Selected: rect-0/)).toBeInTheDocument();
  });

  it("renders property inputs for x, y, width, height, and fill when a rect is selected", () => {
    render(
      <RectsProvider>
        <WithSelectedRect rectId="rect-0">
          <Panel />
        </WithSelectedRect>
      </RectsProvider>,
    );
    expect(screen.getByLabelText("X")).toHaveValue(10);
    expect(screen.getByLabelText("Y")).toHaveValue(20);
    expect(screen.getByLabelText("Width")).toHaveValue(80);
    expect(screen.getByLabelText("Height")).toHaveValue(60);
    expect(screen.getByLabelText("Fill")).toBeInTheDocument();
  });

  it("calls onUndo when Undo is clicked after an action that enables undo", async () => {
    const WithMoveThenPanel = () => {
      const { onMoveRect: move, setSelectedId } = useRects();
      useEffect(() => {
        setSelectedId("rect-0");
        move("rect-0", 50, 60, { x: 10, y: 20 });
      }, [move, setSelectedId]);
      return <Panel />;
    };
    render(
      <RectsProvider>
        <WithMoveThenPanel />
      </RectsProvider>,
    );
    const undoButton = await screen.findByRole("button", { name: /undo position/i });
    expect(undoButton).not.toBeDisabled();
    const user = userEvent.setup();
    await user.click(undoButton);
    expect(screen.getByLabelText("X")).toHaveValue(10);
    expect(screen.getByLabelText("Y")).toHaveValue(20);
  });

  it("updating X input calls onUpdateRect and updates the rect", async () => {
    render(
      <RectsProvider>
        <WithSelectedRect rectId="rect-0">
          <Panel />
        </WithSelectedRect>
      </RectsProvider>,
    );
    const xInput = screen.getByLabelText("X");
    const user = userEvent.setup();
    await user.clear(xInput);
    await user.type(xInput, "99");
    expect(xInput).toHaveValue(99);
  });
});
