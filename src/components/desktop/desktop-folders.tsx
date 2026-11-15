"use client";

import { useRef, useState } from "react";
import { flushSync } from "react-dom";

import { folders, type Folder } from "@/content/site";

import { FolderIcon } from "./folder-icon";
import { FolderWindow } from "./folder-window";

/** Desktop folder icons plus the single Finder window they open. */
export function DesktopFolders() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  // Kept after closing so the window's content stays put during its exit transition.
  const [active, setActive] = useState<Folder | null>(null);

  function open(folder: Folder) {
    flushSync(() => setActive(folder));
    dialogRef.current?.showModal();
  }

  return (
    <>
      <ul
        aria-label="Portfolio sections"
        className="mx-auto mt-10 grid w-full max-w-sm grid-cols-3 sm:max-w-lg gap-x-2 gap-y-6 px-4 desk:contents"
      >
        {folders.map((folder, index) => (
          <FolderIcon key={folder.id} folder={folder} index={index} onOpen={open} />
        ))}
      </ul>
      <FolderWindow ref={dialogRef} folder={active} />
    </>
  );
}
