import Image from "next/image";
import type { CSSProperties } from "react";

import folderIcon from "@/assets/system/folder.png";
import type { Folder } from "@/content/site";

type Props = {
  folder: Folder;
  index: number;
  onOpen: (folder: Folder) => void;
};

/** A Finder-style desktop folder: 78px icon with a 15px semibold label tucked 9px under it. */
export function FolderIcon({ folder, index, onOpen }: Props) {
  const style = {
    "--x": folder.x,
    "--y": folder.y,
    "--lw": folder.labelWidth ?? 78,
    animationDelay: `${320 + index * 70}ms`,
  } as CSSProperties;

  return (
    <li
      style={style}
      className="flex animate-pop justify-center desk:absolute desk:top-[calc(var(--y)*var(--u))] desk:left-[calc(var(--x)*var(--u))] desk:w-[calc(78*var(--u))]"
    >
      <button
        type="button"
        onClick={() => onOpen(folder)}
        aria-haspopup="dialog"
        className="group flex cursor-default flex-col items-center outline-none"
      >
        <span className="relative block size-[clamp(60px,18vw,78px)] rounded-[6px] transition-[background-color,transform] duration-200 ease-out-soft group-hover:-translate-y-0.5 group-focus-visible:bg-black/10 group-active:translate-y-0 desk:size-[calc(78*var(--u))]">
          <Image
            src={folderIcon}
            alt=""
            className="size-full object-contain"
            sizes="(min-width: 1024px) 5.2vw, 78px"
            priority={index < 2}
          />
        </span>
        <span className="-mt-[9px] w-[max(96px,calc(var(--lw)*1px))] text-center text-[15px] leading-[1.2] font-semibold desk:w-[calc(var(--lw)*var(--u))] desk:text-[max(12px,calc(15*var(--u)))]">
          <span className="-mx-1 rounded-[4px] px-1 box-decoration-clone transition-colors group-focus-visible:bg-selection group-focus-visible:text-white">
            {folder.label}
          </span>
        </span>
      </button>
    </li>
  );
}
