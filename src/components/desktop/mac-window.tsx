"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";

import { MENU_BAR_HEIGHT, useWindows, type Rect, type WindowState } from "./window-manager";

type Props = {
  win: WindowState;
  active: boolean;
  zIndex: number;
  label: string;
  className?: string;
  children: ReactNode;
};

const EASE_OPEN = "cubic-bezier(0.16, 1, 0.3, 1)"; // fast-out, long settle — like macOS zoom
const EASE_IN = "cubic-bezier(0.5, 0, 0.75, 0)";

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Transform that maps the window's box onto `target` (used to zoom from/to an icon). */
function toward(box: DOMRect, target: Rect, extra = "") {
  const dx = target.x + target.width / 2 - (box.left + box.width / 2);
  const dy = target.y + target.height / 2 - (box.top + box.height / 2);
  const s = Math.max(0.04, Math.min(target.width / box.width, target.height / box.height));
  return `translate(${dx}px, ${dy}px) scale(${s}) ${extra}`;
}

function dockTarget(id: string): Rect | null {
  const el = document.getElementById(`dock-window-${id}`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.left, y: r.top, width: r.width, height: r.height };
}

/**
 * A draggable macOS window: zooms open from the icon that launched it, closes back into it,
 * minimises into the dock with a genie-style squeeze, and animates zoom (green button).
 * Drag it by any element marked `data-drag`.
 */
export function MacWindow({ win, active, zIndex, label, className = "", children }: Props) {
  const { settle, focus, close, move } = useWindows();
  const ref = useRef<HTMLElement>(null);
  const settleRef = useRef(settle);
  useEffect(() => {
    settleRef.current = settle;
  }, [settle]);

  // Play the animation that matches the window's lifecycle status.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const done = () => settleRef.current(win.id);
    const quick = reducedMotion();
    if (win.status === "open" || win.status === "minimized") return;
    // Drop any held end-state (e.g. a finished minimise) before measuring the real box.
    el.getAnimations().forEach((a) => a.cancel());
    const box = el.getBoundingClientRect();
    let anim: Animation | null = null;

    switch (win.status) {
      case "opening": {
        const from = win.origin
          ? { transform: toward(box, win.origin), opacity: 0 }
          : { transform: "scale(0.94)", opacity: 0 };
        anim = el.animate([from, { transform: "none", opacity: 1 }], {
          duration: quick ? 1 : 460,
          easing: EASE_OPEN,
        });
        break;
      }
      case "closing": {
        const to = win.origin
          ? { transform: toward(box, win.origin), opacity: 0 }
          : { transform: "scale(0.95)", opacity: 0 };
        anim = el.animate([{ transform: "none", opacity: 1 }, to], {
          duration: quick ? 1 : 260,
          easing: EASE_IN,
          fill: "forwards",
        });
        break;
      }
      case "minimizing": {
        const target = dockTarget(win.id) ?? { x: innerWidth / 2, y: innerHeight, width: 36, height: 36 };
        // Genie-ish: narrow first, then get sucked down into the dock.
        anim = el.animate(
          [
            { transform: "none", opacity: 1 },
            { transform: `${toward(box, target).replace(/scale\([^)]*\)/, "")} scale(0.35, 0.6)`, opacity: 0.9, offset: 0.55 },
            { transform: toward(box, target), opacity: 0 },
          ],
          { duration: quick ? 1 : 520, easing: "cubic-bezier(0.4, 0, 0.8, 0.6)", fill: "forwards" },
        );
        break;
      }
      case "restoring": {
        const target = dockTarget(win.id) ?? { x: innerWidth / 2, y: innerHeight, width: 36, height: 36 };
        anim = el.animate(
          [
            { transform: toward(box, target), opacity: 0 },
            { transform: `${toward(box, target).replace(/scale\([^)]*\)/, "")} scale(0.35, 0.6)`, opacity: 0.9, offset: 0.45 },
            { transform: "none", opacity: 1 },
          ],
          { duration: quick ? 1 : 480, easing: EASE_OPEN },
        );
        break;
      }
      default:
        return;
    }

    anim.onfinish = done;
    return () => {
      anim.onfinish = null;
    };
  }, [win.status, win.id, win.origin]);

  // Move focus into the window once it has opened or been restored.
  useEffect(() => {
    if (win.status === "open" && active && !ref.current?.contains(document.activeElement)) {
      ref.current?.focus({ preventScroll: true });
    }
    // Only when it settles open; not on every activation change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [win.status]);

  // Dragging by the title bar / toolbar.
  const drag = useRef<{ dx: number; dy: number; id: number } | null>(null);

  function onPointerDown(e: PointerEvent<HTMLElement>) {
    focus(win.id);
    const target = e.target as HTMLElement;
    if (
      e.button !== 0 ||
      win.maximized ||
      !target.closest("[data-drag]") ||
      target.closest("button, a, input, [data-no-drag]") ||
      window.matchMedia("(max-width: 639px)").matches
    )
      return;
    const el = ref.current!;
    drag.current = { dx: e.clientX - el.offsetLeft, dy: e.clientY - el.offsetTop, id: e.pointerId };
    el.setPointerCapture(e.pointerId);
    el.dataset.dragging = "true";
  }

  function onPointerMove(e: PointerEvent<HTMLElement>) {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const el = ref.current!;
    const x = Math.min(Math.max(e.clientX - d.dx, 80 - el.offsetWidth), innerWidth - 80);
    const y = Math.min(Math.max(e.clientY - d.dy, MENU_BAR_HEIGHT), innerHeight - 40);
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
  }

  function onPointerUp(e: PointerEvent<HTMLElement>) {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    const el = ref.current!;
    delete el.dataset.dragging;
    move(win.id, el.offsetLeft, el.offsetTop);
  }

  function onKeyDown(e: KeyboardEvent<HTMLElement>) {
    if (e.key === "Escape" && !e.defaultPrevented) {
      e.preventDefault();
      close(win.id);
    }
  }

  const { x, y, width, height } = win.bounds;
  const style: CSSProperties = win.maximized
    ? {
        left: 8,
        top: MENU_BAR_HEIGHT + 6,
        width: "calc(100vw - 16px)",
        height: `calc(100dvh - ${MENU_BAR_HEIGHT + 6}px - 84px)`,
        zIndex,
      }
    : { left: x, top: y, width, height: win.kind === "panel" ? "auto" : height, zIndex };

  return (
    <section
      ref={ref}
      role="dialog"
      aria-label={label}
      tabIndex={-1}
      hidden={win.status === "minimized"}
      data-active={active}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
      style={style}
      className={`mac-window-frame pointer-events-auto absolute flex-col ${win.status === "minimized" ? "hidden" : "flex"} overflow-hidden text-ink outline-none max-sm:left-0! max-sm:top-[34px]! max-sm:h-[calc(100dvh-34px)]! max-sm:w-full! max-sm:rounded-none! ${className}`}
    >
      {children}
    </section>
  );
}
