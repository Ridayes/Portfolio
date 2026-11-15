# Hridayesh’s Portfolio

A macOS-desktop-style portfolio site, built from the Figma frame `Examples/Alerts/Side-by-side` (file “Lwin”).

**Stack:** Next.js 16 (App Router, TypeScript), Tailwind CSS v4. No other runtime dependencies.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

Set `NEXT_PUBLIC_SITE_URL` (e.g. `https://softcore.design`) in production so canonical URLs, the sitemap and Open Graph tags point at your domain.

## Where things live

| Path | What it is |
| --- | --- |
| `src/content/site.ts` | **All content:** name, links, folder labels/positions, folder text and projects, dock apps |
| `src/components/desktop/` | `menu-bar`, `clock`, `hero`, `folder-icon`, `folder-window`, `desktop-folders`, `dock` |
| `src/app/globals.css` | Theme tokens, dot-grid background, animations, the `desk:` breakpoint |
| `src/assets/` | Icons exported from Figma |
| `src/app/fonts/` | Self-hosted fonts |

### Adding work to a folder

1. Drop a cover image in `src/assets/projects/`.
2. In `src/content/site.ts`, import it and add an entry to that folder’s `projects` array:

```ts
import agVisual from "@/assets/projects/ag-visual.jpg";
// …
projects: [{ title: "AG Visual — identity", cover: agVisual, href: "https://www.behance.net/…", year: "2026" }],
```

The window switches from the “see Behance” note to a project grid automatically.

## Layout

- **Wide landscape screens (`desk:` = ≥1024px and landscape):** the Figma frame’s composition, scaled to fit. `--u` equals one Figma pixel, so the layout matches the design 1:1 at 1512 × 982.
- **Phones, tablets and portrait screens:** the headline stacks above a 3-column folder grid, and the dock scales down.

## Fonts

The design uses **ITC Garamond Std Light Condensed Italic** and **Avenir**, which are commercial fonts. This build uses:

- **Instrument Serif Italic** (OFL), self-hosted, for “portfolio”. Its size and tracking are tuned to sit where the Figma wordmark sits.
- **Avenir** on Apple devices, where it ships with the OS, falling back to self-hosted **Nunito Sans** elsewhere.

If you own a webfont licence for ITC Garamond, put the `.woff2` file in `src/app/fonts/`, point `instrumentSerif` in `src/app/layout.tsx` at it, and adjust the `255*var(--u)` size in `hero.tsx`.
