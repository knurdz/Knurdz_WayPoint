# AI Collaboration & Engineering Authorship Disclosure

## 1. Executive Disclosure & Philosophy

During the development of **Waypoint** for the Tech Triathlon 2026, Team Knurdz utilized modern AI developer tooling as a productivity multiplier and pair programming accelerator. 

Our engineering principle regarding AI was simple: **leverage AI to accelerate boilerplate generation and test scaffolding, but maintain strict human ownership over domain logic, mathematical constraint modeling, security architecture, and system integration.**

Every line of production code in this repository was inspected, refactored, and verified by our human team members against the hackathon problem statement.

---

## 2. Developer Tooling & Workflow

| Tool | Model / Engine | Primary Engineering Role |
| :--- | :--- | :--- |
| **Antigravity** | Agentic IDE Assistant | Terminal command automation, git workflow, and workspace orchestration |
| **Claude 3.5 Sonnet** | Anthropic LLM | TypeScript interface drafting, Tailwind UI layout skeletons, and Vitest unit test scaffolding |
| **Google Gemini** | Google LLM | Code quality review, edge case analysis, and documentation structuring |
| **Google OR-Tools** | v9.8+ Operations Research Suite | Mathematical constraint programming engine (CP-SAT and VRP routing solver) |
| **ElevenLabs** | Multilingual Voice Synthesis | Driver morning voice briefing audio generation |

---

## 3. Where AI Accelerated Our Velocity

AI tools provided significant leverage in areas of repetitive engineering:
* **Prisma Schema & Type Definitions**: Rapidly drafting repetitive relational schema definitions, database migrations, and synchronized TypeScript interfaces across the monorepo packages.
* **Test Fixture Generation**: Scaffolding baseline unit tests and edge-case boundary checks for the 14 hard feasibility rules in `pytest` and `vitest`.
* **CSS & Component Boilerplate**: Generating initial responsive layout structures and Tailwind CSS utility classes for the 4 distinct portal views (Dispatcher, Loader, Driver, Store).

---

## 4. Real-World Engineering War Stories: Where AI Failed & Humans Intervened

Experienced engineers know that AI models frequently produce naive or incorrect solutions when confronted with complex domain constraints. During the hackathon, our human engineers had to discard AI proposals and design custom architectural solutions in several critical areas:

### Case 1: The "Naive Straight-Line Distance" Trap
* **The AI Proposal**: When tasked with calculating travel durations between retail outlets, the AI generated a function using standard Euclidean/Haversine straight-line distance formulas.
* **The Reality in Sri Lanka**: Straight-line calculation produced completely unfeasible routes. In Sri Lanka's geography, traveling between the Peliyagoda hub in Colombo and outlets in the Central Province requires navigating the steep Kadugannawa Pass, where actual road distance and transit time are heavily distorted by terrain and hourly traffic bottlenecks.
* **Human Architectural Fix**: We rejected the AI's calculation and built a custom matrix reader that deterministically loads and interpolates data directly from the competition's `district_travel.csv` and `traffic_speed.csv` matrices, incorporating hourly congestion multipliers.

### Case 2: Multi-Run Vehicle Scheduling (Trip 1 vs. Trip 2)
* **The AI Proposal**: The AI repeatedly attempted to formulate the Vehicle Routing Problem as a single static dispatch run per vehicle per day.
* **The Operational Requirement**: Rule R8 explicitly allows vehicles to complete up to **two runs per day** (a morning run departing at 05:00 and an afternoon run upon return), provided the cumulative driver shift does not exceed 10 hours (Rule R10).
* **Human Architectural Fix**: The AI's single-pass formulation was incapable of scheduling subsequent runs. Our team engineered a two-phase scheduling pipeline in Python: Phase 1 clusters and allocates morning runs (Trip 1); vehicles that return with remaining driver shift hours and fuel capacity are then re-pooled into Phase 2 for subsequent afternoon runs (Trip 2).

### Case 3: Next.js SSR Leaflet Hydration Failures
* **The AI Proposal**: The AI generated client components that imported Leaflet map primitives directly into the Next.js module tree.
* **The Failure**: Because Next.js pre-renders pages on the server during SSR, Leaflet crashed immediately on initial compilation with `window is not defined` and `ReferenceError: document is not defined`.
* **Human Architectural Fix**: Our frontend engineer restructured the cartography module using Next.js `dynamic(() => import(...), { ssr: false })` with custom fallback skeleton loaders, isolating browser-only DOM operations into client-only rendering contexts.

---

## 5. Algorithmic Solvers & Voice Synthesis Details

* **Google OR-Tools Optimization Engine**:
  * The core routing algorithm does not rely on opaque LLM predictions. Instead, it utilizes **Google OR-Tools** (CP-SAT constraint programming and C++ VRP routing engines) to mathematically guarantee that all 14 hard feasibility rules are strictly satisfied.
* **ElevenLabs Speech Synthesis**:
  * Utilized strictly for generating accessible audio briefings for delivery drivers preparing for their morning route. Integrated with cached static audio fallbacks so drivers can listen to route briefings even when completely disconnected from the Internet.

---

## 6. Affirmation of Engineering Integrity

We certify that:
1. All domain concepts, constraint logic formulations, database indexing strategies, and multi-portal operational workflows were directed and validated by human team members.
2. The platform executes entirely within the provided Docker container environment on standard commodity infrastructure without hidden or undocumented external proprietary dependencies.
