// Link class names used in more than one place, so every instance looks and focuses the same.

/** Rounded "pill" links in the timer and calculator link lists. */
export const pillLinkClass =
  "inline-flex min-h-10 items-center rounded-full border border-border bg-surface px-4 text-sm font-medium text-foreground hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

/** Accent-colored links inside body text. */
export const textLinkClass =
  "font-medium text-accent underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-accent";

/** Muted links in the site footer. */
export const footerLinkClass =
  "rounded text-muted underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

/** Parent-page links in a breadcrumb trail. */
export const crumbLinkClass =
  "rounded hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-accent";
