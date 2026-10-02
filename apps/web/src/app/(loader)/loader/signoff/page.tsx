"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function LoaderSignoffPage() {
  const [signedOff, setSignedOff] = useState(false);
  const [gatePass, setGatePass] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSignoff = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/loader/signoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: "VEH037",
          loaderName: "Priya Fernando",
          stopsLoaded: "4 / 4 reverse sequence complete",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setGatePass(data.gatePassCode);
        setSignedOff(true);
      }
    } catch (err) {
      console.error("Signoff error", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div className="screen-page-header">
        <div>
          <span className="wp-label">LOAD 05</span>
          <h1 className="wp-headline-md" style={{ margin: "0.35rem 0 0" }}>
            Ready for departure
          </h1>
        </div>
        <Link href="/driver/route" className="wp-btn wp-btn-primary" style={{ fontSize: "0.75rem", padding: "0.45rem 0.85rem" }}>
          Unlock driver route
        </Link>
      </div>

      {signedOff && (
        <div
          style={{
            padding: "1rem 1.5rem",
            background: "var(--wp-card-bg, #f0fdf4)",
            border: "1px solid var(--wp-success, #22c55e)",
            borderRadius: "var(--wp-radius-sm, 6px)",
            fontSize: "0.9rem",
          }}
        >
          ✓ Departure Gate Pass <strong>{gatePass}</strong> successfully issued. Cold chain seal sealed. Kamal Silva driver run sheet unlocked for Route R025229.
        </div>
      )}

      <div className="screen-grid-2" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "1.25rem" }}>
        <section className="wp-panel screen-panel" style={{ padding: "1.25rem" }}>
          <dl className="wp-specs-list" style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "0.75rem", margin: 0 }}>
            <dt style={{ color: "var(--wp-muted)" }}>Vehicle</dt>
            <dd className="font-mono" style={{ margin: 0, fontWeight: 700 }}>
              VEH037 · Trip 1
            </dd>

            <dt style={{ color: "var(--wp-muted)" }}>Loader</dt>
            <dd style={{ margin: 0 }}>Priya Fernando</dd>

            <dt style={{ color: "var(--wp-muted)" }}>Stops loaded</dt>
            <dd style={{ margin: 0 }}>4 / 4 reverse sequence complete</dd>

            <dt style={{ color: "var(--wp-muted)" }}>Timestamp</dt>
            <dd className="font-mono" style={{ margin: 0 }}>
              04:48 AM SLST
            </dd>
          </dl>

          <p className="wp-subtext" style={{ marginTop: "1.25rem" }}>
            Checklist locked after sign off · driver route R025229 activated.
          </p>

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
            <button
              type="button"
              className="wp-btn wp-btn-primary"
              onClick={handleSignoff}
              disabled={signedOff || submitting}
            >
              {submitting ? "Issuing Gate Pass..." : signedOff ? "Departure Authorized" : "Ready for departure"}
            </button>
            <Link href="/loader" className="wp-btn wp-btn-outline">
              Review checklist
            </Link>
          </div>
        </section>

        <aside className="wp-panel screen-panel" style={{ padding: "1.25rem" }}>
          <span className="wp-label">Unlocks next</span>
          <h2 className="wp-headline-sm" style={{ margin: "0.35rem 0 0.5rem" }}>
            Driver route R025229
          </h2>
          <p className="wp-subtext">
            Sign off locks the reverse checklist and releases Kamal Silva run sheet for delivery execution.
          </p>
          <div style={{ marginTop: "1.5rem" }}>
            <Link href="/driver/route" className="wp-btn wp-btn-primary">
              Open driver route
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
