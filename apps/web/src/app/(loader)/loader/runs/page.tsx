"use client";

import React from "react";
import Link from "next/link";

interface TripRun {
  id: string;
  vehicle: string;
  trip: string;
  title: string;
  status: "Loading" | "Not started" | "Ready";
  statusChip: string;
  stopsCount: number;
  actionLabel: string;
  link: string;
}

const tripRuns: TripRun[] = [
  {
    id: "run_1",
    vehicle: "VEH037",
    trip: "Trip 1",
    title: "Fresh · Colombo · 4 stops",
    status: "Loading",
    statusChip: "mc-status-chip-info",
    stopsCount: 4,
    actionLabel: "Open checklist",
    link: "/loader",
  },
  {
    id: "run_2",
    vehicle: "VEH004",
    trip: "Trip 1",
    title: "Fresh · Gampaha · 6 stops",
    status: "Not started",
    statusChip: "mc-status-chip-muted",
    stopsCount: 6,
    actionLabel: "Open checklist",
    link: "/loader",
  },
  {
    id: "run_3",
    vehicle: "VEH001",
    trip: "Trip 2",
    title: "Style and Tech · Kandy",
    status: "Ready",
    statusChip: "mc-status-chip-ok",
    stopsCount: 3,
    actionLabel: "View sign off",
    link: "/loader/signoff",
  },
];

export default function LoaderRunsPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div className="screen-page-header">
        <div>
          <span className="wp-label">LOAD 02</span>
          <h1 className="wp-headline-md" style={{ margin: "0.35rem 0 0" }}>
            Choose vehicle trip to load
          </h1>
        </div>
        <span className="mc-pill mc-pill-warn">Plan updated, live</span>
      </div>

      <div className="screen-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem" }}>
        {tripRuns.map((run) => (
          <article key={run.id} className="wp-panel screen-panel" style={{ padding: "1.25rem" }}>
            <span className="font-mono wp-label">
              {run.vehicle} · {run.trip}
            </span>
            <h2 className="wp-headline-sm" style={{ margin: "0.35rem 0 0.5rem" }}>
              {run.title}
            </h2>
            <span className={`mc-status-chip ${run.statusChip}`}>{run.status}</span>
            <div style={{ marginTop: "1.25rem" }}>
              <Link
                href={run.link}
                className={`wp-btn ${run.status === "Loading" ? "wp-btn-primary" : "wp-btn-outline"}`}
                style={{ width: "100%", textAlign: "center", display: "block" }}
              >
                {run.actionLabel}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
