"use client";

import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";

import { vimeoEmbedUrl, type Project } from "@/content/projects";

import { ChevronLeft, ChevronRight, CloseGlyph } from "./finder-icons";

type Props = {
  /** Video projects in the current folder (each has a valid Vimeo link). */
  videos: Project[];
  index: number;
  /** Thumbnail the preview zooms out of. */
  from: DOMRect | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
};

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

const ExpandGlyph = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9.5 2.5h4v4M6.5 13.5h-4v-4M13.5 2.5 9 7M2.5 13.5 7 9" />
  </svg>
);
const CollapseGlyph = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M13 7H9V3M3 9h4v4M9 7l4.5-4.5M7 9l-4.5 4.5" />
  </svg>
);

/**
 * macOS Quick Look-style video player: zooms out of the project tile, plays the Vimeo embed,
 * ←/→ flips between the folder's videos, Esc closes.
 *
 * Full screen (button, F key, or double-click the title bar) works like QuickTime on macOS: the
 * player grows to fill the screen on black, and the title bar floats over the video and fades away
 * after a moment — move the pointer to the top edge to bring it back.
 */
export function QuickLook({ videos, index, from, onIndexChange, onClose }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<Element | null>(null);
  const video = videos[index];
  const src = vimeoEmbedUrl(video.vimeo);
  const player = src ? `${src}${src.includes("?") ? "&" : "?"}autoplay=1&title=0&byline=0&portrait=0&dnt=1` : null;

  const [full, setFull] = useState(false);
  const [chrome, setChrome] = useState(true);
  const hideTimer = useRef<number | null>(null);
  const before = useRef<DOMRect | null>(null);

  useLayoutEffect(() => {
    returnFocus.current = document.activeElement;
    const el = panel.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    const start = from
      ? `translate(${from.left + from.width / 2 - (box.left + box.width / 2)}px, ${from.top + from.height / 2 - (box.top + box.height / 2)}px) scale(${from.width / box.width})`
      : "scale(0.9)";
    el.animate([{ transform: start, opacity: 0 }, { transform: "none", opacity: 1 }], {
      duration: reducedMotion() ? 1 : 380,
      easing: EASE,
    });
    closeBtn.current?.focus({ preventScroll: true });
    // Run once on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(
    () => () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      if (returnFocus.current instanceof HTMLElement) returnFocus.current.focus({ preventScroll: true });
    },
    [],
  );

  // Smoothly morph between the window and full-screen frames (FLIP).
  useLayoutEffect(() => {
    const el = panel.current;
    const prev = before.current;
    before.current = null;
    if (!el || !prev || reducedMotion()) return;
    const next = el.getBoundingClientRect();
    const dx = prev.left - next.left;
    const dy = prev.top - next.top;
    el.animate(
      [
        { transformOrigin: "top left", transform: `translate(${dx}px, ${dy}px) scale(${prev.width / next.width}, ${prev.height / next.height})` },
        { transformOrigin: "top left", transform: "none" },
      ],
      { duration: 420, easing: EASE },
    );
  }, [full]);

  // Leaving the browser's full screen (e.g. its own Esc) also leaves our full-screen layout.
  useEffect(() => {
    const sync = () => {
      if (!document.fullscreenElement && full) {
        before.current = panel.current?.getBoundingClientRect() ?? null;
        setFull(false);
      }
    };
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, [full]);

  /** Shows the floating title bar, then hides it again after a pause (full screen only). */
  function revealChrome() {
    setChrome(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setChrome(false), 2500);
  }

  function toggleFull() {
    before.current = panel.current?.getBoundingClientRect() ?? null;
    if (!full) {
      setFull(true);
      revealChrome();
      // Real full screen where the browser allows it; otherwise the layout alone fills the window.
      root.current?.requestFullscreen?.().catch(() => {});
    } else {
      setFull(false);
      setChrome(true);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    }
  }

  function dismiss() {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
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
    if (e.key === "Escape") {
      e.preventDefault();
      if (full) toggleFull();
      else dismiss();
    } else if (e.key.toLowerCase() === "f" && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      toggleFull();
    } else if (e.key === "ArrowRight" && index < videos.length - 1) onIndexChange(index + 1);
    else if (e.key === "ArrowLeft" && index > 0) onIndexChange(index - 1);
  }

  const iconButton = "grid size-7 place-items-center rounded-full text-white/85 hover:bg-white/10 disabled:opacity-30";

  return createPortal(
    <div
      ref={root}
      className={`fixed inset-0 z-[60] grid animate-[fade-in_200ms_ease-out] place-items-center transition-[background-color,padding] duration-300 ${
        full ? "bg-black p-0" : "bg-black/25 p-4 backdrop-blur-[2px]"
      }`}
      onClick={(e) => e.target === e.currentTarget && !full && dismiss()}
      onKeyDown={onKeyDown}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={`Video: ${video.title}`}
        data-full={full}
        className={
          full
            ? "fixed inset-0 flex flex-col bg-black text-white"
            : "flex w-[min(1000px,94vw,calc((88dvh-44px)*16/9))] flex-col overflow-hidden rounded-[16px] bg-[#1e1e1e]/92 text-white shadow-[0_0_0_0.5px_rgb(255_255_255/0.15),0_30px_80px_rgb(0_0_0/0.5)] backdrop-blur-2xl"
        }
      >
        {/* In full screen, an invisible strip along the top edge brings the title bar back
            (pointer moves over the video itself go to Vimeo's iframe, not to this page). */}
        {full && <div aria-hidden="true" className="absolute inset-x-0 top-0 z-10 h-16" onPointerEnter={revealChrome} onPointerMove={revealChrome} />}

        <div
          onDoubleClick={(e) => (e.target as HTMLElement).closest("button, a") || toggleFull()}
          onPointerMove={full ? revealChrome : undefined}
          onFocus={full ? revealChrome : undefined}
          className={`flex h-11 shrink-0 items-center gap-2 px-3 select-none ${
            full
              ? `absolute inset-x-0 top-0 z-20 h-14 bg-linear-to-b from-black/75 to-transparent px-4 transition-opacity duration-300 ${
                  chrome ? "opacity-100" : "pointer-events-none opacity-0"
                }`
              : ""
          }`}
        >
          <button ref={closeBtn} type="button" onClick={dismiss} aria-label="Close preview" className={iconButton}>
            <CloseGlyph />
          </button>
          <button
            type="button"
            onClick={toggleFull}
            aria-label={full ? "Exit full screen" : "Enter full screen"}
            title={full ? "Exit Full Screen (F)" : "Enter Full Screen (F)"}
            className={iconButton}
          >
            {full ? <CollapseGlyph /> : <ExpandGlyph />}
          </button>
          <p className="min-w-0 flex-1 truncate text-center text-[13px] font-semibold">{video.title}</p>
          {video.behance && (
            <a
              href={video.behance}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-white/10 px-3 py-1 text-[12px] font-medium whitespace-nowrap hover:bg-white/20"
            >
              View on Behance ↗
            </a>
          )}
          <span className="text-[12px] text-white/50 tabular-nums">
            {index + 1} / {videos.length}
          </span>
          <button type="button" aria-label="Previous" disabled={index === 0} onClick={() => onIndexChange(index - 1)} className={iconButton}>
            <ChevronLeft />
          </button>
          <button type="button" aria-label="Next" disabled={index === videos.length - 1} onClick={() => onIndexChange(index + 1)} className={iconButton}>
            <ChevronRight />
          </button>
        </div>

        <div
          key={index}
          className={`relative animate-[fade-in_220ms_ease-out] bg-black ${full ? "min-h-0 flex-1" : "aspect-video w-full"}`}
        >
          {player && (
            <iframe
              src={player}
              title={video.title}
              // Same permissions and referrer policy as Vimeo's own embed code; the referrer is how
              // Vimeo checks domain-restricted videos.
              allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              className="absolute inset-0 size-full"
            />
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
