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
| `src/content/site.ts` | Name, links, folder positions, About text, dock apps |
| `src/content/projects.json` | Projects in each Finder folder (edited by the admin panel) |
| `src/app/admin/` | Local admin panel |
| `src/components/desktop/window-manager.tsx` | Window state: open / close / focus / minimise / zoom / move |
| `src/components/desktop/mac-window.tsx` | Window frame: dragging and the open, close, minimise and restore animations |
| `src/components/desktop/finder-window.tsx` | Finder: sidebar, toolbar, history, search, file grid |
| `src/components/desktop/quick-look.tsx` | Quick Look preview |
| `src/components/desktop/about-panel.tsx` | "About me" utility panel |
| `src/components/desktop/dock.tsx` | Dock |
| `src/components/desktop/` (rest) | Menu bar, clock, hero, desktop icons, traffic lights, icons |
| `src/app/globals.css` | Theme tokens, dot-grid background, keyframes, the `desk:` breakpoint |
| `src/assets/` | Icons exported from Figma and the reference images |

### Adding work (admin panel)

1. Run `npm run dev` and open **http://localhost:3000/admin**.
2. Pick a folder (Video Edits, Branding Projects…) and click **+ Add project**.
3. Give it a title and either:
   - a **Behance link**, so clicking the project opens the case study in a new tab, or
   - a **Vimeo link**, so clicking it plays the video in a Quick Look player (the player also shows "View on Behance" if you add both).
4. Click the thumbnail box to upload or drop an image, or leave it empty to show a folder icon.
5. Press **Save** (⌘S). This writes `src/content/projects.json` and puts thumbnails in `public/projects/`.
6. Commit and push. Vercel redeploys the live site.

The admin page and its API only exist while running `npm run dev`. On the deployed site they return 404.

## SEO

- **Title, description, keywords, canonical URL, Open Graph and Twitter tags** are set in `src/app/layout.tsx` from `src/content/site.ts` (`seoTitle`, `description`, `url`).
- **Link-preview image** (`src/app/opengraph-image.tsx`) and **favicon / iPhone icon** (`icon.tsx`, `apple-icon.tsx`) are generated at build time.
- **Structured data** (`src/lib/structured-data.ts`) tells Google who you are and lists every project from `projects.json`, including Vimeo videos.
- **Sitemap** (`/sitemap.xml`) includes your project thumbnails for Google Images; `robots.txt` hides `/admin`.
- **Own domain:** set `NEXT_PUBLIC_SITE_URL` in Vercel (e.g. `https://softcore.design`) and redeploy.
- **Google Search Console:** add the site there, copy the HTML-tag verification code into a `GOOGLE_SITE_VERIFICATION` env var in Vercel, redeploy, then submit `https://<your-site>/sitemap.xml`.

## Layout

- **Wide landscape screens (`desk:` = ≥1024px and landscape):** the Figma frame’s composition, scaled to fit. `--u` equals one Figma pixel, so the layout matches the design 1:1 at 1512 × 982.
- **Phones, tablets and portrait screens:** the headline stacks above a 3-column folder grid, and the dock scales down.

## Fonts

The design uses **ITC Garamond Std Light Condensed Italic** and **Avenir**, which are commercial fonts. This build uses:

- **Instrument Serif Italic** (OFL), self-hosted, for “portfolio”. Its size and tracking are tuned to sit where the Figma wordmark sits.
- **Avenir** on Apple devices, where it ships with the OS, falling back to self-hosted **Nunito Sans** elsewhere.

If you own a webfont licence for ITC Garamond, put the `.woff2` file in `src/app/fonts/`, point `instrumentSerif` in `src/app/layout.tsx` at it, and adjust the `255*var(--u)` size in `hero.tsx`.
