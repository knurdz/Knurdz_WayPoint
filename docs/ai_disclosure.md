# AI & Algorithmic Tooling Disclosure

## 1. Disclosure Statement

In accordance with competition rules and academic/industrial integrity standards, Team Knurdz discloses the use of assistive Artificial Intelligence (AI) and algorithmic optimization tools during the design, development, and testing of the **Waypoint** platform.

All architectural decisions, business logic rules, domain modeling, system integration, and final code reviews were designed, verified, and directed by the human engineering team.

---

## 2. Tools Utilized & Scope of Use

### 2.1 Developer Tooling & LLM Assistance
* **Tool**: Antigravity (Google DeepMind Agentic Assistant) & Large Language Models (Gemini, Claude 3.5 Sonnet).
* **Scope of Use**:
  - **Code Prototyping & Boilerplate Scaffolding**: Accelerated generation of Prisma schema definitions, Next.js page boilerplate, and Tailwind UI card skeletons.
  - **Automated Test Generation**: Scaffolding unit tests and edge-case boundary checks for the 14 hard allocation rules in pytest and Vitest.
  - **Documentation & Technical Writing**: Structuring Markdown documentation, synthesizing API specifications, and drafting architectural summaries.
  - **Human Verification**: Every auto-generated line of code was inspected, refactored, and rigorously verified by team members against the hackathon problem statement.

### 2.2 Algorithmic Optimization & Solvers
* **Tool**: **Google OR-Tools** (v9.8+ Operations Research Software Suite).
* **Scope of Use**:
  - Utilized for solving the Capacitated Vehicle Routing Problem with Time Windows (CVRPTW) and mixed-integer programming (MIP) formulations.
  - Enforces all 14 domain-specific hard feasibility constraints (weight, volume, reefer temperature integrity, mall delivery cutoff windows, driver work hours, and fuel quota caps).

### 2.3 Audio & Speech Synthesis
* **Tool**: **ElevenLabs Text-to-Speech API**.
* **Scope of Use**:
  - Generation of natural driver morning voice briefings and operational shift summaries for enhanced accessibility.
  - Integrated with static fallback voice prompts for reliable offline execution.

---

## 3. Human Oversight & Engineering Authorship

The team affirms that:
1. **Domain Logic Authorship**: The specific heuristics, business rule matrices, Sri Lankan geographic cartography parameters, and multi-portal operational workflows were conceptualized and tuned by the team.
2. **Security & Data Integrity**: Security safeguards (such as RBAC middleware, bcrypt password hashing, offline IndexedDB conflict resolution, and idempotent PoD verification) were implemented and validated through dedicated manual security audits.
3. **No Unsanctioned Code / Full Reproducibility**: All models and codebases run reproducibly within the provided `docker-compose.yml` environment on standard commodity infrastructure without undisclosed external proprietary dependencies.
