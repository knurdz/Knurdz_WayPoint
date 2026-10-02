"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function StoreDeferralPage() {
  const [acknowledged, setAcknowledged] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <section className="wp-panel screen-deferral-notice" style={{ padding: "2.5rem 1.5rem", textAlign: "center" }}>
        <span className="mc-status-chip mc-status-chip-warn">Order deferred</span>
        <h1 className="wp-headline-md" style={{ margin: "1rem 0 0.5rem" }}>
          ORD009801 not on tomorrow run
        </h1>
        <p className="wp-subtext">
          <strong className="font-mono">REEFER_CAPACITY</strong>, refrigerated compartment unavailable for your chilled volume.
        </p>

        <div
          className="decision-note"
          style={{
            marginTop: "1.25rem",
            display: "inline-block",
            padding: "0.75rem 1.25rem",
            background: "var(--wp-card-bg, #fef2f2)",
            border: "1px solid var(--wp-warning, #f59e0b)",
            borderRadius: "var(--wp-radius-sm, 6px)",
            textAlign: "left",
          }}
        >
          Second consecutive deferral · last run also <strong className="font-mono">REEFER_CAPACITY</strong>. Supervisor override applied.
        </div>

        <p style={{ marginTop: "1.25rem", fontSize: "1rem" }}>
          Next run: <strong>Saturday 04 Oct</strong> · 05:00 to 07:30 window retained
        </p>

        <div style={{ marginTop: "1.5rem" }}>
          {acknowledged ? (
            <span className="mc-status-chip mc-status-chip-ok" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
              ✓ Notice Acknowledged by Store Manager
            </span>
          ) : (
            <button
              type="button"
              className="wp-btn wp-btn-primary"
              onClick={() => setAcknowledged(true)}
              style={{ padding: "0.6rem 1.5rem" }}
            >
              Acknowledge notice
            </button>
          )}
        </div>

        <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem", justifyContent: "center" }}>
          <Link href="/store" className="mc-link">
            Return to Store Portal →
          </Link>
          <Link href="/dispatcher/deferral" className="mc-link">
            Dispatcher deferral audit →
          </Link>
        </div>
      </section>
    </div>
  );
}
