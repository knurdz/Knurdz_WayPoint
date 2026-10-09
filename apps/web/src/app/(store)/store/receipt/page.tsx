"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, AlertTriangle, ShieldCheck, FileCheck, ArrowLeft, Loader2 } from "lucide-react";

interface ReceiptItem {
  id: string;
  sku: string;
  description: string;
  quantity: number;
  weightKg: number;
}

interface ReceiptData {
  orderId: string;
  deliveryCode: string;
  outletId: string;
  orderDate: string;
  tempRequirement: string;
  weightKg: number;
  status: string;
  items: ReceiptItem[];
  vehicleId: string;
  driverName: string;
  podSignature: string;
  podPhoto: string | null;
  podTimestamp: string;
  isDelivered: boolean;
}

function StoreReceiptContent() {
  const searchParams = useSearchParams();
  const orderIdParam = searchParams.get("orderId");

  const [data, setData] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [disputeFiled, setDisputeFiled] = useState(false);
  const [disputeTicket, setDisputeTicket] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const url = orderIdParam ? `/api/store/receipt?orderId=${encodeURIComponent(orderIdParam)}` : "/api/store/receipt";
    fetch(url, { signal: controller.signal })
      .then((res) => res.json())
      .then((receiptData) => {
        if (!receiptData.error) {
          setData(receiptData);
          const initialChecks: Record<string, boolean> = {};
          (receiptData.items || []).forEach((item: ReceiptItem) => {
            initialChecks[item.id] = true;
          });
          setCheckedItems(initialChecks);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Receipt load error", err);
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [orderIdParam]);

  const handleConfirmFull = async () => {
    if (!data) return;
    setConfirming(true);
    try {
      const res = await fetch("/api/store/receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: data.orderId,
          notes: notes || "Full delivery receipt confirmed and verified against driver POD",
        }),
      });
      if (res.ok) {
        setConfirmed(true);
        setDisputeFiled(false);
      }
    } catch (err) {
      console.error("Failed to confirm receipt", err);
    } finally {
      setConfirming(false);
    }
  };

  const handleFileDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    try {
      const res = await fetch("/api/store/dispute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryCode: data.deliveryCode,
          missingCount: Object.values(checkedItems).filter((v) => !v).length,
          damagedNotes: notes || "Line items missing or seal compromised",
          signatureSigned: true,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        setDisputeTicket(json.disputeId);
        setDisputeFiled(true);
        setDisputeOpen(false);
      }
    } catch (err) {
      console.error("Failed to file dispute", err);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "3rem", textAlign: "center", color: "var(--wp-muted)" }}>
        <Loader2 className="animate-spin" size={24} style={{ margin: "0 auto 10px" }} />
        <p>Loading delivery voucher and driver POD details...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="wp-panel" style={{ padding: "2rem", textAlign: "center" }}>
        <h2 className="wp-headline-sm">No Pending Goods Receipt</h2>
        <p className="wp-subtext" style={{ margin: "0.5rem 0 1.5rem" }}>
          There are no orders awaiting confirmation at this time.
        </p>
        <Link href="/store/orders" className="wp-btn wp-btn-primary">
          View Order History
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div className="screen-page-header">
        <div>
          <span className="wp-label">SM 08 · {data.deliveryCode}</span>
          <h1 className="wp-headline-md" style={{ margin: "0.35rem 0 0" }}>
            Confirm receipt vs POD
          </h1>
          <p className="wp-subtext">Order {data.orderId} · Destination {data.outletId}</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Link href="/store/orders" className="wp-btn wp-btn-outline" style={{ fontSize: "0.75rem", padding: "0.45rem 0.85rem" }}>
            Order History
          </Link>
          <Link href="/store" className="wp-btn wp-btn-outline" style={{ fontSize: "0.75rem", padding: "0.45rem 0.85rem" }}>
            Store Portal
          </Link>
        </div>
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
          ✓ Full goods receipt for order <strong>{data.orderId}</strong> successfully verified and reconciled against driver manifest.
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
          <h2 className="wp-headline-sm">Delivered Items Checklist</h2>
          <p className="wp-subtext" style={{ fontSize: "0.8rem", marginBottom: "1rem" }}>
            Verify physical units received against manifest before final sign-off.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", margin: "1rem 0" }}>
            {data.items.map((item) => (
              <label key={item.id} style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer", padding: "0.4rem 0" }}>
                <input
                  type="checkbox"
                  checked={checkedItems[item.id] ?? true}
                  onChange={(e) =>
                    setCheckedItems((prev) => ({ ...prev, [item.id]: e.target.checked }))
                  }
                />
                <div>
                  <span style={{ fontWeight: 600 }}>{item.description}</span>
                  <span className="wp-subtext" style={{ marginLeft: "0.5rem", fontSize: "0.8rem" }}>
                    · {item.quantity} units ({item.weightKg} kg)
                  </span>
                </div>
              </label>
            ))}
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
              disabled={confirmed || confirming}
            >
              {confirming ? "Confirming..." : confirmed ? "✓ Confirmed" : "Confirm full receipt"}
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
          <h2 className="wp-headline-sm">Driver POD Evidence</h2>
          <div
            className="wp-panel"
            style={{
              padding: "1.5rem",
              textAlign: "center",
              marginTop: "0.75rem",
              background: "var(--wp-subpanel, #f1f5f9)",
              border: "1px dashed var(--wp-border-color, #cbd5e1)",
              borderRadius: "8px",
            }}
          >
            <span className="wp-subtext" style={{ fontSize: "0.82rem" }}>
              Carrier: <strong>{data.vehicleId}</strong> · Driver: <strong>{data.driverName}</strong>
            </span>
            <div style={{ marginTop: "1rem", fontStyle: "italic", fontSize: "1.2rem", color: "var(--wp-primary)" }}>
              {data.podSignature.startsWith("data:") ? (
                <img
                  src={data.podSignature}
                  alt="Customer Touch Signature"
                  style={{ maxHeight: "70px", margin: "0 auto", display: "block" }}
                />
              ) : (
                data.podSignature
              )}
            </div>
            <p className="wp-subtext" style={{ fontSize: "0.75rem", marginTop: "0.5rem" }}>
              Verified: {new Date(data.podTimestamp).toLocaleTimeString("en-US", { hour12: false })} SLST
            </p>
          </div>
          <div style={{ marginTop: "1rem" }}>
            <Link href="/driver/route" className="mc-link" style={{ fontSize: "0.85rem" }}>
              View Driver Route Manifest →
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
                <input className="wp-input font-mono" value={data.deliveryCode} readOnly style={{ width: "100%", padding: "0.4rem" }} />
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

export default function StoreReceiptPage() {
  return (
    <Suspense fallback={<div style={{ padding: "2rem", textAlign: "center" }}>Loading receipt...</div>}>
      <StoreReceiptContent />
    </Suspense>
  );
}
