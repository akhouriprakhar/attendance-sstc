# Project Mental Model & Layered Explanations — TRACE

This document provides conceptual mental models and multi-level explanations of TRACE.

---

## 1. The Core Mental Model

Think of TRACE as an **Automated, Offline-First Attendance Stenographer**:

```text
[Input Sources]                   [Core State Engine]              [Output Channels]
- 1-Tap Checkbox Clicks   ───┐                               ┌───► Real-Time Screen Stats
- Magic Absent Roll Box   ───┼──►  useAttendance Hook   ─────┼───► WhatsApp Formatted Text
- Space-Delimited Numbers ───┤     (In-Memory + Sync)        ├───► Phone Clipboard
- AI Screenshot JSON     ───┘              │                 └───► Haptic Vibration Pulse
                                           ▼
                                 [LocalStorage Vault]
                                 - trace_students_v4
                                 - trace_backup_snapshot
                                 - trace_last_copied_session
```

1. **What enters the system?** Roll number checkboxes, fast absent number keystrokes, and AI-extracted JSON schedules.
2. **What happens internally?** The `useAttendance` hook sanitizes the data, auto-shifts roll numbers if modified, and syncs to `localStorage` with snapshot backups.
3. **What data is produced?** A live attendance summary with dynamic ratio inversion (Absentees vs. Presentees).
4. **Where does that data go?** Direct to the system clipboard for immediate pasting into college communication channels.

---

## 2. Layered Explanations

### Level 1: 30-Second Explanation
> "TRACE is a lightning-fast offline web app for college class representatives to take attendance in 20 seconds. You tap absent students or type roll numbers into a magic box, and it immediately generates a perfect WhatsApp attendance message ready to copy and post."

### Level 2: 2-Minute Explanation
> "In college lectures, calling out 50+ roll numbers takes 10 minutes, and web portals often fail without Wi-Fi. TRACE is a zero-latency Progressive Web App built with React and TypeScript. It stores everything in browser `localStorage` and works completely offline via Service Workers.
>
> You can mark attendance using an interactive checklist, a 1-tap roll number grid, or by typing absent numbers separated by spaces into an auto-clearing input box. The app dynamically determines whether to list Absentees or Presentees based on majority turnout, copies formatted text to your clipboard with haptic feedback, and alerts you 5 minutes before class ends."

### Level 3: 10-Minute Technical Explanation
> "Under the hood, TRACE is an offline-first Single Page Application. It uses no backend server or cloud database, achieving sub-millisecond response times.
>
> 1. **State & Storage Architecture:** State is driven by the `useAttendance` custom hook, which exposes atomic actions like `toggleStudent` and `markAbsentRollsByText`. Every state mutation updates React state and immediately writes to `localStorage.trace_students_v4` while creating a redundant JSON snapshot in `trace_backup_snapshot`.
> 2. **Defensive Normalization:** The `sanitizeStudents` function validates array structure, fixes malformed names with a custom `formatTitleCase` parser, and ensures monotonic ordering of roll numbers.
> 3. **Smart Roll Renumbering:** When a student is added or removed, the hook dynamically decrements or increments subsequent roll numbers to maintain contiguous sequencing.
> 4. **PWA Subsystem:** `public/sw.js` implements CacheStorage proxying for offline execution, while `ReportPanel.tsx` hooks `beforeinstallprompt` for native PWA installation.
> 5. **AI Extraction Bridge:** To import schedules without complex OCR libraries, `SettingsModal.tsx` provides pre-engineered JSON schema prompts that users paste into external LLMs."

---

## 3. Top 10 Most Important Facts to Remember

1. **Client-Side Only:** Zero backend server, zero database hosting costs.
2. **Offline-First PWA:** Fully cached via Service Worker (`/sw.js`); runs without network connectivity.
3. **Primary Persistence:** Browser `localStorage` with 4 versioned keys and snapshot-level recovery.
4. **Intelligent Ratio Inversion:** Automatically outputs *Presentees* when turnout is $< 50\%$ and *Absentees* when turnout is $\ge 50\%$.
5. **Magic Vanishing Absent Box:** Space-delimited roll input that unchecks students and auto-clears.
6. **Schedule-Aware 5-Min Alert:** Background interval triggers haptic vibration 5 minutes before lecture end.
7. **Auto Roll Sequence Math:** Insertion/deletion shifts remaining student roll numbers up/down automatically.
8. **AI Prompt Bridge:** Embedded prompts in Settings Modal convert timetable/roster photos into JSON via external LLMs.
9. **One-Click Session Recovery:** "Restore Last Session" recovers exact checkbox state from the last copied report.
10. **Dormant Component Subsystem:** 10 orphaned components exist in `src/components/` representing a rich second-generation feature set ready to be wired into future releases.
