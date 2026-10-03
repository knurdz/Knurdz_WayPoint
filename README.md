# Waypoint Intelligent Enterprise
## Shared Logistics Optimization Platform · Tech Triathlon 2026

Waypoint Intelligent Enterprise is an enterprise grade shared distribution logistics platform servicing three retail brands (Waypoint Fresh, Waypoint Style, and Waypoint Tech) across 120 retail outlets, 2 central distribution depots (Peliyagoda and Kandy), and a dedicated 60 vehicle fleet in Sri Lanka.

## 1. Quickstart and Deployment (Judges Walkthrough)

The entire application runs with a single command in a 100 percent self contained Docker environment without requiring external cloud API keys:

```bash
# 1. Clone and navigate to Source Code directory
cd Source Code

# 2. Copy environment template
cp .env.example .env

# 3. Spin up all containers
docker compose up

# 4. View service logs
docker compose logs
```

Open your browser at: http://localhost (Reverse proxied via Caddy on port 80).

### Seeded Demonstration Accounts
All accounts share the default password: Waypoint2026!

* Dispatcher: dispatcher@waypoint.test · Landing View: Mission Control (/dispatcher) and Board (/dispatcher/allocation)
* Loader: loader@waypoint.test · Landing View: Warehouse Dock Terminal and LIFO Checklist (/loader)
* Driver: driver@waypoint.test · Landing View: Road Manifest and Offline PWA (/driver)
* Store Manager: store@waypoint.test · Landing View: Store Order Portal and POD Closeout (/store)

## 2. Monorepo Architecture and Directory Structure

```
Source Code/
├── apps/
│   └── web/                   Next.js 16 App Router with React 19, Serwist 9 PWA, and Tailwind CSS v4
├── packages/
│   ├── allocation/            Python 3.12 FastAPI Microservice with check allocation and solver
│   ├── database/              PostgreSQL Prisma 6 Schema and CSV Seeder Pipeline
│   └── config/                Shared ESLint, Prettier, and TypeScript Base Configs
├── docker/
│   ├── Caddyfile              Centralized SSL, Security Headers, and Reverse Proxy
│   ├── web.Dockerfile         Multi stage production container for Next.js 16
│   └── allocation.Dockerfile  Python 3.12 container for FastAPI
├── data/                      120 Outlets, 60 Fleet, and Operational Calendar CSVs
├── uploads/                   Local volume mount for Proof of Delivery photo binaries
├── scripts/
│   ├── deploy.sh              Automated deployment pipeline script
│   └── smoke_test.sh          Automated 5 minute judge smoke test script
├── compose configuration      Docker compose multi container orchestrator
├── workspace configuration     Pnpm monorepo workspace boundaries
└── turbo.json                 Turborepo task pipeline configuration
```

## 3. Five Developer Team Ownership Streams

To eliminate blocking dependencies during development, work was divided across 5 decoupled streams with pre established contracts:

1. Dev 1 (Lead Architect and DevOps): Monorepo, Docker Compose, Prisma 6, JWT HttpOnly Auth, App Shell, Copilot (Cmd+K).
2. Dev 2 (Algorithm and Backend Lead): Python 3.12 FastAPI microservice, 14 Hard Allocation Rules, Heuristic Priority Solver, Conflict Engine.
3. Dev 3 (Dispatcher UI Specialist): Mission Control (DISP 01), Post Cutoff Queue (DISP 02), Allocation Board (DISP 04), Live Map (DISP 08).
4. Dev 4 (Driver Mobile PWA Engineer): Serwist 9 PWA, Mobile Viewport 375px, In Browser WebP Canvas Compressor, IndexedDB Outbox.
5. Dev 5 (Dock and Store Full Stack): Store Order Intake (SM 03), Cutoff Urgency Ticker (SM 05), LIFO Reverse Load Checklist (LOAD 03), Receipt Closeout (SM 08).

## 4. Five Minute Judge Smoke Test Walkthrough

Follow this numbered test sequence to verify full functional completeness on a fresh Docker install:

1. Step 1 · Store Order Intake (store@waypoint.test): Place daily Fresh order with 50 chilled dairy cases and 20 produce cases. Instant voucher generated.
2. Step 2 · Dispatcher Allocation (dispatcher@waypoint.test): Open Post Cutoff Queue (142 orders) and click Run Recommendation. 128 orders allocated; 14 deferred with valid reason codes (DEF 01: NO REEFER AVAILABLE). Validator sidebar displays 100 percent green meters.
3. Step 3 · Dock Staging and LIFO Checklist (loader@waypoint.test): Open assigned trip and verify reverse load order (Stop 4 loaded first). Flag 3 damaged cases on Stop 2. Immediate alert pushed to Dispatcher Exception Inbox (DISP 07).
4. Step 4 · Driver Road Execution (driver@waypoint.test): Complete Stop 1 with touch signature and camera POD. Toggle DevTools Offline and complete Stop 2 offline (Banner shows actions queued). Reconnect network and verify automatic batch sync.
5. Step 5 · Goods Receipt Closeout (store@waypoint.test): Open Receipt Confirmation. Review driver signature and photo POD, then confirm delivery. Lifecycle completed with zero discrepancies.
