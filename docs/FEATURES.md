# Feature Breakdown & Analysis — TRACE

This document details all features present in the TRACE codebase, separating **Active/Working Features** from **Dormant/Orphaned Features**.

---

## 1. Active Working Features

### Feature 1: Interactive Checklist & Roster Management
- **Description:** Real-time interactive student checklist displaying student roll numbers (1..54) and full names.
- **User Interaction:** Tap/click any row to toggle presence state between Present (checked) and Absent (unchecked).
- **Haptic Integration:** Triggers a 10ms vibration pulse via `navigator.vibrate(10)` on mobile devices upon tapping.
- **Search Filtering:** Real-time search bar filters the displayed roster by student name or roll number as the user types.
- **Mark All:** One-click toggle that marks all students present (if any are absent) or all absent (if all are present).
- **Relevant Files:** [`src/components/StudentList.tsx`](../src/components/StudentList.tsx), [`src/hooks/useAttendance.ts`](../src/hooks/useAttendance.ts)

### Feature 2: "Magic Vanishing" Absent Roll Number Input
- **Description:** A specialized high-speed entry box for marking absentees without scrolling through the list.
- **Mechanism:**
  1. The user types roll numbers into the box (e.g. `3`, `12`, `28`).
  2. As soon as the user presses `Space`, `Comma (,)`, or `Enter`, the event listener matches all integer tokens via regex `/\b\d+\b/g`.
  3. The hook immediately marks those roll numbers as `p = false` (absent).
  4. A brief toast pops up: `"Roll #X marked absent"`.
  5. The input field is **instantly cleared** so the user can continue typing the next roll number without backspacing.
- **Relevant Files:** [`src/components/StudentList.tsx:42-79`](../src/components/StudentList.tsx#L42-L79)

### Feature 3: Compact 1-Tap Roll Number Grid
- **Description:** A collapsable numerical matrix of buttons (`#1` through `#54`).
- **Mechanism:** Color-coded buttons indicate presence (white badge) vs. absence (red badge). Tapping any button immediately flips that student's attendance without having to scroll the name list.
- **Relevant Files:** [`src/components/StudentList.tsx:146-181`](../src/components/StudentList.tsx#L146-L181)

### Feature 4: Intelligent Ratio-Based WhatsApp Report Generation
- **Description:** Automatically generates a standard college attendance message formatted for WhatsApp/Telegram.
- **Dynamic Inversion Logic:**
  - If $\text{Present} < \text{Absent}$ (e.g. elective or low turnout): Outputs **Presentees** (e.g., `Presentees: 1, 4, 12`).
  - If $\text{Present} \ge \text{Absent}$ (normal lecture): Outputs **Absentees** (e.g., `Absentees: 6, 13, 28`).
  - Formats date (`DD/MM/YYYY`), weekday name (`Friday`), and lecture slot (`Lecture - 1` or `Lecture - 1-2`).
- **Relevant Files:** [`src/components/ReportPanel.tsx:108-134`](../src/components/ReportPanel.tsx#L108-L134)

### Feature 5: One-Click Copy & Session Recovery
- **Description:** "Copy Report" writes the formatted text to `navigator.clipboard`.
- **Session Memory:** Concurrently saves the exact present/absent state map to `localStorage.trace_last_copied_session`.
- **Restore Last Session:** If the user accidentally refreshes or resets attendance for a new class and needs the previous checkmark state back, clicking "Restore Last Session" restores the last copied state map.
- **Relevant Files:** [`src/components/ReportPanel.tsx:136-152`](../src/components/ReportPanel.tsx#L136-L152), [`src/hooks/useAttendance.ts:289-319`](../src/hooks/useAttendance.ts#L289-L319)

### Feature 6: Schedule-Aware 5-Minute Class End Haptic Warning
- **Description:** An automated background timer checks the active day's timetable against the device clock every 10 seconds.
- **Trigger:** If the current system time falls within the last 5 minutes of a scheduled lecture (`endMins - 5 <= now < endMins`), the app renders an amber banner (`Notice: 5 minutes remaining in lecture. Take attendance.`) and vibrates the phone for 50ms.
- **Relevant Files:** [`src/components/ReportPanel.tsx:55-98`](../src/components/ReportPanel.tsx#L55-L98)

### Feature 7: Timetable Schedule & Active Lecture Matrix
- **Description:** A dedicated modal displaying class schedules for Monday through Saturday.
- **Features:**
  - **Live Clock:** Displays system clock down to seconds.
  - **Status Tracker:** Automatically calculates whether a class is currently active (`Active (20 mins left)`), upcoming (`Next in 45 mins`), or completed for the day.
  - **Course Filter Pills:** Filters slots by course code (`CSA`, `DBMS`, `ADA`, `JAVA`, `D.S.`).
  - **Dual Views:** Switchable between "Day View" (detailed cards with faculty names) and "Matrix Grid" (weekly table).
- **Relevant Files:** [`src/components/Modals/TimetableModal.tsx`](../src/components/Modals/TimetableModal.tsx)

### Feature 8: AI Photo/PDF Smart Importer
- **Description:** Pre-built structured prompts that guide the user to convert images of paper timetables, student rosters, or faculty lists into clean JSON using external LLMs (ChatGPT, Gemini, Claude).
- **Sub-importers:**
  1. **Timetable Importer:** Pastes JSON into a validator and updates the weekly schedule.
  2. **Student Roster Importer:** Pastes `[{"roll": 1, "name": "..."}]` and updates the class list.
  3. **Faculty Details Importer:** Pastes `{"CSA": {"name": "...", "faculty": "..."}}` and updates course metadata.
- **Relevant Files:** [`src/components/Modals/SettingsModal.tsx:16-43, 198-316`](../src/components/Modals/SettingsModal.tsx#L16-L43)

### Feature 9: Offline Backup & Restore
- **Description:** Full snapshot export and import.
- **Download Backup:** Creates a downloadable JSON file (`Trace_Attendance_Backup_YYYY-MM-DD.json`) containing the full student roster and configuration.
- **Restore Backup:** File input reader parsing uploaded JSON and restoring configuration to `localStorage`.
- **Relevant Files:** [`src/components/Modals/SettingsModal.tsx:337-374`](../src/components/Modals/SettingsModal.tsx#L337-L374)

### Feature 10: Roster Edit Mode & Auto Roll Renumbering
- **Description:** In Edit Mode, each student row shows Edit and Delete buttons, and an "+ Add" button appears.
- **Auto Roll Renumbering:**
  - If student Roll #5 is deleted, all students from Roll #6 onward are decremented (`roll--`) to preserve contiguous sequence.
  - If a new student is inserted at Roll #10, all existing students with `roll >= 10` are incremented (`roll++`).
- **Relevant Files:** [`src/hooks/useAttendance.ts:321-360`](../src/hooks/useAttendance.ts#L321-L360)

---

## 2. Dormant / Orphaned Features (In Repository but Unwired)

The following feature modules exist in `src/components/` but are not mounted in `App.tsx`:

| Dormant Feature | Component File | Description & Capability |
| :--- | :--- | :--- |
| **Defaulter Analytics** | [`AnalyticsTab.tsx`](../src/components/AnalyticsTab.tsx) | Computes class average attendance, lists students below 75%, and calculates the exact number of classes needed to catch up. |
| **Historical Session Logs** | [`HistoryTab.tsx`](../src/components/HistoryTab.tsx) | Displays a log of all saved past attendance sessions with individual copy and delete controls. |
| **Individual Student Detail Modal** | [`StudentDetailModal.tsx`](../src/components/Modals/StudentDetailModal.tsx) | Displays a timeline of specific dates a student was absent (`absentDates[]`), allowing correction of conducted/attended counts. |
| **Cold Call Random Picker** | [`RandomPickerModal.tsx`](../src/components/Modals/RandomPickerModal.tsx) | Selects a random student who is currently marked **PRESENT** to answer questions in class. |
| **Bulk Text Roster Importer** | [`BulkImportModal.tsx`](../src/components/Modals/BulkImportModal.tsx) | Textarea parsing multiline `Roll, Name` strings. |
| **Keyboard Shortcuts Reference** | [`KeyboardShortcutsModal.tsx`](../src/components/Modals/KeyboardShortcutsModal.tsx) | Modal documenting keyboard hotkeys (`Ctrl+A`, `Ctrl+F`, `Ctrl+C`). |
| **Roster Card with Gauge** | [`StudentItem.tsx`](../src/components/StudentItem.tsx) | Visual card showing emerald/amber/rose attendance percentage pills. |
