"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";

import finderFolder from "@/assets/system/finder-folder.png";
import { dockApps, dockUtilities, getFolder, type DockApp } from "@/content/site";

import { useWindows } from "./window-manager";

const SLOT = 36;
const MAX_SCALE = 1.6;
const RANGE = 120; // px from the cursor where magnification fades out

function Tooltip({ label }: { label: string }) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute bottom-full left-1/2 mb-3 -translate-x-1/2 translate-y-1 rounded-md bg-white/90 px-2.5 py-1 text-[12px] font-medium whitespace-nowrap text-ink opacity-0 shadow-[0_2px_10px_rgb(0_0_0/0.15)] ring-[0.5px] ring-black/10 backdrop-blur transition duration-150 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100"
    >
      {label}
    </span>
  );
}

type ItemProps = {
  label: string;
  scale: number;
  running?: boolean;
  bounceKey?: number;
  id?: string;
  className?: string;
  children: ReactNode;
};

/** One dock slot. Width grows with the magnification so neighbours make room, like macOS. */
function Slot({ label, scale, running, bounceKey, id, className = "", children }: ItemProps) {
  return (
    <li
      id={id}
      className={`dock-slot group relative h-9 shrink-0 ${className}`}
      style={{ width: SLOT * scale, ["--s" as string]: scale }}
    >
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

/** Dock: macOS fish-eye magnification, launch bounce, running dots and minimised windows. */
export function Dock() {
  const { windows, open, restore, focus, launches } = useWindows();
  const list = useRef<HTMLUListElement>(null);
  // Slot centres are measured once when the pointer enters (unmagnified), then reused.
  const [centers, setCenters] = useState<number[]>([]);
  const [mouseX, setMouseX] = useState<number | null>(null);
  const [magnify, setMagnify] = useState(false);

  useEffect(() => {
    const mq = matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    const sync = () => setMagnify(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const measure = useCallback(() => {
    setCenters(
      Array.from(list.current?.querySelectorAll<HTMLElement>(".dock-slot") ?? []).map((el) => {
        const r = el.getBoundingClientRect();
        return r.left + r.width / 2;
      }),
    );
  }, []);

  const scaleAt = (i: number) => {
    if (!magnify || mouseX === null || centers[i] === undefined) return 1;
    const d = Math.abs(mouseX - centers[i]);
    const t = Math.max(0, 1 - (d / RANGE) ** 2);
    return 1 + (MAX_SCALE - 1) * t;
  };

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

  let slot = 0;
  const next = () => scaleAt(slot++);

  return (
    <footer className="pointer-events-none fixed inset-x-0 bottom-[5px] z-20 flex justify-center">
      <div
        className="pointer-events-auto relative origin-bottom animate-dock px-2 pt-2.5 pb-[11px] [animation-delay:500ms] max-sm:scale-[0.62]"
        onPointerEnter={(e: PointerEvent) => {
          if (e.pointerType !== "mouse") return;
          measure();
          setMouseX(e.clientX);
        }}
        onPointerMove={(e: PointerEvent) => e.pointerType === "mouse" && setMouseX(e.clientX)}
        onPointerLeave={() => setMouseX(null)}
        data-hovering={mouseX !== null}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-[15px] border border-black/10 bg-[rgb(246_246_246/0.36)] shadow-[0_0_6px_rgb(0_0_0/0.15)] backdrop-blur-[68px]"
        />
        <ul ref={list} aria-label="Dock" className="relative flex items-end gap-[9px]">
          {dockApps.map((app) => {
            const s = next();
            const isFinder = !!app.opens;
            const inner = <AppIcon app={app} />;
            return (
              <Slot
                key={app.name}
                label={app.name}
                scale={s}
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
              <Slot key={win.id} id={`dock-window-${win.id}`} label={folder?.label ?? ""} scale={next()} className="dock-enter">
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
            <Slot key={app.name} label={app.name} scale={next()}>
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
