# Waypoint Intelligent Enterprise
## Shared Distribution Logistics Platform · Tech Triathlon 2026

Waypoint is an enterprise grade shared logistics optimization platform engineered for three retail brands (Waypoint Fresh, Waypoint Style, and Waypoint Tech). It coordinates 120 retail outlets, 2 central distribution depots (Peliyagoda and Kandy), and a dedicated 60 vehicle fleet across Sri Lanka under strict operational, cold chain, and regulatory constraints.

---

## 1. Quickstart & Deployment

### Option A: Automated Docker Deployment (Judges Fast Track)

The entire application stack (Next.js Web App, Python Optimization Microservice, PostgreSQL, Redis, and Caddy Reverse Proxy) launches with automated schema migrations and seed data using our deployment script:

```bash
# 1. Generate environment variables from template
cp .env.example .env

# 2. Run automated production deployment script
bash scripts/deploy.sh
```

Once the containers are healthy:
* Web Portal: http://localhost (via Caddy on port 80) or http://localhost:3000 (direct Web)
* Python Optimization Engine: http://localhost:8000/docs (FastAPI Swagger UI)

To stop the services:
```bash
docker compose down
```

### Option B: Local Engineering Setup (Bare Metal)

If you prefer running directly on your host machine without Docker:

```bash
# 1. Install Node dependencies
pnpm install

# 2. Setup database schema and seed demonstration data
cp .env.example .env
pnpm --filter @waypoint/database db:push
pnpm --filter @waypoint/database db:seed

# 3. Start Python Allocation Microservice
cd packages/allocation
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000 &
cd ../..

# 4. Start Next.js Web Application
pnpm --filter @waypoint/web dev
```

Visit http://localhost:3000 to access the portal.

---

## 2. Seeded Demonstration Accounts

All demonstration accounts share the default password: `REDACTED`
The login screen also includes 1 click role selector buttons for rapid evaluation.

| Role | Email | Primary Responsibilities | Landing View |
|---|---|---|---|
| **Dispatcher** | `dispatcher@waypoint.test` | Post cutoff allocation, exception inbox, fleet board | `/dispatcher` |
| **Warehouse Loader** | `loader@waypoint.test` | Depot staging, reverse load LIFO scan, damage logs | `/loader` |
| **Delivery Driver** | `driver@waypoint.test` | Road manifest, offline POD signature, exception filing | `/driver` |
| **Store Manager** | `store@waypoint.test` | Daily order placement, cutoff urgency, receipt closeout | `/store` |

---

## 3. Monorepo Architecture

Waypoint is organized as a Turborepo monorepo with strict package boundaries:

```text
.
├── apps/
│   └── web/                   Next.js 16 App Router, React 19, Tailwind CSS v4, Serwist PWA
├── packages/
│   ├── allocation/            Python 3.12 FastAPI microservice with greedy solver and 14 rules
│   ├── database/              PostgreSQL Prisma 6 schema, migration scripts, and CSV seeder
│   ├── types/                 Shared TypeScript contracts and shared schema definitions
│   └── config/                Shared ESLint, Prettier, and TypeScript base configurations
├── docker/
│   ├── Caddyfile              Caddy reverse proxy with security headers and gzip compression
│   ├── web.Dockerfile         Multi stage production Dockerfile for Next.js web application
│   └── allocation.Dockerfile  Optimized Python 3.12 Dockerfile for FastAPI microservice
├── data/                      120 retail outlets, 60 fleet vehicles, and operational calendar CSVs
├── uploads/                   Local storage volume for proof of delivery photo binaries
├── scripts/
│   ├── deploy.sh              Zero downtime automated production deployment script
│   └── smoke_test.sh          Automated API assertion and end to end validation suite
├── docker-compose.yml         Multi container orchestration specification
├── pnpm-workspace.yaml        Pnpm workspace definition
├── turbo.json                 Turborepo build cache and task pipeline configuration
└── package.json               Root workspace scripts and dependencies
```

---

## 4. Five Developer Team Ownership Streams

To deliver the enterprise platform rapidly without blockers, responsibilities were divided into 5 decoupled engineering streams:

* **Stream 1 · Lead Architect & DevOps**: Monorepo scaffolding, Docker compose, Prisma 6 schema, Jose edge JWT authentication, AppShell layout, and global AI Logistics Copilot (`Cmd+K`).
* **Stream 2 · Algorithm & Backend Lead**: Python 3.12 FastAPI engine, implementation of all 14 hard feasibility rules, priority heuristic solver, and deferral diagnosis engine.
* **Stream 3 · Dispatcher Experience**: Mission Control dashboard (DISP 01), post cutoff order queue (DISP 02), drag and drop vehicle allocation board (DISP 04), and live GPS map (DISP 08).
* **Stream 4 · Driver Mobile PWA Specialist**: Mobile viewport ergonomics (390px), Serwist service worker precaching, IndexedDB offline mutation outbox, signature canvas, and background sync.
* **Stream 5 · Dock & Store Full Stack**: Store order placement (SM 03), reactive 16:00 SLST cutoff ticker (SM 05), LIFO reverse loading checklist (LOAD 03), and goods receipt closeout (SM 08).

---

## 5. Five Minute Evaluator Smoke Test Walkthrough

Follow this 5 step workflow to evaluate the full logistics lifecycle:

1. **Step 1 · Store Order Placement (`store@waypoint.test`)**:
   Log in as Store Manager. Navigate to Create Order. Submit a Fresh order containing chilled and frozen items. Observe instant voucher generation and the reactive 16:00 SLST countdown ticker.
2. **Step 2 · Dispatcher Fleet Allocation (`dispatcher@waypoint.test`)**:
   Log in as Dispatcher. Open the Post Cutoff Order Queue. Click **Run Recommendation** to trigger the Python optimization solver. Review allocated trips on the Fleet Board, examine deferral reason codes for unallocated orders, and inspect constraint validation scores.
3. **Step 3 · Dock Staging & LIFO Checklist (`loader@waypoint.test`)**:
   Log in as Loader. Open your assigned vehicle run. Inspect reverse load sequencing (farthest stop loaded first). Use barcode input to verify crates and file a simulated damage exception. Notice immediate exception alert propagation.
4. **Step 4 · Driver Road Execution & Offline POD (`driver@waypoint.test`)**:
   Switch to mobile viewport (390x844). Open route manifest. Arrive at Stop 1 and complete delivery with touch signature and photo POD. Open DevTools Network tab and toggle **Offline**. Complete Stop 2 offline. Notice the offline queue badge. Switch back to **Online** and observe automatic background reconciliation.
5. **Step 5 · Goods Receipt & Dispute Closeout (`store@waypoint.test`)**:
   Return to Store Portal. Open Receipt Confirmation. Review driver signature and photo POD. Confirm delivery or file discrepancy report with zero friction.

---

## 6. Designathon Continuity and Architectural Enhancements

Waypoint faithfully translates the complete Day 5 Designathon architectural blueprint into a fully functioning production platform, satisfying 100% of the screen flows and operational constraints:

* **Complete Screen Flow Fidelity**: All 33 user interface screens across the 4 operational roles (DISP 01 through DISP 10, LOAD 01 through LOAD 05, DRV 01 through DRV 06, and SM 01 through SM 08) are fully implemented without omissions.
* **Visual Direction & SBB Palette**: The user interface strictly adheres to the clean Swiss SBB Logistics Light Palette, flat component elevation, and high contrast typography specified in the design brief.
* **Domain Entity Integrity**: Real competition entities (`OUT001`, `OUT015`, `VEH037`, Colombo, Peliyagoda, Kandy) and operational datasets are directly wired into all views.
* **Positive Value Add Enhancements**:
  * **Global Logistics AI Copilot (`/agent` and `Cmd+K`)**: Added an intelligent enterprise assistant powered by natural language retrieval to query fleet capacity, analyze festival demand ramps, and explain constraint trade offs in real time.
  * **Mobile Ergonomics**: Driver and loader workflows are enhanced with thumb reach optimized bottom sheets, preventing accidental taps in noisy warehouse docks or roadside environments.
  * **Automated Three Way Conflict Reconciliation**: Field sync edge cases are handled automatically, ensuring that if a dispatcher defers a stop while a driver completes delivery offline, the valid physical delivery evidence takes precedence.

---

## 7. Verification and Automated Testing

```bash
# Run Python Allocation Engine test suite (24 unit and rule tests)
packages/allocation/.venv/bin/pytest packages/allocation/tests/ -v

# Run Next.js production build and TypeScript verification (62 routes)
pnpm --filter @waypoint/web run build

# Run end to end API smoke test suite
bash scripts/smoke_test.sh
```
