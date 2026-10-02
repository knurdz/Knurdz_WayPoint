"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function ConfirmContent() {
  const searchParams = useSearchParams();
  const ord1 = searchParams.get("ord1") || "ORD009876";
  const ord2 = searchParams.get("ord2") || "ORD009877";
  const isLate = searchParams.get("late") === "1";

  return (
    <section className="wp-panel screen-deferral-notice" style={{ padding: "2.5rem 1.5rem", textAlign: "center" }}>
      {isLate ? (
        <span className="mc-status-chip mc-status-chip-warn">Rolled to Next Run (Post 16:00 Cutoff)</span>
      ) : (
        <span className="mc-status-chip mc-status-chip-ok">Confirmed before cutoff</span>
      )}
      <h1 className="wp-headline-md" style={{ margin: "1rem 0 0.5rem" }}>
        Orders received
      </h1>
      <p className="font-mono" style={{ fontSize: "1.25rem", color: "var(--wp-primary)" }}>
        {ord1} · {ord2}
      </p>
      <p className="wp-subtext" style={{ maxWidth: "500px", margin: "0.5rem auto 0" }}>
        {isLate
          ? "Orders placed after 16:00 SLST cutoff will ship on the following delivery run."
          : "Delivery date Wed 01 Oct · OUT001 · queued for dispatcher planning after 16:00 SLST"}
      </p>
      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", marginTop: "1.5rem", flexWrap: "wrap" }}>
        <Link href="/store" className="wp-btn wp-btn-outline">
          Return to Portal
        </Link>
        <Link href="/dispatcher/queue" className="wp-btn wp-btn-primary">
          View in queue
        </Link>
      </div>
    </section>
  );
}

export default function StoreConfirmPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <Suspense fallback={<div>Loading confirmation details...</div>}>
        <ConfirmContent />
      </Suspense>
    </div>
  );
}
