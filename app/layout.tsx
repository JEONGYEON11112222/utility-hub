import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { baseOpenGraph } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  // No " | Utility Hub" suffix: Google shows the site name separately above each result (from
  // the WebSite structured data on the home page), and the suffix pushed most tool titles past
  // the ~60 characters shown in results. Pages that need the name include it themselves.
  title: {
    default: siteConfig.name,
    template: "%s",
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  // Allow large image previews and full-length snippets in search results and Discover.
  robots: {
    googleBot: { "max-image-preview": "large", "max-snippet": -1 },
  },
  // Fallback for routes without page metadata (e.g. 404). Pages use pageMetadata() from lib/seo.
  openGraph: baseOpenGraph,
  // Large preview card on X and apps that read Twitter tags; the image comes from Open Graph.
  twitter: { card: "summary_large_image" },
  // Google Search Console ownership (HTML tag method). This token is public by design.
  verification: {
    google: "LYFHxobkj7gIewcYc1MiuVMf-C3hy4HY9T8VyLdUtk4",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-surface focus:px-4 focus:py-2 focus:font-semibold focus:text-foreground focus:shadow-lg focus:outline-2 focus:outline-accent"
        >
          Skip to main content
        </a>
        <SiteHeader />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
