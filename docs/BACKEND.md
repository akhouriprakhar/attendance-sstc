# Backend Architecture & Persistence — TRACE

## 1. Backend-Less Architecture Overview

TRACE does not utilize a traditional server-side backend runtime. There is no Node.js/Express, Python/FastAPI, Ruby on Rails, or serverless function infrastructure. 

Instead, all persistence, synchronization, and data lifecycle management occur purely on the client side via the **Browser Execution Environment**.

---

## 2. The Client-Side Persistence Layer

Persistence is handled exclusively by the Web Storage API (`localStorage`) within the custom React hook [`useAttendance.ts`](../src/hooks/useAttendance.ts).

### LocalStorage Storage Keys

| Storage Key | Type | Data Structure | Purpose |
| :--- | :--- | :--- | :--- |
| `trace_students_v4` | Array | `Student[]` | Active list of students, presence flags (`p`), and attendance records. |
| `trace_config_v4` | Object | `AppConfig` | Semester metadata, subject list, faculty names, and weekly timetable. |
| `trace_backup_snapshot` | Object | `BackupData` | Redundant emergency backup written on every state modification. |
| `trace_last_copied_session` | Array | `Array<{roll: number, p: boolean}>` | Exact checkmark snapshot saved whenever "Copy Report" is tapped. |

---

## 3. Data Integrity & Redundancy Mechanisms

To protect student attendance data from browser storage corruption or ungraceful tab closures, `useAttendance.ts` implements three layers of resilience:

### 1. Dual-Snapshot Writing
Whenever `saveStudents` or `toggleStudent` is executed, the hook writes to `trace_students_v4` and concurrently serializes a complete timestamped snapshot to `trace_backup_snapshot`:
```typescript
const writeSnapshot = useCallback((stList: Student[], cfg: AppConfig) => {
  try {
    const snapshot: BackupData = {
      version: "v4-resilient",
      timestamp: new Date().toISOString(),
      students: stList,
      config: cfg
    };
    localStorage.setItem(STORAGE_KEY_SNAPSHOT, JSON.stringify(snapshot));
  } catch (e) {}
}, []);
```

### 2. Graceful Fallback on Deserialization Failure
During initialization (`useEffect`), if `JSON.parse(savedStudents)` fails due to corrupted JSON syntax, the hook automatically attempts to load and sanitize data from `trace_backup_snapshot` before reverting to the default seed roster.

### 3. Data Sanitization Pipeline (`sanitizeStudents`)
Raw objects retrieved from storage or imported from JSON files are passed through `sanitizeStudents(raw)`:
- Enforces numeric and positive `roll` numbers.
- Sanitizes names via `formatTitleCase()`.
- Guarantees boolean `p` flags.
- Clamps `totalClasses` to $\ge 1$ and `attendedClasses` between $0$ and `totalClasses`.
- Sorts all records in ascending order of roll number (`a.roll - b.roll`).

---

## 4. Service Worker Backend Proxy (`public/sw.js`)

The Service Worker operates as a client-side network proxy:
- **Install Phase:** Pre-caches essential shell assets: `'/'`, `'/index.html'`, `'/manifest.json'`, `'/icon-192.png'`, `'/icon-512.png'`.
- **Activate Phase:** Purges outdated cache names and claims all client tabs (`self.clients.claim()`).
- **Fetch Interception:** Responds from CacheStorage first; falls back to live network fetch if the asset is not cached.

```javascript
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
```

---

## 5. Architectural Trade-offs

| Advantage | Limitation |
| :--- | :--- |
| Zero server hosting costs and 0ms latency. | No automatic cross-device cloud synchronization. |
| 100% functional in offline college environments. | Data loss if user manually clears browser site data. |
| Full data ownership and GDPR-friendly. | Concurrent multi-user edits not supported. |
