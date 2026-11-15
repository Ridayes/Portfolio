"use client";

import Image from "next/image";
import type { MouseEvent, Ref } from "react";

import folderIcon from "@/assets/system/folder.png";
import { site, type Folder } from "@/content/site";

type Props = {
  ref: Ref<HTMLDialogElement>;
  folder: Folder | null;
};

/** macOS-style Finder window rendered in a native <dialog> (focus trap, Esc to close, top layer). */
export function FolderWindow({ ref, folder }: Props) {
  const titleId = "folder-window-title";

  // Clicking the backdrop (the dialog element itself, outside the panel) closes the window.
  function handleClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) event.currentTarget.close();
  }

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClick={handleClick}
      className="mac-window m-auto w-[min(760px,calc(100vw-24px))] max-w-none overflow-hidden rounded-[16px] border border-black/10 bg-white/90 p-0 text-ink shadow-[0_24px_70px_-12px_rgb(0_0_0/0.35),0_0_0_0.5px_rgb(0_0_0/0.2)] backdrop-blur-2xl backdrop:backdrop-blur-[2px]"
    >
      {folder && (
        <div className="flex max-h-[min(640px,calc(100dvh-120px))] flex-col">
          <header className="relative flex h-[52px] shrink-0 items-center border-b border-black/10 px-4">
            <form method="dialog" className="flex gap-2">
              <button
                aria-label="Close window"
                className="group grid size-3 place-items-center rounded-full bg-[#ff5f57] outline-offset-2 ring-[0.5px] ring-black/20 ring-inset"
              >
                <svg viewBox="0 0 8 8" className="size-[7px] opacity-0 transition-opacity group-hover:opacity-60 group-focus-visible:opacity-60" aria-hidden="true">
                  <path d="M1.5 1.5l5 5m0-5l-5 5" stroke="#4d0000" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              </button>
              <span aria-hidden="true" className="size-3 rounded-full bg-[#febc2e] ring-[0.5px] ring-black/20 ring-inset" />
              <span aria-hidden="true" className="size-3 rounded-full bg-[#28c840] ring-[0.5px] ring-black/20 ring-inset" />
            </form>
            <h2
              id={titleId}
              className="absolute inset-x-24 flex items-center justify-center gap-1.5 truncate text-[13px] font-bold"
            >
              <Image src={folderIcon} alt="" className="size-4" />
              {folder.label}
            </h2>
          </header>

          <div className="overflow-y-auto overscroll-contain p-6 sm:p-8">
            <p className="max-w-prose text-[15px] leading-relaxed text-black/75">{folder.summary}</p>

            {folder.id === "about" ? (
              <dl className="mt-6 grid gap-x-6 gap-y-3 text-[14px] sm:grid-cols-[auto_1fr]">
                <dt className="text-black/50">Role</dt>
                <dd>{site.role}</dd>
                <dt className="text-black/50">Based in</dt>
                <dd>{site.location}</dd>
                <dt className="text-black/50">Email</dt>
                <dd>
                  <a className="text-selection underline-offset-2 hover:underline" href={`mailto:${site.email}`}>
                    {site.email}
                  </a>
                </dd>
                <dt className="text-black/50">Behance</dt>
                <dd>
                  <a className="text-selection underline-offset-2 hover:underline" href={site.behance} target="_blank" rel="noopener noreferrer">
                    behance.net/softcore
                  </a>
                </dd>
              </dl>
            ) : folder.projects.length > 0 ? (
              <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {folder.projects.map((project) => (
                  <li key={project.title}>
                    <a
                      href={project.href ?? site.behance}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block rounded-lg outline-offset-4"
                    >
                      <div className="aspect-[4/3] overflow-hidden rounded-lg bg-black/5">
                        {project.cover && (
                          <Image
                            src={project.cover}
                            alt=""
                            placeholder="blur"
                            sizes="(min-width: 640px) 240px, 45vw"
                            className="size-full object-cover transition-transform duration-500 ease-out-soft group-hover:scale-[1.03]"
                          />
                        )}
                      </div>
                      <p className="mt-2 text-[13px] font-semibold">{project.title}</p>
                      {project.year && <p className="text-[12px] text-black/50">{project.year}</p>}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-6 text-[14px] text-black/60">
                Full case studies live on{" "}
                <a className="text-selection underline-offset-2 hover:underline" href={site.behance} target="_blank" rel="noopener noreferrer">
                  Behance
                </a>
                .
              </p>
            )}
          </div>
        </div>
      )}
    </dialog>
  );
}
