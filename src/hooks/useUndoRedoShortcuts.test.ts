import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useRef } from "react";
import { useUndoRedoShortcuts } from "./useUndoRedoShortcuts";

describe("useUndoRedoShortcuts", () => {
  function createKeyEvent(
    key: string,
    options: { metaKey?: boolean; ctrlKey?: boolean; shiftKey?: boolean } = {},
  ): KeyboardEvent {
    return new KeyboardEvent("keydown", {
      key,
      metaKey: options.metaKey ?? false,
      ctrlKey: options.ctrlKey ?? false,
      shiftKey: options.shiftKey ?? false,
      bubbles: true,
    });
  }

  it("does nothing when focusRef.current is null", () => {
    const onUndo = vi.fn();
    const onRedo = vi.fn();
    const focusRef = { current: null as HTMLDivElement | null };

    renderHook(() =>
      useUndoRedoShortcuts({
        focusRef,
        onUndo,
        onRedo,
        canUndo: true,
        canRedo: true,
      }),
    );

    const e = createKeyEvent("z", { metaKey: true });
    const preventDefaultSpy = vi.spyOn(e, "preventDefault");
    document.dispatchEvent(e);

    expect(onUndo).not.toHaveBeenCalled();
    expect(onRedo).not.toHaveBeenCalled();
    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });

  it("does nothing when focus is not on or inside the focus element", () => {
    const onUndo = vi.fn();
    const onRedo = vi.fn();
    const focusRef = { current: document.createElement("div") };
    document.body.appendChild(focusRef.current);
    // Focus something else (e.g. body or another element)
    document.body.focus();

    renderHook(() =>
      useUndoRedoShortcuts({
        focusRef,
        onUndo,
        onRedo,
        canUndo: true,
        canRedo: true,
      }),
    );

    const e = createKeyEvent("z", { metaKey: true });
    document.dispatchEvent(e);

    expect(onUndo).not.toHaveBeenCalled();
    expect(onRedo).not.toHaveBeenCalled();

    document.body.removeChild(focusRef.current);
  });

  it("calls onUndo and prevents default on Cmd+Z when canUndo", () => {
    const onUndo = vi.fn();
    const onRedo = vi.fn();
    const el = document.createElement("div");
    el.tabIndex = 0;
    document.body.appendChild(el);
    el.focus();
    const focusRef = { current: el };

    renderHook(() =>
      useUndoRedoShortcuts({
        focusRef,
        onUndo,
        onRedo,
        canUndo: true,
        canRedo: false,
      }),
    );

    const e = createKeyEvent("z", { metaKey: true });
    const preventDefaultSpy = vi.spyOn(e, "preventDefault");
    document.dispatchEvent(e);

    expect(onUndo).toHaveBeenCalledTimes(1);
    expect(onRedo).not.toHaveBeenCalled();
    expect(preventDefaultSpy).toHaveBeenCalled();

    document.body.removeChild(el);
  });

  it("calls onUndo and prevents default on Ctrl+Z when canUndo", () => {
    const onUndo = vi.fn();
    const onRedo = vi.fn();
    const el = document.createElement("div");
    el.tabIndex = 0;
    document.body.appendChild(el);
    el.focus();
    const focusRef = { current: el };

    renderHook(() =>
      useUndoRedoShortcuts({
        focusRef,
        onUndo,
        onRedo,
        canUndo: true,
        canRedo: false,
      }),
    );

    const e = createKeyEvent("z", { ctrlKey: true });
    const preventDefaultSpy = vi.spyOn(e, "preventDefault");
    document.dispatchEvent(e);

    expect(onUndo).toHaveBeenCalledTimes(1);
    expect(preventDefaultSpy).toHaveBeenCalled();

    document.body.removeChild(el);
  });

  it("does not call onUndo when canUndo is false but still prevents default", () => {
    const onUndo = vi.fn();
    const onRedo = vi.fn();
    const el = document.createElement("div");
    el.tabIndex = 0;
    document.body.appendChild(el);
    el.focus();
    const focusRef = { current: el };

    renderHook(() =>
      useUndoRedoShortcuts({
        focusRef,
        onUndo,
        onRedo,
        canUndo: false,
        canRedo: false,
      }),
    );

    const e = createKeyEvent("z", { metaKey: true });
    const preventDefaultSpy = vi.spyOn(e, "preventDefault");
    document.dispatchEvent(e);

    expect(onUndo).not.toHaveBeenCalled();
    expect(preventDefaultSpy).toHaveBeenCalled();

    document.body.removeChild(el);
  });

  it("calls onRedo and prevents default on Cmd+Shift+Z when canRedo", () => {
    const onUndo = vi.fn();
    const onRedo = vi.fn();
    const el = document.createElement("div");
    el.tabIndex = 0;
    document.body.appendChild(el);
    el.focus();
    const focusRef = { current: el };

    renderHook(() =>
      useUndoRedoShortcuts({
        focusRef,
        onUndo,
        onRedo,
        canUndo: false,
        canRedo: true,
      }),
    );

    const e = createKeyEvent("z", { metaKey: true, shiftKey: true });
    const preventDefaultSpy = vi.spyOn(e, "preventDefault");
    document.dispatchEvent(e);

    expect(onRedo).toHaveBeenCalledTimes(1);
    expect(onUndo).not.toHaveBeenCalled();
    expect(preventDefaultSpy).toHaveBeenCalled();

    document.body.removeChild(el);
  });

  it("calls onRedo and prevents default on Cmd+Y when canRedo", () => {
    const onUndo = vi.fn();
    const onRedo = vi.fn();
    const el = document.createElement("div");
    el.tabIndex = 0;
    document.body.appendChild(el);
    el.focus();
    const focusRef = { current: el };

    renderHook(() =>
      useUndoRedoShortcuts({
        focusRef,
        onUndo,
        onRedo,
        canUndo: false,
        canRedo: true,
      }),
    );

    const e = createKeyEvent("y", { metaKey: true });
    const preventDefaultSpy = vi.spyOn(e, "preventDefault");
    document.dispatchEvent(e);

    expect(onRedo).toHaveBeenCalledTimes(1);
    expect(preventDefaultSpy).toHaveBeenCalled();

    document.body.removeChild(el);
  });

  it("does not call onRedo when canRedo is false but still prevents default for Y", () => {
    const onUndo = vi.fn();
    const onRedo = vi.fn();
    const el = document.createElement("div");
    el.tabIndex = 0;
    document.body.appendChild(el);
    el.focus();
    const focusRef = { current: el };

    renderHook(() =>
      useUndoRedoShortcuts({
        focusRef,
        onUndo,
        onRedo,
        canUndo: false,
        canRedo: false,
      }),
    );

    const e = createKeyEvent("y", { metaKey: true });
    const preventDefaultSpy = vi.spyOn(e, "preventDefault");
    document.dispatchEvent(e);

    expect(onRedo).not.toHaveBeenCalled();
    expect(preventDefaultSpy).toHaveBeenCalled();

    document.body.removeChild(el);
  });

  it("ignores keydown when key is not z or y", () => {
    const onUndo = vi.fn();
    const onRedo = vi.fn();
    const el = document.createElement("div");
    el.tabIndex = 0;
    document.body.appendChild(el);
    el.focus();
    const focusRef = { current: el };

    renderHook(() =>
      useUndoRedoShortcuts({
        focusRef,
        onUndo,
        onRedo,
        canUndo: true,
        canRedo: true,
      }),
    );

    document.dispatchEvent(createKeyEvent("x", { metaKey: true }));
    document.dispatchEvent(createKeyEvent("Z", { metaKey: true })); // uppercase Z still matches toLowerCase

    expect(onUndo).toHaveBeenCalledTimes(1);
    expect(onRedo).not.toHaveBeenCalled();

    document.body.removeChild(el);
  });

  it("removes keydown listener on unmount", () => {
    const onUndo = vi.fn();
    const el = document.createElement("div");
    el.tabIndex = 0;
    document.body.appendChild(el);
    el.focus();
    const focusRef = { current: el };

    const { unmount } = renderHook(() =>
      useUndoRedoShortcuts({
        focusRef,
        onUndo,
        onRedo: vi.fn(),
        canUndo: true,
        canRedo: false,
      }),
    );

    unmount();

    const e = createKeyEvent("z", { metaKey: true });
    document.dispatchEvent(e);
    expect(onUndo).not.toHaveBeenCalled();

    document.body.removeChild(el);
  });
});
