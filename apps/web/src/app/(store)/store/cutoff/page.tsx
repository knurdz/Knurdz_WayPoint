"use client";

import React from "react";
import Link from "next/link";
import { useCutoffCountdown } from "@/hooks/useCutoffCountdown";

export default function StoreCutoffPage() {
  const countdown = useCutoffCountdown();

  const nextRunDate = React.useMemo(() => {
    const d = new Date();
    // Late orders roll past tomorrow to day after tomorrow
    d.setDate(d.getDate() + 2);
    return d.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div className="screen-cutoff-hero wp-panel" style={{ padding: "2rem", textAlign: "center" }}>
        <span className="wp-label">SM 05 · Time until cutoff</span>
        <p className="font-mono" style={{ fontSize: "2.75rem", fontWeight: 700, margin: "0.5rem 0" }}>
          {countdown.formatted}
        </p>
        <p className="wp-subtext">Orders after 4:00 PM ship on the following run</p>
      </div>

      <div className="screen-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
        <section className="wp-panel screen-panel" style={{ padding: "1.5rem" }}>
          <h2 className="wp-headline-sm">If you miss cutoff</h2>
          <p className="wp-subtext" style={{ margin: "0.5rem 0 1rem" }}>
            Late orders roll to <strong>{nextRunDate}</strong> secondary cycle. Store manager receives confirmation with next run date.
          </p>
          <Link href="/dispatcher/cutoff" className="mc-link">
            Dispatcher late order list →
          </Link>
        </section>

        <section className="wp-panel screen-panel" style={{ padding: "1.5rem" }}>
          <h2 className="wp-headline-sm">Still in today window</h2>
          <p className="wp-subtext" style={{ margin: "0.5rem 0 1rem" }}>
            Orders placed before 16:00 SLST stay on tomorrow Fresh run, window 05:00 to 07:30.
          </p>
          <Link href="/store/order" className="wp-btn wp-btn-primary" style={{ display: "inline-block" }}>
            Place order
          </Link>
        </section>
      </div>
    </div>
  );
}
