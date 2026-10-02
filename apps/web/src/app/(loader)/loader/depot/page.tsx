"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function LoaderDepotPage() {
  const [selectedDepot, setSelectedDepot] = useState<"Peliyagoda" | "Kandy">("Peliyagoda");
  const [date, setDate] = useState("2026-09-30");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div className="screen-page-header">
        <div>
          <span className="wp-label">LOAD 01</span>
          <h1 className="wp-headline-md" style={{ margin: "0.35rem 0 0" }}>
            Select warehouse context
          </h1>
        </div>
        <Link href="/loader/runs" className="wp-btn wp-btn-primary" style={{ fontSize: "0.75rem", padding: "0.45rem 0.85rem" }}>
          Continue
        </Link>
      </div>

      <div className="screen-grid-2" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "1.25rem" }}>
        <section className="wp-panel screen-panel" style={{ padding: "1.5rem" }}>
          <p className="wp-label">Depot</p>
          <div style={{ display: "flex", gap: "0.5rem", margin: "0.5rem 0 1.25rem" }}>
            <button
              type="button"
              className={`wp-btn ${selectedDepot === "Peliyagoda" ? "wp-btn-primary" : "wp-btn-outline"}`}
              onClick={() => setSelectedDepot("Peliyagoda")}
            >
              Peliyagoda
            </button>
            <button
              type="button"
              className={`wp-btn ${selectedDepot === "Kandy" ? "wp-btn-primary" : "wp-btn-outline"}`}
              onClick={() => setSelectedDepot("Kandy")}
            >
              Kandy
            </button>
          </div>

          <div className="wp-field" style={{ marginBottom: "1rem" }}>
            <label htmlFor="load-date" style={{ display: "block", marginBottom: "0.35rem", fontSize: "0.8rem", fontWeight: 600 }}>
              Delivery date
            </label>
            <input
              className="wp-input font-mono"
              id="load-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>

          <p className="wp-subtext" style={{ fontSize: "0.8rem" }}>
            Published plans only · last sync 04:12 AM
          </p>

          <Link href="/loader/runs" className="wp-btn wp-btn-primary" style={{ marginTop: "1.25rem", display: "inline-block" }}>
            Continue to vehicle runs
          </Link>
        </section>

        <aside className="wp-panel screen-panel" style={{ padding: "1.5rem" }}>
          <span className="wp-label">Tomorrow published plan</span>
          <h2 className="wp-headline-sm" style={{ margin: "0.35rem 0 1rem" }}>
            30 Sep · Fresh window
          </h2>
          <div className="screen-list" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid var(--wp-border-color)" }}>
              <span>Peliyagoda trips</span>
              <strong className="font-mono">6</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid var(--wp-border-color)" }}>
              <span>Kandy trips</span>
              <strong className="font-mono">2</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0" }}>
              <span>Reefer vehicles</span>
              <strong className="font-mono">9</strong>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
