"use client";

import { useEffect, useState } from "react";

const LAST_COUNTED_KEY = "sass-last-counted-day";

const readLastCounted = () => {
  try {
    return window.localStorage.getItem(LAST_COUNTED_KEY);
  } catch {
    return null;
  }
};

const rememberCounted = (day: string) => {
  try {
    window.localStorage.setItem(LAST_COUNTED_KEY, day);
  } catch {
    // Private windows may refuse storage. That browser is counted again tomorrow.
  }
};

export function VisitorCounter() {
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const countedToday = readLastCounted() === today;
    // Remembered before the request, so a second tab or a quick reload cannot
    // count the same browser twice.
    rememberCounted(today);

    fetch("/api/visits", { method: countedToday ? "GET" : "POST" })
      .then((response) => (response.ok ? response.json() : null))
      .then((body: { total: number | null } | null) => {
        if (typeof body?.total === "number") setTotal(body.total);
      })
      // The number is decoration. If it cannot load, the footer simply omits it.
      .catch(() => setTotal(null));
  }, []);

  return (
    <p className="min-h-4 text-xs text-white/55">
      {total !== null && (
        <>
          Total Visitors:{" "}
          <span className="font-semibold text-brand-gold">
            {total.toLocaleString("en-IN")}
          </span>
        </>
      )}
    </p>
  );
}
