// Single source of truth for site-wide settings and the tool catalog.

const LOCAL_SITE_URL = "http://localhost:3000";

// The production domain is set with NEXT_PUBLIC_SITE_URL at build time (Next.js inlines
// NEXT_PUBLIC_ values during `next build`). Canonical URLs, Open Graph URLs, the sitemap,
// and robots.txt all derive from it. Without it, URLs point at localhost, which is only
// suitable for local development.
const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

export const isSiteUrlConfigured = Boolean(rawSiteUrl);

function normalizeSiteUrl(value: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(
      `NEXT_PUBLIC_SITE_URL must be an absolute URL such as https://www.example.com (got "${value}").`,
    );
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error(`NEXT_PUBLIC_SITE_URL must use http or https (got "${value}").`);
  }
  // Drop query, hash, and trailing slashes so every URL is built from the same base.
  return `${url.origin}${url.pathname.replace(/\/+$/, "")}`;
}

export const siteConfig = {
  name: "Utility Hub",
  url: rawSiteUrl ? normalizeSiteUrl(rawSiteUrl) : LOCAL_SITE_URL,
  description:
    "Free, fast online tools that work in your browser: an accurate countdown timer and everyday calculators, with unit converters on the way.",
  locale: "en_US",
} as const;

/** Absolute URL for a site path, matching how Next.js resolves canonical URLs against metadataBase. */
export function absoluteUrl(path: `/${string}`): string {
  return path === "/" ? siteConfig.url : `${siteConfig.url}${path}`;
}

export type ToolCategory = {
  name: string;
  summary: string;
  /** Present only when the tool is live. Coming-soon categories have no page. */
  href?: string;
};

export const toolCategories: ToolCategory[] = [
  {
    name: "Timer",
    summary:
      "Count down from any number of minutes and seconds, with pause, resume, and an alert when time is up.",
    href: "/timer",
  },
  {
    name: "Calculator",
    summary:
      "Basic and scientific calculators, plus tools for percentages, discounts, tips, sales tax, averages, and fractions.",
    href: "/calculator",
  },
  {
    name: "Converter",
    summary:
      "Unit converters for length, weight, temperature, and volume, covering both metric and imperial units.",
  },
];
