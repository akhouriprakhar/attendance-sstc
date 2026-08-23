# Web APIs & Browser Interfaces — TRACE

Because TRACE is a client-side offline application, it does not expose or consume external REST/GraphQL HTTP endpoints. Instead, its "APIs" comprise native **HTML5 & Web Platform APIs**.

---

## 1. Browser Web APIs Consumed

| Web API | Location in Code | Purpose | Fallback / Error Handling |
| :--- | :--- | :--- | :--- |
| **Web Storage API (`localStorage`)** | [`src/hooks/useAttendance.ts`](../src/hooks/useAttendance.ts) | Persistent key-value storage for roster, config, and session state. | Wrapped in `try-catch` blocks; falls back to `trace_backup_snapshot` or initial memory seed. |
| **Async Clipboard API (`navigator.clipboard`)** | [`src/components/ReportPanel.tsx:137`](../src/components/ReportPanel.tsx#L137), [`src/components/Modals/SettingsModal.tsx:75`](../src/components/Modals/SettingsModal.tsx#L75) | Copies WhatsApp attendance reports and AI prompt templates directly to user clipboard. | Executes `navigator.clipboard.writeText(text)`. |
| **Vibration API (`navigator.vibrate`)** | [`src/hooks/useAttendance.ts:215`](../src/hooks/useAttendance.ts#L215), [`src/components/ReportPanel.tsx:86`](../src/components/ReportPanel.tsx#L86) | Provides tactile haptic feedback on checkbox click, fast roll mark, and 5-min class warning. | Guarded with `if (navigator.vibrate)`. Silently ignored if unsupported (e.g. desktop). |
| **Service Worker API (`navigator.serviceWorker`)** | [`src/main.tsx:12-18`](../src/main.tsx#L12-L18), [`public/sw.js`](../public/sw.js) | Registers `/sw.js` to enable offline asset caching and PWA functionality. | Guarded with `if ('serviceWorker' in navigator)`. Logs registration error to console. |
| **PWA Install API (`beforeinstallprompt`)** | [`src/components/ReportPanel.tsx:33-52`](../src/components/ReportPanel.tsx#L33-52) | Intercepts browser PWA prompt to display a custom "Install App" button in the UI. | `e.preventDefault()`, stores event in `deferredPrompt`, triggers `.prompt()` on click. |
| **FileReader API (`FileReader`)** | [`src/components/Modals/SettingsModal.tsx:133`](../src/components/Modals/SettingsModal.tsx#L133) | Reads uploaded offline `.json` backup files directly in the browser without network transmission. | `reader.readAsText(file)` wrapped in `try-catch` JSON parser with user alert on syntax error. |
| **Blob & URL Object API (`URL.createObjectURL`)** | [`src/hooks/useAttendance.ts:501-507`](../src/hooks/useAttendance.ts#L501-507) | Converts memory JSON string into a downloadable `.json` file stream. | Creates temporary `<a>` element, triggers `.click()`, and cleans up via `URL.revokeObjectURL`. |

---

## 2. Internal Component Action Signatures (Internal API)

The custom hook [`useAttendance`](../src/hooks/useAttendance.ts) exposes the core programmatic interface to UI components:

| Method Signature | Parameters | Return Type | Action Description |
| :--- | :--- | :--- | :--- |
| `toggleStudent` | `(idx: number)` | `void` | Inverts presence boolean `p` of student at array index `idx`. |
| `toggleStudentByRoll` | `(rollNum: number)` | `void` | Finds student by `roll === rollNum` and inverts `p`. |
| `markStudentAbsentByRoll` | `(rollNum: number)` | `boolean` | Sets `p = false` strictly. Returns `true` if state changed, `false` if already absent. |
| `markAbsentRollsByText` | `(rawText: string)` | `void` | Parses space/comma numbers and unchecks matching students in bulk. |
| `toggleAll` | `()` | `void` | Marks all students present (if any absent) or all absent. |
| `saveLastCopiedSession` | `()` | `void` | Persists current presence map to `trace_last_copied_session`. |
| `restoreLastCopiedSession` | `()` | `boolean` | Restores presence map from `trace_last_copied_session`. Returns success flag. |
| `saveStudentProcess` | `(roll, name, isEdit, editIdx)` | `void` | Inserts or edits student, automatically adjusting roll sequence. |
| `deleteStudent` | `(idx: number)` | `void` | Deletes student at `idx` and decrements subsequent roll numbers. |
| `setConfig` | `(newConfig: AppConfig)` | `void` | Replaces entire configuration in state and `localStorage`. |
| `importTimetableOnly` | `(newTimetable: any)` | `void` | Merges new timetable matrix while preserving subjects and students. |
| `importRosterOnly` | `(newRoster: any[])` | `void` | Sanitizes and replaces student roster. |
| `importSubjectsOnly` | `(newSubjects: any)` | `void` | Updates subject codes and faculty assignments. |
| `downloadBackupJSON` | `()` | `void` | Generates timestamped `.json` file download. |
