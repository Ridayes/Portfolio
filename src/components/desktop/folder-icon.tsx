"use client";

import Image from "next/image";
import { useRef, type CSSProperties, type MouseEvent } from "react";

import folderIcon from "@/assets/system/folder.png";
import type { Folder } from "@/content/site";

type Props = {
  folder: Folder;
  index: number;
  selected: boolean;
  onSelect: (id: string) => void;
  onOpen: (id: string, origin: Element | null) => void;
};

/**
 * A Finder-style desktop folder: 78px icon with a 15px semibold label tucked 9px under it.
 * Mouse: click selects, double-click opens. Touch and keyboard (Enter/Space) open directly.
 */
export function FolderIcon({ folder, index, selected, onSelect, onOpen }: Props) {
  const iconRef = useRef<HTMLSpanElement>(null);
  const pointerType = useRef("mouse");

  const style = {
    "--x": folder.x,
    "--y": folder.y,
    "--lw": folder.labelWidth ?? 78,
    animationDelay: `${320 + index * 70}ms`,
  } as CSSProperties;

  function onClick(e: MouseEvent) {
    if (pointerType.current !== "mouse" || e.detail === 0) onOpen(folder.id, iconRef.current);
    else onSelect(folder.id);
  }

  return (
    <li
      style={style}
      className="flex animate-pop justify-center desk:absolute desk:top-[calc(var(--y)*var(--u))] desk:left-[calc(var(--x)*var(--u))] desk:w-[calc(78*var(--u))]"
    >
      <button
        type="button"
        data-desktop-icon
        aria-haspopup="dialog"
        aria-pressed={selected}
        onPointerDown={(e) => (pointerType.current = e.pointerType)}
        onClick={onClick}
        onDoubleClick={() => onOpen(folder.id, iconRef.current)}
        className="group flex cursor-default flex-col items-center outline-none"
      >
        <span
          ref={iconRef}
          className={`relative block size-[clamp(60px,18vw,78px)] rounded-[6px] transition-[background-color,transform] duration-200 ease-out-soft group-hover:-translate-y-0.5 group-focus-visible:bg-black/10 group-active:translate-y-0 group-active:scale-95 desk:size-[calc(78*var(--u))] ${selected ? "bg-black/10" : ""}`}
        >
          <Image
            src={folderIcon}
            alt=""
            className="size-full object-contain"
            sizes="(min-width: 1024px) 5.2vw, 78px"
            priority={index < 2}
          />
        </span>
        <span className="-mt-[9px] w-[max(96px,calc(var(--lw)*1px))] text-center text-[15px] leading-[1.2] font-semibold desk:w-[calc(var(--lw)*var(--u))] desk:text-[max(12px,calc(15*var(--u)))]">
          <span
            className={`-mx-1 rounded-[4px] px-1 box-decoration-clone transition-colors group-focus-visible:bg-selection group-focus-visible:text-white ${selected ? "bg-selection text-white" : ""}`}
          >
            {folder.label}
          </span>
        </span>
      </button>
    </li>
  );
}
