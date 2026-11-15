import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import appleLogo from "@/assets/system/apple.png";
import { site } from "@/content/site";

import { Clock } from "./clock";
import { AccountIcon, ControlCenterIcon, SearchIcon, WifiIcon } from "./status-icons";

const item =
  "flex h-6 items-center rounded-[4px] px-[11px] text-[13px] leading-4 font-semibold whitespace-nowrap";
const link = `${item} transition-colors hover:bg-black/10 focus-visible:bg-black/10 focus-visible:outline-none`;

function Status({ children, width }: { children: ReactNode; width: number }) {
  return (
    <span className={`${item} justify-center max-md:hidden`} style={{ width }} aria-hidden="true">
      {children}
    </span>
  );
}

/** macOS-style menu bar (34px tall, 10px side padding) from the Figma "Menu Bar" frame. */
export function MenuBar() {
  return (
    <header className="fixed inset-x-0 top-0 z-30">
      {/* Progressive blur band from the design (72px, masked to fade out). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[72px] bg-white/15 backdrop-blur-[30px] [mask-image:linear-gradient(to_bottom,black_30%,transparent)]"
      />
      <nav
        aria-label="Primary"
        className="relative flex h-[34px] items-center justify-between px-[10px] py-[5px]"
      >
        <ul className="flex items-center">
          <li className="flex h-6 w-[33px] items-center justify-center max-sm:hidden">
            <Image src={appleLogo} alt="" priority />
          </li>
          <li>
            <Link href="/" className={`${link} font-bold`}>
              {site.title}
            </Link>
          </li>
          <li>
            <a href={site.behance} target="_blank" rel="noopener noreferrer" className={link}>
              Behance
            </a>
          </li>
          <li>
            <a href={`mailto:${site.email}`} className={link}>
              Contact
            </a>
          </li>
        </ul>

        <div className="flex items-center">
          <Status width={40}>
            <WifiIcon />
          </Status>
          <Status width={38}>
            <SearchIcon />
          </Status>
          <Status width={38}>
            <AccountIcon />
          </Status>
          <Status width={38}>
            <ControlCenterIcon />
          </Status>
          <span className={item}>
            <Clock />
          </span>
        </div>
      </nav>
    </header>
  );
}
