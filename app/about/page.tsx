import Link from "next/link";
import { textLinkClass } from "@/components/link-styles";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/about",
  title: "About Utility Hub",
  description:
    "What Utility Hub is, how its free timer and calculators are built and checked for accuracy, and how it handles your privacy.",
});

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        About Utility Hub
      </h1>
      <div className="mt-6 space-y-5 leading-7 text-muted">
        <p>
          Utility Hub is a small collection of free online tools for everyday tasks: a{" "}
          <Link href="/timer" className={textLinkClass}>
            countdown timer
          </Link>{" "}
          and{" "}
          <Link href="/calculator" className={textLinkClass}>
            calculators
          </Link>{" "}
          for percentages, discounts, tips, sales tax, averages, and fractions. Each tool does one
          job, opens instantly, and needs no account or download.
        </p>

        <h2 className="pt-2 text-xl font-semibold tracking-tight text-foreground">
          How the tools are built
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Every tool runs in your browser. What you type into a calculator or timer stays on
            your device and is not sent to a server.
          </li>
          <li>
            Calculations avoid the small rounding errors computers can make, so 0.1 + 0.2 shows
            0.3, and money amounts are rounded to the cent in a way that always adds up.
          </li>
          <li>
            Each tool page explains how the result is worked out, with worked examples you can
            check by hand.
          </li>
          <li>
            Pages work on phones, tablets, and desktops, and every control can be used with a
            keyboard or a screen reader.
          </li>
        </ul>

        <h2 className="pt-2 text-xl font-semibold tracking-tight text-foreground">
          Accuracy and limits
        </h2>
        <p>
          The tools are checked against worked examples, but they are general-purpose helpers,
          not financial, tax, or professional advice. For anything important, such as a tax
          filing, confirm the result with an official source.
        </p>

        <h2 className="pt-2 text-xl font-semibold tracking-tight text-foreground">Privacy</h2>
        <p>
          Utility Hub does not use accounts, cookies, or analytics. Read the{" "}
          <Link href="/privacy" className={textLinkClass}>
            privacy policy
          </Link>{" "}
          for details.
        </p>
      </div>
    </div>
  );
}
