# Frontend Architecture & UI Design — TRACE

## 1. UI Philosophy & Design System

TRACE is built around a **dark-mode, high-contrast, utility-focused aesthetic** designed specifically for high readability on smartphone screens under bright classroom lighting or laptop screens.

### Design Tokens (`src/index.css`)
```css
:root {
  --bg-dark: #0a0a0a;          /* Deep AMOLED black canvas */
  --panel-bg: #1a1a1a;         /* Elevated surface */
  --text-primary: #f0f0f0;     /* High-contrast text */
  --text-secondary: #888888;   /* Subdued metadata */
  --accent-red: #ff3b30;       /* Primary accent & absence marker */
  --accent-green: #30d158;     /* Presence & high attendance rate indicator */
  --border-color: #333333;     /* Subtle grid lines */
  --hover-bg: #2b2b2b;         /* Button & row hover states */
  --font-body: 'Inter', sans-serif;
  --font-mono: 'Roboto Mono', monospace;
}
```

---

## 2. Responsive Layout Strategy

The application layout shifts smoothly between mobile and desktop viewport widths via CSS media queries:

### Mobile Viewport (`< 800px`):
- Single-column vertical layout (`flex-direction: column`).
- `ReportPanel` sits at the top, showing the live formatted report and copy buttons.
- `StudentList` flows underneath with a scrollable list container (`max-height: 60vh`).
- Bottom padding (`padding-bottom: 5rem`) prevents browser navigation bars from obscuring action buttons.

### Desktop Viewport (`>= 800px`):
- Two-column split layout (`flex-direction: row; max-width: 1200px`).
- **Left Column (400px fixed width):** `ReportPanel` sticks to the top of the viewport (`position: sticky; top: 1rem`).
- **Right Column (Flex 2):** `StudentList` expands to fill the remaining horizontal space (`max-height: 80vh`).

---

## 3. Active Frontend Components

### 1. `ReportPanel.tsx`
- **Props:** `students: Student[]`, `config: AppConfig`, `onOpenSettings`, `onCopySession`, `onRestoreLastSession`
- **Internal State:**
  - `startLec` (string, default `"1"`), `endLec` (string, default `""`)
  - `copyText` (`"Copy Report"` $\to$ `"Copied!"`), `restoreText` (`"Restore Last Session"` $\to$ `"Restored!"`)
  - `isInstallable` (PWA install prompt state), `remindAttendance` (5-min warning banner)
- **Memoized Calculations:**
  - `present`, `absent`, `sessionRate`
  - `reportText`: Auto-constructs the formatted text report.

### 2. `StudentList.tsx`
- **Props:** `students: Student[]`, `editMode: boolean`, `onToggleStudent`, `onMarkStudentAbsentByRoll`, `onToggleAll`, `onToggleEditMode`, `onOpenTimetable`, `onOpenAddModal`, `onOpenEditModal`, `onDeleteStudent`
- **Internal State:**
  - `searchTerm` (search input filter)
  - `absentTextInput` (Magic Box raw text)
  - `showRollGrid` (boolean to toggle the 1-tap roll number grid)
  - `toastMessage` (string for vanishing absent toast alerts)

### 3. `StudentModal.tsx`
- **Props:** `isOpen: boolean`, `editIdx: number`, `editingStudent: Student | null`, `onClose`, `onSave`
- **Purpose:** Form for adding a new student or editing an existing student's roll number and full name.

### 4. `TimetableModal.tsx`
- **Props:** `isOpen: boolean`, `config: AppConfig`, `onClose`, `onSelectSubject`
- **Internal State:**
  - `now` (Date instance updated every 1,000ms)
  - `activeDayTab` (defaults to current weekday)
  - `viewMode` (`'day'` or `'grid'`)
  - `filterSubject` (nullable subject code filter)

### 5. `SettingsModal.tsx`
- **Props:** `isOpen: boolean`, `config: AppConfig`, `onClose`, `onSaveConfig`, `onSaveStudents`, `onImportTimetable`, `onImportRoster`, `onImportSubjects`, `onDownloadBackup`
- **Tabs:**
  - `smart`: AI Prompts & JSON string inputs.
  - `manual`: Raw JSON textarea for direct config mutation.
  - `backup`: Download backup file and JSON file restoration.

---

## 4. UI Design Consistency Discrepancy (Forensic Finding)

During the forensic audit, an architectural divergence was identified between the active components and the orphaned components:
1. **Active Components (`App.tsx`, `ReportPanel.tsx`, `StudentList.tsx`, `index.css`):**
   - Use CSS custom properties `--bg-dark`, `--panel-bg`, `--accent-red`, `--font-mono`.
   - Simple, flat, brutalist-clean dark theme with 8px radius corners and mono badge tags.
2. **Orphaned Components (`StudentItem.tsx`, `AnalyticsTab.tsx`, `HistoryTab.tsx`, `KeyboardShortcutsModal.tsx`, `RandomPickerModal.tsx`):**
   - Reference tokens like `var(--bg-surface-elevated)`, `var(--accent-emerald)`, `var(--accent-cyan)`, `var(--radius-md)`, `var(--shadow-glow)`, `var(--gradient-card)`, `btn-enhanced`.
   - **Root Cause:** These components were created in a separate AI generation pass using a distinct design library token scheme that was never merged into `index.css`.
