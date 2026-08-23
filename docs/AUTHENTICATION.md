# Authentication & Security Model — TRACE

## 1. Authentication Model

TRACE operates on a **Zero-Authentication / Single-Tenant Local Device Model**:
- **No Login / Registration:** The application contains no user accounts, passwords, email verifications, OAuth providers, or JWT tokens.
- **No Session Tokens:** Because there is no backend API server, no bearer tokens or session cookies are issued or exchanged.
- **Physical Device Security Boundary:** Access control is governed entirely by the physical security of the host smartphone or computer. Anyone with physical access to the device's web browser can view, mark, edit, or export the attendance roster.

---

## 2. Authorization & Role Management

There are no user roles (e.g. "Admin", "Teacher", "Student", "Guest") encoded into the software.
- The UI exposes full administrative capability (editing students, changing timetables, modifying faculty names, wiping or restoring rosters) to whichever individual operates the device.
- In practical deployment, the application is intended to run exclusively on the personal mobile phone of the Class Representative (CR) or teaching faculty.

---

## 3. Security Threat Analysis & Attack Vectors

| Threat Vector | Severity | Vulnerability Assessment & Mitigation in Code |
| :--- | :--- | :--- |
| **Cross-Site Scripting (XSS)** | **Low** | React JSX automatically escapes dynamic values rendered in the DOM (e.g. `{student.name}`, `{s.roll}`). No instances of `dangerouslySetInnerHTML` exist in the codebase. |
| **JSON Injection via Importers** | **Medium** | In [`SettingsModal.tsx`](../src/components/Modals/SettingsModal.tsx), user-pasted JSON strings are parsed with `JSON.parse()` within `try-catch` blocks and filtered through `sanitizeStudents()`, preventing script execution. |
| **LocalStorage Tampering** | **Low** | Malicious data placed in `localStorage` by a local attacker is sanitized on boot by `sanitizeStudents()`, which strips non-numeric rolls, enforces valid bounds, and strips unexpected types. |
| **Cleartext Data Exposure** | **Low** | Student names and roll numbers are stored in plaintext in the browser's `localStorage`. Since this data contains no sensitive PII (e.g. passwords, SSNs, financial data), local encryption was not deemed necessary by the developer. |
| **Session Hijacking / CSRF** | **Non-Existent** | Not applicable; there are no network sessions, cookies, or backend endpoints to hijack. |

---

## 4. Recommendations for Multi-User Scalability

If this application is upgraded in the future to support multi-class or multi-teacher cloud synchronization, the following authentication controls should be introduced:
1. **OAuth 2.0 / Firebase Auth / Supabase Auth:** Institutional Google Workspace login (e.g. `@college.edu`).
2. **Role-Based Access Control (RBAC):**
   - `Faculty/Admin`: Full read/write authority to schedule and roster.
   - `Class Representative`: Read/write authority restricted to marking attendance for assigned class slots.
   - `Student`: Read-only access to view personal attendance percentages.
3. **Encrypted Cloud Sync:** HTTPS transport encryption with row-level security (RLS) on student records.
