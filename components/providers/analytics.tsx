"use client";

import Script from "next/script";
import { siteConfig } from "@/lib/config";

/**
 * Plausible/Umami analytics script (client-side, deferred so it never
 * blocks server render). No-op when the env slots are empty.
 */
export function Analytics() {
  const domain = siteConfig.analyticsDomain;
  const scriptUrl = siteConfig.analyticsScriptUrl;
  if (!domain || !scriptUrl) return null;

  const isPlausible = scriptUrl.includes("plausible");

  return (
    <>
      <Script defer src={scriptUrl} data-domain={domain} strategy="afterInteractive" />
      {!isPlausible && (
        <Script defer src={scriptUrl} data-website-id={domain} strategy="afterInteractive" />
      )}
    </>
  );
}
