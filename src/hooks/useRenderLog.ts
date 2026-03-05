import { useRef } from "react";

const isDev =
  (typeof import.meta !== "undefined" && import.meta.env?.DEV === true) ||
  (typeof process !== "undefined" && process.env.NODE_ENV !== "production");

function getChangedKeys(
  prev: Record<string, unknown> | undefined,
  next: Record<string, unknown>
): string[] | null {
  if (!prev) return Object.keys(next).length ? Object.keys(next) : null;
  const keys = new Set([...Object.keys(prev), ...Object.keys(next)]);
  const changed: string[] = [];
  for (const k of keys) {
    if (prev[k] !== next[k]) changed.push(k);
  }
  return changed.length ? changed : null;
}

/**
 * Logs each render of the component (development only). Use to verify
 * that memo/useCallback/useMemo are reducing re-renders.
 *
 * @param componentName - Label shown in the console (e.g. "App", "Panel").
 * @param deps - Optional object of values to track. Logs which keys changed
 *               since last render (reference or primitive equality). Use
 *               stable summaries (e.g. rects.length, selectedId) to avoid
 *               noise from new object refs every render.
 *
 * @example
 * // Log every render with no details
 * useRenderLog("App");
 *
 * @example
 * // Log every render and which of these changed
 * useRenderLog("Panel", {
 *   rectId: rect?.id,
 *   canUndo,
 *   canRedo,
 * });
 */
export function useRenderLog(
  componentName: string,
  deps?: Record<string, unknown>
): void {
  const prevDepsRef = useRef<Record<string, unknown> | undefined>(undefined);
  const renderCountRef = useRef(0);

  if (!isDev) return;

  renderCountRef.current += 1;
  const changed =
    deps != null ? getChangedKeys(prevDepsRef.current, deps) : null;
  const label = changed?.length
    ? `[render] ${componentName} (#${renderCountRef.current}) changed: ${changed.join(", ")}`
    : `[render] ${componentName} (#${renderCountRef.current})`;
  console.log(label);
  if (deps != null) prevDepsRef.current = { ...deps };
}
