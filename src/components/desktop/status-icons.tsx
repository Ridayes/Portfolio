import type { SVGProps } from "react";

/** Lightweight stand-ins for the SF Symbols used in the menu bar (wifi, search, account, control centre). */
const base: SVGProps<SVGSVGElement> = {
  width: 16,
  height: 16,
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

export function WifiIcon() {
  return (
    <svg {...base}>
      <path d="M1.6 5.9a9.4 9.4 0 0 1 12.8 0" />
      <path d="M3.9 8.5a6 6 0 0 1 8.2 0" />
      <path d="M6.1 11a2.7 2.7 0 0 1 3.8 0" />
      <circle cx="8" cy="13.1" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function SearchIcon() {
  return (
    <svg {...base} strokeWidth={1.7}>
      <circle cx="6.8" cy="6.8" r="4.3" />
      <path d="m10.1 10.1 3.6 3.6" />
    </svg>
  );
}

export function AccountIcon() {
  return (
    <svg {...base} strokeWidth={1.4}>
      <circle cx="8" cy="8" r="6.4" />
      <circle cx="8" cy="6.6" r="2.1" fill="currentColor" stroke="none" />
      <path d="M4.2 12.8c.9-1.6 2.2-2.4 3.8-2.4s2.9.8 3.8 2.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ControlCenterIcon() {
  return (
    <svg {...base} strokeWidth={1.3}>
      <rect x="1.8" y="2.4" width="12.4" height="4.8" rx="2.4" />
      <circle cx="11.8" cy="4.8" r="1.5" fill="currentColor" stroke="none" />
      <rect x="1.8" y="8.8" width="12.4" height="4.8" rx="2.4" fill="currentColor" />
      <circle cx="4.2" cy="11.2" r="1.5" fill="#fff" stroke="none" />
    </svg>
  );
}
