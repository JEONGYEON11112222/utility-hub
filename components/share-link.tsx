"use client";

import { useEffect, useState } from "react";
import { focusRing } from "@/components/calculators/fields";

// Inputs travel in the URL hash (#p=80&d=25), which never reaches the server, so pages stay
// static and nothing typed is sent anywhere until the visitor shares the link themselves.

/** The shared inputs in the current URL, or null when there are none. Client only. */
export function readShareHash(): URLSearchParams | null {
  const hash = window.location.hash.slice(1);
  return hash ? new URLSearchParams(hash) : null;
}

/**
 * Runs `apply` on mount (and when the route is shown again) if the URL carries this tool's
 * shared inputs. `key` must be present, so an ordinary anchor like #faq never clears a form.
 */
export function useShareHash(key: string, apply: (params: URLSearchParams) => void) {
  useEffect(() => {
    const params = readShareHash();
    if (params?.has(key)) apply(params);
    // apply is a fresh closure each render; reading the hash only on mount is intended.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/** Puts the inputs in the address bar and copies that link. */
export function ShareLink({ params }: { params: Record<string, string> | string[][] }) {
  const query = new URLSearchParams(params).toString();
  // The message belongs to the numbers that were shared; editing them hides it.
  const [shared, setShared] = useState({ query: "", status: "" });

  async function share() {
    const url = `${window.location.origin}${window.location.pathname}#${query}`;
    window.history.replaceState(null, "", url);
    try {
      await navigator.clipboard.writeText(url);
      setShared({ query, status: "Link copied. Anyone who opens it sees these numbers." });
    } catch {
      setShared({ query, status: "Copy the link from your browser's address bar to share these numbers." });
    }
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
      <button
        type="button"
        onClick={share}
        className={`min-h-10 rounded-lg border border-border px-4 text-sm font-medium text-foreground hover:bg-muted-surface ${focusRing}`}
      >
        Copy link to these numbers
      </button>
      <p role="status" className="text-sm text-muted">
        {shared.query === query ? shared.status : ""}
      </p>
    </div>
  );
}
