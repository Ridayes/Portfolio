"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { getFolder } from "@/content/site";

export type Rect = { x: number; y: number; width: number; height: number };

export type WindowStatus = "opening" | "open" | "closing" | "minimizing" | "minimized" | "restoring";

export type WindowState = {
  /** Folder id the window was opened for; also the window's identity. */
  id: string;
  kind: "panel" | "finder";
  status: WindowStatus;
  maximized: boolean;
  bounds: Rect;
  /** Where the window zooms from/to (desktop icon or dock icon). */
  origin: Rect | null;
  /** Creation order. DOM order stays fixed (re-ordering nodes mid-click would cancel the click). */
  seq: number;
};

type Ctx = {
  /** Bottom-to-top stacking order. */
  windows: WindowState[];
  open: (id: string, origin?: Element | null) => void;
  close: (id: string) => void;
  focus: (id: string) => void;
  minimize: (id: string) => void;
  restore: (id: string) => void;
  toggleMaximize: (id: string) => void;
  move: (id: string, x: number, y: number) => void;
  settle: (id: string) => void;
  /** Bumps whenever a window is launched, so the dock can bounce its icon. */
  launches: number;
};

const WindowContext = createContext<Ctx | null>(null);

export const MENU_BAR_HEIGHT = 34;
const DOCK_CLEARANCE = 84;

const SIZES = {
  finder: { width: 900, height: 600 },
  panel: { width: 530, height: 165 },
} as const;

function toRect(el: Element | null | undefined): Rect | null {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.left, y: r.top, width: r.width, height: r.height };
}

function initialBounds(kind: WindowState["kind"], stackIndex: number): Rect {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const size = SIZES[kind];
  const width = Math.min(size.width, vw - 24);
  const height = kind === "panel" ? size.height : Math.min(size.height, vh - MENU_BAR_HEIGHT - DOCK_CLEARANCE);
  const cascade = (stackIndex % 6) * 26;
  const x = Math.max(12, Math.round((vw - width) / 2) + cascade - 40);
  const y = Math.max(
    MENU_BAR_HEIGHT + 10,
    Math.round(MENU_BAR_HEIGHT + (vh - MENU_BAR_HEIGHT - DOCK_CLEARANCE - height) / 2) + cascade - 30,
  );
  return { x, y, width, height };
}

export function WindowProvider({ children }: { children: ReactNode }) {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [launches, setLaunches] = useState(0);
  // Element that had focus when a window opened, so focus can return there on close.
  const openers = useRef(new Map<string, HTMLElement>());
  const seq = useRef(0);

  const update = useCallback((id: string, patch: (w: WindowState) => Partial<WindowState>) => {
    setWindows((list) => list.map((w) => (w.id === id ? { ...w, ...patch(w) } : w)));
  }, []);

  const focus = useCallback((id: string) => {
    setWindows((list) => {
      const i = list.findIndex((w) => w.id === id);
      if (i === -1 || i === list.length - 1) return list;
      return [...list.slice(0, i), ...list.slice(i + 1), list[i]];
    });
  }, []);

  const open = useCallback(
    (id: string, originEl?: Element | null) => {
      const folder = getFolder(id);
      if (!folder) return;
      const origin = toRect(originEl);
      seq.current += 1;
      if (document.activeElement instanceof HTMLElement) openers.current.set(id, document.activeElement);

      setWindows((list) => {
        const existing = list.find((w) => w.id === id);
        if (existing) {
          const rest = list.filter((w) => w.id !== id);
          const status: WindowStatus =
            existing.status === "minimized"
              ? "restoring"
              : existing.status === "closing"
                ? "opening"
                : existing.status;
          return [...rest, { ...existing, status }];
        }
        const win: WindowState = {
          id,
          kind: folder.kind,
          status: "opening",
          maximized: false,
          bounds: initialBounds(folder.kind, list.length),
          origin,
          seq: seq.current,
        };
        return [...list, win];
      });
      setLaunches((n) => n + 1);
    },
    [],
  );

  const close = useCallback(
    (id: string) => update(id, () => ({ status: "closing" })),
    [update],
  );

  const minimize = useCallback(
    (id: string) => update(id, () => ({ status: "minimizing" })),
    [update],
  );

  const restore = useCallback(
    (id: string) => {
      update(id, () => ({ status: "restoring" }));
      focus(id);
    },
    [update, focus],
  );

  const toggleMaximize = useCallback(
    (id: string) => update(id, (w) => ({ maximized: !w.maximized })),
    [update],
  );

  const move = useCallback(
    (id: string, x: number, y: number) => update(id, (w) => ({ bounds: { ...w.bounds, x, y } })),
    [update],
  );

  /** Called by a window when its open/close/minimize/restore animation finishes. */
  const settle = useCallback((id: string) => {
    setWindows((list) => {
      const win = list.find((w) => w.id === id);
      if (!win) return list;
      if (win.status === "closing") {
        const opener = openers.current.get(id);
        openers.current.delete(id);
        if (opener?.isConnected) requestAnimationFrame(() => opener.focus({ preventScroll: true }));
        return list.filter((w) => w.id !== id);
      }
      const next: WindowStatus = win.status === "minimizing" ? "minimized" : "open";
      return list.map((w) => (w.id === id ? { ...w, status: next } : w));
    });
  }, []);

  const value = useMemo(
    () => ({ windows, open, close, focus, minimize, restore, toggleMaximize, move, settle, launches }),
    [windows, open, close, focus, minimize, restore, toggleMaximize, move, settle, launches],
  );

  return <WindowContext.Provider value={value}>{children}</WindowContext.Provider>;
}

export function useWindows() {
  const ctx = useContext(WindowContext);
  if (!ctx) throw new Error("useWindows must be used inside <WindowProvider>");
  return ctx;
}
