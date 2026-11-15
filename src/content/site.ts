import type { StaticImageData } from "next/image";

import afterEffects from "@/assets/dock/after-effects.png";
import behance from "@/assets/dock/behance.png";
import clipStudio from "@/assets/dock/clip-studio.png";
import discord from "@/assets/dock/discord.png";
import figma from "@/assets/dock/figma.png";
import finder from "@/assets/dock/finder.png";
import dockFolder from "@/assets/dock/folder.png";
import illustrator from "@/assets/dock/illustrator.png";
import photoshop from "@/assets/dock/photoshop.png";
import premiere from "@/assets/dock/premiere.png";
import safari from "@/assets/dock/safari.png";
import trash from "@/assets/dock/trash.png";

export const site = {
  name: "Hridayesh Neupane",
  alias: "Softcore",
  title: "Hridayesh’s Portfolio",
  role: "Graphic designer & motion artist",
  location: "Kirtipur, Kathmandu, Nepal",
  description:
    "Portfolio of Hridayesh Neupane (Softcore) — graphic designer and motion artist from Kathmandu, Nepal, working across branding, motion graphics, video editing, illustration and social media design.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  email: "ridayesh02@gmail.com",
  behance: "https://www.behance.net/softcore",
} as const;

/* ------------------------------------------------------------------ */
/* Desktop folders                                                     */
/* ------------------------------------------------------------------ */

type DesktopPlacement = {
  id: string;
  /** Label under the desktop icon. */
  label: string;
  /** Top-left of the icon in the 1512 × 982 Figma frame. */
  x: number;
  y: number;
  /** Label box width in the design, when it differs from the 78px icon. */
  labelWidth?: number;
};

/** Opens the small "About me" utility panel. */
export type PanelFolder = DesktopPlacement & {
  kind: "panel";
  paragraphs: string[];
};

/** Opens a Finder window. Its projects live in projects.json (edit them at /admin). */
export type FinderFolder = DesktopPlacement & {
  kind: "finder";
  /** Name in the Finder sidebar. */
  sidebarLabel: string;
};

export type Folder = PanelFolder | FinderFolder;

export const folders: Folder[] = [
  {
    kind: "panel",
    id: "about",
    label: "About me",
    x: 27.49,
    y: 54,
    paragraphs: [
      "I don’t just edit videos. I create identity.",
      "I’m Hridayesh Neupane, a video editor and motion artist from Kathmandu. With a background in branding and design, I shape every frame, from color and type to pacing and motion, so your video looks and feels unmistakably like you.",
      "Let’s build your look.",
    ],
  },
  {
    kind: "finder",
    id: "social-media",
    label: "Social media designs",
    sidebarLabel: "Social media designs",
    x: 849.79,
    y: 179.04,
    labelWidth: 123.04,
  },
  {
    kind: "finder",
    id: "video-editing",
    label: "Video Editing",
    sidebarLabel: "Video Edits",
    x: 1066,
    y: 220,
  },
  {
    kind: "finder",
    id: "branding",
    label: "Branding projects",
    sidebarLabel: "Branding Projects",
    x: 1084.5,
    y: 383,
  },
  {
    kind: "finder",
    id: "motion-graphics",
    label: "Motion graphics",
    sidebarLabel: "Motion Graphics",
    x: 942.5,
    y: 537,
  },
  {
    kind: "finder",
    id: "illustration",
    label: "Illustration",
    sidebarLabel: "Illustration",
    x: 718.35,
    y: 587,
    labelWidth: 118.59,
  },
];

/** Finder sidebar order, matching the reference window. */
export const sidebarOrder = [
  "video-editing",
  "branding",
  "motion-graphics",
  "social-media",
  "illustration",
] as const;

export const finderFolders = sidebarOrder.map(
  (id) => folders.find((f): f is FinderFolder => f.kind === "finder" && f.id === id)!,
);

export const getFolder = (id: string) => folders.find((f) => f.id === id);

/* ------------------------------------------------------------------ */
/* Dock                                                                */
/* ------------------------------------------------------------------ */

export type DockApp = {
  name: string;
  icon: StaticImageData;
  /** Offset of the rendered icon (which includes its drop shadow) inside the 36px dock slot. */
  top: number;
  href?: string;
  /** Folder to open in Finder (or the frontmost Finder window, if one is open). */
  opens?: string;
};

export const dockApps: DockApp[] = [
  { name: "Finder", icon: finder, top: 0, opens: "video-editing" },
  { name: "Photoshop", icon: photoshop, top: -4.5 },
  { name: "Premiere Pro", icon: premiere, top: -4.92 },
  { name: "Illustrator", icon: illustrator, top: -5 },
  { name: "Figma", icon: figma, top: 0 },
  { name: "Clip Studio Paint", icon: clipStudio, top: -4 },
  { name: "After Effects", icon: afterEffects, top: -5 },
  { name: "Discord", icon: discord, top: -4 },
  { name: "Behance", icon: behance, top: -2.5, href: site.behance },
  { name: "Safari", icon: safari, top: 0 },
];

export const dockUtilities: DockApp[] = [
  { name: "Downloads", icon: dockFolder, top: 0 },
  { name: "Trash", icon: trash, top: 0 },
];

/** Design frame size, used to convert Figma coordinates into responsive units. */
export const FRAME = { width: 1512, height: 982 } as const;
