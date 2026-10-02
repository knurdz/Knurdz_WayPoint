"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface TripRag {
  id: string;
  tripName: string;
  weight: string;
  volume: string;
  freshMin: string;
  fuel: string;
  status: "GREEN" | "AMBER" | "RED";
  statusLabel: string;
  isRed: boolean;
}

interface LegalSwap {
  id: string;
  title: string;
  meta: string;
  targetTrip: string;
  resolvedWeight: string;
  resolvedVolume: string;
}

export default function DispatcherValidatorPage() {
  const [trips, setTrips] = useState<TripRag[]>([]);
  const [swaps, setSwaps] = useState<LegalSwap[]>([]);
  const [selectedSwap, setSelectedSwap] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadValidatorData() {
      try {
        const res = await fetch("/api/dispatcher/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        if (res.ok) {
          const data = await res.json();
          setTrips(data.trips || []);
          setSwaps(data.legalSwaps || []);
        }
      } catch (err) {
        console.error("Failed to load validation details", err);
      } finally {
        setLoading(false);
      }
    }
    loadValidatorData();
  }, []);

  const handleApplySwap = (swap: LegalSwap) => {
    if (selectedSwap === swap.id) {
      setSelectedSwap(null);
      // Revert to original red status
      setTrips((prev) =>
        prev.map((t) =>
          t.id === swap.targetTrip
            ? {
                ...t,
                weight: "5.6 / 5.5 t",
                volume: "23 / 22 m³",
                status: "RED",
                statusLabel: "Red, blocks publish",
                isRed: true,
              }
            : t
        )
      );
    } else {
      setSelectedSwap(swap.id);
      // Apply swap fix
      setTrips((prev) =>
        prev.map((t) =>
          t.id === swap.targetTrip
            ? {
                ...t,
                weight: swap.resolvedWeight,
                volume: swap.resolvedVolume,
                status: "GREEN",
                statusLabel: "Resolved Green",
                isRed: false,
              }
            : t
        )
      );
    }
  };

  const blockersCount = trips.filter((t) => t.isRed).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div className="screen-page-header">
        <div>
          <span className="wp-label">DISP 06 · RAG feasibility</span>
          <h1 className="wp-headline-md" style={{ margin: "0.35rem 0 0" }}>
            Trip validator before publish
          </h1>
        </div>
        {blockersCount > 0 ? (
          <span className="mc-pill mc-pill-danger">{blockersCount} blockers</span>
        ) : (
          <span className="mc-pill mc-pill-ok">0 blockers · Ready to publish</span>
        )}
      </div>

      {/* RAG Matrix Table */}
      <section className="wp-panel screen-panel" style={{ padding: 0, overflow: "hidden" }}>
        <div className="screen-rag-row screen-rag-head">
          <span>Trip</span>
          <span>Weight</span>
          <span>Volume</span>
          <span>Fresh min</span>
          <span>Fuel</span>
          <span>Status</span>
        </div>

        {loading ? (
          <div style={{ padding: "2rem", textAlign: "center" }}>Evaluating constraints...</div>
        ) : (
          trips.map((trip) => (
            <div key={trip.id} className={`screen-rag-row ${trip.isRed ? "is-red" : ""}`}>
              <span className="font-mono">{trip.tripName}</span>
              <span>{trip.weight}</span>
              <span>{trip.volume}</span>
              <span>{trip.freshMin}</span>
              <span>{trip.fuel}</span>
              <span>
                {trip.status === "GREEN" && <span className="mc-status-chip mc-status-chip-ok">{trip.statusLabel}</span>}
                {trip.status === "AMBER" && <span className="mc-status-chip mc-status-chip-warn">{trip.statusLabel}</span>}
                {trip.status === "RED" && <span className="mc-status-chip mc-status-chip-danger">{trip.statusLabel}</span>}
              </span>
            </div>
          ))
        )}
      </section>

      {/* Legal Swaps Resolution Panel */}
      <section className="wp-panel screen-panel" style={{ marginTop: "0.5rem" }}>
        <h2 className="wp-headline-sm">Legal swaps for VEH014 T2</h2>
        <p className="wp-subtext" style={{ margin: "0.35rem 0 1rem" }}>
          Pick one fix to clear the publish blocker without breaking constraints.
        </p>

        <div className="decision-choice-grid">
          {swaps.map((swap) => {
            const isSelected = selectedSwap === swap.id;
            return (
              <button
                key={swap.id}
                type="button"
                className={`decision-choice ${isSelected ? "active" : ""}`}
                style={{
                  textAlign: "left",
                  border: isSelected ? "2px solid var(--wp-primary)" : "1px solid var(--wp-border-color, #e2e8f0)",
                  background: isSelected ? "var(--wp-active-bg, rgba(14, 165, 233, 0.08))" : "transparent",
                  padding: "1rem",
                  borderRadius: "var(--wp-radius-sm, 6px)",
                  cursor: "pointer",
                }}
                onClick={() => handleApplySwap(swap)}
              >
                <span className="decision-choice-title" style={{ display: "block", fontWeight: 700, marginBottom: "0.35rem" }}>
                  {isSelected ? `✓ ${swap.title}` : swap.title}
                </span>
                <span className="decision-choice-meta" style={{ display: "block", fontSize: "0.78rem", color: "var(--wp-muted)" }}>
                  {swap.meta}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Budget and Slack Details */}
      <div className="screen-grid-2" style={{ marginTop: "0.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <article className="wp-panel screen-panel">
          <h2 className="wp-headline-sm">Style and Tech combined window</h2>
          <p className="wp-kpi-value font-mono" style={{ fontSize: "1.5rem", margin: "0.5rem 0" }}>
            120 / 480 min
          </p>
          <p className="wp-subtext">Separate planning budget from Fresh 270 min per vehicle per day.</p>
        </article>

        <article className="wp-panel screen-panel">
          <h2 className="wp-headline-sm">Window slack</h2>
          <p className="wp-subtext">OUT001 mall dock 05:00 to 07:30 · 18 min slack after service estimate.</p>
          <p style={{ marginTop: "0.75rem" }}>
            <Link href="/dispatcher/allocation" className="mc-link">
              Jump to Allocation Board →
            </Link>
          </p>
        </article>
      </div>
    </div>
  );
}
