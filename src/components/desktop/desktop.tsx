"use client";

import { useEffect, useState } from "react";

import { folders } from "@/content/site";

import { FolderIcon } from "./folder-icon";
import { useWindows } from "./window-manager";

/** Desktop folder icons with Finder-style selection. Windows render in <WindowLayer />. */
export function Desktop() {
  const { open } = useWindows();
  const [selected, setSelected] = useState<string | null>(null);

  // Clicking anywhere that isn't a desktop icon clears the selection, like macOS.
  useEffect(() => {
    const clear = (e: PointerEvent) => {
      if (!(e.target as Element).closest?.("[data-desktop-icon]")) setSelected(null);
    };
    document.addEventListener("pointerdown", clear);
    return () => document.removeEventListener("pointerdown", clear);
  }, []);

  return (
    <ul
      aria-label="Portfolio sections"
      className="mx-auto mt-10 grid w-full max-w-sm grid-cols-3 gap-x-2 gap-y-6 px-4 sm:max-w-lg desk:contents"
    >
      {folders.map((folder, index) => (
        <FolderIcon
          key={folder.id}
          folder={folder}
          index={index}
          selected={selected === folder.id}
          onSelect={setSelected}
          onOpen={(id, origin) => {
            setSelected(id);
            open(id, origin);
          }}
        />
      ))}
    </ul>
  );
}
