"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator && (window as any).serwist !== undefined) {
      // leveraging window.serwist might not be reliable if not injected.
      // Standard registration:
    }
    
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").then(
          (registration) => {
            console.log("Service Worker registration successful with scope: ", registration.scope);
          },
          (err) => {
            console.error("Service Worker registration failed: ", err);
          }
        );
      });
    }
  }, []);

  return null;
}
