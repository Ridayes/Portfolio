import "server-only";

import { randomBytes } from "node:crypto";
import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import { PROJECT_FOLDERS, isBehanceUrl, vimeoEmbedUrl, type Project, type ProjectsData } from "@/content/projects";

/**
 * File-backed store for the local admin panel. Only ever used while running `next dev` on your
 * own machine: the API routes refuse every request in production, where the file system is
 * read-only anyway. Publishing = commit + push.
 */
const ROOT = process.cwd();
const DATA_FILE = path.join(ROOT, "src/content/projects.json");
const THUMB_DIR = path.join(ROOT, "public/projects");
const THUMB_URL = "/projects/";

export const isAdminEnabled = () => process.env.NODE_ENV === "development";

export async function readProjects(): Promise<ProjectsData> {
  return JSON.parse(await readFile(DATA_FILE, "utf8"));
}

const str = (v: unknown, max = 500) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Validates and normalises data from the admin form before it touches the disk. */
export function sanitize(input: unknown): ProjectsData {
  if (!input || typeof input !== "object") throw new Error("Invalid data");
  const source = input as Record<string, unknown>;
  const out = {} as ProjectsData;

  for (const folder of PROJECT_FOLDERS) {
    const list = Array.isArray(source[folder]) ? (source[folder] as unknown[]) : [];
    const seen = new Set<string>();
    out[folder] = list.map((raw): Project => {
      const p = (raw ?? {}) as Record<string, unknown>;
      let id = str(p.id, 80).replace(/[^a-z0-9-]/gi, "").toLowerCase() || randomBytes(4).toString("hex");
      while (seen.has(id)) id = `${id}-${randomBytes(2).toString("hex")}`;
      seen.add(id);
      const thumb = str(p.thumbnail);
      return {
        id,
        title: str(p.title, 120) || "Untitled",
        thumbnail: thumb.startsWith(THUMB_URL) && !thumb.includes("..") ? thumb : null,
        behance: str(p.behance),
        vimeo: str(p.vimeo),
      };
    });
  }
  return out;
}

export async function writeProjects(data: ProjectsData) {
  await writeFile(DATA_FILE, `${JSON.stringify(data, null, 2)}\n`);
  await removeUnusedThumbnails(data);
}

/** Deletes uploaded thumbnails that no project points at any more (replaced or removed). */
async function removeUnusedThumbnails(data: ProjectsData) {
  const used = new Set(
    Object.values(data)
      .flat()
      .map((p) => p.thumbnail?.slice(THUMB_URL.length))
      .filter(Boolean),
  );
  let files: string[] = [];
  try {
    files = await readdir(THUMB_DIR);
  } catch {
    return;
  }
  await Promise.all(
    files
      .filter((f) => !f.startsWith(".") && !used.has(f))
      .map((f) => unlink(path.join(THUMB_DIR, f)).catch(() => {})),
  );
}

const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

/** Saves an uploaded thumbnail into public/projects and returns its public URL. */
export async function saveThumbnail(file: File, name: string) {
  return saveImage(Buffer.from(await file.arrayBuffer()), file.type, name);
}

async function saveImage(bytes: Buffer, mime: string, name: string) {
  const ext = IMAGE_TYPES[mime.split(";")[0].trim()];
  if (!ext) throw new Error("Use a JPG, PNG, WebP, AVIF or GIF image.");
  if (bytes.byteLength > MAX_UPLOAD_BYTES) throw new Error("Images must be under 10 MB.");
  const slug =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "project";
  const filename = `${slug}-${Date.now().toString(36)}.${ext}`;
  await mkdir(THUMB_DIR, { recursive: true });
  await writeFile(path.join(THUMB_DIR, filename), bytes);
  return `${THUMB_URL}${filename}`;
}

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Upgrade-Insecure-Requests": "1",
};

/** Finds the share image (og:image) in a page's HTML. */
export function findOgImage(html: string): string | null {
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    if (!/(property|name)\s*=\s*["'](og:image|twitter:image)(:src)?["']/i.test(tag)) continue;
    const content = tag.match(/content\s*=\s*["']([^"']+)["']/i)?.[1];
    if (content) return content.replace(/&amp;/g, "&");
  }
  return null;
}

/** Project covers live on Behance's image CDN under /projects/<size>/; anything else (a logo,
 * a banner, a bot-check page's image) isn't the cover. */
const isBehanceCover = (url: string) => /^https:\/\/[^/]*behance\.net\/projects\//i.test(url);

/** Asks for the 808px cover (crisp on retina); the caller falls back to the original size. */
const largeBehanceCover = (url: string) => url.replace(/\/projects\/(?:max_)?\d+(?:_[a-z]+)?\//i, "/projects/808/");

/**
 * Finds a Behance project's cover image URL. Behance often blocks requests that don't come from a
 * real browser, so if reading the page directly fails (or returns something that isn't a project
 * cover) we ask Microlink — a free link-preview service — for the same share image.
 */
async function findBehanceCover(projectUrl: string): Promise<string> {
  try {
    const page = await fetch(projectUrl, { headers: BROWSER_HEADERS, redirect: "follow" });
    if (page.ok) {
      const found = findOgImage(await page.text());
      const absolute = found ? new URL(found, projectUrl).toString() : null;
      if (absolute && isBehanceCover(absolute)) return absolute;
    }
  } catch {
    // Network error — fall through to the preview service.
  }

  const api = `https://api.microlink.io/?url=${encodeURIComponent(projectUrl)}`;
  const res = await fetch(api).catch(() => {
    throw new Error("Couldn’t reach Behance — check your internet connection.");
  });
  const json = (await res.json().catch(() => null)) as { status?: string; data?: { image?: { url?: string } } } | null;
  const image = json?.data?.image?.url;
  if (!res.ok || json?.status !== "success" || !image || !isBehanceCover(image)) {
    throw new Error(
      "Couldn’t get this project’s cover from Behance. Save the cover from Behance (right-click → Save Image) and drop it into the thumbnail box instead.",
    );
  }
  return image;
}

/**
 * Downloads a Behance project's cover (the image Behance uses when the link is shared) and saves
 * a copy in public/projects, so the site never hot-links Behance's servers.
 */
export async function saveBehanceCover(projectUrl: string, name: string) {
  if (!isBehanceUrl(projectUrl)) throw new Error("Add a behance.net project link first.");
  const cover = await findBehanceCover(projectUrl);
  const headers = { "User-Agent": BROWSER_HEADERS["User-Agent"], Referer: "https://www.behance.net/" };

  let image = await fetch(largeBehanceCover(cover), { headers }).catch(() => null);
  if (!image?.ok) image = await fetch(cover, { headers });
  if (!image.ok) throw new Error(`Couldn’t download the cover (HTTP ${image.status}).`);
  const bytes = Buffer.from(await image.arrayBuffer());
  // A real cover is tens of KB at least; a few KB means we got an icon or placeholder.
  if (bytes.byteLength < 8 * 1024) {
    throw new Error("Behance sent a placeholder instead of the cover. Save the cover image from Behance and drop it into the thumbnail box.");
  }
  return saveImage(bytes, image.headers.get("content-type") ?? "", name);
}

/**
 * Saves a Vimeo video's thumbnail via Vimeo's public oEmbed API (works for public and unlisted
 * videos), asking for a large 1280px version when Vimeo has one.
 */
export async function saveVimeoThumbnail(vimeoInput: string, name: string) {
  const embed = vimeoEmbedUrl(vimeoInput);
  const match = embed?.match(/player\.vimeo\.com\/video\/(\d+)/);
  if (!embed || !match) throw new Error("Add a Vimeo video link first.");
  const hash = new URL(embed).searchParams.get("h");
  const pageUrl = `https://vimeo.com/${match[1]}${hash ? `/${hash}` : ""}`;

  const res = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(pageUrl)}&width=1280`).catch(() => {
    throw new Error("Couldn’t reach Vimeo — check your internet connection.");
  });
  if (res.status === 403 || res.status === 404) {
    throw new Error("Vimeo won’t share this video’s thumbnail. Check its privacy is Anyone or Unlisted.");
  }
  const json = (await res.json().catch(() => null)) as { thumbnail_url?: string } | null;
  const thumb = json?.thumbnail_url;
  if (!res.ok || !thumb) throw new Error("Couldn’t find a thumbnail for that Vimeo video.");

  // Vimeo thumbnails end in _WIDTHxHEIGHT; ask for the big one, fall back to what oEmbed gave.
  const large = thumb.replace(/_\d+(x\d+)?(?=[?.]|$)/, "_1280");
  let image = await fetch(large).catch(() => null);
  if (!image?.ok) image = await fetch(thumb);
  if (!image.ok) throw new Error(`Couldn’t download the thumbnail (HTTP ${image.status}).`);
  return saveImage(Buffer.from(await image.arrayBuffer()), image.headers.get("content-type") ?? "image/jpeg", name);
}
