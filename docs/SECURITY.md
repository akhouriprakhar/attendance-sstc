# Security & Vulnerability Analysis — TRACE

This document presents a comprehensive security audit of the TRACE codebase.

---

## 1. Security Strengths & Confirmed Safe Patterns

| Area | Status | Technical Rationale |
| :--- | :--- | :--- |
| **No Server-Side Injections** | **CONFIRMED SAFE** | No SQL database or backend server exists; SQL Injection, Remote Code Execution (RCE), and Server-Side Request Forgery (SSRF) are architecturally impossible. |
| **React XSS Defenses** | **CONFIRMED SAFE** | No usage of `dangerouslySetInnerHTML`, `eval()`, `document.write()`, or direct un-escaped innerHTML manipulation. All dynamic text is safely escaped by React's virtual DOM. |
| **PWA Cache Scope** | **CONFIRMED SAFE** | The Service Worker (`public/sw.js`) restricts caching strictly to local assets (`/`, `/index.html`, `/manifest.json`, icons), avoiding caching of untrusted third-party origins. |
| **JSON Deserialization Guards** | **CONFIRMED SAFE** | All `JSON.parse` operations in `useAttendance.ts` and `SettingsModal.tsx` are wrapped in `try-catch` blocks and filtered through `sanitizeStudents()`, preventing runtime prototype pollution. |

---

## 2. Potential Security Concerns & Findings

### Finding 1: Unencrypted LocalStorage Data
- **Classification:** `POSSIBLE CONCERN` (Low Risk)
- **Description:** Student names, roll numbers, and historical attendance logs are stored as unencrypted UTF-8 plaintext in browser `localStorage`.
- **Impact:** Any browser extension with storage permissions or any user with physical access to DevTools can read the roster.
- **Context:** In standard academic environments, student names and roll numbers are considered public directory information; however, institutions subject to strict FERPA or GDPR compliance may require client-side WebCrypto encryption.

### Finding 2: Unbounded LocalStorage Growth
- **Classification:** `POSSIBLE CONCERN` (Low Risk)
- **Description:** While current storage is tiny (~20 KB for 54 students), if extensive absence history logs (`absentDates[]`) accumulate indefinitely over multiple semesters without cleanup, storage could theoretically approach the 5MB browser `localStorage` limit.
- **Mitigation:** Implement a rolling window or export-and-clear archival mechanism.

### Finding 3: Missing CORS / CSP Meta Headers
- **Classification:** `POSSIBLE CONCERN` (Low Risk)
- **Description:** `index.html` does not define a strict Content Security Policy (`<meta http-equiv="Content-Security-Policy">`).
- **Recommendation:** Add a CSP meta tag restricting script execution strictly to `'self'` and styles to `'self' https://fonts.googleapis.com`.
