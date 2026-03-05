const mockCanvas = document.createElement("canvas");
const mockStage = {
  eventMode: "static",
  hitArea: {},
  on: () => {},
  off: () => {},
  toLocal: () => ({ x: 0, y: 0 }),
  addChild: () => {},
  removeChild: () => {},
};

export const MockApplication = class MockApplication {
  init = () => Promise.resolve();
  canvas = mockCanvas;
  stage = mockStage;
  screen = {};
  destroy = () => {};
};

export const MockGraphics = class MockGraphics {
  eventMode = "static";
  cursor = "";
  x = 0;
  y = 0;
  on = () => this;
  off = () => this;
  clear = () => this;
  rect = () => this;
  fill = () => this;
  stroke = () => this;
  destroy = () => {};
};
