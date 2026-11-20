import type { MetadataRoute } from "next";

import { projects } from "@/content/projects";
import { site } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  // Project thumbnails as image entries, so Google Images can find the work.
  const images = Object.values(projects)
    .flat()
    .flatMap((p) => (p.thumbnail ? [`${site.url}${p.thumbnail}`] : []));

  return [{ url: site.url, lastModified: new Date(), changeFrequency: "monthly", priority: 1, images }];
}
