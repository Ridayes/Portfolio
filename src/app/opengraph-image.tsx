import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { site } from "@/content/site";

export const alt = `${site.name} — welcome to my portfolio`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Link-preview image (Facebook, LinkedIn, WhatsApp, X, iMessage…), drawn like the site's hero. */
export default async function OpenGraphImage() {
  const [serif, sans] = await Promise.all([
    readFile(join(process.cwd(), "src/assets/og/instrument-serif-italic.woff")),
    readFile(join(process.cwd(), "src/assets/og/nunito-sans.woff")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 96px",
          background: "#ffffff",
          color: "#000",
        }}
      >
        <div style={{ fontFamily: "Sans", fontSize: 44, marginLeft: 150, marginBottom: -60 }}>welcome to my</div>
        <div style={{ fontFamily: "Serif", fontStyle: "italic", fontSize: 250, letterSpacing: -5, lineHeight: 1.15 }}>
          portfolio
        </div>
        <div style={{ display: "flex", fontFamily: "Sans", fontSize: 30, color: "#333", marginTop: 6 }}>
          {site.name} · Graphic designer & motion artist · Kathmandu, Nepal
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Serif", data: serif, style: "italic", weight: 400 },
        { name: "Sans", data: sans, style: "normal", weight: 400 },
      ],
    },
  );
}
