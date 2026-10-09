"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function LoaderSignoffContent() {
  const searchParams = useSearchParams();
  const vehicleId = searchParams.get("vehicleId") || "VEH037";
  const tripId = searchParams.get("tripId") || "TRIP_001";

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
          vehicleId,
          loaderName: "Priya Fernando",
          stopsLoaded: "Reverse LIFO sequence complete",
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
          <span className="wp-label">LOAD 05 · {vehicleId}</span>
          <h1 className="wp-headline-md wp-mt-xs wp-m0">
            Ready for departure
          </h1>
          <p className="wp-subtext">Peliyagoda central distribution dock · {tripId}</p>
        </div>
        <Link href="/driver/route" className="wp-btn wp-btn-primary wp-text-xs wp-pad-sm">
          Driver route manifest
        </Link>
      </div>

      {signedOff && (
        <div className="wp-card-panel wp-pad-md wp-text-sm" style={{ background: "var(--wp-card-bg, #f0fdf4)", borderColor: "var(--wp-success, #22c55e)" }}>
          ✓ Departure Gate Pass <strong>{gatePass}</strong> successfully issued. Cold chain seal sealed in PostgreSQL. Driver Kamal Silva run sheet activated for {vehicleId}.
        </div>
      )}

      <div className="screen-grid-2 wp-grid-sidebar">
        <section className="wp-panel screen-panel wp-pad-md">
          <dl className="wp-specs-list wp-m0" style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "0.75rem" }}>
            <dt className="wp-text-muted">Vehicle</dt>
            <dd className="font-mono wp-m0 wp-bold">
              {vehicleId} · {tripId}
            </dd>

            <dt className="wp-text-muted">Dock Lead</dt>
            <dd className="wp-m0">Priya Fernando</dd>

            <dt className="wp-text-muted">Loading Status</dt>
            <dd className="wp-m0">Reverse LIFO sequence staged</dd>

            <dt className="wp-text-muted">Seal Verification</dt>
            <dd className="font-mono wp-m0" style={{ color: "var(--wp-success)" }}>
              Nominal (+3.8°C Reefer)
            </dd>
          </dl>

          <p className="wp-subtext wp-mt-md">
            Checklist locks atomically after sign off. Vehicle manifest status transitions to in-transit in PostgreSQL.
          </p>

          <div className="wp-row wp-mt-md" style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button
              type="button"
              className="wp-btn wp-btn-primary"
              onClick={handleSignoff}
              disabled={signedOff || submitting}
            >
              {submitting ? "Issuing Gate Pass..." : signedOff ? "✓ Departure Authorized" : "Ready for departure"}
            </button>
            <Link href={`/loader?tripId=${encodeURIComponent(tripId)}&vehicleId=${encodeURIComponent(vehicleId)}`} className="wp-btn wp-btn-outline">
              Review checklist
            </Link>
            {signedOff && (
              <Link href="/driver/route" className="wp-btn wp-btn-primary" style={{ background: "var(--wp-info)" }}>
                Go to Driver Manifest →
              </Link>
            )}
          </div>
        </section>

        <aside className="wp-panel screen-panel wp-pad-md">
          <span className="wp-label">Next Workflow Step</span>
          <h2 className="wp-headline-sm wp-mt-xs wp-mb-sm">
            Road PWA Delivery Manifest
          </h2>
          <p className="wp-subtext">
            Once departure authorization is submitted, delivery driver Kamal Silva receives road delivery manifests and stop navigation order on his handheld PWA.
          </p>
        </aside>
      </div>
    </div>
  );
}

export default function LoaderSignoffPage() {
  return (
    <Suspense fallback={<div>Loading departure authorization...</div>}>
      <LoaderSignoffContent />
    </Suspense>
  );
}
