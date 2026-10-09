"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCutoffCountdown } from "@/hooks/useCutoffCountdown";

export default function StoreOrderPage() {
  const router = useRouter();
  const cutoff = useCutoffCountdown();

  const [ambientProduct, setAmbientProduct] = useState("Bread loaves, organic rice");
  const [ambientWeight, setAmbientWeight] = useState("2100");
  const [chilledProduct, setChilledProduct] = useState("Dairy cases, curd, ice cream");
  const [chilledWeight, setChilledWeight] = useState("4850");
  const [outletCode, setOutletCode] = useState("OUT001");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.outletId) {
          setOutletCode(data.user.outletId);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/store/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ambientProduct,
          ambientWeight: Number(ambientWeight),
          chilledProduct,
          chilledWeight: Number(chilledWeight),
          outletCode: outletCode || "OUT001",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const queryParams = new URLSearchParams({
          ord1: data.orders[0]?.orderId || "ORD001",
          ord2: data.orders[1]?.orderId || "ORD002",
          late: data.isPastCutoff ? "1" : "0",
        });
        router.push(`/store/confirm?${queryParams.toString()}`);
      } else {
        const err = await res.json();
        setErrorMsg(err.error || "Order submission failed");
      }
    } catch {
      setErrorMsg("Network error placing order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div className="screen-page-header">
        <div>
          <span className="wp-label">SM 03 · Core</span>
          <h1 className="wp-headline-md" style={{ margin: "0.35rem 0 0" }}>
            Place today orders
          </h1>
          <p className="wp-subtext">Two orders same day, Fresh ambient + chilled before cutoff.</p>
        </div>
        {cutoff.isPastCutoff ? (
          <span className="mc-pill mc-pill-warn">Past 16:00 SLST (Rolled to Next Run)</span>
        ) : (
          <span className="mc-pill mc-pill-ok">Before 16:00 SLST ({cutoff.formatted} remaining)</span>
        )}
      </div>

      {errorMsg && (
        <div
          style={{
            padding: "0.75rem 1rem",
            background: "var(--wp-card-bg, #fef2f2)",
            border: "1px solid var(--wp-danger, #ef4444)",
            borderRadius: "var(--wp-radius-sm, 6px)",
            color: "var(--wp-danger, #ef4444)",
            fontSize: "0.85rem",
          }}
        >
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="screen-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
          {/* Ambient Panel */}
          <section className="wp-panel screen-panel" style={{ padding: "1.25rem" }}>
            <h2 className="wp-headline-sm">Ambient · Bakery</h2>
            <div className="wp-field" style={{ marginTop: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.35rem", fontSize: "0.8rem", fontWeight: 600 }}>
                Product
              </label>
              <input
                className="wp-input"
                value={ambientProduct}
                onChange={(e) => setAmbientProduct(e.target.value)}
                style={{ width: "100%", padding: "0.5rem" }}
                required
              />
            </div>
            <div className="wp-field" style={{ marginTop: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.35rem", fontSize: "0.8rem", fontWeight: 600 }}>
                Weight kg
              </label>
              <input
                className="wp-input font-mono"
                value={ambientWeight}
                onChange={(e) => setAmbientWeight(e.target.value)}
                type="number"
                style={{ width: "100%", padding: "0.5rem" }}
                required
              />
            </div>
          </section>

          {/* Chilled Panel */}
          <section className="wp-panel screen-panel" style={{ padding: "1.25rem" }}>
            <h2 className="wp-headline-sm">Chilled · Dairy</h2>
            <div className="wp-field" style={{ marginTop: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.35rem", fontSize: "0.8rem", fontWeight: 600 }}>
                Product
              </label>
              <input
                className="wp-input"
                value={chilledProduct}
                onChange={(e) => setChilledProduct(e.target.value)}
                style={{ width: "100%", padding: "0.5rem" }}
                required
              />
            </div>
            <div className="wp-field" style={{ marginTop: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.35rem", fontSize: "0.8rem", fontWeight: 600 }}>
                Weight kg
              </label>
              <input
                className="wp-input font-mono"
                value={chilledWeight}
                onChange={(e) => setChilledWeight(e.target.value)}
                type="number"
                style={{ width: "100%", padding: "0.5rem" }}
                required
              />
            </div>
          </section>
        </div>

        <div style={{ marginTop: "1.25rem", display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <button
            type="submit"
            className="wp-btn wp-btn-primary"
            disabled={submitting}
            style={{ padding: "0.6rem 1.25rem" }}
          >
            {submitting ? "Placing Orders..." : "Submit both orders"}
          </button>
          <Link href="/store/cutoff" className="wp-btn wp-btn-outline" style={{ padding: "0.6rem 1.25rem" }}>
            Cutoff rules
          </Link>
          <Link href="/store" className="mc-link" style={{ marginLeft: "auto", fontSize: "0.85rem" }}>
            Return to Store Portal →
          </Link>
        </div>
      </form>
    </div>
  );
}
