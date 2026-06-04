"use client";

import { useEffect } from "react";

// Registers the service worker so Aurexis can be installed as an app.
// Only runs in the browser, in production, and fails silently if unsupported.
export default function PWA() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    };
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
  }, []);
  return null;
}
