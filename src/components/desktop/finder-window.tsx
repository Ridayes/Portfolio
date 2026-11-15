"use client";

import Image from "next/image";
import { useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

import finderFolder from "@/assets/system/finder-folder.png";
import { getProjects, vimeoEmbedUrl, type Project } from "@/content/projects";
import { finderFolders, getFolder, site, type FinderFolder } from "@/content/site";

import {
  ArchiveIcon,
  ChevronLeft,
  ChevronRight,
  ComposeIcon,
  FolderOutline,
  NewFolderIcon,
  PlayGlyph,
  SearchGlyph,
  TagIcon,
  TrashIcon,
} from "./finder-icons";
import { MacWindow } from "./mac-window";
import { QuickLook } from "./quick-look";
import { TrafficLights } from "./traffic-lights";
import { useWindows, type WindowState } from "./window-manager";

/** A folder id, e.g. "branding". */
type Location = string;

function resolve(location: Location) {
  const folder = getFolder(location) as FinderFolder;
  return { folder, title: folder.sidebarLabel, items: getProjects(folder.id) };
}

const pill =
  "flex h-[34px] items-center rounded-full bg-[#f7f7f7]/90 shadow-[0_0_0_0.5px_rgb(0_0_0/0.06),0_6px_16px_-4px_rgb(0_0_0/0.12)] backdrop-blur";
const toolButton =
  "grid h-[34px] w-[34px] place-items-center rounded-full text-[#1d1d1f] transition-colors hover:bg-black/5 active:bg-black/10";

export function FinderWindow({ win, active, zIndex }: { win: WindowState; active: boolean; zIndex: number }) {
  const { close, minimize, toggleMaximize } = useWindows();

  // Back/forward history, like Finder.
  const [history, setHistory] = useState<{ stack: Location[]; index: number }>({ stack: [win.id], index: 0 });
  const location = history.stack[history.index];
  const { folder, title, items } = resolve(location);

  const [query, setQuery] = useState("");
  const [preview, setPreview] = useState<{ index: number; from: DOMRect | null } | null>(null);
  const pointerType = useRef<string>("mouse");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? items.filter((p) => p.title.toLowerCase().includes(q)) : items;
  }, [items, query]);

  // Video projects in this folder, for the Quick Look player (←/→ flips between them).
  const videos = visible.filter((p) => vimeoEmbedUrl(p.vimeo));

  function go(next: Location) {
    if (next === location) return;
    setHistory(({ stack, index }) => ({ stack: [...stack.slice(0, index + 1), next], index: index + 1 }));
    setQuery("");
  }

  const canBack = history.index > 0;
  const canForward = history.index < history.stack.length - 1;
  const step = (delta: number) => {
    setHistory((h) => ({ ...h, index: Math.min(Math.max(h.index + delta, 0), h.stack.length - 1) }));
    setQuery("");
  };

  /** Vimeo projects play in Quick Look; everything else opens its Behance page. */
  function openProject(project: Project, el: HTMLElement | null) {
    if (vimeoEmbedUrl(project.vimeo)) {
      setPreview({ index: videos.findIndex((v) => v.id === project.id), from: el?.getBoundingClientRect() ?? null });
    } else if (project.behance) {
      window.open(project.behance, "_blank", "noopener,noreferrer");
    }
  }

  // Window-level shortcuts: ⌘[ / ⌘] for back/forward, ⌘F for search.
  const searchRef = useRef<HTMLInputElement>(null);
  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (!(e.metaKey || e.ctrlKey)) return;
    if (e.key === "[" && canBack) {
      e.preventDefault();
      step(-1);
    } else if (e.key === "]" && canForward) {
      e.preventDefault();
      step(1);
    } else if (e.key.toLowerCase() === "f") {
      e.preventDefault();
      searchRef.current?.focus();
    }
  }

  const sidebarIndex = finderFolders.findIndex((f) => f.id === folder.id);

  return (
    <MacWindow
      win={win}
      active={active}
      zIndex={zIndex}
      label={`${title} — Finder`}
      className="rounded-[26px] bg-white shadow-[0_0_0_0.5px_rgb(0_0_0/0.18),0_28px_70px_-10px_rgb(0_0_0/0.38)] data-[active=false]:shadow-[0_0_0_0.5px_rgb(0_0_0/0.14),0_16px_40px_-12px_rgb(0_0_0/0.25)]"
    >
      <div className="relative flex min-h-0 flex-1 flex-col" onKeyDown={onKeyDown}>
        {/* Title bar */}
        <div data-drag className="flex h-[33px] shrink-0 items-center gap-[15px] pt-px pl-[9px] select-none">
          <TrafficLights
            active={active}
            zoomed={win.maximized}
            onClose={() => close(win.id)}
            onMinimize={() => minimize(win.id)}
            onZoom={() => toggleMaximize(win.id)}
          />
          <p className="truncate text-[15px] font-bold" aria-hidden="true">
            {title}
          </p>
        </div>

        <div className="flex min-h-0 flex-1">
          {/* Sidebar */}
          <nav
            aria-label="Folders"
            className="mb-[9px] ml-[9px] hidden w-[223px] shrink-0 rounded-[14px] bg-[#f8f8f8] p-[9px] shadow-[inset_-1px_0_0_#fff,0_0_0_0.5px_rgb(0_0_0/0.05),6px_0_18px_-6px_rgb(0_0_0/0.08)] sm:block"
          >
            <ul className="relative">
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-6 rounded-[6px] bg-[#d8d8d8] transition-transform duration-300 ease-out-soft"
                style={{ transform: `translateY(${sidebarIndex * 24}px)` }}
              />
              {finderFolders.map((f) => {
                const current = f.id === folder.id;
                return (
                  <li key={f.id}>
                    <button
                      type="button"
                      onClick={() => go(f.id)}
                      aria-current={current ? "page" : undefined}
                      className="relative flex h-6 w-full items-center gap-[6px] rounded-[6px] px-[6px] text-left text-[12px] font-medium text-[#1d1d1f] outline-offset-[-2px]"
                    >
                      <span className={current ? "text-[#2f7fdc]" : "text-[#1d1d1f]"}>
                        <FolderOutline />
                      </span>
                      <span className="truncate">{f.sidebarLabel}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex min-w-0 flex-1 flex-col">
            {/* Toolbar */}
            <div data-drag className="flex h-[34px] shrink-0 items-center gap-2 pr-[9px] pl-[9px] sm:pl-[17px]">
              <div className={`${pill} px-0.5`}>
                <button type="button" aria-label="Back" disabled={!canBack} onClick={() => step(-1)} className={`${toolButton} w-[31px] disabled:text-[#c4c4c4] disabled:hover:bg-transparent`}>
                  <ChevronLeft />
                </button>
                <span aria-hidden="true" className="h-[18px] w-px bg-black/10" />
                <button type="button" aria-label="Forward" disabled={!canForward} onClick={() => step(1)} className={`${toolButton} w-[31px] disabled:text-[#c4c4c4] disabled:hover:bg-transparent`}>
                  <ChevronRight />
                </button>
              </div>
              <h2 key={location} className="ml-1 min-w-0 flex-1 animate-[finder-in_240ms_var(--ease-out-soft)] truncate text-[15px] font-bold select-none">
                {title}
              </h2>
              <div className={`${pill} hidden gap-0.5 px-1.5 text-[#1d1d1f] lg:flex`} aria-hidden="true">
                <span className={toolButton}><NewFolderIcon /></span>
                <span className={toolButton}><TrashIcon /></span>
                <span className={toolButton}><ArchiveIcon /></span>
                <span className={toolButton}><TagIcon /></span>
              </div>
              <a href={`mailto:${site.email}`} aria-label="Email me" title="Email me" className={`${pill} ${toolButton} max-sm:hidden`}>
                <ComposeIcon />
              </a>
              <label className={`${pill} w-[130px] gap-1.5 px-3 text-[#6e6e73] focus-within:ring-2 focus-within:ring-selection/40 max-sm:w-[110px]`}>
                <SearchGlyph />
                <span className="sr-only">Search in {title}</span>
                <input
                  ref={searchRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search"
                  className="w-full min-w-0 bg-transparent text-[13px] text-[#1d1d1f] outline-none placeholder:text-[#6e6e73] [&::-webkit-search-cancel-button]:hidden"
                />
              </label>
            </div>

            {/* Mobile folder switcher (sidebar is hidden on small screens) */}
            <ul className="flex shrink-0 gap-1.5 overflow-x-auto px-3 pt-3 sm:hidden" aria-label="Folders">
              {finderFolders.map((f) => (
                <li key={f.id}>
                  <button
                    type="button"
                    onClick={() => go(f.id)}
                    className={`rounded-full px-3 py-1.5 text-[12px] font-medium whitespace-nowrap ${f.id === folder.id ? "bg-[#d8d8d8]" : "bg-[#f2f2f2]"}`}
                  >
                    {f.sidebarLabel}
                  </button>
                </li>
              ))}
            </ul>

            {/* Contents */}
            <div
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
              onPointerDown={(e: PointerEvent) => (pointerType.current = e.pointerType)}
            >
              <div key={location} className="animate-[finder-in_260ms_var(--ease-out-soft)] px-2 pt-[22px] pb-28 sm:px-4 sm:pb-6">
                {visible.length > 0 ? (
                  <ul className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-x-2 gap-y-5 max-sm:grid-cols-2" aria-label={`Contents of ${title}`}>
                    {visible.map((project) => (
                      <li key={project.id}>
                        <ProjectTile project={project} onOpen={(el) => openProject(project, el)} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="grid place-items-center gap-2 pt-24 text-center text-[13px] text-[#8a8a8e]">
                    {query ? (
                      <p>No results for “{query}”</p>
                    ) : (
                      <>
                        <p>This folder is empty — new work is on its way.</p>
                        <a href={site.behance} target="_blank" rel="noopener noreferrer" className="text-selection hover:underline">
                          See more on Behance
                        </a>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {preview && videos[preview.index] && (
        <QuickLook
          videos={videos}
          index={preview.index}
          from={preview.from}
          onIndexChange={(index) => setPreview({ index, from: null })}
          onClose={() => setPreview(null)}
        />
      )}
    </MacWindow>
  );
}

/**
 * A project in the Finder grid: its thumbnail (or a folder icon) and title. One click opens it —
 * the Vimeo player for video projects, otherwise the Behance page in a new tab.
 */
function ProjectTile({ project, onOpen }: { project: Project; onOpen: (el: HTMLElement) => void }) {
  const isVideo = !!vimeoEmbedUrl(project.vimeo);
  const hint = isVideo ? "Play video" : project.behance ? "Open on Behance" : "Coming soon";
  const disabled = !isVideo && !project.behance;

  return (
    <button
      type="button"
      onClick={(e) => onOpen(e.currentTarget)}
      aria-disabled={disabled}
      title={hint}
      aria-label={`${project.title} — ${hint}`}
      className="group flex w-full cursor-pointer flex-col items-center gap-1.5 outline-none select-none aria-disabled:cursor-default"
    >
      <span className="relative grid aspect-[4/3] w-full max-w-[168px] place-items-center rounded-[10px] p-1.5 transition-colors duration-150 group-hover:bg-black/5 group-focus-visible:bg-black/8">
        {project.thumbnail ? (
          <span className="relative block size-full overflow-hidden rounded-[6px] shadow-[0_0_0_0.5px_rgb(0_0_0/0.15),0_2px_6px_rgb(0_0_0/0.18)] transition-transform duration-200 ease-out-soft group-hover:scale-[1.03] group-active:scale-[0.97]">
            <Image src={project.thumbnail} alt="" fill sizes="(max-width: 640px) 45vw, 168px" className="object-cover" />
          </span>
        ) : (
          <Image
            src={finderFolder}
            alt=""
            className="h-[78%] w-auto transition-transform duration-200 ease-out-soft group-hover:scale-105 group-active:scale-95"
          />
        )}
        {isVideo && (
          <span className="absolute right-3 bottom-3">
            <PlayGlyph />
          </span>
        )}
      </span>
      <span className="max-w-[160px] rounded-[4px] px-1.5 text-center text-[12px] leading-[16px] font-semibold break-words text-[#1d1d1f] transition-colors group-focus-visible:bg-selection group-focus-visible:text-white">
        {project.title}
      </span>
    </button>
  );
}
