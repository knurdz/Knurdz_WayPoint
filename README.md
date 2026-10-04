# Waypoint Intelligent Enterprise
## Shared Distribution Logistics Platform · Tech Triathlon 2026

Waypoint is an enterprise grade shared logistics optimization and fleet management platform engineered for three retail brands (Waypoint Fresh, Waypoint Style, and Waypoint Tech). It coordinates 100 retail outlets, 2 central distribution hubs (Peliyagoda and Kandy), and a dedicated 37 vehicle fleet across Sri Lanka under strict operational, cold chain, and regulatory constraints.

---

## Submission Summary & Quick Reference

* **Public Production URL**: [https://waypoint.knurdz.org](https://waypoint.knurdz.org)
* **Local Evaluation URL**: [http://localhost:3000](http://localhost:3000) or [http://localhost](http://localhost) (via Caddy Reverse Proxy)
* **Demonstration Video**: [Tech Triathlon 2026 Demonstration Video](https://knurdz.org/waypoint-demo)
* **Repository (TeamName_SolutionName)**: [https://github.com/knurdz/Knurdz_WayPoint](https://github.com/knurdz/Knurdz_WayPoint)

### Official Submission Documentation
* **Architecture Design & Diagrams**: [docs/architecture.md](docs/architecture.md)
* **Relational Data Model & ERD**: [docs/data_model.md](docs/data_model.md)
* **AI Tool & Solver Disclosure**: [docs/ai_disclosure.md](docs/ai_disclosure.md)

### Seeded Demonstration Accounts

All seeded demonstration accounts use the verified password: `Waypoint2026!`

| Role | Seeded Email (Primary / Alternative) | Default Password | Primary Responsibilities | Target View |
|---|---|---|---|---|
| **Dispatcher** | `dispatcher@waypoint.test` <br/>`dispatcher@waypoint.knurdz.org` | `Waypoint2026!` | Post cutoff optimization, fleet board, live GPS map | `/dispatcher` |
| **Warehouse Loader** | `loader@waypoint.test` <br/>`loader@waypoint.knurdz.org` | `Waypoint2026!` | Loading dock staging, reverse LIFO sequence, damage reporting | `/loader` |
| **Delivery Driver** | `driver@waypoint.test` <br/>`driver@waypoint.knurdz.org` | `Waypoint2026!` | Route manifest, real time GPS beacon, offline touch POD | `/driver/route` |
| **Store Manager** | `store@waypoint.test` <br/>`store@waypoint.knurdz.org` | `Waypoint2026!` | Daily order placement, 16:00 cutoff alerts, receipt sign off | `/store` |

*Note: The login screen also features 1 click role selector profile cards to load assigned credentials instantly for rapid evaluation.*

---

## 1. Single Command Docker Deployment (Clean Machine Evaluation)

The entire application stack launches with a single Docker Compose command on any clean machine. An automated initialization service (`db_init`) waits for PostgreSQL, applies schema migrations, and seeds master data from operational CSVs before opening web traffic:

```bash
# 1. Clone repository
git clone https://github.com/knurdz/Knurdz_WayPoint.git
cd Knurdz_WayPoint

# 2. Copy production environment configuration
cp .env.example .env

# 3. Launch full stack with automated migration and seed
docker compose up -d
```

### Validating Service Health
Once running, verify that all services report healthy status:
```bash
docker compose ps
```

* **Web Portal**: [http://localhost:3000](http://localhost:3000) or [http://localhost](http://localhost)
* **API Health Check**: [http://localhost:3000/api/health](http://localhost:3000/api/health)
* **FastAPI Allocation Solver**: [http://localhost:8000/docs](http://localhost:8000/docs)

### Stopping Services
```bash
docker compose down
```

---

## 2. Five Minute Evaluator Walkthrough

Follow this 6 step end to end workflow to test the complete logistics lifecycle:

### Step 1: Store Order Placement
1. Navigate to `/login` and select **Store Manager** (`store@waypoint.test`).
2. On `/store`, review cool room capacity utilization (74%) and upcoming deliveries.
3. Click **Place Order**, enter ambient goods (Bread loaves, organic rice) and chilled goods (Dairy cases, curd).
4. Submit the order. Notice that orders submitted before 16:00 SLST receive instant confirmation and are queued in PostgreSQL for the morning run.

### Step 2: Dispatcher Optimization & Allocation
1. Log in as **Dispatcher** (`dispatcher@waypoint.test`).
2. Navigate to **Order Queue** (`/dispatcher/orders`). Review the unallocated orders across Colombo, Gampaha, and Kandy.
3. Click **Run Recommendation** (or navigate to `/dispatcher/allocation`). The system passes candidate orders and available vehicles to the FastAPI mathematical constraint solver.
4. Review generated trips, vehicle fill rates, and constraint compliance scores.

### Step 3: Warehouse Loading & LIFO Sequencing
1. Log in as **Warehouse Loader** (`loader@waypoint.test`).
2. On `/loader`, select an active loading run (e.g. `Trip 1 · VEH037`).
3. Verify the reverse load sequencing (last delivery stop loaded first into the chassis).
4. Confirm crate verification checklists and report any dock exceptions.

### Step 4: Driver GPS Telemetry & Proof of Delivery (POD)
1. Log in as **Delivery Driver** (`driver@waypoint.test`) on `/driver/route` (optimized for 390px mobile viewports).
2. Observe the **GPS Telemetry Active** indicator in the toolbar: the device streams real browser geolocation fixes (`navigator.geolocation`) to the backend telemetry engine.
3. Tap **Capture POD** on Stop 1 (`/driver/pod`), capture a digital touch signature and photo POD, and confirm delivery.
4. Notice that Stop 1 updates to **Delivered**, and delivery completion timestamps are written to PostgreSQL.

### Step 5: Real Time Sri Lankan Fleet Map (PickMe / Uber Precision)
1. Return to the Dispatcher portal and navigate to **Fleet Map** (`/dispatcher/map`).
2. Inspect the interactive Leaflet map centered on Sri Lanka's Western and Central transport corridors.
3. Observe active vehicles with directional heading arrows and speed tags.
4. Select `VEH037`: review its active GPS fix, completed stops, and live thermal telemetry (+3.4°C chilled).
5. Toggle between **Sri Lanka Map** and **Corridor Schematic** to compare geographic and topological perspectives.

### Step 6: Store Goods Receipt Closeout
1. Switch back to **Store Manager** (`store@waypoint.test`) on `/store`.
2. Inspect the delivered run, review the driver's submitted POD signature, and close out the delivery receipt.

---

## 3. Real Time GPS Telemetry & Predictive Routing Engine

To deliver high fidelity operational visibility similar to PickMe and Uber, Waypoint features a hybrid telemetry engine:

1. **Active Driver Browser GPS**:
   When drivers access `/driver/route`, the application utilizes `navigator.geolocation.watchPosition` to sample high accuracy latitude, longitude, heading, and speed, streaming updates to `/api/driver/telemetry`. Vehicles reporting active telemetry display a `LIVE SATELLITE GPS` badge with real time radar ripples.

2. **Predictive Route Interpolation (Fallback)**:
   When a vehicle does not have an active driver session or enters cellular blind spots, the engine predicts position using:
   * Depot departure schedules (05:00 SLST) and current elapsed time.
   * Baseline inter stop travel distances and speed metrics from `district_travel.csv`.
   * Hourly traffic congestion factors from `traffic_speed.csv`.
   * Known geographic coordinates for 100 Sri Lankan retail outlets across Western and Central Provinces.
   The engine interpolates the vehicle's position along the road polyline, calculating heading and speed while displaying a `PREDICTIVE MODEL` badge.

---

## 4. Significant Advancements Since Day 5 Design

During the transition from the Day 5 Designathon specification to production deployment, several strategic enhancements were engineered:

* **Pure Database Backed Persistence**:
  Replaced mock data with PostgreSQL 16 managed via Prisma Client. All orders, line items, vehicle allocations, trips, stops, deferrals, and proof of delivery records are persisted directly to relational tables.

* **Automated Cold Boot Orchestration (`db_init`)**:
  Introduced a dedicated migration container in `docker-compose.yml` that handles schema creation and CSV master data seeding automatically on `docker compose up`, eliminating manual setup steps on clean evaluator machines.

* **Dual Mode Interactive Fleet Cartography (PickMe / Uber Style)**:
  Enhanced the dispatcher map with an interactive Leaflet mapping engine featuring CartoDB Voyager tiles, custom top-down vehicle silhouettes distinguishing delivery Vans from dual-axle commercial Trucks, distinct Icy Blue liveries with snowflake condenser icons for refrigerated vehicles (Blue Van / Blue Truck), 3-tier load level gauges (Empty, Half Load, Full Load), dynamic heading rotation, and real-time radar ping ripples for live GPS fixes. Filter pills allow dispatchers to instantly segment the fleet by chassis, refrigeration type, and cargo fill level.

* **Offline First Resilience & Conflict Reconciliation**:
  Equipped mobile views with Serwist service worker precaching and IndexedDB mutation queues, enabling drivers to complete deliveries and capture signatures in offline basement loading docks. Upon reconnection, an automated reconciliation algorithm resolves discrepancies against central records.

* **Standalone Production Containerization**:
  Configured Next.js standalone build output, reducing container image size and dependencies while improving boot times and memory efficiency.

---

## 5. Automated Verification & Quality Assurance

Waypoint maintains strict quality gates across both frontend and backend modules:

```bash
# 1. Run Python Allocation Solver test suite (24 tests)
packages/allocation/.venv/bin/pytest packages/allocation/tests/ -v

# 2. Run TypeScript compilation across all packages (0 errors)
pnpm --filter @waypoint/web run typecheck

# 3. Run ESLint code quality suite (0 errors)
pnpm --filter @waypoint/web run lint

# 4. Run Vitest automated test suite (58 unit tests)
pnpm --filter @waypoint/web run test

# 5. Run end to end API smoke test suite
bash scripts/smoke_test.sh
```

---

## 6. Monorepo Structure

```text
.
├── apps/
│   └── web/                   Next.js 16 App Router, React 19, Tailwind CSS v4, Leaflet, Serwist PWA
├── packages/
│   ├── allocation/            Python 3.12 FastAPI microservice with constraint solver (14 hard rules)
│   ├── database/              PostgreSQL Prisma 6 schema, migration scripts, and CSV seeder
│   ├── types/                 Shared TypeScript contracts and data models
│   └── config/                Shared ESLint, Prettier, and TypeScript base configurations
├── docker/
│   ├── Caddyfile              Caddy reverse proxy with automatic TLS and security headers
│   ├── web.Dockerfile         Multi stage standalone Dockerfile for Next.js web application
│   └── allocation.Dockerfile  Optimized Python 3.12 Dockerfile for FastAPI microservice
├── data/                      100 retail outlets, 37 fleet vehicles, and road travel network CSVs
├── uploads/                   Local storage volume for proof of delivery photo binaries
├── scripts/
│   ├── deploy.sh              Automated production deployment script
│   └── smoke_test.sh          Automated API assertion and end to end validation suite
├── docker-compose.yml         Multi container orchestration specification
├── pnpm-workspace.yaml        Pnpm workspace definition
├── turbo.json                 Turborepo build cache and task pipeline configuration
└── package.json               Root workspace scripts and dependencies
```
