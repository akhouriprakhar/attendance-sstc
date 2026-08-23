# AI-Generated & AI-Assisted Code Forensics — TRACE

This document presents a forensic investigation into whether and how artificial intelligence (AI) tools were used in the development of TRACE.

---

## 1. Classification of Evidence

To adhere to forensic standards, evidence is categorized into:
- **Strong Evidence:** Explicit prompt strings, prompt templates, or unmistakable generative artifacts.
- **Moderate Evidence:** Structural patterns, repetitive boilerplate, parallel implementations, or mismatched token systems.
- **Weak Evidence:** Generic styling choices or typical boilerplate.

---

## 2. Forensic Findings & Evidence

### Finding 1: Explicit Embedded AI Prompt Constants
- **Classification:** `STRONG EVIDENCE`
- **Location:** [`src/components/Modals/SettingsModal.tsx:16-43`](../src/components/Modals/SettingsModal.tsx#L16-L43)
- **Artifacts:**
  - Three distinct multi-line prompt constants (`PROMPT_TIMETABLE`, `PROMPT_ROSTER`, `PROMPT_TEACHERS`) containing classic LLM instruction patterns:
    > *"I am uploading an image/PDF/screenshot... Please extract... output ONLY a valid JSON object matching this exact schema with no extra conversational text or markdown codeblocks"*
- **Forensic Assessment:** The developer designed an intentional feature where external LLMs act as the computer vision / OCR parser for timetables and class lists.

### Finding 2: Divergent Dual-Generation Component Subsystems
- **Classification:** `STRONG / MODERATE EVIDENCE`
- **Locations:**
  - Active Generation: `App.tsx`, `ReportPanel.tsx`, `StudentList.tsx`, `index.css`
  - Dormant Generation: `StudentItem.tsx`, `AnalyticsTab.tsx`, `HistoryTab.tsx`, `KeyboardShortcutsModal.tsx`, `RandomPickerModal.tsx`, `ToastError.tsx`
- **Forensic Indicators:**
  - The active components use CSS tokens like `--bg-dark`, `--panel-bg`, `--accent-red`, `--border-color`.
  - The dormant components use an entirely different set of modern CSS tokens (`var(--bg-surface-elevated)`, `var(--text-sub)`, `var(--accent-emerald)`, `var(--accent-cyan)`, `var(--radius-md)`, `btn-enhanced`, `roster-card-container`).
- **Forensic Assessment:** The project evolved across at least two distinct AI generation prompts:
  1. An initial prompt that generated the complete working MVP with minimalist CSS in `index.css`.
  2. A secondary prompt (e.g. *"Generate advanced features for class analytics, history logs, student detail modal, and cold call picker"*) that generated rich modular components with a refined design token set, but the developer never updated `App.tsx` or `index.css` to stitch them into the main view.

### Finding 3: Realistic College Seed Data Generation
- **Classification:** `MODERATE EVIDENCE`
- **Location:** [`src/hooks/useAttendance.ts:25-90`](../src/hooks/useAttendance.ts#L25-L90)
- **Artifacts:**
  - 54 Indian student names (e.g., *Anshu Raj, Aakarshan Mishra, Amit Poddar, Akhouri Prakhar, Abhibhava Singh...*).
  - 9 real academic courses and professor names (*Prof. Ashish Rangade, Prof. Abhishek Dewangan, Prof. Teena Aggarwal, Prof. Savita Nam, Dr. Choubey*).
- **Forensic Assessment:** A real classroom list was either fed into the AI prompt to construct `DEFAULT_STUDENTS_STR` and `DEFAULT_CONFIG`, or extracted directly via the `SettingsModal` AI importer during initial setup.

---

## 3. Human vs. AI Authorship Summary

| Area | Authorship Profile | Forensic Rationale |
| :--- | :--- | :--- |
| **Core Architecture & Flow** | **AI-Assisted Human** | Highly tailored to real-world Indian engineering CR workflows (specific WhatsApp formatting, 5-minute reminder, Magic Box input). |
| **Component Generation** | **AI-Generated with Human Oversight** | High-velocity creation of specialized UI components; minor gaps left in integration wiring. |
| **PWA & Offline Strategy** | **AI-Assisted** | Standard Service Worker caching and Web Manifest configuration. |
