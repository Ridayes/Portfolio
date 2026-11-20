import { projects, vimeoEmbedUrl, type Project } from "@/content/projects";
import { finderFolders, site } from "@/content/site";

const absolute = (path: string) => (path.startsWith("http") ? path : `${site.url}${path}`);

function work(project: Project, genre: string) {
  const embed = vimeoEmbedUrl(project.vimeo);
  return {
    "@type": embed ? "VideoObject" : "CreativeWork",
    name: project.title,
    genre,
    creator: { "@id": `${site.url}/#person` },
    ...(project.behance ? { url: project.behance } : {}),
    ...(project.thumbnail ? { image: absolute(project.thumbnail) } : {}),
    ...(embed
      ? {
          embedUrl: embed,
          ...(project.thumbnail ? { thumbnailUrl: absolute(project.thumbnail) } : {}),
          description: `${project.title} — ${genre.toLowerCase()} by ${site.name}.`,
        }
      : {}),
  };
}

/**
 * schema.org data for search engines: who you are (Person), the site (WebSite) and every project
 * from the Finder folders (an ItemList of CreativeWork / VideoObject), since the projects
 * themselves only appear after a visitor opens a window.
 */
export function structuredData() {
  const items = finderFolders.flatMap((folder) =>
    (projects[folder.id as keyof typeof projects] ?? []).map((p) => work(p, folder.sidebarLabel)),
  );

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${site.url}/#person`,
        name: site.name,
        alternateName: site.alias,
        jobTitle: site.role,
        description: site.description,
        url: site.url,
        email: `mailto:${site.email}`,
        sameAs: [site.behance],
        knowsAbout: ["Graphic design", "Branding", "Motion graphics", "Video editing", "Illustration", "Social media design"],
        address: {
          "@type": "PostalAddress",
          addressLocality: "Kirtipur, Kathmandu",
          addressCountry: "NP",
        },
      },
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        url: site.url,
        name: site.title,
        description: site.description,
        inLanguage: "en",
        author: { "@id": `${site.url}/#person` },
      },
      {
        "@type": "ItemList",
        name: `Selected work by ${site.name}`,
        numberOfItems: items.length,
        itemListElement: items.map((item, i) => ({ "@type": "ListItem", position: i + 1, item })),
      },
    ],
  };
}
