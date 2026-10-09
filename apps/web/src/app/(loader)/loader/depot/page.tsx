"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function LoaderDepotPage() {
  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDepot, setSelectedDepot] = useState<"Peliyagoda" | "Kandy">("Peliyagoda");
  const [date, setDate] = useState(todayStr);

  const displayDate = new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });

  return (
    <div className="wp-stack">
      <div className="screen-page-header">
        <div>
          <span className="wp-label">LOAD 01</span>
          <h1 className="wp-headline-md wp-mt-xs wp-m0">
            Select warehouse context
          </h1>
        </div>
        <Link
          href={`/loader/runs?depot=${encodeURIComponent(selectedDepot)}&date=${encodeURIComponent(date)}`}
          className="wp-btn wp-btn-primary wp-text-xs wp-pad-sm"
        >
          Continue
        </Link>
      </div>

      <div className="screen-grid-2 wp-grid-sidebar">
        <section className="wp-panel screen-panel wp-pad-lg">
          <p className="wp-label">Depot</p>
          <div className="wp-row-sm wp-mt-sm wp-mb-md">
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

          <div className="wp-field wp-mb-md">
            <label htmlFor="load-date" className="wp-text-sm wp-semibold wp-mb-xs" style={{ display: "block" }}>
              Delivery date
            </label>
            <input
              className="wp-input font-mono wp-w-full wp-pad-sm"
              id="load-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <p className="wp-subtext wp-text-sm">
            Published plans only · last sync 04:12 AM
          </p>

          <Link
            href={`/loader/runs?depot=${encodeURIComponent(selectedDepot)}&date=${encodeURIComponent(date)}`}
            className="wp-btn wp-btn-primary wp-mt-md"
            style={{ display: "inline-block" }}
          >
            Continue to vehicle runs
          </Link>
        </section>

        <aside className="wp-panel screen-panel wp-pad-lg">
          <span className="wp-label">Published dispatch plan</span>
          <h2 className="wp-headline-sm wp-mt-xs wp-mb-md">
            {displayDate} · Fresh window
          </h2>
          <div className="screen-list wp-stack-sm">
            <div className="wp-list-row">
              <span>Peliyagoda trips</span>
              <strong className="font-mono">6</strong>
            </div>
            <div className="wp-list-row">
              <span>Kandy trips</span>
              <strong className="font-mono">2</strong>
            </div>
            <div className="wp-list-row">
              <span>Reefer vehicles</span>
              <strong className="font-mono">9</strong>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
