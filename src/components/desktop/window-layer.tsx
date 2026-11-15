"use client";

import { getFolder } from "@/content/site";

import { AboutPanel } from "./about-panel";
import { FinderWindow } from "./finder-window";
import { useWindows } from "./window-manager";

/** Renders every open window, stacked between the desktop and the dock/menu bar. */
export function WindowLayer() {
  const { windows } = useWindows();
  const visible = windows.filter((w) => w.status !== "minimized" && w.status !== "minimizing");
  const activeId = visible.at(-1)?.id;

  return (
    <div className="pointer-events-none fixed inset-0 z-[15]">
      {[...windows].sort((a, b) => a.seq - b.seq).map((win) => {
        const folder = getFolder(win.id);
        if (!folder) return null;
        // Stacking comes from z-index, not DOM order (see WindowState.seq).
        const props = { win, active: win.id === activeId, zIndex: windows.indexOf(win) + 1 };
        return folder.kind === "panel" ? (
          <AboutPanel key={win.id} folder={folder} {...props} />
        ) : (
          <FinderWindow key={win.id} {...props} />
        );
      })}
    </div>
  );
}
