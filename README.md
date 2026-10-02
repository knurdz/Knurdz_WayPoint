# Waypoint Intelligent Enterprise
## Shared Logistics Optimization Platform — Tech-Triathlon 2026 Hackathon

[![Next.js 16](https://img.shields.io/badge/Next.js-16%20(React%2019)-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7.4+-DC382D?logo=redis)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://www.docker.com/)

**Waypoint Intelligent Enterprise** is an enterprise-grade shared distribution logistics platform servicing three retail brands (**Waypoint Fresh**, **Waypoint Style**, and **Waypoint Tech**) across 120 retail outlets, 2 central distribution depots (Peliyagoda and Kandy), and a dedicated 60-vehicle fleet in Sri Lanka.

---

## 1. Quickstart & Deployment (Judges Walkthrough)

The entire application runs with **a single command** in a 100% self-contained Docker environment without requiring external AWS S3 or Cloudinary API keys:

```bash
# 1. Clone & Navigate to Source-Code
cd Source-Code

# 2. Copy Environment Template
cp .env.example .env

# 3. Spin Up All 5 Containers
docker compose up -d

# 4. View Service Logs
docker compose logs -f
```

Open your browser at: **`http://localhost`** (Reverse-proxied via Caddy 2.8 on port 80).

### Seeded Demonstration Accounts
All accounts share default password: **`REDACTED`**

| User Role | Seeded Email | Default Landing View |
| :--- | :--- | :--- |
| **Dispatcher** | `dispatcher@waypoint.test` | Mission Control (`/dispatcher`) & Board (`/dispatcher/allocation`) |
| **Loader** | `loader@waypoint.test` | Warehouse Dock Terminal & LIFO Checklist (`/loader`) |
| **Driver** | `driver@waypoint.test` | Road Manifest & Offline PWA (`/driver`) |
| **Store Manager**| `store@waypoint.test` | Store Order Portal & POD Closeout (`/store`) |

---

## 2. Monorepo Architecture & Directory Structure

```
Source-Code/
├── apps/
│   └── web/                   # Next.js 16 App Router (React 19, Serwist 9 PWA, Tailwind CSS v4)
├── packages/
│   ├── allocation/            # Python 3.12+ FastAPI Microservice (check_allocation.py, solver)
│   ├── database/              # PostgreSQL Prisma 6 Schema & CSV Seeder Pipeline
│   └── config/                # Shared ESLint, Prettier, and TypeScript Base Configs
├── docker/
│   ├── Caddyfile              # Centralized SSL, Security Headers & Reverse Proxy
│   ├── web.Dockerfile         # Multi-stage production container for Next.js 16
│   └── allocation.Dockerfile  # Python 3.12-slim container for FastAPI
├── data/                      # 120 Outlets, 60 Fleet & Operational Calendar CSVs
├── uploads/                   # Local volume mount for Proof of Delivery (POD) photo binaries
├── docker-compose.yml         # 5-Service Container Orchestrator
├── pnpm-workspace.yaml        # Workspace boundaries
└── turbo.json                 # Turborepo task pipeline
```

---

## 3. Five-Developer Team Ownership Directory

To eliminate blocking dependencies during development, work is divided across 5 decoupled streams with pre-established contracts:

* **Dev 1 (Lead Architect & DevOps):** Monorepo, Docker Compose, Prisma 6, JWT HttpOnly Auth, App Shell, Copilot (`Cmd+K`).
* **Dev 2 (Algorithm & Backend Lead):** Python 3.12 FastAPI microservice, 14 Hard Allocation Rules, Heuristic Priority Solver, Conflict Engine.
* **Dev 3 (Dispatcher UI Specialist):** Mission Control (`DISP-01`), Post-Cutoff Queue (`DISP-02`), Allocation Board (`DISP-04`), Live Map (`DISP-08`).
* **Dev 4 (Driver Mobile PWA Engineer):** Serwist 9 PWA, Mobile Viewport (375px), In-Browser WebP Canvas Compressor (<400KB), IndexedDB Outbox.
* **Dev 5 (Dock & Store Full-Stack):** Store Order Intake (`SM-03`), Cutoff Urgency Ticker (`SM-05`), LIFO Reverse Load Checklist (`LOAD-03`), Receipt Closeout (`SM-08`).

---

## 4. Five-Minute Judge Smoke Test Walkthrough

Follow this numbered test sequence to verify full functional completeness on a fresh Docker install:

1. **Step 1 — Store Order Intake (`store@waypoint.test`):** Place daily Fresh order with 50 chilled dairy cases + 20 produce cases. Instant voucher `ORD-92308` generated.
2. **Step 2 — Dispatcher Allocation (`dispatcher@waypoint.test`):** Open Post-Cutoff Queue (142 orders) $\to$ Click "Run Recommendation". 128 orders allocated; 14 deferred with valid reason codes (`DEF-01: NO_REEFER_AVAILABLE`). Validator sidebar displays 100% green meters.
3. **Step 3 — Dock Staging & LIFO Checklist (`loader@waypoint.test`):** Open assigned trip $\to$ Verify reverse load order (Stop 4 loaded first) $\to$ Flag 3 damaged cases on Stop 2. Immediate alert pushed to Dispatcher Exception Inbox (`DISP-07`).
4. **Step 4 — Driver Road Execution (`driver@waypoint.test`):** Complete Stop 1 with touch signature and camera POD $\to$ Toggle DevTools Offline $\to$ Complete Stop 2 offline (Banner: *1 action queued*) $\to$ Reconnect network and verify automatic batch sync.
5. **Step 5 — Goods Receipt Closeout (`store@waypoint.test`):** Open Receipt Confirmation $\to$ Review driver signature and photo POD $\to$ Confirm delivery. Lifecycle completed with zero discrepancies!
