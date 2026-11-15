"use client";

import type { PanelFolder } from "@/content/site";

import { FolderOutline } from "./finder-icons";
import { MacWindow } from "./mac-window";
import { TrafficLights } from "./traffic-lights";
import { useWindows, type WindowState } from "./window-manager";

/** The small "About me" utility panel from the reference (530px wide, 28px title bar). */
export function AboutPanel({
  folder,
  win,
  active,
  zIndex,
}: {
  folder: PanelFolder;
  win: WindowState;
  active: boolean;
  zIndex: number;
}) {
  const { close, minimize, toggleMaximize } = useWindows();
  const titleId = `${win.id}-title`;

  return (
    <MacWindow
      win={win}
      active={active}
      zIndex={zIndex}
      label={folder.label}
      className="rounded-[16px] bg-white shadow-[0_0_0_0.5px_rgb(0_0_0/0.16),0_22px_48px_-8px_rgb(0_0_0/0.35)] data-[active=false]:shadow-[0_0_0_0.5px_rgb(0_0_0/0.12),0_12px_30px_-10px_rgb(0_0_0/0.25)]"
    >
      <header data-drag className="relative flex h-[28px] shrink-0 items-center border-b border-[#e6e6e6] px-[13px] select-none">
        <TrafficLights
          active={active}
          size={12}
          gap={6}
          zoomed={win.maximized}
          onClose={() => close(win.id)}
          onMinimize={() => minimize(win.id)}
          onZoom={() => toggleMaximize(win.id)}
        />
        <h2
          id={titleId}
          className="pointer-events-none absolute inset-x-20 flex items-center justify-center gap-1 text-[13px] font-bold text-[#1d1d1f]"
        >
          <span className="text-[#6e6e73]">
            <FolderOutline size={14} />
          </span>
          {folder.label}
        </h2>
      </header>
      <div className="overflow-y-auto px-[18px] pt-[22px] pb-[26px] text-[13px] leading-[16px] text-[#1d1d1f]">
        {folder.paragraphs.map((p, i) => (
          <p key={i} className="animate-rise" style={{ animationDelay: `${120 + i * 70}ms`, animationDuration: "500ms" }}>
            {p}
          </p>
        ))}
      </div>
    </MacWindow>
  );
}
