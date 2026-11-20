import { ImageResponse } from "next/og";

import { FolderMark } from "./icon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Home-screen icon for iPhone/iPad: the folder on white. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#fff" }}>
        <FolderMark scale={2.2} />
      </div>
    ),
    size,
  );
}
