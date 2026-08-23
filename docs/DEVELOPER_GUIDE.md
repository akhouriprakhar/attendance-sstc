# Developer & Modification Guide — TRACE

This practical guide assists developers in navigating, modifying, and extending the TRACE codebase.

---

## 1. Quick "Where Do I Look?" Cheat Sheet

| I Want To... | Inspect / Modify These Files |
| :--- | :--- |
| **Change the WhatsApp message format** | [`src/components/ReportPanel.tsx:108-134`](../src/components/ReportPanel.tsx#L108-L134) (`reportText` memo calculation) |
| **Change default students / seed roster** | [`src/hooks/useAttendance.ts:25`](../src/hooks/useAttendance.ts#L25) (`DEFAULT_STUDENTS_STR`) |
| **Change default subjects / timetable** | [`src/hooks/useAttendance.ts:27-90`](../src/hooks/useAttendance.ts#L27-L90) (`DEFAULT_CONFIG`) |
| **Modify the Magic Vanishing Box behavior** | [`src/components/StudentList.tsx:42-79`](../src/components/StudentList.tsx#L42-L79) (`processRollInput`) |
| **Adjust the 5-minute lecture end alert** | [`src/components/ReportPanel.tsx:55-98`](../src/components/ReportPanel.tsx#L55-L98) (`checkSchedule` interval) |
| **Change the UI theme / colors / fonts** | [`src/index.css`](../src/index.css) (`:root` CSS variables and layout styles) |
| **Add a new modal window** | Create modal in `src/components/Modals/`, import in `src/App.tsx`, toggle via `useState` |
| **Change LocalStorage storage keys / version** | [`src/hooks/useAttendance.ts:4-7`](../src/hooks/useAttendance.ts#L4-L7) (`STORAGE_KEY_*` constants) |
| **Update Service Worker offline caching** | [`public/sw.js:1`](../public/sw.js#L1) (increment `CACHE_NAME` e.g. `v11`) |

---

## 2. Step-by-Step Task Recipes

### Recipe A: Adding a New Subject to the Semester
1. Open [`src/hooks/useAttendance.ts`](../src/hooks/useAttendance.ts).
2. Locate `DEFAULT_CONFIG.subjects`.
3. Add the subject key (e.g. `"OS"`):
   ```typescript
   "OS": { name: "Operating Systems", faculty: "Prof. John Doe" }
   ```
4. In `DEFAULT_CONFIG.timetable`, insert slots referring to `"OS"` (e.g. `{ "t": "09:00-09:50", "s": "OS" }`).
5. Open [`src/components/Modals/TimetableModal.tsx`](../src/components/Modals/TimetableModal.tsx) and add a badge color palette to `SUBJECT_COLORS`:
   ```typescript
   "OS": { bg: "rgba(168, 85, 247, 0.12)", border: "rgba(168, 85, 247, 0.4)", text: "#a855f7" }
   ```

---

### Recipe B: Connecting the Dormant "Random Picker" Feature
1. Open [`src/App.tsx`](../src/App.tsx).
2. Import `RandomPickerModal`:
   ```tsx
   import { RandomPickerModal } from './components/Modals/RandomPickerModal';
   ```
3. Add state: `const [isRandomOpen, setIsRandomOpen] = useState(false);`
4. In `StudentList.tsx`, add a button in the header:
   ```tsx
   <button className="btn secondary" onClick={() => setIsRandomOpen(true)}>🎲 Pick</button>
   ```
5. Mount `<RandomPickerModal isOpen={isRandomOpen} students={students} onClose={() => setIsRandomOpen(false)} />` inside `App.tsx`.

---

### Recipe C: Modifying the WhatsApp Attendance Format
To adjust the output to include a custom signature or batch identifier:
1. Open [`src/components/ReportPanel.tsx`](../src/components/ReportPanel.tsx).
2. Locate lines 127–133.
3. Modify the return template string:
   ```typescript
   return `*BATCH 2026 ATTENDANCE*\n${dayStr}, ${dateStr}\nLecture: ${lecStr}\nAbsentees: ${absenteesStr || "NIL"}\n\nSubmitted by Class Representative`;
   ```

---

## 3. Local Development & Deployment Workflow

```bash
# 1. Install packages
npm install

# 2. Run local dev server with Hot Module Replacement
npm run dev

# 3. Build for production (TypeScript compile + Vite Rollup bundling)
npm run build

# 4. Preview local build
npm run preview
```
Deploy to Netlify by connecting your Git repository; Netlify will read `netlify.toml` and deploy automatically.
