import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/privacy",
  title: "Privacy Policy",
  description:
    "How Utility Hub handles your data: the tools run in your browser, with no accounts, cookies, or analytics.",
});

// Update this date whenever the policy text changes. It is a fixed string because rendering
// the current date would make the page dynamic.
const LAST_UPDATED = "October 27, 2026";

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-muted">Last updated: {LAST_UPDATED}</p>

      <div className="mt-6 space-y-5 leading-7 text-muted">
        <p>
          Utility Hub is built to work without collecting personal information. This page explains
          what happens to data when you use the site.
        </p>

        <h2 className="pt-2 text-xl font-semibold tracking-tight text-foreground">
          What you enter into the tools
        </h2>
        <p>
          The timer and calculators run entirely in your browser. Numbers, times, and lists you
          enter are processed on your device and are not sent to or stored on our servers. They
          are gone when you close or reload the page.
        </p>

        <h2 className="pt-2 text-xl font-semibold tracking-tight text-foreground">
          Cookies, storage, and analytics
        </h2>
        <p>
          Utility Hub does not set cookies, does not save anything in your browser&apos;s
          storage, and does not use analytics or advertising trackers. There are no accounts or
          sign-up forms.
        </p>

        <h2 className="pt-2 text-xl font-semibold tracking-tight text-foreground">Hosting</h2>
        <p>
          The site is hosted by Vercel. Like any web host, Vercel receives standard technical
          information when your browser requests a page, such as your IP address, browser type,
          and the page requested, and may keep it in server logs for security and reliability.
          See Vercel&apos;s privacy policy for how it handles that information.
        </p>

        <h2 className="pt-2 text-xl font-semibold tracking-tight text-foreground">
          Browser features
        </h2>
        <p>
          While a timer is running, the timer asks your browser to keep the screen awake, and it
          can play a chime when time is up. Both happen only on your device, and you can turn the
          chime off.
        </p>

        <h2 className="pt-2 text-xl font-semibold tracking-tight text-foreground">
          Changes to this policy
        </h2>
        <p>
          If the site starts using cookies, analytics, or advertising, this policy will be updated
          before that happens, and the date above will change.
        </p>
      </div>
    </div>
  );
}
