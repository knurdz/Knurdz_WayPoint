"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, WifiOff, AlertTriangle, ShieldAlert, CheckCircle } from "lucide-react";

export default function DegradationPage() {
  return (
    <div style={{ padding: "1.5rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div className="screen-page-header" style={{ marginBottom: "1.5rem" }}>
        <div>
          <span className="wp-label">Page 11 · Section 8</span>
          <h1 className="wp-headline-md" style={{ margin: "0.35rem 0 0" }}>
            Degradation scenarios
          </h1>
        </div>
      </div>

      <section
        className="wp-panel deg-intro"
        style={{ padding: "1.5rem", marginBottom: "1.5rem" }}
      >
        <h2 className="wp-headline-sm" style={{ margin: 0 }}>
          Primary: Offline sync after Kandy hill country blackout
        </h2>
        <p className="wp-subtext" style={{ marginTop: "0.5rem", lineHeight: 1.5 }}>
          Mobile coverage drops in the Kandy corridor and rural hill districts. Kamal Silva on VEH037 must keep completing stops without signal while the dispatcher and store manager still need accurate status. This scenario tests the offline queue, sync progress, and conflict resolution when the server deferred OUT003 while the driver delivered offline.
        </p>
        <div style={{ marginTop: "1rem" }}>
          <Link
            href="/driver/sync"
            className="wp-btn wp-btn-primary"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
          >
            Open offline sync dashboard <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <div
        className="wp-panel"
        style={{ padding: "1.25rem", overflowX: "auto", marginBottom: "2rem" }}
      >
        <table
          className="deg-matrix"
          style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}
        >
          <thead>
            <tr style={{ borderBottom: "2px solid var(--wp-border)", textAlign: "left" }}>
              <th style={{ padding: "0.75rem" }}>State</th>
              <th style={{ padding: "0.75rem" }}>Driver (DRV 06)</th>
              <th style={{ padding: "0.75rem" }}>Dispatcher (DISP 07)</th>
              <th style={{ padding: "0.75rem" }}>Store (SM 07)</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: "1px solid var(--wp-border)" }}>
              <td style={{ padding: "0.75rem", fontWeight: 700 }}>1 Offline</td>
              <td style={{ padding: "0.75rem" }}>
                <Link href="/driver/sync" style={{ color: "var(--wp-primary)" }}>
                  Amber banner; complete stops locally
                </Link>
              </td>
              <td style={{ padding: "0.75rem" }}>
                <Link href="/dispatcher/exceptions" style={{ color: "var(--wp-primary)" }}>
                  Last sync 6:12 AM; pending stops
                </Link>
              </td>
              <td style={{ padding: "0.75rem" }}>
                <Link href="/store/tracking" style={{ color: "var(--wp-primary)" }}>
                  ETA frozen and offline note
                </Link>
              </td>
            </tr>
            <tr style={{ borderBottom: "1px solid var(--wp-border)" }}>
              <td style={{ padding: "0.75rem", fontWeight: 700 }}>2 Queued</td>
              <td style={{ padding: "0.75rem" }}>
                <Link href="/driver/sync" style={{ color: "var(--wp-primary)" }}>
                  POD x2, issue x1 queued
                </Link>
              </td>
              <td style={{ padding: "0.75rem", color: "var(--wp-muted)" }}>
                Awaiting reconnect
              </td>
              <td style={{ padding: "0.75rem" }}>
                <Link href="/store/tracking" style={{ color: "var(--wp-primary)" }}>
                  No change
                </Link>
              </td>
            </tr>
            <tr style={{ borderBottom: "1px solid var(--wp-border)" }}>
              <td style={{ padding: "0.75rem", fontWeight: 700 }}>3 Syncing</td>
              <td style={{ padding: "0.75rem" }}>
                <Link href="/driver/sync" style={{ color: "var(--wp-primary)" }}>
                  Blue Syncing 2 of 3...
                </Link>
              </td>
              <td style={{ padding: "0.75rem" }}>
                <Link href="/dispatcher/exceptions" style={{ color: "var(--wp-primary)" }}>
                  Spinner on route
                </Link>
              </td>
              <td style={{ padding: "0.75rem" }}>
                <Link href="/store/tracking" style={{ color: "var(--wp-primary)" }}>
                  Updating status...
                </Link>
              </td>
            </tr>
            <tr style={{ borderBottom: "1px solid var(--wp-border)" }}>
              <td style={{ padding: "0.75rem", fontWeight: 700 }}>4 Synced</td>
              <td style={{ padding: "0.75rem" }}>
                <Link href="/driver/sync" style={{ color: "var(--wp-primary)" }}>
                  Green and timestamps
                </Link>
              </td>
              <td style={{ padding: "0.75rem" }}>
                <Link href="/dispatcher/exceptions" style={{ color: "var(--wp-primary)" }}>
                  Checkmarks stops 2 and 3
                </Link>
              </td>
              <td style={{ padding: "0.75rem" }}>
                <Link href="/store/tracking" style={{ color: "var(--wp-primary)" }}>
                  Delivered 6:38 AM
                </Link>
              </td>
            </tr>
            <tr>
              <td style={{ padding: "0.75rem", fontWeight: 700 }}>5 Conflict</td>
              <td style={{ padding: "0.75rem" }}>
                <Link href="/driver/sync" style={{ color: "var(--wp-primary)" }}>
                  Amber conflict banner
                </Link>
              </td>
              <td style={{ padding: "0.75rem" }}>
                <Link href="/dispatcher/exceptions" style={{ color: "var(--wp-primary)" }}>
                  Accept delivery or Escalate
                </Link>
              </td>
              <td style={{ padding: "0.75rem" }}>
                <Link href="/store/tracking" style={{ color: "var(--wp-primary)" }}>
                  Status corrected after resolve
                </Link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="wp-headline-sm" style={{ marginBottom: "1rem" }}>
        Secondary scenarios
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1.25rem",
        }}
      >
        <article className="wp-panel" style={{ padding: "1.25rem" }}>
          <span className="wp-label">8.2 · Pre departure chilled shortfall</span>
          <h3 style={{ fontSize: "1rem", margin: "0.5rem 0" }}>
            Loader flags stock before departure
          </h3>
          <p className="wp-subtext" style={{ fontSize: "0.78rem" }}>
            Chilled shortfall on VEH037 trip 1, adjust plan before 4:50 AM departure.
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginTop: "1rem",
              fontSize: "0.8rem",
            }}
          >
            <Link href="/loader/shortfall" style={{ color: "var(--wp-primary)" }}>
              LOAD 04
            </Link>
            <span>→</span>
            <Link href="/dispatcher/exceptions" style={{ color: "var(--wp-primary)" }}>
              DISP 07
            </Link>
            <span>→</span>
            <Link href="/dispatcher/deferral" style={{ color: "var(--wp-primary)" }}>
              DISP 05
            </Link>
          </div>
        </article>

        <article className="wp-panel" style={{ padding: "1.25rem" }}>
          <span className="wp-label">8.3 · Mid route breakdown</span>
          <h3 style={{ fontSize: "1rem", margin: "0.5rem 0" }}>
            Mechanical fault in transit
          </h3>
          <p className="wp-subtext" style={{ fontSize: "0.78rem" }}>
            VEH037 cooling unit fault detected. Remaining stops rerouted to nearest depot.
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginTop: "1rem",
              fontSize: "0.8rem",
            }}
          >
            <Link href="/driver/issue" style={{ color: "var(--wp-primary)" }}>
              DRV 05
            </Link>
            <span>→</span>
            <Link href="/dispatcher/exceptions" style={{ color: "var(--wp-primary)" }}>
              DISP 07
            </Link>
          </div>
        </article>

        <article className="wp-panel" style={{ padding: "1.25rem" }}>
          <span className="wp-label">8.4 · Store refusal</span>
          <h3 style={{ fontSize: "1rem", margin: "0.5rem 0" }}>
            Store manager rejects delivery
          </h3>
          <p className="wp-subtext" style={{ fontSize: "0.78rem" }}>
            Coolroom capacity full at OUT003. Stock returned to vehicle inventory.
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginTop: "1rem",
              fontSize: "0.8rem",
            }}
          >
            <Link href="/driver/issue" style={{ color: "var(--wp-primary)" }}>
              DRV 05
            </Link>
            <span>→</span>
            <Link href="/store/receipt" style={{ color: "var(--wp-primary)" }}>
              SM 08
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
