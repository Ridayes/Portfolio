"use client";

import Image from "next/image";
import { useEffect, useRef, type PointerEvent, type ReactNode, type RefObject } from "react";

import finderFolder from "@/assets/system/finder-folder.png";
import { dockApps, dockUtilities, getFolder, type DockApp } from "@/content/site";

import { useWindows } from "./window-manager";

const SLOT = 36;
/** Like the reference dock: sizes interpolate linearly from 1× at ±RANGE px to MAX_SCALE at the cursor… */
const MAX_SCALE = 1.75;
const RANGE = 150;
/** …and each slot chases its target size on a spring (same feel as framer-motion's useSpring). */
const SPRING = { mass: 0.1, stiffness: 120, damping: 14 };

/**
 * Spring-driven dock magnification without a motion library. Each frame it measures every slot's
 * live centre (like the reference), works out its target scale from the cursor distance, and
 * steps a spring towards it, writing width and --s straight to the DOM (no React re-renders).
 */
function useDockMagnification(list: RefObject<HTMLUListElement | null>) {
  const mouseX = useRef(Infinity);
  const springs = useRef(new Map<HTMLElement, { s: number; v: number }>());
  const frame = useRef<number | null>(null);
  const last = useRef(0);
  const enabled = useRef(false);

  useEffect(() => {
    const mq = matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    const sync = () => (enabled.current = mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => {
      mq.removeEventListener("change", sync);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, []);

  function tick(now: number) {
    const dt = Math.min((now - last.current) / 1000, 1 / 30);
    last.current = now;
    let moving = false;

    for (const el of list.current?.querySelectorAll<HTMLElement>(".dock-slot") ?? []) {
      const state = springs.current.get(el) ?? { s: 1, v: 0 };
      const r = el.getBoundingClientRect();
      const d = Math.abs(mouseX.current - (r.left + r.width / 2));
      const target = 1 + (MAX_SCALE - 1) * Math.max(0, 1 - d / RANGE);

      // Semi-implicit Euler in small sub-steps keeps the stiff spring stable.
      const steps = 8;
      const h = dt / steps;
      for (let i = 0; i < steps; i++) {
        const a = (SPRING.stiffness * (target - state.s) - SPRING.damping * state.v) / SPRING.mass;
        state.v += a * h;
        state.s += state.v * h;
      }
      if (Math.abs(target - state.s) < 0.001 && Math.abs(state.v) < 0.01) {
        state.s = target;
        state.v = 0;
      } else moving = true;

      springs.current.set(el, state);
      el.style.width = `${SLOT * state.s}px`;
      el.style.setProperty("--s", String(state.s));
    }

    frame.current = moving ? requestAnimationFrame(tick) : null;
  }

  function kick() {
    if (frame.current !== null) return;
    last.current = performance.now();
    frame.current = requestAnimationFrame(tick);
  }

  return {
    onPointerMove(e: PointerEvent) {
      if (e.pointerType !== "mouse" || !enabled.current) return;
      mouseX.current = e.clientX;
      kick();
    },
    onPointerLeave() {
      mouseX.current = Infinity;
      kick();
    },
  };
}

/**
 * App name above the icon (like the reference: fades in while sliding up 10px). It sits above the
 * icon's *magnified* height (--s is the slot's live scale), so the enlarged icon never covers it.
 */
function Tooltip({ label }: { label: string }) {
  return (
    <span
      aria-hidden="true"
      style={{ bottom: "calc(var(--s, 1) * 36px + 10px)" }}
      className="pointer-events-none absolute left-1/2 z-20 -translate-x-1/2 translate-y-2.5 rounded-md bg-[#e8e8e8]/95 px-2 py-0.5 text-[12px] leading-[18px] font-medium whitespace-nowrap text-neutral-800 opacity-0 shadow-[0_2px_8px_rgb(0_0_0/0.18)] ring-[0.5px] ring-black/10 backdrop-blur transition-[opacity,translate] duration-200 ease-out group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100"
    >
      {label}
    </span>
  );
}

type ItemProps = {
  label: string;
  running?: boolean;
  bounceKey?: number;
  id?: string;
  className?: string;
  children: ReactNode;
};

/** One dock slot. Width grows with the magnification so neighbours make room, like macOS. */
function Slot({ label, running, bounceKey, id, className = "", children }: ItemProps) {
  return (
    <li id={id} className={`dock-slot group relative h-9 shrink-0 hover:z-10 focus-within:z-10 ${className}`} style={{ width: SLOT }}>
      <Tooltip label={label} />
      <span
        key={bounceKey}
        className={`absolute inset-x-0 bottom-0 h-9 origin-bottom ${bounceKey ? "animate-[dock-bounce_700ms_ease-out]" : ""}`}
      >
        <span className="dock-icon absolute inset-0 origin-bottom">{children}</span>
      </span>
      {running && (
        <span aria-hidden="true" className="absolute -bottom-[7px] left-1/2 size-1 -translate-x-1/2 rounded-full bg-black/55" />
      )}
    </li>
  );
}

function AppIcon({ app }: { app: DockApp }) {
  return (
    <Image src={app.icon} alt="" style={{ top: app.top }} className="absolute left-1/2 max-w-none -translate-x-1/2" />
  );
}

/** Dock: spring-driven magnification (after the reference FloatingDock), launch bounce, running dots and minimised windows. */
export function Dock() {
  const { windows, open, restore, focus, launches } = useWindows();
  const list = useRef<HTMLUListElement>(null);
  const magnify = useDockMagnification(list);

  const finders = windows.filter((w) => w.kind === "finder");
  const minimized = windows.filter((w) => ["minimizing", "minimized", "restoring"].includes(w.status));

  function launch(app: DockApp, el: HTMLElement) {
    if (!app.opens) return;
    const front = finders.at(-1);
    if (front) {
      if (front.status === "minimized") restore(front.id);
      else focus(front.id);
    } else open(app.opens, el);
  }

  return (
    <footer className="pointer-events-none fixed inset-x-0 bottom-[5px] z-20 flex justify-center">
      <div
        className="pointer-events-auto relative origin-bottom animate-dock px-2 pt-2.5 pb-[11px] [animation-delay:500ms] max-sm:scale-[0.62]"
        onPointerMove={magnify.onPointerMove}
        onPointerLeave={magnify.onPointerLeave}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-[15px] border border-black/10 bg-[rgb(246_246_246/0.36)] shadow-[0_0_6px_rgb(0_0_0/0.15)] backdrop-blur-[68px]"
        />
        <ul ref={list} aria-label="Dock" className="relative flex items-end gap-[9px]">
          {dockApps.map((app) => {
            const isFinder = !!app.opens;
            const inner = <AppIcon app={app} />;
            return (
              <Slot
                key={app.name}
                label={app.name}
                running={isFinder && finders.length > 0}
                bounceKey={isFinder ? launches : undefined}
              >
                {app.href ? (
                  <a href={app.href} target="_blank" rel="noopener noreferrer" aria-label={app.name} className="block size-full rounded-[10px] outline-offset-2">
                    {inner}
                  </a>
                ) : app.opens ? (
                  <button type="button" aria-label={`Open ${app.name}`} onClick={(e) => launch(app, e.currentTarget)} className="block size-full rounded-[10px] outline-offset-2">
                    {inner}
                  </button>
                ) : (
                  <span role="img" aria-label={app.name}>{inner}</span>
                )}
              </Slot>
            );
          })}

          <li aria-hidden="true" className="flex h-[41px] items-center self-center px-[5px]">
            <span className="h-[41px] w-px bg-[rgb(60_60_67/0.29)]" />
          </li>

          {minimized.map((win) => {
            const folder = getFolder(win.id);
            return (
              <Slot key={win.id} id={`dock-window-${win.id}`} label={folder?.label ?? ""} className="dock-enter">
                <button
                  type="button"
                  aria-label={`Restore ${folder?.label}`}
                  onClick={() => restore(win.id)}
                  className="grid size-full place-items-center rounded-[8px] bg-white/80 shadow-[0_1px_3px_rgb(0_0_0/0.2)] ring-[0.5px] ring-black/10 outline-offset-2"
                >
                  <Image src={finderFolder} alt="" className="w-[70%]" />
                </button>
              </Slot>
            );
          })}

          {dockUtilities.map((app) => (
            <Slot key={app.name} label={app.name}>
              <span role="img" aria-label={app.name}>
                <AppIcon app={app} />
              </span>
            </Slot>
          ))}
        </ul>
      </div>
    </footer>
  );
}
