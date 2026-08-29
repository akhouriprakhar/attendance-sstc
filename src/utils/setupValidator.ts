import { Student, AppConfig, ScheduleSlot } from '../types';
import { formatTitleCase } from '../hooks/useAttendance';
import { normalizeSubjectName } from './textFormatter';

export interface ValidationResult {
  success: boolean;
  error?: string;
  students?: Student[];
  config?: AppConfig;
}

export const GENERIC_SETUP_PROMPT = `I want to set up my class attendance and timetable in my attendance tracker application.

Please organize all my class data into a single valid JSON object.

Here is my raw class information:
[PASTE YOUR STUDENT LIST, ROLL NUMBERS, CLASS/SECTION NAME, SUBJECTS, FACULTY, AND TIMETABLE HERE]

Please extract and format all the information into ONLY a valid JSON object matching this exact schema:

{
  "className": "Class / Section / Semester Name",
  "students": [
    { "roll": 1, "name": "Student Full Name" },
    { "roll": 2, "name": "Student Full Name" }
  ],
  "subjects": {
    "DS": { "name": "Data Science", "faculty": "Teacher / Faculty Name" },
    "DS Lab": { "name": "Data Science Lab", "faculty": "Teacher / Faculty Name" },
    "Blockchain": { "name": "Blockchain", "faculty": "Teacher / Faculty Name" },
    "TOC": { "name": "Theory of Computation", "faculty": "Teacher / Faculty Name" },
    "CN": { "name": "Computer Networks", "faculty": "Teacher / Faculty Name" },
    "CN Lab": { "name": "Computer Networks Lab", "faculty": "Teacher / Faculty Name" },
    "IoT": { "name": "IoT", "faculty": "Teacher / Faculty Name" },
    "IoT Lab": { "name": "IoT Lab", "faculty": "Teacher / Faculty Name" },
    "Minor Project": { "name": "Minor Project", "faculty": "Teacher / Faculty Name" }
  },
  "timetable": {
    "Monday": [
      { "t": "10:00-10:50", "s": "DS" },
      { "t": "10:50-11:40", "s": "TOC" }
    ],
    "Tuesday": [],
    "Wednesday": [],
    "Thursday": [],
    "Friday": [],
    "Saturday": []
  }
}

Instructions:
1. Extract all supplied students accurately. Preserve full names and exact spellings.
2. If roll numbers are provided, preserve them. If not provided, assign sequential integer roll numbers starting from 1. Ensure roll numbers are unique.
3. Extract class/section/semester name if provided.
4. Use clean, standardized, readable Subject Names / Abbreviations (e.g. "DS", "Blockchain", "TOC", "CN", "IoT", "Minor Project") and distinctly identify practicals (e.g. "DS Lab", "IoT Lab", "CN Lab"). Strip elective prefixes like "Elective Subject 1 Blockchain" to purely "Blockchain".
5. Extract the class timetable schedule with start-end times (format: "HH:MM-HH:MM") and the clean subject/lab names.
6. If subjects or timetable are not provided, leave them as empty objects {} without inventing fake data.
7. Do NOT invent missing student names or fake data.
8. Return ONLY the raw JSON object with no conversational text, explanations, or surrounding markdown formatting.`;

/**
 * Normalizes a day's schedule slots, ensuring multi-period lab blocks (e.g. Periods 3 & 4 CN Lab)
 * are uniformly labeled and designated as practical/lab slots across all consecutive periods.
 */
export const normalizeTimetableDaySlots = (rawSlots: ScheduleSlot[]): ScheduleSlot[] => {
  if (!Array.isArray(rawSlots)) return [];

  // 1. First pass: normalize subject names and check durations
  const normalized = rawSlots
    .filter(slot => slot && typeof slot === 'object' && typeof slot.t === 'string' && typeof slot.s === 'string')
    .map(slot => {
      const cleanSubject = normalizeSubjectName(slot.s.trim());
      let finalSubject = cleanSubject;

      try {
        const [startStr, endStr] = slot.t.split('-');
        if (startStr && endStr) {
          const [sH, sM] = startStr.split(':').map(Number);
          const [eH, eM] = endStr.split(':').map(Number);
          const duration = (eH * 60 + eM) - (sH * 60 + sM);
          if (duration >= 75) {
            if (cleanSubject === 'CN') finalSubject = 'CN Lab';
            else if (cleanSubject === 'IoT') finalSubject = 'IoT Lab';
            else if (cleanSubject === 'DS') finalSubject = 'DS Lab';
            else if (cleanSubject === 'DBMS') finalSubject = 'DBMS Lab';
            else if (cleanSubject === 'OS') finalSubject = 'OS Lab';
            else if (cleanSubject === 'JAVA') finalSubject = 'JAVA Lab';
            else if (cleanSubject === 'PYTHON') finalSubject = 'PYTHON Lab';
            else if (cleanSubject === 'WT') finalSubject = 'WT Lab';
            else if (cleanSubject === 'ADA' || cleanSubject === 'DAA') finalSubject = 'ADA Lab';
          }
        }
      } catch (e) {}

      return {
        t: slot.t.trim(),
        s: finalSubject
      };
    });

  // 2. Second pass: unify contiguous lab slots across consecutive periods
  for (let i = 0; i < normalized.length; i++) {
    const curr = normalized[i];
    const isCurrLab = curr.s.endsWith(' Lab') || curr.s.includes('Project');

    if (isCurrLab) {
      const baseName = curr.s.replace(/\s+Lab$/i, '').trim();

      // If previous slot shares base name (e.g. "CN" before "CN Lab"), make it "CN Lab"
      if (i > 0) {
        const prev = normalized[i - 1];
        if (prev.s === baseName || prev.s.toLowerCase() === baseName.toLowerCase()) {
          prev.s = curr.s;
        }
      }

      // If next slot shares base name (e.g. "CN" after "CN Lab"), make it "CN Lab"
      if (i < normalized.length - 1) {
        const next = normalized[i + 1];
        if (next.s === baseName || next.s.toLowerCase() === baseName.toLowerCase()) {
          next.s = curr.s;
        }
      }
    }
  }

  return normalized;
};

/**
 * Normalizes full timetable map with proper Day casing (e.g. "Monday") and multi-period lab unification.
 */
export const normalizeTimetableMap = (rawMap?: Record<string, ScheduleSlot[]>): Record<string, ScheduleSlot[]> => {
  if (!rawMap || typeof rawMap !== 'object') return {};
  const standardDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const result: Record<string, ScheduleSlot[]> = {};

  Object.keys(rawMap).forEach(key => {
    const matchedDay = standardDays.find(d => d.toLowerCase() === key.trim().toLowerCase()) || formatTitleCase(key.trim());
    result[matchedDay] = normalizeTimetableDaySlots(rawMap[key] || []);
  });

  return result;
};

export const validateClassSetupJson = (rawInput: string): ValidationResult => {
  if (!rawInput || !rawInput.trim()) {
    return {
      success: false,
      error: "Setup couldn't be imported. Input is empty. Please paste the JSON generated by your AI."
    };
  }

  // Strip markdown code fences if AI wrapped the output in ```json ... ```
  let cleaned = rawInput.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    return {
      success: false,
      error: "Setup couldn't be imported. Please check the information generated by your AI and try again."
    };
  }

  if (!parsed || (typeof parsed !== 'object' && !Array.isArray(parsed))) {
    return {
      success: false,
      error: "Setup couldn't be imported. Please check the information generated by your AI and try again."
    };
  }

  // Extract raw students list
  let rawStudents: any[] = [];
  if (Array.isArray(parsed)) {
    rawStudents = parsed;
  } else if (Array.isArray(parsed.students)) {
    rawStudents = parsed.students;
  } else if (Array.isArray(parsed.roster)) {
    rawStudents = parsed.roster;
  } else {
    return {
      success: false,
      error: "Setup couldn't be imported. No student list was found. Please ensure the AI included a 'students' list."
    };
  }

  // Validate student list is not empty
  if (rawStudents.length === 0) {
    return {
      success: false,
      error: "Setup couldn't be imported. Student roster cannot be empty."
    };
  }

  // Validate each student and detect duplicates
  const seenRolls = new Set<number>();
  const seenNames = new Set<string>();
  const sanitizedStudents: Student[] = [];

  for (let i = 0; i < rawStudents.length; i++) {
    const item = rawStudents[i];
    if (!item || typeof item !== 'object') {
      return {
        success: false,
        error: `Setup couldn't be imported. Student #${i + 1} is invalid.`
      };
    }

    // Name validation
    if (typeof item.name !== 'string' || !item.name.trim()) {
      return {
        success: false,
        error: `Setup couldn't be imported. Student #${i + 1} has a missing or empty name.`
      };
    }

    const trimmedName = item.name.trim();

    // Duplicate name check
    const normalizedName = trimmedName.toLowerCase();
    if (seenNames.has(normalizedName)) {
      return {
        success: false,
        error: `Setup couldn't be imported. Duplicate student name detected: "${trimmedName}".`
      };
    }
    seenNames.add(normalizedName);

    // Roll number validation
    let roll: number;
    if (typeof item.roll === 'number' && Number.isInteger(item.roll) && item.roll > 0) {
      roll = item.roll;
    } else if (typeof item.roll === 'string' && !isNaN(parseInt(item.roll, 10)) && parseInt(item.roll, 10) > 0) {
      roll = parseInt(item.roll, 10);
    } else if (item.roll === undefined || item.roll === null) {
      roll = i + 1;
    } else {
      return {
        success: false,
        error: `Setup couldn't be imported. Student "${trimmedName}" has an invalid roll number.`
      };
    }

    // Duplicate roll number check
    if (seenRolls.has(roll)) {
      return {
        success: false,
        error: `Setup couldn't be imported. Duplicate student roll number #${roll} detected.`
      };
    }
    seenRolls.add(roll);

    sanitizedStudents.push({
      roll,
      name: formatTitleCase(trimmedName),
      p: false
    });
  }

  // Sort students by roll number
  sanitizedStudents.sort((a, b) => a.roll - b.roll);

  // Validate and sanitize Config
  const semesterName = typeof parsed.className === 'string' && parsed.className.trim()
    ? parsed.className.trim()
    : typeof parsed.semesterName === 'string' && parsed.semesterName.trim()
    ? parsed.semesterName.trim()
    : '';

  const subjects: Record<string, { name: string; faculty?: string }> = {};
  if (parsed.subjects && typeof parsed.subjects === 'object' && !Array.isArray(parsed.subjects)) {
    Object.keys(parsed.subjects).forEach(key => {
      const sub = parsed.subjects[key];
      const rawName = sub && typeof sub === 'object' && typeof sub.name === 'string'
        ? sub.name
        : typeof sub === 'string'
        ? sub
        : key;
      const rawFaculty = sub && typeof sub === 'object' && typeof sub.faculty === 'string'
        ? sub.faculty
        : '-';

      const cleanKey = normalizeSubjectName(key);
      const cleanName = normalizeSubjectName(rawName) || formatTitleCase(rawName);

      subjects[cleanKey] = {
        name: cleanName,
        faculty: formatTitleCase(rawFaculty)
      };
    });
  }

  const timetable = normalizeTimetableMap(parsed.timetable);

  const config: AppConfig = {
    semesterName,
    subjects,
    timetable,
    minAttendanceReq: typeof parsed.minAttendanceReq === 'number' ? parsed.minAttendanceReq : 75
  };

  return {
    success: true,
    students: sanitizedStudents,
    config
  };
};
