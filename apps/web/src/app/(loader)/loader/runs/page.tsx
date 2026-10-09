"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

interface TripRun {
  id: string;
  vehicle: string;
  trip: string;
  title: string;
  status: string;
  stopsCount: number;
  link: string;
}

export default function LoaderRunsPage() {
  const [runs, setRuns] = useState<TripRun[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/loader/runs", { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (data.runs && Array.isArray(data.runs)) {
          setRuns(data.runs);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Failed to load runs", err);
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div className="screen-page-header">
        <div>
          <span className="wp-label">LOAD 02</span>
          <h1 className="wp-headline-md" style={{ margin: "0.35rem 0 0" }}>
            Choose vehicle trip to load
          </h1>
          <p className="wp-subtext">Active vehicle loading manifests from dispatch allocation</p>
        </div>
        <span className="mc-pill mc-pill-warn">Plan updated · live PostgreSQL sync</span>
      </div>

      {loading ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "var(--wp-muted)" }}>
          <Loader2 className="animate-spin" size={24} style={{ margin: "0 auto 10px" }} />
          <p>Loading scheduled dock manifests...</p>
        </div>
      ) : runs.length === 0 ? (
        <div className="wp-panel" style={{ padding: "2rem", textAlign: "center" }}>
          <p className="wp-subtext">No planned trips found. Dispatcher allocation required.</p>
          <Link href="/dispatcher/allocation" className="wp-btn wp-btn-primary" style={{ marginTop: "1rem", display: "inline-block" }}>
            Run Dispatch Allocation
          </Link>
        </div>
      ) : (
        <div className="screen-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
          {runs.map((run) => (
            <article key={run.id} className="wp-panel screen-panel" style={{ padding: "1.25rem" }}>
              <span className="font-mono wp-label">
                {run.vehicle} · {run.trip}
              </span>
              <h2 className="wp-headline-sm" style={{ margin: "0.35rem 0 0.5rem" }}>
                {run.title}
              </h2>
              <span className={`mc-status-chip ${run.status === "Ready" || run.status === "Completed" ? "mc-status-chip-ok" : "mc-status-chip-info"}`}>
                {run.status}
              </span>
              <div style={{ marginTop: "1.25rem" }}>
                <Link
                  href={`/loader?tripId=${encodeURIComponent(run.id)}&vehicleId=${encodeURIComponent(run.vehicle)}`}
                  className={`wp-btn ${run.status === "Loading" || run.status === "planned" ? "wp-btn-primary" : "wp-btn-outline"}`}
                  style={{ width: "100%", textAlign: "center", display: "block" }}
                >
                  Open Reverse LIFO checklist
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
