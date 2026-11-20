import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** Favicon: the blue macOS folder from the desktop. */
export function FolderMark({ scale }: { scale: number }) {
  const u = (n: number) => n * scale;
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "relative", display: "flex", width: u(56), height: u(44) }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: u(24), height: u(12), borderRadius: u(4), background: "#1e8fe0" }} />
        <div style={{ position: "absolute", left: 0, top: u(5), width: u(56), height: u(39), borderRadius: u(5), background: "#1e8fe0" }} />
        <div style={{ position: "absolute", left: 0, top: u(10), width: u(56), height: u(34), borderRadius: u(5), background: "#4cc1f7" }} />
      </div>
    </div>
  );
}

export default function Icon() {
  return new ImageResponse(<FolderMark scale={1} />, size);
}
