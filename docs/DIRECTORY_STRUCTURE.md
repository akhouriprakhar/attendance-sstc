# Directory Structure & File Inventory — TRACE

This document provides an exhaustive inventory of every file and directory in the TRACE repository.

---

## 1. Physical Directory Tree

```text
attendance/
├── index.html
├── netlify.toml
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.js
├── public/
│   ├── _redirects
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── manifest.json
│   └── sw.js
└── src/
    ├── App.tsx
    ├── index.css
    ├── main.tsx
    ├── components/
    │   ├── AnalyticsTab.tsx              [UNUSED]
    │   ├── HistoryTab.tsx                [UNUSED]
    │   ├── ReportPanel.tsx
    │   ├── SkeletonRoster.tsx            [UNUSED]
    │   ├── StudentItem.tsx               [UNUSED]
    │   ├── StudentList.tsx
    │   ├── ToastError.tsx                [UNUSED]
    │   ├── ToastNotification.tsx         [UNUSED]
    │   └── Modals/
    │       ├── BulkImportModal.tsx       [UNUSED]
    │       ├── KeyboardShortcutsModal.tsx[UNUSED]
    │       ├── RandomPickerModal.tsx     [UNUSED]
    │       ├── SettingsModal.tsx
    │       ├── StudentDetailModal.tsx    [UNUSED]
    │       ├── StudentModal.tsx
    │       └── TimetableModal.tsx
    ├── hooks/
    │   └── useAttendance.ts
    └── types/
        └── index.ts
```

---

## 2. Comprehensive File Inventory & Classification

| File Path | Type | Purpose / Business Logic | Usage Status | Dependencies / Imports | Dependents / Callers | Generated / AI Artifact |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| [`index.html`](../index.html) | HTML | Entry HTML host document, font preconnects, PWA meta | **CONFIRMED USED** | Google Fonts, `/src/main.tsx` | Browser | Human / Template |
| [`package.json`](../package.json) | JSON | Package manifest, scripts, npm dependencies | **CONFIRMED USED** | React 18, Vite 5, TS 5 | npm / Vite | Project Config |
| [`package-lock.json`](../package-lock.json) | JSON | Dependency lockfile | **CONFIRMED USED** | Exact npm dependency tree | npm | Generated (npm) |
| [`tsconfig.json`](../tsconfig.json) | JSON | TypeScript compiler options | **CONFIRMED USED** | ES2020, JSX react-jsx | `tsc` / Vite | Project Config |
| [`vite.config.js`](../vite.config.js) | JS | Vite bundler configuration | **CONFIRMED USED** | `@vitejs/plugin-react` | Vite CLI | Project Config |
| [`netlify.toml`](../netlify.toml) | TOML | Netlify build & publish directory spec | **CONFIRMED USED** | None | Netlify CI/CD | Deployment Config |
| [`public/_redirects`](../public/_redirects) | Text | Netlify SPA rewrite rule (`/* /index.html 200`) | **CONFIRMED USED** | None | Netlify Edge | Deployment Config |
| [`public/manifest.json`](../public/manifest.json) | JSON | PWA installation manifest | **CONFIRMED USED** | `icon-192.png`, `icon-512.png` | `index.html`, Browser | PWA Config |
| [`public/sw.js`](../public/sw.js) | JS | Service Worker cache & offline fetch proxy | **CONFIRMED USED** | CacheStorage API | `main.tsx`, Browser | PWA Service Worker |
| [`public/icon-192.png`](../public/icon-192.png) | PNG | 192px application icon | **CONFIRMED USED** | None | `manifest.json`, `index.html`| Asset |
| [`public/icon-512.png`](../public/icon-512.png) | PNG | 512px splash / high-res icon | **CONFIRMED USED** | None | `manifest.json` | Asset |
| [`src/main.tsx`](../src/main.tsx) | TSX | Application bootstrap, React root render, SW registration | **CONFIRMED USED** | React, `App.tsx`, `index.css`| `index.html` | Application Root |
| [`src/index.css`](../src/index.css) | CSS | Master styling, color tokens, layout flexbox/grid | **CONFIRMED USED** | Google Fonts (Inter, Roboto Mono) | `main.tsx` | Styling |
| [`src/types/index.ts`](../src/types/index.ts) | TS | Core TypeScript interface contracts | **CONFIRMED USED** | None | All `src/` modules | Type Definitions |
| [`src/hooks/useAttendance.ts`](../src/hooks/useAttendance.ts) | TS | State management, `localStorage` synchronization, roll math | **CONFIRMED USED** | React, `types/index.ts` | `App.tsx` | Core Hook |
| [`src/App.tsx`](../src/App.tsx) | TSX | Root UI container connecting hook to panels & modals | **CONFIRMED USED** | `useAttendance`, panels, modals | `main.tsx` | Container Component |
| [`src/components/ReportPanel.tsx`](../src/components/ReportPanel.tsx) | TSX | WhatsApp report formatting, stats, copy button, 5-min alert | **CONFIRMED USED** | React, `types/index.ts` | `App.tsx` | UI Component |
| [`src/components/StudentList.tsx`](../src/components/StudentList.tsx) | TSX | Roster checklist, magic absent box, roll grid, search | **CONFIRMED USED** | React, `types/index.ts` | `App.tsx` | UI Component |
| [`src/components/Modals/StudentModal.tsx`](../src/components/Modals/StudentModal.tsx) | TSX | Add / Edit roll number & student name modal | **CONFIRMED USED** | React, `types/index.ts` | `App.tsx` | Modal Component |
| [`src/components/Modals/TimetableModal.tsx`](../src/components/Modals/TimetableModal.tsx) | TSX | Daily schedule & weekly matrix timetable viewer | **CONFIRMED USED** | React, `types/index.ts` | `App.tsx` | Modal Component |
| [`src/components/Modals/SettingsModal.tsx`](../src/components/Modals/SettingsModal.tsx) | TSX | AI Prompt copy & importer, JSON editor, backup downloader | **CONFIRMED USED** | React, `types/index.ts` | `App.tsx` | Modal Component |
| [`src/components/StudentItem.tsx`](../src/components/StudentItem.tsx) | TSX | Card item with color threshold gauge and custom checkbox | **UNUSED / DEAD CODE** | React, `types/index.ts` | None | Alternative / AI Component |
| [`src/components/AnalyticsTab.tsx`](../src/components/AnalyticsTab.tsx) | TSX | Class analytics, defaulter calculations, catch-up math | **UNUSED / DEAD CODE** | React, `types/index.ts` | None | Alternative / AI Component |
| [`src/components/HistoryTab.tsx`](../src/components/HistoryTab.tsx) | TSX | Past session log viewer and session copier | **UNUSED / DEAD CODE** | React, `types/index.ts` | None | Alternative / AI Component |
| [`src/components/SkeletonRoster.tsx`](../src/components/SkeletonRoster.tsx) | TSX | Animated loading skeleton placeholder | **UNUSED / DEAD CODE** | React | None | Orphaned UI Component |
| [`src/components/ToastNotification.tsx`](../src/components/ToastNotification.tsx)| TSX | Floating toast notification banner | **UNUSED / DEAD CODE** | React | None | Orphaned UI Component |
| [`src/components/ToastError.tsx`](../src/components/ToastError.tsx) | TSX | System error banner with retry trigger | **UNUSED / DEAD CODE** | React | None | Orphaned UI Component |
| [`src/components/Modals/StudentDetailModal.tsx`](../src/components/Modals/StudentDetailModal.tsx) | TSX | Student absence history timeline & stats correction modal | **UNUSED / DEAD CODE** | React, `types/index.ts` | None | Orphaned UI Component |
| [`src/components/Modals/RandomPickerModal.tsx`](../src/components/Modals/RandomPickerModal.tsx) | TSX | Random present student picker ("Cold Call Questioner") | **UNUSED / DEAD CODE** | React, `types/index.ts` | None | Orphaned UI Component |
| [`src/components/Modals/BulkImportModal.tsx`](../src/components/Modals/BulkImportModal.tsx) | TSX | Textarea bulk roster importer | **UNUSED / DEAD CODE** | React | None | Orphaned UI Component |
| [`src/components/Modals/KeyboardShortcutsModal.tsx`](../src/components/Modals/KeyboardShortcutsModal.tsx) | TSX | Hotkeys summary cheat-sheet modal | **UNUSED / DEAD CODE** | React | None | Orphaned UI Component |

---

## 3. Categorized Breakdown

- **Core Application Files (Active):** 11 files (`index.html`, `main.tsx`, `index.css`, `types/index.ts`, `useAttendance.ts`, `App.tsx`, `ReportPanel.tsx`, `StudentList.tsx`, `StudentModal.tsx`, `TimetableModal.tsx`, `SettingsModal.tsx`)
- **PWA & Deployment Files (Active):** 7 files (`manifest.json`, `sw.js`, `_redirects`, `netlify.toml`, `icon-192.png`, `icon-512.png`, `vite.config.js`)
- **Orphaned / Unconnected Files (Dead Code):** 10 files (`StudentItem.tsx`, `AnalyticsTab.tsx`, `HistoryTab.tsx`, `SkeletonRoster.tsx`, `ToastNotification.tsx`, `ToastError.tsx`, `StudentDetailModal.tsx`, `RandomPickerModal.tsx`, `BulkImportModal.tsx`, `KeyboardShortcutsModal.tsx`)
- **Configuration & Manifests:** 3 files (`package.json`, `package-lock.json`, `tsconfig.json`)
