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
    default: site.seoTitle,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.title,
  authors: [{ name: site.name, url: site.behance }],
  creator: site.name,
  publisher: site.name,
  category: "design",
  keywords: [
    site.name,
    site.alias,
    "graphic designer",
    "graphic designer Kathmandu",
    "graphic designer Nepal",
    "motion graphics",
    "motion designer",
    "video editor",
    "video editing",
    "branding",
    "logo design",
    "social media design",
    "illustration",
    "portfolio",
    "Kathmandu",
    "Nepal",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    url: "/",
    siteName: site.title,
    title: site.seoTitle,
    description: site.description,
    locale: "en_US",
    firstName: "Hridayesh",
    lastName: "Neupane",
    username: site.alias,
  },
  twitter: {
    card: "summary_large_image",
    title: site.seoTitle,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  // Paste the code from Google Search Console into this env var in Vercel to verify the site.
  verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
  formatDetection: { telephone: false },
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
