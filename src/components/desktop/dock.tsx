import Image from "next/image";

import { dockApps, dockUtilities, type DockApp } from "@/content/site";

function DockItem({ app }: { app: DockApp }) {
  const icon = (
    <Image
      src={app.icon}
      alt={app.name}
      style={{ top: app.top }}
      className="absolute left-1/2 max-w-none -translate-x-1/2"
    />
  );

  return (
    <li className="group relative size-9 shrink-0">
      {/* Tooltip, like macOS dock labels */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-full left-1/2 mb-4 -translate-x-1/2 translate-y-1 rounded-md bg-white/90 px-2.5 py-1 text-[12px] font-medium whitespace-nowrap opacity-0 shadow-[0_2px_10px_rgb(0_0_0/0.15)] ring-[0.5px] ring-black/10 transition duration-150 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100"
      >
        {app.name}
      </span>
      <span className="absolute inset-0 origin-bottom transition-transform duration-200 ease-out-soft group-hover:-translate-y-1.5 group-hover:scale-[1.22] group-focus-within:-translate-y-1.5 group-focus-within:scale-[1.22]">
        {app.href ? (
          <a href={app.href} target="_blank" rel="noopener noreferrer" className="block size-full rounded-[10px] outline-offset-2">
            {icon}
          </a>
        ) : (
          icon
        )}
      </span>
    </li>
  );
}

/** Dock from the Figma frame: 36px slots, 9px gap, frosted 15px-radius panel. */
export function Dock() {
  return (
    <footer className="pointer-events-none fixed inset-x-0 bottom-[5px] z-20 flex justify-center">
      <div className="pointer-events-auto relative origin-bottom animate-dock px-2 pt-2.5 pb-[11px] [animation-delay:500ms] max-sm:scale-[0.62]">
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-[15px] border border-black/10 bg-[rgb(246_246_246/0.36)] shadow-[0_0_6px_rgb(0_0_0/0.15)] backdrop-blur-[68px]"
        />
        <ul aria-label="Tools I use" className="relative flex items-center gap-[9px]">
          {dockApps.map((app) => (
            <DockItem key={app.name} app={app} />
          ))}
          <li aria-hidden="true" className="flex items-center px-[5px]">
            <span className="h-[41px] w-px bg-[rgb(60_60_67/0.29)]" />
          </li>
          {dockUtilities.map((app) => (
            <DockItem key={app.name} app={app} />
          ))}
        </ul>
      </div>
    </footer>
  );
}
