# Utility Hub — Project Instructions

@AGENTS.md

The Next.js rules in AGENTS.md always apply. Before writing code, read the relevant guide in `node_modules/next/dist/docs/`. Do not rely on memory of older Next.js versions.

## 1. Product goal

- Build a fast, mobile-first, accessible English-language utility website for users mainly in the US, UK, Canada, and Australia.
- The long-term business model is organic search traffic monetized with AdSense. Content quality and user trust come before ad placement.
- Build in this order: **Timer → Calculator → Converter**. Finish and polish one category before starting the next.
- Priorities, in order: useful working tools, matching real search intent, technical SEO, performance (Core Web Vitals), and maintainability.

## 2. Technical rules

### Stack (keep it)
- Next.js 16.4 App Router (`app/`, no `src/`), TypeScript strict mode, Tailwind CSS v4, ESLint 9.
- Import alias: `@/*` maps to the project root.
- Tailwind runs through the `@tailwindcss/turbopack` loader configured in `next.config.ts` (`turbopack.rules`). Do not add a `postcss.config` file or switch to `@tailwindcss/postcss` unless there is a clear technical reason.
- Do not replace or remove existing configuration in `next.config.ts`, `tsconfig.json`, or `eslint.config.mjs` (`cacheComponents`, `partialPrefetching`, `experimental.agentFeedback`, `turbopack.rules`) without a clear technical reason, stated to the user first.

### Cache Components (enabled)
Docs: `01-app/01-getting-started/08-caching.md` and `01-app/03-api-reference/05-config/01-next-config-js/cacheComponents.md`.
- Pages are prerendered into a static shell by default. Keep tool pages fully static wherever possible, since that is best for SEO and speed.
- Do not call `Date.now()`, `new Date()`, `Math.random()`, or `crypto.randomUUID()` while rendering Server Components. Prerendering will fail. Put time-based and random logic (timers, clocks, countdowns) in Client Components and run it in effects or event handlers, not during render, so it doesn't cause hydration mismatches.
- Runtime APIs (`cookies`, `headers`, `searchParams`, `connection`) make content dynamic. They must be wrapped in `<Suspense>` and should be avoided on tool pages unless clearly needed.
- If you use `"use cache"`, pair it with `cacheLife`. Cached values must be serializable. For example, return `metadataBase` as a string, not a `URL`, from a cached `generateMetadata`.
- Do not use `export const runtime = 'edge'`. Cache Components requires the Node.js runtime.
- Route state is kept across navigations through React `<Activity>`. Make sure timers and effects clean up correctly when a route is hidden and start again when it becomes visible.

### Components and architecture
- Default to Server Components. Add `"use client"` only to the smallest interactive part (the tool widget itself). Keep the explanatory content, headings, and FAQs server-rendered.
- Prefer reusable components and data-driven templates. Examples: a shared tool-page layout, plus typed config or data files for converter units and calculator definitions. Avoid copy-pasting near-identical pages.
- Keep pure logic (calculations, unit conversion, time formatting) in plain TypeScript modules, separate from the UI, so it can be tested and reused.
- Interactive tools must work fully, be keyboard accessible, and work on screens from 320px wide to desktop.
- Use semantic HTML (`header`, `nav`, `main`, `section`, `footer`, a single `h1`, ordered headings), real `<button>`/`<label>`/`<input>` elements, accessible names, visible focus styles, sufficient color contrast, and `aria-live` for changing results where appropriate. Respect `prefers-reduced-motion`.
- Do not add a database, authentication, paid APIs, analytics or ad scripts, or unnecessary dependencies without explicit approval. Prefer platform and built-in solutions.

## 3. SEO rules

Docs: `01-app/01-getting-started/14-metadata-and-og-images.md`, `01-app/03-api-reference/04-functions/generate-metadata.md`, `01-app/03-api-reference/03-file-conventions/01-metadata/` (`sitemap.md`, `robots.md`).

- All public-facing content is in English. Default to US English spelling, and mention UK/AU/CA conventions or units where they matter to users.
- Each page targets one clear, distinct search intent and provides real value: a working tool, plus concise how-to-use guidance, explanations or formulas, examples, and FAQs where they help.
- Set metadata on every page through the Metadata API (`metadata` / `generateMetadata`, Server Components only):
  - a unique, descriptive `title` (use a `title.template` in the root layout) and `description`;
  - `alternates.canonical` on indexable pages;
  - Open Graph basics.
- Set `metadataBase` once in the root layout from a single site-config constant. Never hardcode the domain in multiple places. The production domain is not decided yet, so ask before assuming one.
- Use semantic headings and meaningful internal links between related tools and categories, with descriptive anchor text. Use `next/link`.
- Avoid keyword stuffing, mass-generated thin pages, doorway pages, and near-duplicate content. Do not create a page for a variation unless it serves a distinct intent with distinct useful content.
- Prepare for `app/sitemap.ts` and `app/robots.ts`, generated from the same route and data source as the pages so they stay in sync.
- Use structured data (JSON-LD) only where it accurately describes the visible page content.
- Keep layouts stable (no layout shift). If ad slots are added later, they must reserve space and must not get in the way of using the tool.

## 4. Quality and safety

- After substantial changes, run:
  - `npm run lint`
  - `npx tsc --noEmit`
  - `npm run build` (production build, which also catches Cache Components prerender errors)
- Fix all errors before claiming a task is complete. Report failures honestly, including the output.
- At the end of each task, list the files that were changed, created, or deleted, and explain how to test the result (URLs to visit and what to check).
- Never expose secrets or commit credentials. `.env*` files are git-ignored and must stay that way.
- Do not run destructive commands (for example `rm -rf`, `git reset --hard`, force pushes, deleting `.next` while the dev server is running) or risky dependency fixes (`npm audit fix --force`, major version bumps) without asking first.
- A dev server may already be running on port 3000 (see `.next/dev/lock`). Reuse it instead of starting a second one.
- `next dev` maintains managed blocks in `AGENTS.md`. Do not delete or hand-edit content between its `BEGIN`/`END` markers.
