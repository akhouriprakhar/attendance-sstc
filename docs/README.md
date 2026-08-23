# TRACE — Attendance Tracker Documentation Index

> **Master All-In-One Document:** 📖 **[`docs/MASTER_DOCUMENTATION.md`](./MASTER_DOCUMENTATION.md)** *(Single consolidated file containing all 22 guides in sequence with Heading 1 structure)*  
> **Project Version:** 1.0.0 (v4-resilient storage)  
> **Repository Type:** Client-Side Single Page Application (PWA)  
> **Tech Stack:** React 18, TypeScript 5, Vite 5, Vanilla CSS, Web Storage API, Service Worker

---

## 1. Executive Summary

**TRACE** (*"Your presence. Traced."*) is a zero-latency, offline-first Progressive Web Application (PWA) engineered for college class representatives (CRs), professors, and teaching assistants to record student attendance in seconds. It eliminates the friction of paper-based roll calls and tedious WhatsApp message drafting by providing an optimized checklist, a fast-entry "Magic Vanishing Roll Box", automatic timetable-aware smart alerts, resilient dual-snapshot `localStorage` persistence, and intelligent formatted clipboard generation.

---

## 2. Master Documentation Directory

Explore the full forensic analysis and technical architecture documentation across the following guides:

| Document | Description |
| :--- | :--- |
| **[1. Project Overview](./PROJECT_OVERVIEW.md)** | High-level & technical summary, problem statement, real-world context, and user journey. |
| **[2. System Architecture](./ARCHITECTURE.md)** | Architectural patterns, ASCII diagrams, component hierarchy, and offline PWA design. |
| **[3. Directory Structure & Inventory](./DIRECTORY_STRUCTURE.md)** | Complete file inventory, purpose, usage status, dependencies, and classification. |
| **[4. Feature Breakdown](./FEATURES.md)** | Detailed inspection of all active and dormant application features. |
| **[5. Data Flow Analysis](./DATA_FLOW.md)** | Step-by-step lifecycle traces from user touchpoints to `localStorage` and clipboard. |
| **[6. Frontend Architecture](./FRONTEND.md)** | UI design system, state hierarchy, React component analysis, and responsive layout. |
| **[7. Backend & Persistence](./BACKEND.md)** | Analysis of the backend-less offline architecture, Service Worker caching, and Web Storage. |
| **[8. Data Models & Database](./DATABASE.md)** | TypeScript interfaces, ER diagram, storage keys, schema evolution, and recovery algorithms. |
| **[9. Web APIs & Protocols](./API.md)** | Audit of browser APIs: Web Storage, Clipboard, Vibration, Service Worker, and PWA Prompts. |
| **[10. Authentication & Security Audit](./AUTHENTICATION.md)** | Single-device security model, threat vector analysis, and access control audit. |
| **[11. Configuration & Environments](./CONFIGURATION.md)** | Build configs (`vite.config.js`, `tsconfig.json`, `netlify.toml`), default subjects, and timetables. |
| **[12. Dependency Analysis](./DEPENDENCIES.md)** | Dependency audit, npm footprint analysis, and manifest verification. |
| **[13. Testing Strategy](./TESTING.md)** | Assessment of existing tests, verification gaps, and recommended test suites. |
| **[14. External Services & AI Pipelines](./EXTERNAL_SERVICES.md)** | External typography CDNs and AI-assisted data extraction workflows. |
| **[15. Security & Vulnerability Report](./SECURITY.md)** | In-depth security audit: XSS, localStorage tampering, and PWA cache hygiene. |
| **[16. Code Quality & Maintainability](./CODE_QUALITY.md)** | Code patterns, performance characteristics, hook architecture, and code health. |
| **[17. AI-Generated Code Forensics](./AI_CODE_ANALYSIS.md)** | Forensic detection of AI prompts, dual component generations, and AI artifacts. |
| **[18. Incomplete Work & Dead Code](./INCOMPLETE_WORK.md)** | Exhaustive list of orphaned components, unlinked modals, and missing CSS rules. |
| **[19. Developer & Modification Guide](./DEVELOPER_GUIDE.md)** | Practical walkthrough for adding subjects, altering schemas, and wiring dead components. |
| **[20. Viva & Interview Questions](./VIVA_QUESTIONS.md)** | Comprehensive CSE exam, viva, code review, and technical interview Q&A. |
| **[21. Project Mental Model](./PROJECT_MENTAL_MODEL.md)** | Conceptual mental model, 30-second pitch, 2-minute elevator speech, and deep dive. |
| **[22. Project Health Scorecard](./PROJECT_HEALTH.md)** | Final ratings across 10 engineering dimensions and summary verdict. |

---

## 3. Recommended Reading Order

For a developer, code reviewer, or student new to this codebase, read the documentation in this sequence:

```text
[PROJECT_OVERVIEW.md]
        ↓
[ARCHITECTURE.md]
        ↓
[DIRECTORY_STRUCTURE.md]
        ↓
[FEATURES.md] & [DATA_FLOW.md]
        ↓
[FRONTEND.md] & [DATABASE.md]
        ↓
[AI_CODE_ANALYSIS.md] & [INCOMPLETE_WORK.md]
        ↓
[DEVELOPER_GUIDE.md]
        ↓
[VIVA_QUESTIONS.md] & [PROJECT_HEALTH.md]
```

---

## 4. Key Source Code Entry Points

| File Path | Role | Description |
| :--- | :--- | :--- |
| [`src/main.tsx`](../src/main.tsx) | App Bootstrapper | Renders React root & registers Service Worker (`/sw.js`). |
| [`src/App.tsx`](../src/App.tsx) | Main Orchestrator | Connects `useAttendance` hook to panels and active modals. |
| [`src/hooks/useAttendance.ts`](../src/hooks/useAttendance.ts) | Core Engine | Manages all state, local persistence, roll calculations, and backups. |
| [`src/components/ReportPanel.tsx`](../src/components/ReportPanel.tsx) | Output Engine | Computes ratio-based WhatsApp text, 5-min alert, & clipboard copying. |
| [`src/components/StudentList.tsx`](../src/components/StudentList.tsx) | Input Engine | Roster rendering, Magic Box vanishing input, and roll grid. |
| [`src/components/Modals/SettingsModal.tsx`](../src/components/Modals/SettingsModal.tsx) | Importer | AI screenshot parser prompts, raw JSON editor, and backup tools. |
| [`src/components/Modals/TimetableModal.tsx`](../src/components/Modals/TimetableModal.tsx) | Timetable View | Weekly matrix, daily schedule, active course highlight, and live clock. |
| [`src/index.css`](../src/index.css) | Design System | High-contrast dark theme, CSS variables, and responsive layout. |

---

## 5. Quick Architecture Diagram

```text
+-----------------------------------------------------------------------------------+
|                                  BROWSER CLIENT                                   |
|                                                                                   |
|  +--------------------+     +--------------------------------------------------+  |
|  |     ReportPanel    |     |                   StudentList                    |  |
|  | - Live Report Text |     | - Search Filter      - Mark All (Toggle)         |  |
|  | - Copy to WhatsApp |     | - Magic Roll Box     - Interactive Roster List   |  |
|  | - Restore Session  |     | - 1-Tap Roll Grid    - Edit Mode (+ Add/Delete)  |  |
|  | - 5-min Class Alert|     +--------------------------------------------------+  |
|  +--------------------+                              |                            |
|            \                                         /                            |
|             \                                       /                             |
|              +-------------------------------------+                              |
|              |         useAttendance Hook          |                              |
|              |   (State Engine & Data Logic)       |                              |
|              +-------------------------------------+                              |
|                                 |                                                 |
|          +----------------------+----------------------+                          |
|          |                                             |                          |
|  +-------------------------------+             +-------------------------------+  |
|  |      LocalStorage Engine      |             |         PWA Subsystem         |  |
|  | - trace_students_v4           |             | - Service Worker (/sw.js)     |  |
|  | - trace_config_v4             |             | - CacheStorage (v10)          |  |
|  | - trace_backup_snapshot       |             | - manifest.json               |  |
|  | - trace_last_copied_session   |             | - navigator.vibrate Haptics   |  |
|  +-------------------------------+             +-------------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## 6. How to Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev

# 3. Build production bundle
npm run build

# 4. Preview production build
npm run preview
```
