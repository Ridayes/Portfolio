import { Desktop } from "@/components/desktop/desktop";
import { Dock } from "@/components/desktop/dock";
import { Hero } from "@/components/desktop/hero";
import { MenuBar } from "@/components/desktop/menu-bar";
import { WindowLayer } from "@/components/desktop/window-layer";
import { WindowProvider } from "@/components/desktop/window-manager";
import { site } from "@/content/site";

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  alternateName: site.alias,
  jobTitle: site.role,
  url: site.url,
  email: `mailto:${site.email}`,
  sameAs: [site.behance],
  address: { "@type": "PostalAddress", addressLocality: "Kathmandu", addressCountry: "NP" },
};

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
      </main>
      <WindowLayer />
      <Dock />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
    </WindowProvider>
  );
}
