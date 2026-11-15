"use client";

import Image from "next/image";
import { useMemo, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent } from "react";

import finderFolder from "@/assets/system/finder-folder.png";
import { finderFolders, getFolder, site, type FinderFolder, type Media, type Project } from "@/content/site";

import {
  ArchiveIcon,
  ChevronLeft,
  ChevronRight,
  ComposeIcon,
  FolderOutline,
  LinkDoc,
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

/** "branding" (a category) or "branding/ag-visual" (a project inside it). */
type Location = string;

type Item =
  | { key: string; kind: "project"; name: string; project: Project }
  | { key: string; kind: "file"; name: string; file: Media };

function resolve(location: Location) {
  const [folderId, projectId] = location.split("/");
  const folder = getFolder(folderId) as FinderFolder;
  const project = projectId ? folder.projects.find((p) => p.id === projectId) : undefined;
  const items: Item[] = project
    ? project.files.map((file, i) => ({ key: `${i}-${file.name}`, kind: "file", name: file.name, file }))
    : folder.projects.map((p) => ({ key: p.id, kind: "project", name: p.title, project: p }));
  return { folder, project, title: project?.title ?? folder.sidebarLabel, items };
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
  const { folder, project, title, items } = resolve(location);

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ index: number; from: DOMRect | null } | null>(null);
  const pointerType = useRef<string>("mouse");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? items.filter((i) => i.name.toLowerCase().includes(q)) : items;
  }, [items, query]);

  type FileItem = Extract<Item, { kind: "file" }> & { file: Exclude<Media, { type: "link" }> };
  const previewable = visible.filter(
    (i): i is FileItem => i.kind === "file" && i.file.type !== "link",
  );

  function go(next: Location) {
    if (next === location) return;
    setHistory(({ stack, index }) => ({ stack: [...stack.slice(0, index + 1), next], index: index + 1 }));
    setQuery("");
    setSelected(null);
  }

  const canBack = history.index > 0;
  const canForward = history.index < history.stack.length - 1;
  const step = (delta: number) => {
    setHistory((h) => ({ ...h, index: Math.min(Math.max(h.index + delta, 0), h.stack.length - 1) }));
    setQuery("");
    setSelected(null);
  };

  function openItem(item: Item, el: HTMLElement | null) {
    if (item.kind === "project") return go(`${folder.id}/${item.project.id}`);
    if (item.file.type === "link") return void window.open(item.file.href, "_blank", "noopener,noreferrer");
    const index = previewable.findIndex((p) => p.key === item.key);
    setPreview({ index, from: el?.getBoundingClientRect() ?? null });
  }

  function onItemClick(item: Item, e: MouseEvent<HTMLButtonElement>) {
    // Mouse: click selects, double-click opens (like Finder). Touch and keyboard open right away.
    if (pointerType.current === "touch" || e.detail === 0) openItem(item, e.currentTarget);
    else setSelected(item.key);
  }

  function onItemKey(item: Item, e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === " " && item.kind === "file") {
      e.preventDefault();
      openItem(item, e.currentTarget);
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
                      aria-current={current && !project ? "page" : undefined}
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
              onPointerDown={(e: PointerEvent) => {
                pointerType.current = e.pointerType;
                if (e.target === e.currentTarget) setSelected(null);
              }}
            >
              <div key={location} className="animate-[finder-in_260ms_var(--ease-out-soft)] px-2 pt-[22px] pb-28 sm:px-4 sm:pb-6">
                {visible.length > 0 ? (
                  <ul className="grid grid-cols-[repeat(auto-fill,90px)] gap-y-3" aria-label={`Contents of ${title}`}>
                    {visible.map((item) => (
                      <li key={item.key}>
                        <ItemTile
                          item={item}
                          selected={selected === item.key}
                          onClick={(e) => onItemClick(item, e)}
                          onDoubleClick={(e) => openItem(item, e.currentTarget)}
                          onKeyDown={(e) => onItemKey(item, e)}
                        />
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
                        <a href={project?.href ?? site.behance} target="_blank" rel="noopener noreferrer" className="text-selection hover:underline">
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

      {preview && previewable.length > 0 && (
        <QuickLook
          files={previewable.map((p) => p.file)}
          index={preview.index}
          from={preview.from}
          onIndexChange={(index) => setPreview({ index, from: null })}
          onClose={() => setPreview(null)}
        />
      )}
    </MacWindow>
  );
}

function ItemTile({
  item,
  selected,
  onClick,
  onDoubleClick,
  onKeyDown,
}: {
  item: Item;
  selected: boolean;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
  onDoubleClick: (e: MouseEvent<HTMLButtonElement>) => void;
  onKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => void;
}) {
  const hint =
    item.kind === "project" ? "Folder" : item.file.type === "link" ? "Opens in a new tab" : "Press Space to preview";
  return (
    <button
      type="button"
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onKeyDown={onKeyDown}
      aria-pressed={selected}
      title={hint}
      className="group flex w-[90px] cursor-default flex-col items-center gap-[3px] outline-none select-none"
    >
      <span
        className={`grid h-[60px] w-[72px] place-items-center rounded-[6px] transition-colors duration-150 group-focus-visible:bg-black/8 ${selected ? "bg-black/8" : ""}`}
      >
        <Thumb item={item} />
      </span>
      <span
        className={`max-w-[86px] rounded-[4px] px-1 text-center text-[11px] leading-[14px] font-semibold break-words transition-colors ${selected ? "bg-selection text-white" : "text-[#1d1d1f] group-focus-visible:bg-selection group-focus-visible:text-white"}`}
      >
        {item.name}
      </span>
    </button>
  );
}

function Thumb({ item }: { item: Item }) {
  if (item.kind === "project") {
    return <Image src={finderFolder} alt="" className="h-[56px] w-auto transition-transform duration-200 ease-out-soft group-active:scale-95" />;
  }
  const { file } = item;
  if (file.type === "image") {
    return (
      <Image
        src={file.src}
        alt=""
        sizes="64px"
        className="max-h-[54px] w-auto max-w-[64px] rounded-[3px] object-contain shadow-[0_0_0_0.5px_rgb(0_0_0/0.15),0_1px_3px_rgb(0_0_0/0.15)]"
      />
    );
  }
  if (file.type === "video") {
    return (
      <span className="relative grid h-[44px] w-[64px] place-items-center overflow-hidden rounded-[3px] bg-[#1d1d1f] shadow-[0_1px_3px_rgb(0_0_0/0.2)]">
        {file.poster && <Image src={file.poster} alt="" fill sizes="64px" className="object-cover" />}
        <span className="relative"><PlayGlyph /></span>
      </span>
    );
  }
  return <LinkDoc />;
}
