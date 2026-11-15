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

## How it behaves

It works like a small macOS desktop:

- **Desktop folders:** click to select, double-click to open (tap on touch, Enter on keyboard). "About me" opens a utility panel and every other folder opens a Finder window.
- **Windows:** zoom open out of the icon that launched them and close back into it. Drag them by the title bar or toolbar. The traffic lights close, minimise and zoom them. Clicking a window brings it to the front, and Esc closes the front one.
- **Finder:** sidebar with an animated selection, back/forward (also ⌘[ / ⌘]), search (⌘F), and project folders that open into their files. Images and videos open in **Quick Look** (Space or double-click, ←/→ to flip through, Esc to close). Links open in a new tab.
- **Dock:** fish-eye magnification, a launch bounce, a running-app dot under Finder, and minimised windows that you click to restore.
- Every animation is skipped when the visitor has "reduce motion" turned on.

## Where things live

| Path | What it is |
| --- | --- |
| `src/content/site.ts` | **All content:** name, links, folder positions, About text, projects and their files, dock apps |
| `src/components/desktop/window-manager.tsx` | Window state: open / close / focus / minimise / zoom / move |
| `src/components/desktop/mac-window.tsx` | Window frame: dragging and the open, close, minimise and restore animations |
| `src/components/desktop/finder-window.tsx` | Finder: sidebar, toolbar, history, search, file grid |
| `src/components/desktop/quick-look.tsx` | Quick Look preview |
| `src/components/desktop/about-panel.tsx` | "About me" utility panel |
| `src/components/desktop/dock.tsx` | Dock |
| `src/components/desktop/` (rest) | Menu bar, clock, hero, desktop icons, traffic lights, icons |
| `src/app/globals.css` | Theme tokens, dot-grid background, keyframes, the `desk:` breakpoint |
| `src/assets/` | Icons exported from Figma and the reference images |

### Adding work

1. Put files in `src/assets/projects/<project>/`, e.g. `src/assets/projects/ag-visual/logo.png`.
2. In `src/content/site.ts`, import them and list them in the project's `files`:

```ts
import agLogo from "@/assets/projects/ag-visual/logo.png";
// …
{ id: "ag-visual", title: "AG visual", files: [
  { type: "image", name: "Logo.png", src: agLogo, alt: "AG Visual logo on black" },
  { type: "video", name: "Reel.mp4", src: "/videos/ag-reel.mp4" },          // file in /public/videos
  { type: "link", name: "Case study", href: "https://www.behance.net/gallery/…" },
] }
```

To add a new project folder, add `{ id, title, files: [] }` to a category's `projects`. A folder with no files shows an empty state that links to Behance.

## Layout

- **Wide landscape screens (`desk:` = ≥1024px and landscape):** the Figma frame’s composition, scaled to fit. `--u` equals one Figma pixel, so the layout matches the design 1:1 at 1512 × 982.
- **Phones, tablets and portrait screens:** the headline stacks above a 3-column folder grid, and the dock scales down.

## Fonts

The design uses **ITC Garamond Std Light Condensed Italic** and **Avenir**, which are commercial fonts. This build uses:

- **Instrument Serif Italic** (OFL), self-hosted, for “portfolio”. Its size and tracking are tuned to sit where the Figma wordmark sits.
- **Avenir** on Apple devices, where it ships with the OS, falling back to self-hosted **Nunito Sans** elsewhere.

If you own a webfont licence for ITC Garamond, put the `.woff2` file in `src/app/fonts/`, point `instrumentSerif` in `src/app/layout.tsx` at it, and adjust the `255*var(--u)` size in `hero.tsx`.
