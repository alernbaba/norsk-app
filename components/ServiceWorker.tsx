"use client";

import { useEffect } from "react";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * Registers the offline service worker. sw.js is only generated for the static
 * GitHub Pages build (scripts/build-sw.ts), so dev and `next start` skip this.
 */
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SERVICE_WORKER !== "true" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register(`${base}/sw.js`, { scope: `${base}/` }).catch(() => {
      // Without a service worker the app still works online.
    });
  }, []);
  return null;
}
