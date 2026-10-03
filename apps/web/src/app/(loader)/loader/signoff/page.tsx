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
    <div className="wp-stack">
      <div className="screen-page-header">
        <div>
          <span className="wp-label">LOAD 05</span>
          <h1 className="wp-headline-md wp-mt-xs wp-m0">
            Ready for departure
          </h1>
        </div>
        <Link href="/driver/route" className="wp-btn wp-btn-primary wp-text-xs wp-pad-sm">
          Unlock driver route
        </Link>
      </div>

      {signedOff && (
        <div className="wp-card-panel wp-pad-md wp-text-sm" style={{ background: "var(--wp-card-bg, #f0fdf4)", borderColor: "var(--wp-success, #22c55e)" }}>
          ✓ Departure Gate Pass <strong>{gatePass}</strong> successfully issued. Cold chain seal sealed. Kamal Silva driver run sheet unlocked for Route R025229.
        </div>
      )}

      <div className="screen-grid-2 wp-grid-sidebar">
        <section className="wp-panel screen-panel wp-pad-md">
          <dl className="wp-specs-list wp-m0" style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "0.75rem" }}>
            <dt className="wp-text-muted">Vehicle</dt>
            <dd className="font-mono wp-m0 wp-bold">
              VEH037 · Trip 1
            </dd>

            <dt className="wp-text-muted">Loader</dt>
            <dd className="wp-m0">Priya Fernando</dd>

            <dt className="wp-text-muted">Stops loaded</dt>
            <dd className="wp-m0">4 / 4 reverse sequence complete</dd>

            <dt className="wp-text-muted">Timestamp</dt>
            <dd className="font-mono wp-m0">
              04:48 AM SLST
            </dd>
          </dl>

          <p className="wp-subtext wp-mt-md">
            Checklist locked after sign off · driver route R025229 activated.
          </p>

          <div className="wp-row wp-mt-md">
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

        <aside className="wp-panel screen-panel wp-pad-md">
          <span className="wp-label">Unlocks next</span>
          <h2 className="wp-headline-sm wp-mt-xs wp-mb-sm">
            Driver route R025229
          </h2>
          <p className="wp-subtext">
            Sign off locks the reverse checklist and releases Kamal Silva run sheet for delivery execution.
          </p>
          <div className="wp-mt-lg">
            <Link href="/driver/route" className="wp-btn wp-btn-primary">
              Open driver route
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
