"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";

import type { Media } from "@/content/site";

import { ChevronLeft, ChevronRight, CloseGlyph } from "./finder-icons";

type Previewable = Exclude<Media, { type: "link" }>;

type Props = {
  files: Previewable[];
  index: number;
  /** Thumbnail the preview zooms out of. */
  from: DOMRect | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
};

/** macOS Quick Look: zooms out of the thumbnail, ←/→ to flip through, Space or Esc to close. */
export function QuickLook({ files, index, from, onIndexChange, onClose }: Props) {
  const panel = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<Element | null>(null);
  const file = files[index];

  useLayoutEffect(() => {
    returnFocus.current = document.activeElement;
    const el = panel.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    const quick = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = from
      ? `translate(${from.left + from.width / 2 - (box.left + box.width / 2)}px, ${from.top + from.height / 2 - (box.top + box.height / 2)}px) scale(${from.width / box.width})`
      : "scale(0.9)";
    el.animate([{ transform: start, opacity: 0 }, { transform: "none", opacity: 1 }], {
      duration: quick ? 1 : 380,
      easing: "cubic-bezier(0.16, 1, 0.3, 1)",
    });
    closeBtn.current?.focus({ preventScroll: true });
    // Run once on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(
    () => () => {
      if (returnFocus.current instanceof HTMLElement) returnFocus.current.focus({ preventScroll: true });
    },
    [],
  );

  function dismiss() {
    const el = panel.current;
    if (!el) return onClose();
    el.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "scale(0.92)" }], {
      duration: 180,
      easing: "ease-in",
      fill: "forwards",
    }).onfinish = onClose;
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    e.stopPropagation();
    if (e.key === "Escape" || (e.key === " " && !(e.target instanceof HTMLVideoElement))) {
      e.preventDefault();
      dismiss();
    } else if (e.key === "ArrowRight" && index < files.length - 1) onIndexChange(index + 1);
    else if (e.key === "ArrowLeft" && index > 0) onIndexChange(index - 1);
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[60] grid animate-[fade-in_200ms_ease-out] place-items-center bg-black/25 p-4 backdrop-blur-[2px]"
      onClick={(e) => e.target === e.currentTarget && dismiss()}
      onKeyDown={onKeyDown}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={`Quick Look: ${file.name}`}
        className="flex max-h-[88dvh] w-[min(1000px,94vw)] flex-col overflow-hidden rounded-[16px] bg-[#1e1e1e]/92 text-white shadow-[0_0_0_0.5px_rgb(255_255_255/0.15),0_30px_80px_rgb(0_0_0/0.5)] backdrop-blur-2xl"
      >
        <div className="flex h-11 shrink-0 items-center gap-2 px-3">
          <button
            ref={closeBtn}
            type="button"
            onClick={dismiss}
            aria-label="Close preview"
            className="grid size-7 place-items-center rounded-full text-white/80 hover:bg-white/10"
          >
            <CloseGlyph />
          </button>
          <p className="min-w-0 flex-1 truncate text-center text-[13px] font-semibold">{file.name}</p>
          <span className="text-[12px] text-white/50 tabular-nums">
            {index + 1} / {files.length}
          </span>
          <button type="button" aria-label="Previous" disabled={index === 0} onClick={() => onIndexChange(index - 1)} className="grid size-7 place-items-center rounded-full hover:bg-white/10 disabled:opacity-30">
            <ChevronLeft />
          </button>
          <button type="button" aria-label="Next" disabled={index === files.length - 1} onClick={() => onIndexChange(index + 1)} className="grid size-7 place-items-center rounded-full hover:bg-white/10 disabled:opacity-30">
            <ChevronRight />
          </button>
        </div>
        <div key={index} className="relative grid min-h-[min(60dvh,520px)] flex-1 animate-[fade-in_220ms_ease-out] place-items-center bg-black/40">
          {file.type === "image" ? (
            <Image
              src={file.src}
              alt={file.alt}
              sizes="94vw"
              placeholder={file.src.blurDataURL ? "blur" : "empty"}
              className="max-h-[calc(88dvh-44px)] w-auto object-contain"
            />
          ) : (
            <video
              src={file.src}
              poster={file.poster?.src}
              controls
              autoPlay
              playsInline
              className="max-h-[calc(88dvh-44px)] w-full"
            />
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
