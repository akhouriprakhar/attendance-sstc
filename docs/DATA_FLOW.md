# Data Flow Analysis — TRACE

This document traces the complete lifecycle of data across the major user interactions in TRACE.

---

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

---

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

---

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

---

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

---

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

## 6. AI Smart Import Flow

```text
User Pastes AI-Generated JSON into SettingsModal (e.g., Timetable Input)
  │
  ▼
SettingsModal: handleApplyTimetable()
  ├── 1. JSON Validation: JSON.parse(timetableInput)
  ├── 2. Calls onImportTimetable(parsed)
  │      │
  │      ▼
  │   useAttendance.ts: importTimetableOnly(newTimetable)
  │      ├── Clones config: updatedConfig = { ...config, timetable: newTimetable }
  │      ├── setConfigState(updatedConfig)
  │      ├── Writes to localStorage: 'trace_config_v4'
  │      └── Writes to snapshot: 'trace_backup_snapshot'
  │
  ├── 3. Clears input textarea
  └── 4. Alerts: "Timetable Imported & Applied Successfully!"
```

---

## 7. Auto-Renumbering on Student Insertion / Deletion

```text
Student Deletion: deleteStudent(targetIdx)
  ├── targetRoll = list[targetIdx].roll
  ├── list.splice(targetIdx, 1)
  ├── list.forEach(s => { if (s.roll > targetRoll) s.roll--; })
  └── sanitizeStudents() -> sorted & saved to localStorage

Student Addition: saveStudentProcess(newRoll, name, isEdit, editIdx)
  ├── If edit: remove old student & decrement subsequent rolls
  ├── If collision (list.some(s => s.roll === newRoll)):
  │     list.forEach(s => { if (s.roll >= newRoll) s.roll++; })
  ├── list.push({ roll: newRoll, name: formatTitleCase(name), ... })
  └── sanitizeStudents() -> sorted by roll & saved to localStorage
```
