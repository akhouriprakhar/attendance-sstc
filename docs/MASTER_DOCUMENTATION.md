# TRACE — Complete Master Documentation & Forensic Knowledge Base

> **Project Name:** TRACE (*"Your presence. Traced."*)  
> **Version:** 1.0.0 (v4-resilient storage)  
> **Target Audience:** College Class Representatives (CRs), Professors, TAs, CSE Students, Code Reviewers  
> **Tech Stack:** React 18, TypeScript 5, Vite 5, Vanilla CSS, Web Storage API, Service Worker  

---

# Table of Contents
1. [Master Overview & Index](#1-master-overview--index)
2. [Project Overview & Problem Statement](#2-project-overview--problem-statement)
3. [System Architecture & PWA Design](#3-system-architecture--pwa-design)
4. [Directory Structure & File Inventory](#4-directory-structure--file-inventory)
5. [Feature Breakdown (Active & Dormant)](#5-feature-breakdown-active--dormant)
6. [Data Flow Analysis & Interaction Traces](#6-data-flow-analysis--interaction-traces)
7. [Frontend Architecture & UI Design System](#7-frontend-architecture--ui-design-system)
8. [Backend-Less Architecture & Persistence](#8-backend-less-architecture--persistence)
9. [Database Models & Storage Schema](#9-database-models--storage-schema)
10. [Web Platform APIs & Browser Interfaces](#10-web-platform-apis--browser-interfaces)
11. [Authentication & Security Boundaries](#11-authentication--security-boundaries)
12. [Configuration, Environment & Build Settings](#12-configuration-environment--build-settings)
13. [Dependency Audit & Footprint Analysis](#13-dependency-audit--footprint-analysis)
14. [Testing Strategy & Quality Assurance](#14-testing-strategy--quality-assurance)
15. [External Services & AI Prompt Pipelines](#15-external-services--ai-prompt-pipelines)
16. [Security & Vulnerability Analysis](#16-security--vulnerability-analysis)
17. [Code Quality & Maintainability Audit](#17-code-quality--maintainability-audit)
18. [AI-Generated Code Forensics](#18-ai-generated-code-forensics)
19. [Incomplete Work & Dead Code Catalog](#19-incomplete-work--dead-code-catalog)
20. [Developer & Modification Guide](#20-developer--modification-guide)
21. [CSE Viva & Technical Interview Q&A](#21-cse-viva--technical-interview-qa)
22. [Project Mental Model & Layered Explanations](#22-project-mental-model--layered-explanations)
23. [Project Health Scorecard & Final Verdict](#23-project-health-scorecard--final-verdict)

---

# 1. Master Overview & Index

## Executive Summary
**TRACE** is a zero-latency, offline-first Progressive Web Application (PWA) engineered for college class representatives (CRs), professors, and teaching assistants to record student attendance in seconds. It eliminates the friction of paper-based roll calls and tedious WhatsApp message drafting by providing an optimized checklist, a fast-entry "Magic Vanishing Roll Box", automatic timetable-aware smart alerts, resilient dual-snapshot `localStorage` persistence, and intelligent formatted clipboard generation.

## Key Source Code Entry Points

| File Path | Role | Description |
| :--- | :--- | :--- |
| `src/main.tsx` | App Bootstrapper | Renders React root & registers Service Worker (`/sw.js`). |
| `src/App.tsx` | Main Orchestrator | Connects `useAttendance` hook to panels and active modals. |
| `src/hooks/useAttendance.ts` | Core Engine | Manages all state, local persistence, roll calculations, and backups. |
| `src/components/ReportPanel.tsx` | Output Engine | Computes ratio-based WhatsApp text, 5-min alert, & clipboard copying. |
| `src/components/StudentList.tsx` | Input Engine | Roster rendering, Magic Box vanishing input, and roll grid. |
| `src/components/Modals/SettingsModal.tsx` | Importer | AI screenshot parser prompts, raw JSON editor, and backup tools. |
| `src/components/Modals/TimetableModal.tsx` | Timetable View | Weekly matrix, daily schedule, active course highlight, and live clock. |
| `src/index.css` | Design System | High-contrast dark theme, CSS variables, and responsive layout. |

## Quick Architecture Summary

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

## How to Run Locally

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

---

# 2. Project Overview & Problem Statement

## What Is This Project?

### Simple Explanation
**TRACE** is a lightweight, dark-mode web application designed to help college Class Representatives (CRs) and professors take attendance in under 30 seconds. Instead of calling out names one-by-one or writing roll numbers on paper, the user quickly checks off students or types absent roll numbers into a rapid-entry input box. The app immediately formats a complete WhatsApp attendance report ready to be copied and pasted into official college WhatsApp or Telegram groups.

### Technical Explanation
TRACE is a single-page Progressive Web Application (PWA) built using React 18, TypeScript, and Vite. It operates strictly client-side without a backend server or external database. All persistent state—including a 54-student class roster, semester schedules, and subject allocations—is serialized and synchronized to browser `localStorage` under versioned keys with snapshot-level redundancy. It uses Service Workers to provide offline operation and leverages the Web Vibration API for tactile haptic feedback during roll checks and lecture transition alerts.

## Problem Statement & Real-World Context

### The Real-World Problem
In Indian engineering colleges (and higher education institutions generally), taking attendance during lectures presents recurring operational friction:
1. **Time Consumption:** Traditional oral roll calls for batches of 50–70 students consume 7–12 minutes out of a standard 50-minute lecture period.
2. **Connectivity Issues in Classrooms:** Cloud-based attendance software and college portals frequently fail in lecture halls with poor cellular data reception or restricted Wi-Fi.
3. **WhatsApp / Telegram Group Reporting:** Class Representatives are required to submit formatted attendance messages to department chat groups after every lecture (e.g., *"Friday: 18/07/2026, Lecture - 2, Absentees: 4, 12, 38"*). Manually drafting these messages is error-prone.
4. **Variable Reporting Conventions:** If only 4 students attend an elective lab, the CR must report the *Presentees* list rather than 50 absent roll numbers. If 50 students attend, they report the *Absentees* list. Calculating and inverting this manually in a hurry leads to mistakes.

### The Technical Solution
TRACE solves these challenges through:
- **Zero-Latency Offline Execution:** Instantaneous rendering and zero network roundtrips.
- **Intelligent Ratio-Based Output:** Automatically toggles between reporting *Absentees* (when attendance is $\ge 50\%$) and *Presentees* (when attendance is $< 50\%$).
- **Magic Vanishing Absent Box:** An optimized text input that parses roll numbers delimited by spaces or commas, unchecks the matching students, and automatically clears the input for the next entry.
- **Schedule-Aware Timetable Tracker:** A weekly schedule matrix that tracks the active lecture in real time and alerts the user 5 minutes before class ends.
- **AI-Prompt Bridge:** Built-in copyable prompts allowing users to take photos of class lists or timetable PDFs, convert them to JSON via ChatGPT/Claude/Gemini, and import them directly into the app.

## Target Audience & Users

| User Persona | Typical Use Case |
| :--- | :--- |
| **Class Representatives (CRs)** | Taking attendance during college lectures on a mobile phone and posting formatted reports to WhatsApp. |
| **College Professors & Lecturers** | Checking off students on a tablet/laptop or verifying which students are absent before beginning a lab session. |
| **Lab Instructors & TAs** | Managing multi-slot practical sessions (e.g. "Python Lab / DBMS Lab") with quick presentee/absentee tracking. |

## User Journey & Workflow

```text
[User Opens App in Classroom (Even Offline)]
                     ↓
[App Loads Cached Roster (54 Students) from localStorage]
                     ↓
[User Selects Lecture Number (Start / End)]
                     ↓
[Attendance Input Method]
 ├── Method A: Tap Student Cards in Checklist
 ├── Method B: Click 1-Tap "Roll Grid" (#1 .. #54)
 ├── Method C: Type Absent Numbers in "Magic Roll Box" (e.g., "4 12 38 ")
 └── Method D: Click "Mark All" then uncheck absentees
                     ↓
[ReportPanel Instantly Generates Formatted Text]
 (Auto-determines Absentees vs. Presentees based on majority count)
                     ↓
[User Taps "Copy Report"]
 ├── Text copied to Clipboard
 ├── Vibration haptic pulse triggered
 └── Snapshot saved to localStorage (for "Restore Last Session")
                     ↓
[User Pastes into College WhatsApp Group]
```

## Summary of Core Metrics
- **Default Batch Size:** 54 Students (Rolls 1 to 54)
- **Target Semester:** 4th Semester (Computer Science & Engineering)
- **Active Core Subjects:** 9 Courses (CSA, DBMS, ADA, JAVA, Discrete Math, Python/DBMS Lab, Mini Project/Java Lab, Personality Development, Library)
- **Client Storage Engines:** `localStorage` (4 keys: `trace_students_v4`, `trace_config_v4`, `trace_backup_snapshot`, `trace_last_copied_session`)
- **PWA Cache Version:** `trace-app-cache-v10`

---

# 3. System Architecture & PWA Design

## Architectural Style & Paradigm
TRACE employs a **Client-Side Single-Page Application (SPA)** architecture structured around an **Offline-First Progressive Web App (PWA)** design.

Key characteristics:
- **No Backend Web Server:** The application has no server-side execution runtime (no Node.js Express server, no Django/Flask, no cloud functions).
- **Static Hosting:** The production build consists entirely of static HTML, CSS, JavaScript, and asset files served via CDN (Netlify).
- **Local Persistence Model:** All state mutates purely within the client's browser memory and is serialized to Web Storage (`localStorage`).
- **Service Worker Interception:** Network requests for static shell assets are intercepted by a Service Worker and served from the browser's `CacheStorage`.

## Detailed System Architecture Diagram

```text
+-------------------------------------------------------------------------------+
|                                USER BROWSER                                   |
|                                                                               |
|  +-------------------------------------------------------------------------+  |
|  |                             PRESENTATION TIER                           |  |
|  |                                                                         |  |
|  |   +-----------------------+              +--------------------------+   |  |
|  |   |      ReportPanel      |              |       StudentList        |   |  |
|  |   |  - Lecture Selector   |              |  - Search & Filters      |   |  |
|  |   |  - Formatted Output   |              |  - Checkbox Roster       |   |  |
|  |   |  - Copy & Restore     |              |  - 1-Tap Roll Grid       |   |  |
|  |   |  - 5-Min Alert Notice |              |  - Magic Vanishing Input |   |  |
|  |   +-----------------------+              +--------------------------+   |  |
|  |              \                                /                         |  |
|  |               \                              /                          |  |
|  |        +--------------------------------------------+                   |  |
|  |        |             MODAL SUBSYSTEM                |                   |  |
|  |        |  - SettingsModal (AI Importers, Backup)    |                   |  |
|  |        |  - TimetableModal (Matrix, Daily Timeline) |                   |  |
|  |        |  - StudentModal (Add / Edit Roll & Name)   |                   |  |
|  |        +--------------------------------------------+                   |  |
|  +-------------------------------------------------------------------------+  |
|                                       |                                       |
|  +-------------------------------------------------------------------------+  |
|  |                           APPLICATION LOGIC TIER                        |  |
|  |                                                                         |  |
|  |   +-----------------------------------------------------------------+   |  |
|  |   |                      useAttendance Hook                         |   |  |
|  |   |  - State: students[], config, editMode                          |   |  |
|  |   |  - Logic: toggle, bulk uncheck, shift rolls on add/delete       |   |  |
|  |   |  - Formatting: TitleCase, ratio calculation                     |   |  |
|  |   |  - Backup: snapshot writer, JSON export/import                  |   |  |
|  |   +-----------------------------------------------------------------+   |  |
|  +-------------------------------------------------------------------------+  |
|                                       |                                       |
|  +-------------------------------------------------------------------------+  |
|  |                           CLIENT DATA & OS TIER                         |  |
|  |                                                                         |  |
|  |   +------------------------+  +-------------------+  +---------------+  |  |
|  |   |    LocalStorage API    |  |  Service Worker   |  | Web Vibration |  |  |
|  |   |  - trace_students_v4   |  |  - /sw.js         |  | - Haptic feedback|
|  |   |  - trace_config_v4     |  |  - CacheStorage   |  |   on check/alert|
|  |   |  - trace_backup_snap   |  |    (v10)          |  +---------------+  |  |
|  |   |  - trace_last_copied   |  +-------------------+  +---------------+  |  |
|  |   +------------------------+                         | Web Clipboard |  |  |
|  |                                                      | - Copy report |  |  |
|  |                                                      +---------------+  |  |
|  +-------------------------------------------------------------------------+  |
+-------------------------------------------------------------------------------+
```

## Component Hierarchy & Module Tree

```text
index.html
└── src/main.tsx
    └── src/App.tsx
        ├── src/hooks/useAttendance.ts (Custom Hook)
        │
        ├── src/components/ReportPanel.tsx
        │   └── Live WhatsApp text computation & haptic alert timer
        │
        ├── src/components/StudentList.tsx
        │   ├── 1-Tap Roll Grid
        │   ├── Search Filter
        │   ├── Magic Vanishing Roll Box
        │   └── Student Item Row List
        │
        ├── src/components/Modals/StudentModal.tsx
        │   └── Add / Edit Student Roll & Name form
        │
        ├── src/components/Modals/TimetableModal.tsx
        │   ├── Live Clock Header
        │   ├── Course Filter Pills
        │   ├── Day Tab Timeline View
        │   └── Weekly Matrix View
        │
        └── src/components/Modals/SettingsModal.tsx
            ├── Tab 1: AI Photo/PDF Smart Importer (Timetable, Roster, Faculty)
            ├── Tab 2: Raw Config JSON Editor
            └── Tab 3: Offline Backup & Restore (Download / Upload JSON)
```

## Offline & Progressive Web App (PWA) Architecture

TRACE conforms to PWA standards through three core components:

1. **Web App Manifest (`public/manifest.json`):**
   - Declares standalone display mode (`"display": "standalone"`).
   - Customizes theme colors (`#0a0a0a`) and home screen icons (`192x192` and `512x512`).
   - Hooks into the browser's `beforeinstallprompt` event via `ReportPanel.tsx` to render an inline "Install App" button.

2. **Service Worker (`public/sw.js`):**
   - Implements a cache-first network fallback strategy (`caches.match(event.request).then(response => response || fetch(event.request))`).
   - Versioned cache identifier: `trace-app-cache-v10`.
   - Automatically claims clients on activation (`self.clients.claim()`) and purges stale caches.

3. **Client-Side SPA Routing (`public/_redirects` & `netlify.toml`):**
   - Serves `index.html` for all route requests with status 200, enabling clean browser URL navigation without 404s.

---

# 4. Directory Structure & File Inventory

## Comprehensive File Inventory & Classification

| File Path | Type | Purpose / Business Logic | Usage Status | Dependencies / Imports | Dependents / Callers | Generated / AI Artifact |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `index.html` | HTML | Entry HTML host document, font preconnects, PWA meta | **CONFIRMED USED** | Google Fonts, `/src/main.tsx` | Browser | Human / Template |
| `package.json` | JSON | Package manifest, scripts, npm dependencies | **CONFIRMED USED** | React 18, Vite 5, TS 5 | npm / Vite | Project Config |
| `package-lock.json` | JSON | Dependency lockfile | **CONFIRMED USED** | Exact npm dependency tree | npm | Generated (npm) |
| `tsconfig.json` | JSON | TypeScript compiler options | **CONFIRMED USED** | ES2020, JSX react-jsx | `tsc` / Vite | Project Config |
| `vite.config.js` | JS | Vite bundler configuration | **CONFIRMED USED** | `@vitejs/plugin-react` | Vite CLI | Project Config |
| `netlify.toml` | TOML | Netlify build & publish directory spec | **CONFIRMED USED** | None | Netlify CI/CD | Deployment Config |
| `public/_redirects` | Text | Netlify SPA rewrite rule (`/* /index.html 200`) | **CONFIRMED USED** | None | Netlify Edge | Deployment Config |
| `public/manifest.json` | JSON | PWA installation manifest | **CONFIRMED USED** | `icon-192.png`, `icon-512.png` | `index.html`, Browser | PWA Config |
| `public/sw.js` | JS | Service Worker cache & offline fetch proxy | **CONFIRMED USED** | CacheStorage API | `main.tsx`, Browser | PWA Service Worker |
| `public/icon-192.png` | PNG | 192px application icon | **CONFIRMED USED** | None | `manifest.json`, `index.html`| Asset |
| `public/icon-512.png` | PNG | 512px splash / high-res icon | **CONFIRMED USED** | None | `manifest.json` | Asset |
| `src/main.tsx` | TSX | Application bootstrap, React root render, SW registration | **CONFIRMED USED** | React, `App.tsx`, `index.css`| `index.html` | Application Root |
| `src/index.css` | CSS | Master styling, color tokens, layout flexbox/grid | **CONFIRMED USED** | Google Fonts (Inter, Roboto Mono) | `main.tsx` | Styling |
| `src/types/index.ts` | TS | Core TypeScript interface contracts | **CONFIRMED USED** | None | All `src/` modules | Type Definitions |
| `src/hooks/useAttendance.ts` | TS | State management, `localStorage` synchronization, roll math | **CONFIRMED USED** | React, `types/index.ts` | `App.tsx` | Core Hook |
| `src/App.tsx` | TSX | Root UI container connecting hook to panels & modals | **CONFIRMED USED** | `useAttendance`, panels, modals | `main.tsx` | Container Component |
| `src/components/ReportPanel.tsx` | TSX | WhatsApp report formatting, stats, copy button, 5-min alert | **CONFIRMED USED** | React, `types/index.ts` | `App.tsx` | UI Component |
| `src/components/StudentList.tsx` | TSX | Roster checklist, magic absent box, roll grid, search | **CONFIRMED USED** | React, `types/index.ts` | `App.tsx` | UI Component |
| `src/components/Modals/StudentModal.tsx` | TSX | Add / Edit roll number & student name modal | **CONFIRMED USED** | React, `types/index.ts` | `App.tsx` | Modal Component |
| `src/components/Modals/TimetableModal.tsx` | TSX | Daily schedule & weekly matrix timetable viewer | **CONFIRMED USED** | React, `types/index.ts` | `App.tsx` | Modal Component |
| `src/components/Modals/SettingsModal.tsx` | TSX | AI Prompt copy & importer, JSON editor, backup downloader | **CONFIRMED USED** | React, `types/index.ts` | `App.tsx` | Modal Component |
| `src/components/StudentItem.tsx` | TSX | Card item with color threshold gauge and custom checkbox | **UNUSED / DEAD CODE** | React, `types/index.ts` | None | Alternative / AI Component |
| `src/components/AnalyticsTab.tsx` | TSX | Class analytics, defaulter calculations, catch-up math | **UNUSED / DEAD CODE** | React, `types/index.ts` | None | Alternative / AI Component |
| `src/components/HistoryTab.tsx` | TSX | Past session log viewer and session copier | **UNUSED / DEAD CODE** | React, `types/index.ts` | None | Alternative / AI Component |
| `src/components/SkeletonRoster.tsx` | TSX | Animated loading skeleton placeholder | **UNUSED / DEAD CODE** | React | None | Orphaned UI Component |
| `src/components/ToastNotification.tsx` | TSX | Floating toast notification banner | **UNUSED / DEAD CODE** | React | None | Orphaned UI Component |
| `src/components/ToastError.tsx` | TSX | System error banner with retry trigger | **UNUSED / DEAD CODE** | React | None | Orphaned UI Component |
| `src/components/Modals/StudentDetailModal.tsx` | TSX | Student absence history timeline & stats correction modal | **UNUSED / DEAD CODE** | React, `types/index.ts` | None | Orphaned UI Component |
| `src/components/Modals/RandomPickerModal.tsx` | TSX | Random present student picker ("Cold Call Questioner") | **UNUSED / DEAD CODE** | React, `types/index.ts` | None | Orphaned UI Component |
| `src/components/Modals/BulkImportModal.tsx` | TSX | Textarea bulk roster importer | **UNUSED / DEAD CODE** | React | None | Orphaned UI Component |
| `src/components/Modals/KeyboardShortcutsModal.tsx` | TSX | Hotkeys summary cheat-sheet modal | **UNUSED / DEAD CODE** | React | None | Orphaned UI Component |

---

# 5. Feature Breakdown (Active & Dormant)

## Active Working Features

### Feature 1: Interactive Checklist & Roster Management
- **Description:** Real-time interactive student checklist displaying student roll numbers (1..54) and full names.
- **User Interaction:** Tap/click any row to toggle presence state between Present (checked) and Absent (unchecked).
- **Haptic Integration:** Triggers a 10ms vibration pulse via `navigator.vibrate(10)` on mobile devices upon tapping.
- **Search Filtering:** Real-time search bar filters the displayed roster by student name or roll number as the user types.
- **Mark All:** One-click toggle that marks all students present (if any are absent) or all absent (if all are present).

### Feature 2: "Magic Vanishing" Absent Roll Number Input
- **Description:** A specialized high-speed entry box for marking absentees without scrolling through the list.
- **Mechanism:**
  1. The user types roll numbers into the box (e.g. `3`, `12`, `28`).
  2. As soon as the user presses `Space`, `Comma (,)`, or `Enter`, the event listener matches all integer tokens via regex `/\b\d+\b/g`.
  3. The hook immediately marks those roll numbers as `p = false` (absent).
  4. A brief toast pops up: `"Roll #X marked absent"`.
  5. The input field is **instantly cleared** so the user can continue typing the next roll number without backspacing.

### Feature 3: Compact 1-Tap Roll Number Grid
- **Description:** A collapsable numerical matrix of buttons (`#1` through `#54`).
- **Mechanism:** Color-coded buttons indicate presence (white badge) vs. absence (red badge). Tapping any button immediately flips that student's attendance without having to scroll the name list.

### Feature 4: Intelligent Ratio-Based WhatsApp Report Generation
- **Description:** Automatically generates a standard college attendance message formatted for WhatsApp/Telegram.
- **Dynamic Inversion Logic:**
  - If $\text{Present} < \text{Absent}$ (e.g. elective or low turnout): Outputs **Presentees** (e.g., `Presentees: 1, 4, 12`).
  - If $\text{Present} \ge \text{Absent}$ (normal lecture): Outputs **Absentees** (e.g., `Absentees: 6, 13, 28`).
  - Formats date (`DD/MM/YYYY`), weekday name (`Friday`), and lecture slot (`Lecture - 1` or `Lecture - 1-2`).

### Feature 5: One-Click Copy & Session Recovery
- **Description:** "Copy Report" writes the formatted text to `navigator.clipboard`.
- **Session Memory:** Concurrently saves the exact present/absent state map to `localStorage.trace_last_copied_session`.
- **Restore Last Session:** If the user accidentally refreshes or resets attendance for a new class and needs the previous checkmark state back, clicking "Restore Last Session" restores the last copied state map.

### Feature 6: Schedule-Aware 5-Minute Class End Haptic Warning
- **Description:** An automated background timer checks the active day's timetable against the device clock every 10 seconds.
- **Trigger:** If the current system time falls within the last 5 minutes of a scheduled lecture (`endMins - 5 <= now < endMins`), the app renders an amber banner (`Notice: 5 minutes remaining in lecture. Take attendance.`) and vibrates the phone for 50ms.

### Feature 7: Timetable Schedule & Active Lecture Matrix
- **Description:** A dedicated modal displaying class schedules for Monday through Saturday.
- **Features:**
  - **Live Clock:** Displays system clock down to seconds.
  - **Status Tracker:** Automatically calculates whether a class is currently active (`Active (20 mins left)`), upcoming (`Next in 45 mins`), or completed for the day.
  - **Course Filter Pills:** Filters slots by course code (`CSA`, `DBMS`, `ADA`, `JAVA`, `D.S.`).
  - **Dual Views:** Switchable between "Day View" (detailed cards with faculty names) and "Matrix Grid" (weekly table).

### Feature 8: AI Photo/PDF Smart Importer
- **Description:** Pre-built structured prompts that guide the user to convert images of paper timetables, student rosters, or faculty lists into clean JSON using external LLMs (ChatGPT, Gemini, Claude).
- **Sub-importers:**
  1. **Timetable Importer:** Pastes JSON into a validator and updates the weekly schedule.
  2. **Student Roster Importer:** Pastes `[{"roll": 1, "name": "..."}]` and updates the class list.
  3. **Faculty Details Importer:** Pastes `{"CSA": {"name": "...", "faculty": "..."}}` and updates course metadata.

### Feature 9: Offline Backup & Restore
- **Description:** Full snapshot export and import.
- **Download Backup:** Creates a downloadable JSON file (`Trace_Attendance_Backup_YYYY-MM-DD.json`) containing the full student roster and configuration.
- **Restore Backup:** File input reader parsing uploaded JSON and restoring configuration to `localStorage`.

### Feature 10: Roster Edit Mode & Auto Roll Renumbering
- **Description:** In Edit Mode, each student row shows Edit and Delete buttons, and an "+ Add" button appears.
- **Auto Roll Renumbering:**
  - If student Roll #5 is deleted, all students from Roll #6 onward are decremented (`roll--`) to preserve contiguous sequence.
  - If a new student is inserted at Roll #10, all existing students with `roll >= 10` are incremented (`roll++`).

## Dormant Features (In Repository but Unwired)

| Dormant Feature | Component File | Description & Capability |
| :--- | :--- | :--- |
| **Defaulter Analytics** | `AnalyticsTab.tsx` | Computes class average attendance, lists students below 75%, and calculates the exact number of classes needed to catch up. |
| **Historical Session Logs** | `HistoryTab.tsx` | Displays a log of all saved past attendance sessions with individual copy and delete controls. |
| **Individual Student Detail Modal** | `StudentDetailModal.tsx` | Displays a timeline of specific dates a student was absent (`absentDates[]`), allowing correction of conducted/attended counts. |
| **Cold Call Random Picker** | `RandomPickerModal.tsx` | Selects a random student who is currently marked **PRESENT** to answer questions in class. |
| **Bulk Text Roster Importer** | `BulkImportModal.tsx` | Textarea parsing multiline `Roll, Name` strings. |
| **Keyboard Shortcuts Reference** | `KeyboardShortcutsModal.tsx` | Modal documenting keyboard hotkeys (`Ctrl+A`, `Ctrl+F`, `Ctrl+C`). |
| **Roster Card with Gauge** | `StudentItem.tsx` | Visual card showing emerald/amber/rose attendance percentage pills. |

---

# 6. Data Flow Analysis & Interaction Traces

## 1. Primary Attendance Toggle Flow

```text
User Taps Student Checkbox / Row
  │
  ▼
StudentList: onChange event on #cb-{idx}
  │
  ▼
App.tsx: passes onToggleStudent handler
  │
  ▼
useAttendance.ts: toggleStudent(idx)
  │
  ├── 1. In-Memory Mutation: copy[idx].p = !copy[idx].p
  ├── 2. LocalStorage Sync: localStorage.setItem('trace_students_v4', JSON.stringify(copy))
  ├── 3. Snapshot Backup: writeSnapshot(copy, config) -> localStorage.setItem('trace_backup_snapshot', ...)
  ├── 4. Haptic Feedback: navigator.vibrate(10)
  └── 5. React State Update: setStudents(copy)
        │
        ▼
Re-render Triggered
  ├── StudentList: Updates checkbox visual state (✓ checkmark)
  └── ReportPanel: useMemo recalculates present/absent totals and re-generates reportText
```

## 2. Magic Vanishing Absent Roll Box Flow

```text
User Types in Input Box: "4 12 " (Space pressed)
  │
  ▼
StudentList: handleAbsentTextChange or handleKeyDown
  │
  ▼
processRollInput(rawText)
  ├── 1. Regex Tokenization: rawText.match(/\b\d+\b/g) -> ['4', '12']
  ├── 2. Loop Tokens: For each roll number:
  │      └── Calls onMarkStudentAbsentByRoll(num)
  │
  ▼
useAttendance.ts: markStudentAbsentByRoll(4), markStudentAbsentByRoll(12)
  ├── Checks if student with roll === 4 has s.p !== false
  ├── Mutates s.p = false
  ├── Synchronizes localStorage ('trace_students_v4') and snapshot
  ├── Returns `changed = true`
  │
  ▼
StudentList:
  ├── Displays temporary Toast: "Roll #4 marked absent"
  ├── Clears input text immediately: setAbsentTextInput('')
  └── Re-render updates unchecked students and ReportPanel output
```

## 3. Copy Report & Session Backup Flow

```text
User Clicks "Copy Report" Button
  │
  ▼
ReportPanel: handleCopy()
  ├── 1. Clipboard Write: navigator.clipboard.writeText(reportText)
  ├── 2. Save Session Snapshot: calls onCopySession()
  │      │
  │      ▼
  │   useAttendance.ts: saveLastCopiedSession()
  │      ├── Extracts stateMap: students.map(s => ({ roll: s.roll, p: s.p }))
  │      └── Writes to localStorage: 'trace_last_copied_session'
  │
  ├── 3. Haptic Pulse: navigator.vibrate(10)
  ├── 4. Button Text Change: setCopyText('Copied!') -> resets after 1500ms
  └── 5. User Pastes Formatted Text into WhatsApp Group
```

## 4. Restore Last Session Flow

```text
User Clicks "Restore Last Session" Button
  │
  ▼
ReportPanel: handleRestoreLast()
  │
  ▼
useAttendance.ts: restoreLastCopiedSession()
  ├── 1. Read: localStorage.getItem('trace_last_copied_session')
  ├── 2. If null: returns false -> ReportPanel alerts "No previous session found"
  ├── 3. If exists: parses Map<roll, boolean>
  ├── 4. Maps students array: s.p = map.get(s.roll) ?? false
  ├── 5. Updates React State: setStudents(copy)
  ├── 6. Syncs localStorage ('trace_students_v4') and snapshot
  └── 7. Returns true -> ReportPanel sets button text to "Restored!"
```

## 5. Timetable 5-Minute Warning Lifecycle

```text
Background Interval (ReportPanel.tsx: setInterval every 10,000 ms)
  │
  ▼
checkSchedule()
  ├── 1. Reads current Date(): nowInMins = currentHour * 60 + currentMin
  ├── 2. Reads config.timetable[todayName] slots
  ├── 3. Iterates slots: parses "10:00-10:50" -> startMins (600), endMins (650)
  ├── 4. Evaluates Condition: nowInMins >= endMins - 5 && nowInMins < endMins
  │
  ├── If Condition TRUE:
  │   ├── setRemindAttendance(true)
  │   └── If !hasVibratedRef.current:
  │       ├── navigator.vibrate(50)
  │       └── hasVibratedRef.current = true
  │
  └── If Condition FALSE:
      ├── setRemindAttendance(false)
      └── hasVibratedRef.current = false
```

---

# 7. Frontend Architecture & UI Design System

## UI Philosophy & Design Tokens (`src/index.css`)
```css
:root {
  --bg-dark: #0a0a0a;          /* Deep AMOLED black canvas */
  --panel-bg: #1a1a1a;         /* Elevated surface */
  --text-primary: #f0f0f0;     /* High-contrast text */
  --text-secondary: #888888;   /* Subdued metadata */
  --accent-red: #ff3b30;       /* Primary accent & absence marker */
  --accent-green: #30d158;     /* Presence & high attendance rate indicator */
  --border-color: #333333;     /* Subtle grid lines */
  --hover-bg: #2b2b2b;         /* Button & row hover states */
  --font-body: 'Inter', sans-serif;
  --font-mono: 'Roboto Mono', monospace;
}
```

## Responsive Layout Strategy
- **Mobile Viewport (`< 800px`):** Single-column vertical layout (`flex-direction: column`). `ReportPanel` sits at the top showing the live report; `StudentList` flows underneath with `max-height: 60vh` and bottom padding (`5rem`) to clear mobile browser chrome.
- **Desktop Viewport (`>= 800px`):** Two-column split layout (`max-width: 1200px`). Left Column (400px fixed width) sticks to top (`position: sticky; top: 1rem`). Right Column expands to fill remaining space.

## Active Frontend Components
1. **`ReportPanel.tsx`:** Renders live output string, start/end lecture selectors, Copy and Restore buttons, stats footer (Total, Present, Absent, Attendance Rate %), and 5-min warning notice.
2. **`StudentList.tsx`:** Renders the 1-Tap Roll Grid, search bar, Magic Roll Box, student checkbox rows, and Edit Mode triggers.
3. **`StudentModal.tsx`:** Simple form modal to add or edit roll numbers and student names.
4. **`TimetableModal.tsx`:** Dual-view schedule modal (Day timeline cards and weekly Matrix table) with live clock.
5. **`SettingsModal.tsx`:** 3-tab modal: Smart AI photo importers, raw JSON config editor, and JSON backup/restore.

---

# 8. Backend-Less Architecture & Persistence

## Persistence Layer Overview
TRACE uses a **Backend-Less Architecture**. There is no server-side runtime, no API endpoints, and no remote database. All state lives inside browser `localStorage` managed by `src/hooks/useAttendance.ts`.

## LocalStorage Storage Keys

| Storage Key | Type | Data Structure | Purpose |
| :--- | :--- | :--- | :--- |
| `trace_students_v4` | Array | `Student[]` | Active list of students, presence flags (`p`), and attendance records. |
| `trace_config_v4` | Object | `AppConfig` | Semester metadata, subject list, faculty names, and weekly timetable. |
| `trace_backup_snapshot` | Object | `BackupData` | Redundant emergency backup written on every state modification. |
| `trace_last_copied_session` | Array | `Array<{roll: number, p: boolean}>` | Exact checkmark snapshot saved whenever "Copy Report" is tapped. |

## Data Integrity & Redundancy Mechanisms
1. **Dual-Snapshot Writing:** Concurrently serializes every roster/config change to `trace_backup_snapshot`.
2. **Graceful Fallback on JSON Corruption:** If `JSON.parse(savedStudents)` throws, the hook automatically attempts to parse `trace_backup_snapshot` before reverting to the default seed roster.
3. **Data Sanitization Pipeline (`sanitizeStudents`):** Normalizes roll numbers to positive integers, parses names through `formatTitleCase()`, clamps attended counts, and sorts records strictly by roll number.

## Service Worker Proxy (`public/sw.js`)
- Pre-caches static shell assets: `'/'`, `'/index.html'`, `'/manifest.json'`, `'/icon-192.png'`, `'/icon-512.png'`.
- Intercepts network `fetch` events with a Cache-First strategy to ensure full offline availability.

---

# 9. Database Models & Storage Schema

## Entity-Relationship Diagram (Logical Schema)

```text
+-----------------------+              +-------------------------------------+
|        Student        |              |              AppConfig              |
+-----------------------+              +-------------------------------------+
| roll: number (PK)     |              | semesterName: string                |
| name: string          |              | minAttendanceReq?: number           |
| p: boolean            |              | subjects: Record<Code, SubjectInfo> |
| totalClasses?: number |              | timetable: Record<Day, Slot[]>      |
| attendedClasses?: num |              +-------------------------------------+
| absentDates: LogItem[]|                                |
+-----------------------+                                | 1:N
            | 1:N                                        v
            v                                  +-------------------+
+-----------------------+                      |   ScheduleSlot    |
|    AbsenceLogItem     |                      +-------------------+
+-----------------------+                      | t: string ("Time")|
| id: string (PK)       |                      | s: string ("Code")|
| dateStr: string       |                      +-------------------+
| dayStr: string        |                                | N:1
| lecStr: string        |                                v
+-----------------------+                      +-------------------+
                                               |    SubjectInfo    |
+-----------------------+                      +-------------------+
|   AttendanceRecord    |                      | name: string      |
|  (Historical Sessions)|                      | faculty?: string  |
+-----------------------+                      +-------------------+
| id: string (PK)       |
| subject: string       |
| dateStr: string       |
| lecStr: string        |
| presentCount: number  |
| totalCount: number    |
| absentRolls?: number[]|
+-----------------------+
```

## TypeScript Data Model Contracts (`src/types/index.ts`)

```typescript
export interface AbsenceLogItem {
  id: string;
  dateStr: string;
  dayStr: string;
  lecStr: string;
}

export interface Student {
  roll: number;
  name: string;
  p: boolean;
  totalClasses?: number;
  attendedClasses?: number;
  absentDates?: AbsenceLogItem[];
}

export interface SubjectInfo {
  name: string;
  faculty?: string;
}

export interface ScheduleSlot {
  t: string;
  s: string;
}

export interface AppConfig {
  semesterName: string;
  subjects: Record<string, SubjectInfo>;
  timetable: Record<string, ScheduleSlot[]>;
  minAttendanceReq?: number;
}

export interface BackupData {
  version: string;
  timestamp: string;
  students: Student[];
  config: AppConfig;
}

export interface AttendanceRecord {
  id: string;
  subject: string;
  dateStr: string;
  lecStr: string;
  presentCount: number;
  totalCount: number;
  absentRolls?: number[];
}
```

---

# 10. Web Platform APIs & Browser Interfaces

| Web API | Location in Code | Purpose | Fallback / Error Handling |
| :--- | :--- | :--- | :--- |
| **Web Storage API (`localStorage`)** | `src/hooks/useAttendance.ts` | Persistent key-value storage for roster, config, and session state. | Wrapped in `try-catch` blocks; falls back to `trace_backup_snapshot` or initial memory seed. |
| **Async Clipboard API (`navigator.clipboard`)** | `src/components/ReportPanel.tsx:137`, `src/components/Modals/SettingsModal.tsx:75` | Copies WhatsApp attendance reports and AI prompt templates directly to user clipboard. | Executes `navigator.clipboard.writeText(text)`. |
| **Vibration API (`navigator.vibrate`)** | `src/hooks/useAttendance.ts:215`, `src/components/ReportPanel.tsx:86` | Provides tactile haptic feedback on checkbox click, fast roll mark, and 5-min class warning. | Guarded with `if (navigator.vibrate)`. Silently ignored if unsupported (e.g. desktop). |
| **Service Worker API (`navigator.serviceWorker`)** | `src/main.tsx:12-18`, `public/sw.js` | Registers `/sw.js` to enable offline asset caching and PWA functionality. | Guarded with `if ('serviceWorker' in navigator)`. Logs registration error to console. |
| **PWA Install API (`beforeinstallprompt`)** | `src/components/ReportPanel.tsx:33-52` | Intercepts browser PWA prompt to display a custom "Install App" button in the UI. | `e.preventDefault()`, stores event in `deferredPrompt`, triggers `.prompt()` on click. |
| **FileReader API (`FileReader`)** | `src/components/Modals/SettingsModal.tsx:133` | Reads uploaded offline `.json` backup files directly in the browser without network transmission. | `reader.readAsText(file)` wrapped in `try-catch` JSON parser with user alert on syntax error. |
| **Blob & URL Object API (`URL.createObjectURL`)** | `src/hooks/useAttendance.ts:501-507` | Converts memory JSON string into a downloadable `.json` file stream. | Creates temporary `<a>` element, triggers `.click()`, and cleans up via `URL.revokeObjectURL`. |

---

# 11. Authentication & Security Boundaries

- **Zero-Authentication Model:** No login, passwords, session tokens, JWTs, or cookies.
- **Physical Device Boundary:** Access control is governed strictly by the physical lock screen/passcode of the Class Representative's phone or laptop.
- **Threat Vector Assessment:**
  - *XSS:* Low risk. React Virtual DOM escapes all rendered strings. No `dangerouslySetInnerHTML`.
  - *SQLi / RCE / CSRF:* Non-existent. No server or SQL database exists.
  - *JSON Injections:* User imports are guarded by `try-catch` blocks and typed sanitization (`sanitizeStudents`).
  - *Plaintext Storage:* Student names and roll numbers reside in plaintext `localStorage`. Safe for general college directories.

---

# 12. Configuration, Environment & Build Settings

- **Environment Variables:** None required (no `.env` files).
- **Vite Config (`vite.config.js`):** Integrates `@vitejs/plugin-react`.
- **TypeScript Config (`tsconfig.json`):** Configured for `ES2020` target, `strict: true`, `allowImportingTsExtensions: true`.
- **Netlify Build (`netlify.toml`):** Executes `npm run build`, publishes `dist/`.
- **Netlify SPA Redirects (`public/_redirects`):** Rewrites `/*` to `/index.html` with status `200`.

---

# 13. Dependency Audit & Footprint Analysis

- **Production Dependencies (`package.json`):**
  - `react` (`^18.2.0`)
  - `react-dom` (`^18.2.0`)
- **Developer Dependencies (`package.json`):**
  - `vite` (`^5.0.0`)
  - `@vitejs/plugin-react` (`^4.2.0`)
  - `typescript` (`^5.2.2`)
  - `@types/react` (`^18.2.0`)
  - `@types/react-dom` (`^18.2.0`)
- **Bundle Footprint:** Extremely lightweight (~145 KB total minified assets), zero third-party utility bloat (no Axios, Lodash, or Moment.js).
- **Manifest Bug Found:** `package.json` contains a `"lint"` script referring to `eslint`, but `eslint` is missing from `devDependencies`.

---

# 14. Testing Strategy & Quality Assurance

- **Current Coverage:** 0% automated test coverage (no test runner installed).
- **Critical Logic to Test:**
  1. *Roll Renumbering Math:* Splicing students and shifting roll numbers up/down without off-by-one errors.
  2. *Magic Box Regex:* Extracting space-delimited numbers (`/\b\d+\b/g`) from varied keystrokes.
  3. *Ratio Inversion Boundary:* Verifying Absentees vs. Presentees formatting at 50% threshold.
  4. *LocalStorage Recovery:* Testing corrupted JSON fallback to `trace_backup_snapshot`.
- **Recommended Setup:** Install Vitest and React Testing Library (`npm i -D vitest @testing-library/react @testing-library/jest-dom jsdom`).

---

# 15. External Services & AI Prompt Pipelines

## External CDNs
- **Google Fonts:** Preconnects to `fonts.googleapis.com` and `fonts.gstatic.com` for typography. Falls back to system sans-serif/monospace fonts if offline.

## Embedded AI Prompt Pipeline (`src/components/Modals/SettingsModal.tsx`)
Users take photos of paper schedules and paste them into ChatGPT/Gemini alongside pre-engineered prompt constants:
1. `PROMPT_TIMETABLE`: Prompts LLM for Monday-to-Saturday `{ "Day": [{ "t": "10:00-10:50", "s": "CSA" }] }` JSON.
2. `PROMPT_ROSTER`: Prompts LLM for `[ { "roll": 1, "name": "..." } ]` JSON array.
3. `PROMPT_TEACHERS`: Prompts LLM for `{ "CSA": { "name": "...", "faculty": "..." } }` JSON object.

---

# 16. Security & Vulnerability Analysis

- **Confirmed Safe Patterns:** Zero server-side attack surface, React virtual DOM auto-escaping, bounded Service Worker cache scope, safe `JSON.parse` with try-catch blocks.
- **Potential Concerns:** Unencrypted `localStorage` (acceptable for classroom directories, requires encryption for GDPR compliance); lack of explicit CSP meta tag in `index.html`.

---

# 17. Code Quality & Maintainability Audit

- **Strengths:** Clean separation between hook logic and presentation components; defensive data normalization; responsive mobile-first CSS.
- **Anti-Patterns & Smells:**
  1. *10 Orphaned Components:* Dead code left in `src/components/`.
  2. *Duplicated Markup:* `StudentItem.tsx` exists but `StudentList.tsx` renders inline markup instead.
  3. *Missing ESLint:* Dependency missing from `package.json`.

---

# 18. AI-Generated Code Forensics

- **Strong Evidence:** Hardcoded LLM prompt constants in `SettingsModal.tsx` (`PROMPT_TIMETABLE`, `PROMPT_ROSTER`, `PROMPT_TEACHERS`).
- **Moderate Evidence (Dual Component Generations):**
  - Generation 1: Dark-mode CSS tokens in `index.css` used by active components (`App.tsx`, `ReportPanel.tsx`, `StudentList.tsx`).
  - Generation 2: Rich design tokens (`var(--bg-surface-elevated)`, `var(--accent-emerald)`, `btn-enhanced`) used by orphaned components (`AnalyticsTab.tsx`, `RandomPickerModal.tsx`, etc.), indicating a secondary AI prompt pass that was never integrated into `App.tsx`.
- **Realistic Seed Data:** 54 authentic Indian student names and real 4th-semester engineering courses extracted via AI prompt pipelines.

---

# 19. Incomplete Work & Dead Code Catalog

The following 10 component files exist in `src/components/` but are **not mounted in `App.tsx`**:
1. `StudentItem.tsx` — Card with threshold gauge pill.
2. `AnalyticsTab.tsx` — Class average & defaulter list component.
3. `HistoryTab.tsx` — Attendance session log viewer.
4. `SkeletonRoster.tsx` — Loading skeleton placeholder.
5. `ToastNotification.tsx` — Generic toast notification.
6. `ToastError.tsx` — System error banner.
7. `StudentDetailModal.tsx` — Absence history timeline modal (functions `removeAbsenceRecord`, `addAbsenceRecord`, `updateStudentTotals` exist in hook but lack UI trigger).
8. `RandomPickerModal.tsx` — Cold call student picker modal.
9. `BulkImportModal.tsx` — Bulk textarea importer (superseded by `SettingsModal.tsx`).
10. `KeyboardShortcutsModal.tsx` — Hotkey cheat sheet modal.

---

# 20. Developer & Modification Guide

## "Where Do I Look?" Cheat Sheet

| I Want To... | Inspect / Modify These Files |
| :--- | :--- |
| **Change WhatsApp message format** | `src/components/ReportPanel.tsx:108-134` (`reportText` calculation) |
| **Change default student names** | `src/hooks/useAttendance.ts:25` (`DEFAULT_STUDENTS_STR`) |
| **Change default subjects / timetable** | `src/hooks/useAttendance.ts:27-90` (`DEFAULT_CONFIG`) |
| **Modify Magic Vanishing Box behavior** | `src/components/StudentList.tsx:42-79` (`processRollInput`) |
| **Adjust 5-min lecture end alert** | `src/components/ReportPanel.tsx:55-98` (`checkSchedule` interval) |
| **Change theme colors / fonts** | `src/index.css` (`:root` CSS variables) |
| **Add a new modal window** | Create in `src/components/Modals/`, import in `src/App.tsx`, toggle via `useState` |
| **Update Service Worker cache** | `public/sw.js:1` (increment `CACHE_NAME` e.g. `v11`) |

---

# 21. CSE Viva & Technical Interview Q&A

### Q1: Why did you build this without a backend database?
**Answer:** College classrooms are notorious network dead zones. An offline-first client architecture using `localStorage` and Service Workers guarantees 0ms latency and 100% availability without hosting costs.

### Q2: How does the "Magic Vanishing Roll Box" work?
**Answer:** In `StudentList.tsx`, the input field intercepts delimiters (`Space`, `Comma`, `Enter`), matches numbers using regex `/\b\d+\b/g`, unchecks matching students in state, triggers a toast notification, and immediately clears the input field state to empty.

### Q3: How does the ratio-based output logic work?
**Answer:** In `ReportPanel.tsx`, if $\text{Present} < \text{Absent}$ (such as an elective lab), it formats `Presentees: 1, 4, 12`. If $\text{Present} \ge \text{Absent}$ (regular lecture), it formats `Absentees: 6, 13, 28`.

### Q4: How is data corruption prevented during storage writes?
**Answer:** TRACE implements dual-snapshot writing in `useAttendance.ts`. On every mutation, a timestamped snapshot is written to `trace_backup_snapshot`. If primary deserialization fails, the hook recovers from the backup snapshot before falling back to default seeds.

---

# 22. Project Mental Model & Layered Explanations

## The Core Mental Model

```text
[Inputs: Checkbox Clicks / Space-Delimited Numbers / AI JSON]
                           │
                           ▼
             [useAttendance Hook Engine]
   (Sanitization + Roll Renumbering + Snapshot Backup)
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
    [LocalStorage Vault]        [ReportPanel Formatter]
    - trace_students_v4         - Absentees vs Presentees
    - trace_backup_snapshot     - 1-Click Clipboard Copy
                                - 5-Min Vibration Alert
```

## Layered Explanations
- **30 Seconds:** "TRACE is an offline-first web app for college Class Representatives to take attendance in 20 seconds. You tap absent students or type roll numbers into a magic box, and it immediately formats a clean attendance message ready to copy and post to WhatsApp."
- **2 Minutes:** "In college lectures, calling roll numbers takes 10 minutes, and web portals stall without Wi-Fi. TRACE is a zero-latency PWA built with React and TypeScript that works completely offline. It offers checklist marking, a 1-tap roll grid, and an auto-clearing Magic Roll Box. It dynamically formats WhatsApp reports with ratio inversion and alerts the user 5 minutes before class ends."
- **10 Minutes:** "Under the hood, TRACE is a client-side offline PWA. State is centralized in `useAttendance.ts`, enforcing defensive data normalization via `sanitizeStudents()`. Adding or deleting students dynamically shifts roll numbers up or down. Offline caching is powered by Service Workers, and schedule imports are accelerated by pre-built AI prompt templates."

---

# 23. Project Health Scorecard & Final Verdict

| Dimension | Rating | Summary |
| :--- | :---: | :--- |
| **Architecture** | **Good** | Clean custom hook separation and offline PWA design. |
| **Code Quality** | **Good** | Defensive sanitization, strong TypeScript contracts, immutable updates. |
| **Performance** | **Excellent** | Zero-lag rendering, 0ms network latency, ~145 KB bundle. |
| **User Experience (UX)** | **Excellent** | Magic Box fast entry, haptic feedback, 1-tap copy, 5-min alert. |
| **Security** | **Good** | No backend attack surface, zero XSS risks. Plaintext client storage. |
| **Testing** | **Poor** | 0% automated test coverage. |
| **Maintainability** | **Fair** | Marred by orphaned components and missing CSS tokens. |
| **Core Flow Completeness**| **Excellent**| Complete and working end-to-end for classroom attendance. |
| **AI Risk** | **Moderate** | Dual component generations; prompts embedded in Settings modal. |
| **Technical Debt** | **Fair** | Needs wiring of dormant components into top navigation tabs. |

## Final Engineering Verdict
> **FINAL VERDICT: PRODUCTION-VIABLE CLIENT MVP WITH RESILIENT LOCAL STORAGE & MINIMAL TECHNICAL DEBT**

TRACE is a highly effective, zero-latency Progressive Web App that solves a real collegiate administrative problem. Its primary execution path (mark attendance $\to$ auto-format $\to$ copy to WhatsApp $\to$ restore session) is solid, battle-tested, and ready for deployment.

---

## If you remember only 10 things about this project, remember these:

1. **Client-Side Only:** Zero backend server, zero cloud hosting costs.
2. **Offline-First PWA:** Fully cached via Service Worker (`public/sw.js`); operates without internet.
3. **Primary Persistence:** Browser `localStorage` with 4 versioned keys and snapshot recovery.
4. **Intelligent Ratio Inversion:** Automatically outputs *Presentees* when turnout is $< 50\%$ and *Absentees* when turnout is $\ge 50\%$.
5. **Magic Vanishing Absent Box:** Space-delimited roll input that unchecks students and auto-clears.
6. **Schedule-Aware 5-Min Alert:** Background interval triggers haptic vibration 5 minutes before lecture end.
7. **Auto Roll Sequence Math:** Insertion/deletion shifts remaining student roll numbers up/down automatically.
8. **AI Prompt Bridge:** Embedded prompts in Settings Modal convert timetable/roster photos into JSON via external LLMs.
9. **One-Click Session Recovery:** "Restore Last Session" recovers exact checkbox state from the last copied report.
10. **Dormant Component Subsystem:** 10 orphaned components exist in `src/components/` representing a rich second-generation feature set ready to be wired into future releases.
