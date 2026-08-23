# Project Overview — TRACE Attendance Tracker

## 1. What Is This Project?

### Simple Explanation
**TRACE** is a lightweight, dark-mode web application designed to help college Class Representatives (CRs) and professors take attendance in under 30 seconds. Instead of calling out names one-by-one or writing roll numbers on paper, the user quickly checks off students or types absent roll numbers into a rapid-entry input box. The app immediately formats a complete WhatsApp attendance report ready to be copied and pasted into official college WhatsApp or Telegram groups.

### Technical Explanation
TRACE is a single-page Progressive Web Application (PWA) built using React 18, TypeScript, and Vite. It operates strictly client-side without a backend server or external database. All persistent state—including a 54-student class roster, semester schedules, and subject allocations—is serialized and synchronized to browser `localStorage` under versioned keys with snapshot-level redundancy. It uses Service Workers to provide offline operation and leverages the Web Vibration API for tactile haptic feedback during roll checks and lecture transition alerts.

---

## 2. Problem Statement & Real-World Context

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

---

## 3. Target Audience & Users

| User Persona | Typical Use Case |
| :--- | :--- |
| **Class Representatives (CRs)** | Taking attendance during college lectures on a mobile phone and posting formatted reports to WhatsApp. |
| **College Professors & Lecturers** | Checking off students on a tablet/laptop or verifying which students are absent before beginning a lab session. |
| **Lab Instructors & TAs** | Managing multi-slot practical sessions (e.g. "Python Lab / DBMS Lab") with quick presentee/absentee tracking. |

---

## 4. User Journey & Workflow

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

---

## 5. Summary of Core Metrics

- **Default Batch Size:** 54 Students (Rolls 1 to 54)
- **Target Semester:** 4th Semester (Computer Science & Engineering)
- **Active Core Subjects:** 9 Courses (CSA, DBMS, ADA, JAVA, Discrete Math, Python/DBMS Lab, Mini Project/Java Lab, Personality Development, Library)
- **Client Storage Engines:** `localStorage` (4 keys: `trace_students_v4`, `trace_config_v4`, `trace_backup_snapshot`, `trace_last_copied_session`)
- **PWA Cache Version:** `trace-app-cache-v10`
