# External Services & AI Integration — TRACE

This document details all external networks, CDNs, third-party infrastructure, and AI-assisted workflows used by TRACE.

---

## 1. Network CDNs & Web Resources

| External Service | Host URL | Purpose | Offline Behavior / Fallback |
| :--- | :--- | :--- | :--- |
| **Google Fonts** | `https://fonts.googleapis.com`<br>`https://fonts.gstatic.com` | Delivers typography (`Inter`, `Roboto Mono`, `JetBrains Mono`, `Plus Jakarta Sans`). | Preconnect tags in `index.html`. If offline, browser falls back to generic system sans-serif / monospace fonts. |
| **Netlify Edge CDN** | `*.netlify.app` | Static asset hosting, SSL termination, and automated continuous deployment. | Serves the cached production build on initial download; subsequent visits cached by Service Worker. |

---

## 2. The AI-Assisted Data Extraction Pipeline

TRACE integrates with Large Language Models (ChatGPT, Claude, Google Gemini) via a **Human-in-the-Loop Copy-Paste Prompt Protocol** embedded inside [`SettingsModal.tsx`](../src/components/Modals/SettingsModal.tsx):

```text
[Physical Class Timetable / PDF Roster / Faculty List]
                       │
                       ▼
[User Takes Screenshot / Uploads Image to ChatGPT/Gemini]
                       │
                       ▼
[User Clicks "Copy AI Prompt" in TRACE Settings Modal]
                       │
                       ▼
[User Pastes Prompt + Image into LLM Interface]
                       │
                       ▼
[LLM Generates Strict JSON Matching TRACE Schema]
                       │
                       ▼
[User Pastes JSON into TRACE Importer Textarea]
                       │
                       ▼
[TRACE Validates JSON, Sanitizes Schema, & Updates LocalStorage]
```

### Embedded AI Prompts Analysis

#### 1. Timetable Prompt (`PROMPT_TIMETABLE`)
```text
I am uploading an image/PDF/screenshot of a class timetable schedule. Please extract all lectures from Monday to Saturday and output ONLY a valid JSON object matching this exact schema with no extra conversational text or markdown codeblocks:

{
  "Monday": [
    { "t": "10:00-10:50", "s": "CSA" },
    { "t": "10:50-11:40", "s": "DBMS" }
  ],
  "Tuesday": [
    { "t": "10:00-10:50", "s": "JAVA" }
  ]
}
```

#### 2. Student Roster Prompt (`PROMPT_ROSTER`)
```text
I am uploading an image/PDF/screenshot of a student class list or attendance roll call sheet. Please extract all student roll numbers and full names, and output ONLY a valid JSON array matching this exact schema with no extra conversational text or markdown codeblocks:

[
  { "roll": 1, "name": "Anshu Raj" },
  { "roll": 2, "name": "Aakarshan Mishra" },
  { "roll": 3, "name": "Amit Poddar" }
]
```

#### 3. Faculty Assignment Prompt (`PROMPT_TEACHERS`)
```text
I am uploading an image/PDF/screenshot of subject faculty assignments. Please extract all subject codes, subject full names, and faculty/professor names, and output ONLY a valid JSON object matching this exact schema with no extra conversational text or markdown codeblocks:

{
  "CSA": { "name": "Computer System Architecture", "faculty": "Prof. Ashish Rangade" },
  "DBMS": { "name": "Database Management System", "faculty": "Prof. Abhishek Dewangan" },
  "ADA": { "name": "Analysis & Design of Algorithm", "faculty": "Prof. Teena Aggarwal" }
}
```
