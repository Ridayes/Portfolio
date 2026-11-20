import { Desktop } from "@/components/desktop/desktop";
import { Dock } from "@/components/desktop/dock";
import { Hero } from "@/components/desktop/hero";
import { MenuBar } from "@/components/desktop/menu-bar";
import { WindowLayer } from "@/components/desktop/window-layer";
import { WindowProvider } from "@/components/desktop/window-manager";
import { getProjects } from "@/content/projects";
import { finderFolders, site } from "@/content/site";
import { structuredData } from "@/lib/structured-data";

/**
 * Projects only appear inside Finder windows after a click, so this list repeats them for screen
 * readers (and, as a side effect, search engines). It is visually hidden, not hidden from either.
 */
function WorkIndex() {
  return (
    <nav aria-label="Selected work" className="sr-only">
      <h2>Selected work</h2>
      {finderFolders.map((folder) => {
        const list = getProjects(folder.id);
        if (list.length === 0) return null;
        return (
          <section key={folder.id}>
            <h3>{folder.sidebarLabel}</h3>
            <ul>
              {list.map((p) => (
                <li key={p.id}>
                  {p.behance ? <a href={p.behance}>{p.title}</a> : p.title}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
      <p>
        More work on <a href={site.behance}>Behance</a>. Contact: <a href={`mailto:${site.email}`}>{site.email}</a>
      </p>
    </nav>
  );
}

export default function Home() {
  return (
    <WindowProvider>
      <MenuBar />
      <main className="relative min-h-dvh overflow-hidden pt-[calc(34px+12vh)] pb-32 desk:p-0">
        {/*
          Desktop stage: keeps the 1512 × 982 Figma frame's proportions and scales to fit the
          viewport. `--u` is one design pixel, so Figma coordinates map 1:1 at 1512 × 982.
        */}
        <div className="desk:absolute desk:inset-0 desk:m-auto desk:aspect-[1512/982] desk:w-[min(100vw,calc(100dvh*1512/982))] desk:[container-type:inline-size]">
          <div className="[--u:calc(100cqw/1512)] desk:absolute desk:inset-0">
            <Hero />
            <Desktop />
          </div>
        </div>
        <WorkIndex />
      </main>
      <WindowLayer />
      <Dock />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData()).replace(/</g, "\\u003c") }}
      />
    </WindowProvider>
  );
}
