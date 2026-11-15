import type { SVGProps } from "react";

/** SF Symbol-style line icons for the Finder window (drawn to match the reference). */
const stroke = (size: number): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: "0 0 20 20",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
});

export const FolderOutline = ({ size = 16 }: { size?: number }) => (
  <svg {...stroke(size)} strokeWidth={1.4}>
    <path d="M2.5 5.2c0-.9.7-1.6 1.6-1.6h3.4l1.7 1.8h6.7c.9 0 1.6.7 1.6 1.6v7.6c0 .9-.7 1.6-1.6 1.6H4.1c-.9 0-1.6-.7-1.6-1.6z" />
    <path d="M2.5 7.6h15" />
  </svg>
);

export const ChevronLeft = () => (
  <svg {...stroke(20)} strokeWidth={1.8}>
    <path d="M12.5 4 6.5 10l6 6" />
  </svg>
);

export const ChevronRight = () => (
  <svg {...stroke(20)} strokeWidth={1.8}>
    <path d="m7.5 4 6 6-6 6" />
  </svg>
);

export const NewFolderIcon = () => (
  <svg {...stroke(20)}>
    <path d="M2.5 5.2c0-.9.7-1.6 1.6-1.6h3.4l1.7 1.8h6.7c.9 0 1.6.7 1.6 1.6v7.6c0 .9-.7 1.6-1.6 1.6H4.1c-.9 0-1.6-.7-1.6-1.6z" />
    <path d="M2.5 7.6h15" />
  </svg>
);

export const TrashIcon = () => (
  <svg {...stroke(20)}>
    <path d="M3.5 5h13M8 5V3.5h4V5M5 5l.8 11a1.5 1.5 0 0 0 1.5 1.4h5.4a1.5 1.5 0 0 0 1.5-1.4L15 5" />
    <path d="M8.3 8v6.5M11.7 8v6.5" />
  </svg>
);

export const ArchiveIcon = () => (
  <svg {...stroke(20)}>
    <rect x="2.5" y="3.5" width="15" height="4" rx="1" />
    <path d="M4 7.5v7.5a1.5 1.5 0 0 0 1.5 1.5h9A1.5 1.5 0 0 0 16 15V7.5M8 11h4" />
  </svg>
);

export const TagIcon = () => (
  <svg {...stroke(20)}>
    <path d="M10.6 2.8h5.1c.8 0 1.5.7 1.5 1.5v5.1c0 .4-.2.8-.4 1.1l-6.6 6.6a1.5 1.5 0 0 1-2.1 0l-4.6-4.6a1.5 1.5 0 0 1 0-2.1l6.6-6.6c.3-.3.7-.4 1.1-.4Z" />
    <circle cx="13.6" cy="6.4" r="1.1" />
  </svg>
);

export const ComposeIcon = () => (
  <svg {...stroke(20)}>
    <path d="M9 3.5H5A1.5 1.5 0 0 0 3.5 5v10A1.5 1.5 0 0 0 5 16.5h10a1.5 1.5 0 0 0 1.5-1.5v-4" />
    <path d="m15.4 3.2 1.4 1.4-7.3 7.3-2.1.7.7-2.1z" />
  </svg>
);

export const SearchGlyph = () => (
  <svg {...stroke(16)} strokeWidth={1.7}>
    <circle cx="8.6" cy="8.6" r="5.1" />
    <path d="m12.4 12.4 4.3 4.3" />
  </svg>
);

export const PlayGlyph = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" aria-hidden="true">
    <circle cx="10" cy="10" r="9" fill="rgb(0 0 0 / 0.55)" />
    <path d="M8 6.3v7.4l6-3.7z" fill="#fff" />
  </svg>
);

export const LinkDoc = () => (
  <svg width="46" height="56" viewBox="0 0 46 56" aria-hidden="true">
    <path d="M4 3a3 3 0 0 1 3-3h23l12 12v41a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z" fill="#fff" stroke="#d0d0d0" />
    <path d="M30 0v9a3 3 0 0 0 3 3h9" fill="#f1f1f1" stroke="#d0d0d0" />
    <circle cx="23" cy="33" r="9" fill="none" stroke="#1f6fd6" strokeWidth="1.6" />
    <path d="M14 33h18M23 24c3 3 3 15 0 18m0-18c-3 3-3 15 0 18" fill="none" stroke="#1f6fd6" strokeWidth="1.3" />
  </svg>
);

export const CloseGlyph = () => (
  <svg {...stroke(14)} strokeWidth={1.8}>
    <path d="m5 5 10 10m0-10L5 15" />
  </svg>
);
