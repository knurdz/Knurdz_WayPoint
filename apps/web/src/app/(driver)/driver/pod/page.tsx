"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";

export default function DriverPodPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [receiverName, setReceiverName] = useState("Anjali Jayawardena");
  const [verifiedQty, setVerifiedQty] = useState(true);
  const [photoCaptured, setPhotoCaptured] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [podSuccess, setPodSuccess] = useState<string | null>(null);
  const [podError, setPodError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#0f172a";
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    setHasSignature(true);
    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSubmitPod = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setPodSuccess(null);
    setPodError(null);

    try {
      const res = await fetch("/api/driver/pod", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryCode: "DEL_88401",
          receiverName,
          verifiedQty,
          photoCaptured,
          signatureData: hasSignature ? "signature_blob_captured" : null,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPodSuccess(`Proof of delivery ${data.podId} recorded successfully. Stop 2 marked Delivered.`);
      } else {
        setPodError(data.error || "Failed to record proof of delivery");
      }
    } catch {
      setPodError("Network error while submitting proof of delivery");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div className="screen-page-header">
        <div>
          <span className="wp-label">DRV 04 · OUT001</span>
          <h1 className="wp-headline-md" style={{ margin: "0.35rem 0 0" }}>
            Proof of delivery
          </h1>
        </div>
        <Link href="/store/receipt" className="wp-btn wp-btn-outline" style={{ fontSize: "0.75rem", padding: "0.45rem 0.85rem" }}>
          Store receipt
        </Link>
      </div>

      {podSuccess && (
        <div
          style={{
            padding: "0.85rem 1.25rem",
            background: "var(--wp-card-bg, #f0fdf4)",
            border: "1px solid var(--wp-success, #22c55e)",
            borderRadius: "var(--wp-radius-sm, 6px)",
            fontSize: "0.85rem",
          }}
        >
          ✓ {podSuccess}
        </div>
      )}

      {podError && (
        <div
          style={{
            padding: "0.85rem 1.25rem",
            background: "rgba(220, 38, 38, 0.08)",
            border: "1px solid #DC2626",
            borderRadius: "var(--wp-radius-sm, 6px)",
            fontSize: "0.85rem",
            color: "#DC2626",
          }}
        >
          ⚠ {podError}
        </div>
      )}

      <div className="screen-grid-2" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "1.25rem" }}>
        {/* POD Form */}
        <section className="wp-panel screen-panel" style={{ padding: "1.25rem" }}>
          <form onSubmit={handleSubmitPod} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={verifiedQty}
                onChange={(e) => setVerifiedQty(e.target.checked)}
                style={{ width: "1.1rem", height: "1.1rem" }}
              />
              <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Quantities verified (66 units)</span>
            </label>

            <div className="wp-field">
              <label style={{ display: "block", marginBottom: "0.35rem", fontSize: "0.8rem", fontWeight: 600 }}>
                Receiver name
              </label>
              <input
                className="wp-input"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                required
                style={{ width: "100%", padding: "0.5rem" }}
              />
            </div>

            <div className="wp-field">
              <label style={{ display: "block", marginBottom: "0.35rem", fontSize: "0.8rem", fontWeight: 600 }}>
                Photo Evidence
              </label>
              <div
                className="wp-panel"
                onClick={() => setPhotoCaptured(!photoCaptured)}
                style={{
                  padding: "1.5rem",
                  textAlign: "center",
                  borderStyle: "dashed",
                  cursor: "pointer",
                  background: photoCaptured ? "var(--wp-card-bg, #f0fdf4)" : "var(--wp-subpanel, #f8fafc)",
                  borderColor: photoCaptured ? "var(--wp-success)" : "var(--wp-border-color)",
                }}
              >
                {photoCaptured ? (
                  <span style={{ color: "var(--wp-success)", fontWeight: 700, fontSize: "0.85rem" }}>
                    ✓ Delivery Photo Attached (Peliyagoda Bay Seal & Store Coolroom)
                  </span>
                ) : (
                  <span className="wp-subtext" style={{ fontSize: "0.85rem" }}>
                    📷 Tap to capture or upload delivery photo
                  </span>
                )}
              </div>
            </div>

            <div className="wp-field">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>Receiver Signature</label>
                <button
                  type="button"
                  className="mc-link"
                  onClick={clearCanvas}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.75rem" }}
                >
                  Clear signature
                </button>
              </div>
              <div style={{ border: "1px solid var(--wp-border-color, #cbd5e1)", borderRadius: "4px", background: "#fff" }}>
                <canvas
                  ref={canvasRef}
                  width={420}
                  height={110}
                  style={{ width: "100%", height: "110px", display: "block", touchAction: "none", cursor: "crosshair" }}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
              <button
                type="submit"
                className="wp-btn wp-btn-primary"
                disabled={submitting}
                style={{ flex: 1 }}
              >
                {submitting ? "Transmitting POD..." : "Submit POD"}
              </button>
              <Link href="/driver" className="wp-btn wp-btn-outline">
                Back to route
              </Link>
            </div>
          </form>
        </section>

        {/* Aside: Stop Details */}
        <aside className="wp-panel screen-panel" style={{ padding: "1.25rem" }}>
          <span className="wp-label">Stop 2 · OUT001</span>
          <h2 className="wp-headline-sm" style={{ margin: "0.35rem 0 1rem" }}>
            Fresh Galle Rd
          </h2>
          <div className="screen-list" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid var(--wp-border-color)" }}>
              <span>Dairy cases</span>
              <strong className="font-mono">42</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid var(--wp-border-color)" }}>
              <span>Curd trays</span>
              <strong className="font-mono">18</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0" }}>
              <span>Ice cream</span>
              <strong className="font-mono">6</strong>
            </div>
          </div>
          <div style={{ marginTop: "1.5rem" }}>
            <Link href="/store/receipt" className="mc-link" style={{ fontSize: "0.8rem" }}>
              Store receipt view →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
