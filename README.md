# Utility Hub

**Live site: [getutilityhub.com](https://getutilityhub.com)**

Free, fast online tools that work right in your browser. No sign-up, no download, and nothing you type is sent to a server.

## Tools

**Timer**
- [Online countdown timer](https://getutilityhub.com/timer): any length, with pause, resume, an alarm chime, full-screen mode for TVs and projectors, and a screen wake lock while it runs
- Ready-to-start timers: [1](https://getutilityhub.com/1-minute-timer), [5](https://getutilityhub.com/5-minute-timer), [10](https://getutilityhub.com/10-minute-timer), [15](https://getutilityhub.com/15-minute-timer), [20](https://getutilityhub.com/20-minute-timer), [25 (Pomodoro)](https://getutilityhub.com/25-minute-timer), [30](https://getutilityhub.com/30-minute-timer), and [60](https://getutilityhub.com/60-minute-timer) minutes

**Calculators**
- [Basic calculator](https://getutilityhub.com/calculator) with keyboard support
- [Scientific calculator](https://getutilityhub.com/scientific-calculator): parentheses, powers, roots, trig, and logs
- [Percentage calculator](https://getutilityhub.com/percentage-calculator): percent of a number, what percent, and percentage change
- [Discount calculator](https://getutilityhub.com/discount-calculator): sale price and amount saved
- [Tip calculator](https://getutilityhub.com/tip-calculator): tip, total, and split per person
- [Sales tax calculator](https://getutilityhub.com/sales-tax-calculator): add tax to a price or remove it from a total
- [Average calculator](https://getutilityhub.com/average-calculator): mean, sum, and count of a pasted list
- [Fraction calculator](https://getutilityhub.com/fraction-calculator): simplified answers, mixed numbers, and decimals

## How it's built

- [Next.js](https://nextjs.org) App Router with Cache Components: every page is prerendered as static HTML
- TypeScript (strict), Tailwind CSS v4, ESLint
- Server Components by default; only the interactive tool widgets run on the client
- Calculation and timing logic lives in plain TypeScript modules under `lib/`, separate from the UI
- Results avoid floating-point surprises (0.1 + 0.2 shows 0.3), and money amounts are rounded to the cent so the parts always add up
- Keyboard accessible, screen-reader friendly, and responsive from 320px wide

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Before committing, run:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

### Production site URL

Canonical URLs, Open Graph URLs, `/sitemap.xml`, and `/robots.txt` are all built from one setting:

```bash
NEXT_PUBLIC_SITE_URL=https://getutilityhub.com
```

- Set it in the hosting provider's environment variables (or in `.env.production.local`, which is git-ignored) **before running `next build`**. `NEXT_PUBLIC_` values are inlined at build time, so changing it later requires a rebuild.
- Use the exact origin you want indexed (`https`, no trailing slash).
- If it is not set, every URL falls back to `http://localhost:3000`, which is only suitable for local development, and the production build logs a warning.

### Notifying search engines after a deploy

Once a production deploy is live, run:

```bash
npm run indexnow
```

This sends every URL in the live sitemap to [IndexNow](https://www.indexnow.org/) (used by Bing, Yandex, Seznam, Naver, and others) so they recrawl changed pages. The verification key file lives in `public/`. Google does not use IndexNow; use Search Console for Google.
