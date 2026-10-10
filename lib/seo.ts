import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";
import { timerPagePath, timerPages } from "@/lib/timer-pages";

type SitePath = `/${string}`;

export const baseOpenGraph = {
  type: "website",
  siteName: siteConfig.name,
  locale: siteConfig.locale,
} as const;

type PageMetadataInput = {
  /** Path of the page. Used for the canonical URL and og:url, resolved against metadataBase. */
  path: SitePath;
  title: string;
  description: string;
  /** Skip the root layout's "%s | Utility Hub" title template. */
  absoluteTitle?: boolean;
};

// A page-level `openGraph` object replaces the layout's instead of merging with it,
// so every page builds its metadata here to keep siteName, type, and locale.
export function pageMetadata({
  path,
  title,
  description,
  absoluteTitle = false,
}: PageMetadataInput): Metadata {
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: { ...baseOpenGraph, url: path, title, description },
  };
}

/** Every public, indexable page. The sitemap is generated from this list. */
export const indexablePaths: SitePath[] = [
  "/",
  "/timer",
  ...timerPages.map(timerPagePath),
];
