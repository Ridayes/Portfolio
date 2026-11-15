import data from "./projects.json";

/**
 * A portfolio project as shown in the Finder windows. Edit these with the admin panel
 * (`npm run dev`, then open /admin) — it writes `projects.json` and saves thumbnails to
 * `public/projects/`.
 */
export type Project = {
  id: string;
  title: string;
  /** Path under /public (e.g. "/projects/ag-visual-123.jpg"), or null to show a folder icon. */
  thumbnail: string | null;
  /** Behance case-study URL. Clicking the project opens it in a new tab. */
  behance: string;
  /** Vimeo URL. When set, clicking plays the video in a Quick Look window instead. */
  vimeo: string;
};

/** Finder folder ids that hold projects (same ids as the desktop folders). */
export const PROJECT_FOLDERS = [
  "video-editing",
  "branding",
  "motion-graphics",
  "social-media",
  "illustration",
] as const;

export type ProjectFolderId = (typeof PROJECT_FOLDERS)[number];
export type ProjectsData = Record<ProjectFolderId, Project[]>;

export const projects = data as ProjectsData;

export function getProjects(folderId: string): Project[] {
  return projects[folderId as ProjectFolderId] ?? [];
}

/**
 * Turns whatever you paste from Vimeo into its player URL, or null if there's no video in it.
 * Accepts: vimeo.com/123456789, links without https://, unlisted links (vimeo.com/123/abcdef or
 * ?h=abcdef), share/manage/review/showcase/channel links, player.vimeo.com URLs, the full
 * <iframe> embed code, and live events (vimeo.com/event/123).
 */
export function vimeoEmbedUrl(input: string): string | null {
  let text = input.trim();
  // Embed code: use the iframe's src.
  const src = text.match(/src\s*=\s*["']([^"']+)["']/i)?.[1];
  if (src) text = src;
  if (text.startsWith("//")) text = `https:${text}`;
  else if (!/^https?:\/\//i.test(text)) text = `https://${text}`;

  let url: URL;
  try {
    url = new URL(text);
  } catch {
    return null;
  }
  if (!/(^|\.)vimeo\.com$/i.test(url.hostname)) return null;

  const parts = url.pathname.split("/").filter(Boolean);
  if (parts[0] === "event" && /^\d+$/.test(parts[1] ?? "")) {
    return `https://vimeo.com/event/${parts[1]}/embed`;
  }

  // The video id is the last all-digit path segment (showcase/123/video/456 → 456).
  let idIndex = -1;
  parts.forEach((p, i) => {
    if (/^\d{5,}$/.test(p)) idIndex = i;
  });
  // A showcase or profile link without a specific video has no playable id.
  if (idIndex === -1 || (parts[idIndex - 1] === "showcase" && parts[idIndex + 1] !== "video")) return null;

  const id = parts[idIndex];
  const next = parts[idIndex + 1] ?? "";
  const hash = url.searchParams.get("h") ?? (/^[0-9a-f]{6,}$/i.test(next) ? next : null);
  const embed = new URL(`https://player.vimeo.com/video/${id}`);
  if (hash) embed.searchParams.set("h", hash);
  return embed.toString();
}

export function isBehanceUrl(input: string): boolean {
  try {
    const url = new URL(input.trim());
    return url.protocol === "https:" && /(^|\.)behance\.net$/.test(url.hostname);
  } catch {
    return false;
  }
}
