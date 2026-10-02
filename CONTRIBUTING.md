# Engineering Guidelines & PR Workflow

## 1. Branch Naming Conventions
Every feature branch must follow this naming convention:
* `feat/<feature-name>` (e.g., `feat/disp-04-allocation-board`)
* `fix/<bug-name>` (e.g., `fix/van-only-truck-rejection`)
* `chore/<task-name>` (e.g., `chore/csv-seed-updates`)
* `test/<suite-name>` (e.g., `test/s1-check-allocation-pass`)

## 2. Conventional Commit Standards
Commits must adhere to the Conventional Commits specification:
* `feat(scope): add new capability`
* `fix(scope): resolve bug or constraint violation`
* `chore(scope): update dependencies, tooling or configs`
* `test(scope): add test assertions`
* `docs(scope): update documentation or handbook`

## 3. Pull Request Requirements
Before submitting a PR for review:
1. Ensure code passes local formatting: `pnpm run format:check`
2. Run automated type checking: `pnpm run lint`
3. If modifying allocation logic, verify `check_allocation.py` passes 100%:
   ```bash
   python packages/allocation/check_allocation.py
   ```
4. PR description must list:
   * Main Feature & Sub-Feature ID
   * Testing performed
   * Interface changes (if any) that impact other developers.
