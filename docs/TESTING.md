# Testing Strategy & Audit — TRACE

## 1. Existing Test Assessment

An inspection of the repository reveals that **there are currently no automated unit tests, integration tests, or end-to-end (E2E) test files**.

- **Test Frameworks Present:** None (no Vitest, Jest, React Testing Library, Cypress, or Playwright configured).
- **Test Scripts in `package.json`:** No `"test"` script is defined.
- **Coverage Status:** 0% automated coverage.

---

## 2. Critical Business Logic Requiring Automated Test Verification

Although the codebase is currently un-tested, the core logic in [`useAttendance.ts`](../src/hooks/useAttendance.ts) contains intricate algorithmic flows that would benefit heavily from automated unit tests:

### 1. Roll Number Renumbering Math (`saveStudentProcess` & `deleteStudent`)
- **Risk:** Deleting roll #12 must correctly decrement rolls 13..54 to 12..53 without duplicating IDs or introducing off-by-one errors.
- **Risk:** Inserting a student at roll #1 must shift all existing students up by 1 (`roll++`).

### 2. Magic Vanishing Roll Box Parser (`processRollInput`)
- **Risk:** Inputs containing multiple numbers (e.g. `"4, 12 28\n"`) or edge-case numbers (e.g. `"99"` when max roll is 54) must fail gracefully without mutating unmatched students.

### 3. Dynamic Ratio-Based Output Logic (`ReportPanel.tsx`)
- **Risk:**
  - $\text{Present} = 4, \text{Absent} = 50 \implies \text{Must output "Presentees: ..."}$
  - $\text{Present} = 50, \text{Absent} = 4 \implies \text{Must output "Absentees: ..."}$
  - $\text{Present} = \text{Absent} = 27 \implies \text{Must output "Absentees: ..."}$

### 4. Resilient LocalStorage Deserialization (`sanitizeStudents`)
- **Risk:** Importing corrupt JSON or objects with missing keys (e.g. `{ name: null, roll: "foo" }`) must be repaired by `sanitizeStudents` without crashing the React root render.

---

## 3. Recommended Testing Implementation Plan

To bring TRACE to enterprise-grade stability, the following testing stack should be introduced:

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

### Proposed Test Suite Architecture:
1. **Unit Tests (`src/hooks/__tests__/useAttendance.test.ts`):**
   - Test default student initialization.
   - Test toggle, toggleAll, markAbsentRollsByText.
   - Test roll collision and auto-increment/decrement.
   - Test JSON snapshot generation and corrupted storage recovery.
2. **Component Tests (`src/components/__tests__/ReportPanel.test.tsx`):**
   - Test ratio threshold inversion (Absentees vs. Presentees string formatting).
   - Test clipboard write trigger on button click.
3. **E2E Tests (`e2e/attendance-flow.spec.ts` using Playwright):**
   - Open app $\to$ mark all $\to$ type `"3 12 "` in Magic Box $\to$ verify roll #3 and #12 uncheck $\to$ click Copy $\to$ verify clipboard content.
