import { render } from "@testing-library/react";
import React from "react";
import { vi } from "vitest";
import { App } from "./App";

vi.mock("./components/PixiCanvas", () => ({
  PixiCanvas: () => React.createElement("div", { "data-testid": "pixi-canvas" }),
}));

describe("App", () => {
  it("renders the canvas and panel layout", () => {
    render(<App />);
    const container = document.querySelector('[style*="display: flex"]');
    expect(container).toBeInTheDocument();
  });

  it("renders PixiCanvas and panel", () => {
    const { getByTestId } = render(<App />);
    expect(getByTestId("pixi-canvas")).toBeInTheDocument();
  });
});
