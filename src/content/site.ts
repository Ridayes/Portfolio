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

export type Project = {
  title: string;
  /** Optional cover; put images in src/assets/projects and import them here. */
  cover?: StaticImageData;
  href?: string;
  year?: string;
};

export type Folder = {
  id: string;
  label: string;
  /** Top-left of the icon in the 1512 × 982 Figma frame. */
  x: number;
  y: number;
  /** Label box width in the design, when it differs from the 78px icon. */
  labelWidth?: number;
  summary: string;
  projects: Project[];
};

/**
 * Desktop folders, positioned exactly as in the Figma frame.
 * Add work to each `projects` array, e.g.
 *   { title: "AG Visual identity", cover: agCover, href: "https://www.behance.net/…", year: "2026" }
 */
export const folders: Folder[] = [
  {
    id: "about",
    label: "About me",
    x: 27.49,
    y: 54,
    summary:
      "I’m Hridayesh Neupane — also known as Softcore — a graphic designer and motion artist based in Kirtipur, Kathmandu. Over the last two years I’ve grown from intern to trainee to leaper at Kharaayo, where I also taught design courses, while running a freelance practice across branding, motion graphics, video editing and photography.",
    projects: [],
  },
  {
    id: "social-media",
    label: "Social media designs",
    x: 849.79,
    y: 179.04,
    labelWidth: 123.04,
    summary: "Campaign posts, carousels and content systems built for scroll-stopping feeds.",
    projects: [],
  },
  {
    id: "video-editing",
    label: "Video Editing",
    x: 1066,
    y: 220,
    summary: "Edits with pace and story, from long-form films to short-form reels.",
    projects: [],
  },
  {
    id: "branding",
    label: "Branding projects",
    x: 1084.5,
    y: 383,
    summary: "Identities, logo systems and brand guidelines.",
    projects: [],
  },
  {
    id: "motion-graphics",
    label: "Motion graphics",
    x: 942.5,
    y: 537,
    summary: "Animated logos, kinetic type and explainers made in After Effects.",
    projects: [],
  },
  {
    id: "illustration",
    label: "Illustration",
    x: 718.35,
    y: 587,
    labelWidth: 118.59,
    summary: "Digital painting, concept art and editorial illustration.",
    projects: [],
  },
];

export type DockApp = {
  name: string;
  icon: StaticImageData;
  /** Offset of the rendered icon (which includes its drop shadow) inside the 36px dock slot. */
  top: number;
  href?: string;
};

export const dockApps: DockApp[] = [
  { name: "Finder", icon: finder, top: 0 },
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
