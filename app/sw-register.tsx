"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((reg) => {
          if (process.env.NODE_ENV === "development") {
            console.log("[SW] registered, scope:", reg.scope);
          }
        })
        .catch((err) => {
          console.error("[SW] registration failed:", err);
        });
    }
  }, []);

  return null;
}
