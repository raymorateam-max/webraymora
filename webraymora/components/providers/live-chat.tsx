"use client";

import { useEffect } from "react";
import { siteConfig } from "@/lib/config";

/**
 * Tawk.to live-chat widget (client-side). No-op when env slots are empty.
 * Loaded via DOM insertion in an effect so nothing inline needs
 * dangerouslySetInnerHTML.
 */
export function LiveChat() {
  const propertyId = siteConfig.tawktoPropertyId;
  const widgetId = siteConfig.tawktoWidgetId;

  useEffect(() => {
    if (!propertyId || !widgetId) return;

    const existing = document.getElementById("tawkto-script");
    if (existing) return;

    const script = document.createElement("script");
    script.id = "tawkto-script";
    script.async = true;
    script.src = `https://embed.tawk.to/${propertyId}/${widgetId}/default`;
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");
    document.body.appendChild(script);

    return () => {
      const node = document.getElementById("tawkto-script");
      node?.remove();
    };
  }, [propertyId, widgetId]);

  return null;
}
