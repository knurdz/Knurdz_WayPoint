"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function StoreReceiptPage() {
  const [line1, setLine1] = useState(true);
  const [line2, setLine2] = useState(true);
  const [notes, setNotes] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [disputeFiled, setDisputeFiled] = useState(false);
  const [disputeTicket, setDisputeTicket] = useState<string | null>(null);

  const handleConfirmFull = () => {
    setConfirmed(true);
    setDisputeFiled(false);
  };

  const handleFileDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/store/dispute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryCode: "DEL_88390",
          missingCount: !line1 || !line2 ? 1 : 0,
          damagedNotes: notes || "Line items missing or seal compromised",
          signatureSigned: true,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setDisputeTicket(data.disputeId);
        setDisputeFiled(true);
        setDisputeOpen(false);
      }
    } catch (err) {
      console.error("Failed to file dispute", err);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div className="screen-page-header">
        <div>
          <span className="wp-label">SM 08 · DEL 88390</span>
          <h1 className="wp-headline-md" style={{ margin: "0.35rem 0 0" }}>
            Confirm receipt vs POD
          </h1>
        </div>
        <Link href="/store" className="wp-btn wp-btn-outline" style={{ fontSize: "0.75rem", padding: "0.45rem 0.85rem" }}>
          Back to Store Portal
        </Link>
      </div>

      {confirmed && (
        <div
          style={{
            padding: "0.85rem 1.25rem",
            background: "var(--wp-card-bg, #f0fdf4)",
            border: "1px solid var(--wp-success, #22c55e)",
            borderRadius: "var(--wp-radius-sm, 6px)",
            fontSize: "0.85rem",
          }}
        >
          ✓ Full receipt successfully verified and confirmed against driver manifest.
        </div>
      )}

      {disputeFiled && (
        <div
          style={{
            padding: "0.85rem 1.25rem",
            background: "var(--wp-card-bg, #fef2f2)",
            border: "1px solid var(--wp-danger, #ef4444)",
            borderRadius: "var(--wp-radius-sm, 6px)",
            fontSize: "0.85rem",
          }}
        >
          ⚠ Dispute ticket <strong>{disputeTicket}</strong> filed successfully. Routed to Dispatcher Exception Desk.
        </div>
      )}

      <div className="screen-grid-2" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "1.25rem" }}>
        {/* Left: Line Checklist */}
        <section className="wp-panel screen-panel" style={{ padding: "1.25rem" }}>
          <h2 className="wp-headline-sm">Line checklist</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", margin: "1rem 0" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
              <input type="checkbox" checked={line1} onChange={(e) => setLine1(e.target.checked)} />
              <span>Bread loaves x 120</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
              <input type="checkbox" checked={line2} onChange={(e) => setLine2(e.target.checked)} />
              <span>Organic rice x 40</span>
            </label>
          </div>

          <div className="wp-field" style={{ marginTop: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.35rem", fontSize: "0.8rem", fontWeight: 600 }}>
              Discrepancy notes
            </label>
            <textarea
              className="wp-textarea"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record damaged packaging, temperature breach, or missing units..."
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>

          <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.25rem" }}>
            <button
              type="button"
              className="wp-btn wp-btn-primary"
              onClick={handleConfirmFull}
              disabled={confirmed}
            >
              Confirm full receipt
            </button>
            <button
              type="button"
              className="wp-btn wp-btn-outline"
              onClick={() => setDisputeOpen(true)}
            >
              File POD Dispute
            </button>
          </div>
        </section>

        {/* Right: Driver POD Evidence */}
        <section className="wp-panel screen-panel" style={{ padding: "1.25rem" }}>
          <h2 className="wp-headline-sm">Driver POD</h2>
          <div
            className="wp-panel"
            style={{
              padding: "2rem",
              textAlign: "center",
              marginTop: "0.75rem",
              background: "var(--wp-subpanel, #f1f5f9)",
              border: "1px dashed var(--wp-border-color, #cbd5e1)",
            }}
          >
            <span className="wp-subtext" style={{ fontSize: "0.85rem" }}>
              POD photo · Signed by Anjali J. · 05:52 AM
            </span>
            <div style={{ marginTop: "1rem", fontStyle: "italic", fontSize: "1.25rem", color: "var(--wp-primary)" }}>
              Anjali Jayawardena
            </div>
          </div>
          <div style={{ marginTop: "1rem" }}>
            <Link href="/driver/route" className="mc-link">
              Driver POD screen →
            </Link>
          </div>
        </section>
      </div>

      {/* Dispute Modal */}
      {disputeOpen && (
        <div className="wp-command-backdrop" style={{ display: "block" }}>
          <div className="wp-command-dialog" style={{ padding: "1.5rem" }}>
            <h2 className="wp-headline-sm" style={{ margin: "0 0 0.5rem" }}>
              File POD Discrepancy Dispute
            </h2>
            <p className="wp-subtext">Record missing or damaged goods for immediate dispatcher reconciliation.</p>

            <form onSubmit={handleFileDispute} style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div className="wp-field">
                <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.8rem" }}>
                  Delivery Reference
                </label>
                <input className="wp-input font-mono" value="DEL_88390" readOnly style={{ width: "100%", padding: "0.4rem" }} />
              </div>

              <div className="wp-field">
                <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.8rem" }}>
                  Discrepancy Details
                </label>
                <textarea
                  className="wp-textarea"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Detail the shortage or seal damage..."
                  required
                  style={{ width: "100%", padding: "0.4rem" }}
                />
              </div>

              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                <button type="submit" className="wp-btn wp-btn-primary" style={{ flex: 1 }}>
                  Submit Dispute
                </button>
                <button type="button" className="wp-btn wp-btn-outline" onClick={() => setDisputeOpen(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
