import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdminPanel } from "./admin-panel";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

/** Local-only project editor. Exists while running `npm run dev`; 404 on the deployed site. */
export default function AdminPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <AdminPanel />;
}
