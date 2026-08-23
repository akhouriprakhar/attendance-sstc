# CSE Viva & Interview Preparation Guide — TRACE

This guide compiles essential technical and architectural questions likely to be asked during a CSE project viva, code review, or technical interview.

---

## 1. Beginner & Project Overview Questions

### Q1: What is TRACE and what problem does it solve?
**Answer:** TRACE is an offline-first Progressive Web App (PWA) built with React 18, TypeScript, and Vite. It replaces slow, error-prone paper roll calls in college lectures with an instant checklist and a fast-entry "Magic Roll Box". It automatically formats attendance reports for WhatsApp/Telegram groups and works completely without internet connectivity.

### Q2: Why is the project built without a backend server?
**Answer:** College classrooms frequently suffer from poor mobile connectivity and restricted Wi-Fi. A client-side, offline-first architecture with `localStorage` and Service Worker caching guarantees 0ms latency and 100% uptime in dead zones while incurring zero server hosting costs.

---

## 2. Architecture & Data Flow Questions

### Q3: How does data persist across browser refreshes?
**Answer:** State is synchronized to `localStorage` under versioned keys (`trace_students_v4`, `trace_config_v4`). On every mutation, a secondary redundant backup snapshot (`trace_backup_snapshot`) is written. If primary parsing fails, the app falls back to the snapshot before falling back to initial seed data.

### Q4: Explain the dynamic ratio-based output logic in `ReportPanel.tsx`.
**Answer:** The report dynamically inverts output based on turnout. If $\text{Present} < \text{Absent}$ (such as an elective or lab session), it formats and outputs the *Presentees* list (`Presentees: 1, 4, 12`). If $\text{Present} \ge \text{Absent}$ (standard lecture), it outputs the *Absentees* list (`Absentees: 6, 13, 28`). This saves screen space and adheres to college reporting norms.

### Q5: How does the "Magic Vanishing Roll Box" work technically?
**Answer:** In `StudentList.tsx`, the text input listens for delimiters (space, comma, newline) or Enter. It extracts integer tokens using the regex `/\b\d+\b/g`, calls `markStudentAbsentByRoll()` for each token, displays a toast notification, and immediately clears the input field state (`setAbsentTextInput('')`) for uninterrupted typing.

---

## 3. Algorithm & Code-Level Questions

### Q6: How does TRACE handle roll number renumbering when adding or deleting students?
**Answer:** In `useAttendance.ts`:
- **On Delete:** The target student is spliced out, and all students with `roll > deletedRoll` have their roll numbers decremented (`roll--`) to ensure a contiguous 1..N sequence.
- **On Add / Insert:** If the desired roll number collides with an existing student, all students with `roll >= newRoll` have their roll numbers incremented (`roll++`). The array is then sorted by `a.roll - b.roll`.

### Q7: What role does `sanitizeStudents()` play in data reliability?
**Answer:** It acts as a defensive validation boundary. When loading from `localStorage` or parsing user-imported JSON, it coerces rolls to positive numbers, cleans names with `formatTitleCase()`, ensures boolean `p` flags, clamps attended classes within $[0, \text{totalClasses}]$, and sorts the array.

---

## 4. Advanced & Critical Viva Questions

### Q8: How does the 5-minute class end alert work without battery-draining polling?
**Answer:** `ReportPanel.tsx` sets up a lightweight `setInterval` that fires every 10 seconds. It converts the current system time to minutes since midnight (`currentHour * 60 + currentMin`), checks the active day's timetable schedule slots, and triggers an alert and haptic vibration (`navigator.vibrate(50)`) when `nowInMins` falls in the window $[endMins - 5, endMins)$.

### Q9: What is the purpose of the AI prompt constants in `SettingsModal.tsx`?
**Answer:** Since optical character recognition (OCR) and PDF parsing inside a lightweight PWA is resource-intensive, TRACE uses a human-in-the-loop AI pipeline. It provides pre-engineered LLM prompts with exact JSON schemas that users copy and paste into ChatGPT or Gemini alongside timetable photos, then paste the structured JSON back into the app.

### Q10: If a user clears their browser cache, how can they recover their attendance data?
**Answer:** TRACE provides an "Offline Backup & Restore" feature in `SettingsModal.tsx` that exports all roster stats and timetables into a timestamped `.json` file. Users can restore this file at any time via the browser `FileReader` API.
