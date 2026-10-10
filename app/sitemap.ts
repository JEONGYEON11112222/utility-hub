import type { MetadataRoute } from "next";
import { indexablePaths } from "@/lib/seo";
import { absoluteUrl, isSiteUrlConfigured } from "@/lib/site";

// lastModified is omitted on purpose: there is no reliable per-page modification date yet,
// and an inaccurate one is worse than none. Calling new Date() here would also make the
// route dynamic under Cache Components.
export default function sitemap(): MetadataRoute.Sitemap {
  if (!isSiteUrlConfigured && process.env.NODE_ENV === "production") {
    console.warn(
      "[sitemap] NEXT_PUBLIC_SITE_URL is not set, so sitemap URLs point to localhost. Set it to the production domain before deploying.",
    );
  }

  return indexablePaths.map((path) => ({ url: absoluteUrl(path) }));
}
