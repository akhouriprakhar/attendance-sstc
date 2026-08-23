# System Architecture — TRACE Attendance Tracker

## 1. Architectural Style & Paradigm

TRACE employs a **Client-Side Single-Page Application (SPA)** architecture structured around an **Offline-First Progressive Web App (PWA)** design.

Key characteristics:
- **No Backend Web Server:** The application has no server-side execution runtime (no Node.js Express server, no Django/Flask, no cloud functions).
- **Static Hosting:** The production build consists entirely of static HTML, CSS, JavaScript, and asset files served via CDN (Netlify).
- **Local Persistence Model:** All state mutates purely within the client's browser memory and is serialized to Web Storage (`localStorage`).
- **Service Worker Interception:** Network requests for static shell assets are intercepted by a Service Worker and served from the browser's `CacheStorage`.

---

## 2. System Architecture Diagram

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

---

## 3. Component Hierarchy & Module Tree

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

*(Note: See [Incomplete Work & Dead Code](./INCOMPLETE_WORK.md) for orphaned components not mounted in `App.tsx`).*

---

## 4. Offline & Progressive Web App (PWA) Architecture

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

## 5. Architectural Strengths & Inherent Constraints

### Strengths
- **Instant Response Time:** 0 ms API latency since all operations execute in-memory.
- **Resilience:** Operates continuously in network dead zones (basements, classrooms).
- **Simplicity:** No database migrations, no cloud server costs, no authentication session expiration.
- **Portability:** Full dataset exportable to a single timestamped JSON file.

### Inherent Constraints
- **Device-Bound Data:** Data saved on one device/browser does not automatically sync to another device without exporting/importing JSON backups.
- **Browser Cache Wipe Risk:** If the user manually clears browser site data, `localStorage` is erased (mitigated by the snapshot backup system and JSON export feature).
- **Single-User Scope:** Does not support multi-user concurrent editing on the same class roster simultaneously.
