This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Production site URL (required before deploying)

Canonical URLs, Open Graph URLs, `/sitemap.xml`, and `/robots.txt` are all built from one setting:

```bash
NEXT_PUBLIC_SITE_URL=https://www.your-domain.com
```

- Set it in your hosting provider's environment variables (or in `.env.production.local`, which is git-ignored) **before running `next build`**. `NEXT_PUBLIC_` values are inlined at build time, so changing it later requires a rebuild.
- Use the exact origin you want indexed (choose `www` or non-`www`, always `https`), without a trailing slash. A path prefix such as `https://example.com/tools` is supported.
- If it is not set, every URL falls back to `http://localhost:3000`. That is only suitable for local development, and the production build logs a warning.
- After deploying, check `https://www.your-domain.com/robots.txt` and `/sitemap.xml`, then submit the sitemap in Google Search Console and Bing Webmaster Tools.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
