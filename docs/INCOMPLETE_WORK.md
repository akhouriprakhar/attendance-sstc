# Incomplete Work & Dead Code Audit — TRACE

This document catalogs all orphaned components, unlinked features, and incomplete implementations in the TRACE repository.

---

## 1. Inventory of Orphaned / Dead Code Files

The following 10 component files exist in the repository but are **never imported, mounted, or called** in the active application tree:

| File Path | Description | Why It Is Unused | Missing Prerequisite |
| :--- | :--- | :--- | :--- |
| [`src/components/StudentItem.tsx`](../src/components/StudentItem.tsx) | Enhanced student card with threshold pills. | `StudentList.tsx` renders its own inline `<div className="student-item">` elements. | CSS classes (`.student-card-item`, `.threshold-gauge-tag`) missing from `index.css`. |
| [`src/components/AnalyticsTab.tsx`](../src/components/AnalyticsTab.tsx) | Attendance analytics, class average, and defaulters below 75%. | `App.tsx` has no navigation tab system to switch to an Analytics view. | Top-level tab switcher in `App.tsx`. |
| [`src/components/HistoryTab.tsx`](../src/components/HistoryTab.tsx) | Past attendance session history list. | `useAttendance.ts` does not store an array of past sessions in `localStorage`. | History state array in hook + Tab UI in `App.tsx`. |
| [`src/components/Modals/StudentDetailModal.tsx`](../src/components/Modals/StudentDetailModal.tsx) | Modal to view/edit a student's total attended classes & absence dates. | No click trigger exists on student cards in `StudentList.tsx` to open this modal. | State in `App.tsx` (`isStudentDetailOpen`, `selectedStudent`). |
| [`src/components/Modals/RandomPickerModal.tsx`](../src/components/Modals/RandomPickerModal.tsx) | "Cold Call Questioner" modal picking a random present student. | No button or hotkey exists in `StudentList.tsx` or `ReportPanel.tsx` to open it. | UI trigger button in `StudentList.tsx`. |
| [`src/components/Modals/BulkImportModal.tsx`](../src/components/Modals/BulkImportModal.tsx) | Textarea modal for bulk pasting `Roll, Name` text. | Superseded by `SettingsModal.tsx` Tab 1 (AI Importer) and Tab 2. | Redundant component. |
| [`src/components/Modals/KeyboardShortcutsModal.tsx`](../src/components/Modals/KeyboardShortcutsModal.tsx) | Hotkey reference modal. | No keyboard help button exists, and global hotkeys (`Ctrl+A`, `Ctrl+C`) are not wired. | Global `window.addEventListener('keydown')` listener. |
| [`src/components/SkeletonRoster.tsx`](../src/components/SkeletonRoster.tsx) | Loading skeleton card animation. | App loads instantaneously from `localStorage`; no async network loading state exists. | Async backend loading state. |
| [`src/components/ToastNotification.tsx`](../src/components/ToastNotification.tsx) | Floating toast notification banner. | `StudentList.tsx` implements an inline `toastMessage` state instead. | Redundant component. |
| [`src/components/ToastError.tsx`](../src/components/ToastError.tsx) | System error banner with retry button. | Not integrated into application error boundaries. | React Error Boundary. |

---

## 2. Incomplete State & Hook Integrations

In [`src/hooks/useAttendance.ts`](../src/hooks/useAttendance.ts), several robust helper functions were created specifically for `StudentDetailModal.tsx` but are currently dormant:
- `removeAbsenceRecord(roll, logId)` (lines 361–384)
- `addAbsenceRecord(roll, dateStr, dayStr, lecStr)` (lines 385–413)
- `updateStudentTotals(roll, newTotal, newAttended)` (lines 414–436)

---

## 3. Roadblock Audit Summary

1. **Confirmed Dead Code:** 10 component files.
2. **Missing CSS Tokens:** Orphaned components depend on ~15 CSS classes and variables not defined in `src/index.css`.
3. **Missing Tooling:** `package.json` specifies ESLint scripts without ESLint installed.
