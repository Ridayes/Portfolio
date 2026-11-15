import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import { site } from "@/content/site";

import "./globals.css";

const instrumentSerif = localFont({
  src: "./fonts/instrument-serif-latin-400-italic.woff2",
  style: "italic",
  weight: "400",
  variable: "--font-instrument",
  display: "swap",
});

const nunitoSans = localFont({
  src: "./fonts/nunito-sans-latin-400-normal.woff2",
  weight: "400",
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.role}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.title,
  authors: [{ name: site.name, url: site.behance }],
  creator: site.name,
  keywords: [
    "graphic designer",
    "motion designer",
    "motion graphics",
    "branding",
    "video editing",
    "illustration",
    "Kathmandu",
    "Nepal",
    site.alias,
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: site.title,
    title: `${site.name} — ${site.role}`,
    description: site.description,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.role}`,
    description: site.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${nunitoSans.variable} antialiased`}>
      <body className="min-h-dvh overflow-x-hidden">{children}</body>
    </html>
  );
}
