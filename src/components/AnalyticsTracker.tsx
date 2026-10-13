"use client";

import { useEffect, useRef, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const VISITOR_ID_KEY = "cs_vid";
const SESSION_ID_KEY = "cs_sid";

function getOrCreateId(storage: Storage, key: string): string {
  try {
    let id = storage.getItem(key);
    if (!id || id.length < 10) {
      id =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `cs_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      storage.setItem(key, id);
    }
    return id;
  } catch {
    return `cs_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }
}

function detectDevice(): "desktop" | "mobile" | "tablet" {
  if (typeof window === "undefined") return "desktop";
  const width = window.innerWidth;
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

function TrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedRef = useRef<{ url: string; time: number } | null>(null);

  useEffect(() => {
    // Only track in browser
    if (typeof window === "undefined" || !pathname) return;

    // Never track admin or internal API pages
    if (pathname.startsWith("/admin") || pathname.startsWith("/api")) {
      return;
    }

    const queryString = searchParams?.toString();
    const currentUrl = queryString ? `${pathname}?${queryString}` : pathname;
    const now = Date.now();

    // Deduplication check: Avoid re-tracking identical URL within 2.5s (prevents strict mode & re-render duplicate hits)
    if (
      lastTrackedRef.current &&
      lastTrackedRef.current.url === currentUrl &&
      now - lastTrackedRef.current.time < 2500
    ) {
      return;
    }
    lastTrackedRef.current = { url: currentUrl, time: now };

    // Small delay ensures document title is updated by Next.js metadata
    const timer = setTimeout(() => {
      try {
        const visitorId = getOrCreateId(localStorage, VISITOR_ID_KEY);
        const sessionId = getOrCreateId(sessionStorage, SESSION_ID_KEY);
        const deviceType = detectDevice();

        const payload = {
          visitorId,
          sessionId,
          pathname,
          title: typeof document !== "undefined" ? document.title : "",
          referrer: typeof document !== "undefined" ? document.referrer : "",
          deviceType,
        };

        fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          keepalive: true,
        }).catch(() => {
          // Silent catch to never disturb user experience
        });
      } catch {
        // Safe fail
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  return null;
}

export default function AnalyticsTracker() {
  return (
    <Suspense fallback={null}>
      <TrackerInner />
    </Suspense>
  );
}
