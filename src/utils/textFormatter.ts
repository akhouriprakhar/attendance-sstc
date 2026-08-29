import { SubjectInfo, Student, AppConfig, TemplateConfig, DEFAULT_TEMPLATE_CONFIG } from '../types/index';

/**
 * Joins an array of strings into natural English with '&':
 * - 1 item: "A"
 * - 2 items: "A & B"
 * - 3 items: "A, B & C"
 * - 4+ items: "A, B, C & D"
 */
export const formatConjunction = (items: string[]): string => {
  const filtered = items.map(s => (s || '').trim()).filter(Boolean);
  if (filtered.length === 0) return '';
  if (filtered.length === 1) return filtered[0];
  if (filtered.length === 2) return `${filtered[0]} & ${filtered[1]}`;
  const allButLast = filtered.slice(0, -1).join(', ');
  return `${allButLast} & ${filtered[filtered.length - 1]}`;
};

/**
 * Known domain abbreviation mappings for clean initials & standardized names
 */
const KNOWN_ABBREVIATIONS: Record<string, string> = {
  // Theory Subjects
  'data science': 'DS',
  'introduction to data science': 'DS',
  'intro to data science': 'DS',
  'data structures': 'DS',
  'data structure': 'DS',
  'discrete structures': 'DS',
  'discrete structure': 'DS',
  'discrete mathematics': 'DM',
  'blockchain': 'Blockchain',
  'blockchain technology': 'Blockchain',
  'blockchain technologies': 'Blockchain',
  'theory of computation': 'TOC',
  'automata theory': 'TOC',
  'theory of automata': 'TOC',
  'computer network': 'CN',
  'computer networks': 'CN',
  'internet of things': 'IoT',
  'iot': 'IoT',
  'minor project': 'Minor Project',
  'major project': 'Major Project',
  'database management system': 'DBMS',
  'database management systems': 'DBMS',
  'computer system architecture': 'CSA',
  'analysis & design of algorithms': 'ADA',
  'design & analysis of algorithms': 'DAA',
  'operating system': 'OS',
  'operating systems': 'OS',
  'artificial intelligence': 'AI',
  'machine learning': 'ML',
  'software engineering': 'SE',
  'object oriented programming': 'OOP',
  'web technology': 'WT',
  'web technologies': 'WT',
  'python programming': 'PYTHON',
  'python': 'PYTHON',
  'java programming': 'JAVA',
  'java': 'JAVA',
  'cloud computing': 'CC',
  'cyber security': 'CS',
  'information security': 'IS',

  // Lab / Practical Subjects
  'ds lab': 'DS Lab',
  'data science lab': 'DS Lab',
  'data structures lab': 'DS Lab',
  'data structure lab': 'DS Lab',
  'iot lab': 'IoT Lab',
  'internet of things lab': 'IoT Lab',
  'cn lab': 'CN Lab',
  'computer networks lab': 'CN Lab',
  'computer network lab': 'CN Lab',
  'toc lab': 'TOC Lab',
  'dbms lab': 'DBMS Lab',
  'database management system lab': 'DBMS Lab',
  'database management systems lab': 'DBMS Lab',
  'os lab': 'OS Lab',
  'operating system lab': 'OS Lab',
  'operating systems lab': 'OS Lab',
  'python lab': 'PYTHON Lab',
  'java lab': 'JAVA Lab',
  'wt lab': 'WT Lab',
  'web technology lab': 'WT Lab',
  'ada lab': 'ADA Lab',
  'daa lab': 'DAA Lab'
};

/**
 * Strips elective prefixes such as:
 * - "Elective Subject 1", "Professional Elective 2", "Open Elective", "Elective 1", "Elective -"
 * e.g. "Elective Subject 1 Blockchain" -> "Blockchain"
 *      "Professional Elective - Blockchain" -> "Blockchain"
 *      "Blockchain Elective" -> "Blockchain"
 */
export const stripElectivePrefix = (raw: string): string => {
  let cleaned = (raw || '').trim();
  // Strip starting elective descriptors
  cleaned = cleaned.replace(/^(?:(?:professional|open|program|departmental)\s+)?elective(?:\s*(?:subject)?\s*(?:[-:\d]+)?)?\s*[-:]?\s*/i, '');
  // Strip trailing elective descriptors
  cleaned = cleaned.replace(/\s*[-:]?\s*(?:professional|open|program|departmental)?\s*elective(?:\s*(?:subject)?\s*(?:[-:\d]+)?)?$/i, '');
  return cleaned.trim();
};

/**
 * Normalizes subject names and abbreviations to standard uppercase / title case,
 * cleanly separating Theory from Lab/Practical subjects and removing elective prefixes.
 * e.g. "ds" -> "DS", "ds lab" -> "DS Lab", "Elective 1 Blockchain" -> "Blockchain", "iot lab" -> "IoT Lab"
 */
export const normalizeSubjectName = (raw: string): string => {
  const trimmed = stripElectivePrefix(raw);
  if (!trimmed) return '';

  const lower = trimmed.toLowerCase();
  if (KNOWN_ABBREVIATIONS[lower]) {
    return KNOWN_ABBREVIATIONS[lower];
  }

  // Check if this is a Lab / Practical slot
  const isLab = lower.includes('lab') || lower.includes('practical');

  if (isLab) {
    if (lower.includes('iot') || lower.includes('internet of things')) {
      return 'IoT Lab';
    }
    if (lower.includes('ds') || lower.includes('data science') || lower.includes('data struct') || lower.includes('discrete struct')) {
      return 'DS Lab';
    }
    if (lower.includes('cn') || lower.includes('computer network')) {
      return 'CN Lab';
    }
    if (lower.includes('dbms') || lower.includes('database')) {
      return 'DBMS Lab';
    }
    if (lower.includes('os') || lower.includes('operating system')) {
      return 'OS Lab';
    }
    if (lower.includes('python')) {
      return 'PYTHON Lab';
    }
    if (lower.includes('java')) {
      return 'JAVA Lab';
    }
    if (lower.includes('wt') || lower.includes('web tech')) {
      return 'WT Lab';
    }
    if (lower.includes('ada') || lower.includes('daa') || lower.includes('algorithm')) {
      return 'ADA Lab';
    }

    const baseWithoutLab = trimmed.replace(/\s*(?:lab|practical)\s*/gi, '').trim();
    if (baseWithoutLab) {
      const cleanBase = normalizeSubjectName(baseWithoutLab);
      return `${cleanBase} Lab`;
    }
  }

  // Theory Subjects
  if (lower === 'blockchain' || lower.startsWith('blockchain')) {
    return 'Blockchain';
  }
  if (lower === 'iot' || lower === 'internet of things') {
    return 'IoT';
  }
  if (lower === 'minor project' || lower.startsWith('minor project')) {
    return 'Minor Project';
  }
  if (lower === 'major project' || lower.startsWith('major project')) {
    return 'Major Project';
  }
  if (lower === 'toc' || lower.includes('theory of comp') || lower.includes('automata')) {
    return 'TOC';
  }
  if (lower === 'cn' || lower.includes('computer network')) {
    return 'CN';
  }
  if (lower === 'ds' || lower.includes('data science') || lower.includes('data struct') || lower.includes('discrete struct')) {
    return 'DS';
  }

  // If already short acronym (<= 5 chars with no spaces)
  if (trimmed.length <= 5 && !trimmed.includes(' ')) {
    return trimmed.toUpperCase();
  }

  return trimmed;
};

/**
 * Extracts clean, concise uppercase initials for a given subject title or code
 */
export const getCleanSingleInitial = (raw: string): string => {
  const trimmed = (raw || '').trim();
  if (!trimmed) return '';

  const normalized = normalizeSubjectName(trimmed);
  if (normalized && normalized !== trimmed) {
    return normalized;
  }

  const lower = trimmed.toLowerCase();
  if (KNOWN_ABBREVIATIONS[lower]) {
    return KNOWN_ABBREVIATIONS[lower];
  }

  // If already a short acronym (<= 5 chars with no spaces)
  if (trimmed.length <= 5 && !trimmed.includes(' ')) {
    return trimmed.toUpperCase();
  }

  // Common stop words to ignore when generating initials
  const stopWords = new Set(['and', '&', 'of', 'in', 'the', 'for', 'to', 'a', 'an', 'with', 'lab']);

  // Extract capital letters from words
  const words = trimmed.split(/[\s\-_\/]+/).filter(w => !stopWords.has(w.toLowerCase()));
  if (words.length === 1) {
    return words[0];
  }

  const initials = words.map(w => {
    if (w.toLowerCase() === 'database') return 'DB';
    return w[0];
  }).join('').toUpperCase();

  return initials.slice(0, 5);
};

export interface FormattedSubjectInfo {
  name: string;
  code: string;
  faculty: string;
}

/**
 * Resolves full name, clean initials/codes, and faculty names with natural formatting
 */
export const resolveSubjectDetails = (
  rawIdentifier: string,
  subjectsMap: Record<string, SubjectInfo> = {}
): FormattedSubjectInfo => {
  const raw = (rawIdentifier || '').trim();
  if (!raw) {
    return { name: 'Scheduled Class', code: '', faculty: '' };
  }

  // 1. Direct match in subjectsMap
  if (subjectsMap[raw]) {
    const info = subjectsMap[raw];
    const cleanFromName = info.name ? normalizeSubjectName(info.name) : '';
    const cleanFromRaw = normalizeSubjectName(raw);
    const cleanName = cleanFromName || cleanFromRaw || (info.name || raw);
    return {
      name: cleanName,
      code: cleanName,
      faculty: info.faculty && info.faculty !== '-' ? info.faculty : ''
    };
  }

  // 2. Search in subjectsMap keys and names
  const lower = raw.toLowerCase();
  const matched = Object.entries(subjectsMap).find(
    ([code, sub]) =>
      code.toLowerCase() === lower ||
      (sub.name && sub.name.toLowerCase() === lower) ||
      normalizeSubjectName(code).toLowerCase() === lower ||
      (sub.name && normalizeSubjectName(sub.name).toLowerCase() === lower)
  );

  if (matched) {
    const [code, info] = matched;
    const cleanFromName = info.name ? normalizeSubjectName(info.name) : '';
    const cleanFromCode = normalizeSubjectName(code);
    const cleanName = cleanFromName || cleanFromCode || info.name || code;
    return {
      name: cleanName,
      code: cleanName,
      faculty: info.faculty && info.faculty !== '-' ? info.faculty : ''
    };
  }

  // 3. Fallback to normalized name
  const clean = normalizeSubjectName(raw);
  return {
    name: clean,
    code: clean,
    faculty: ''
  };
};

export interface GenerateReportOptions {
  students: Student[];
  config: AppConfig;
  outputMode: 'presentees' | 'absentees';
  startLec: string;
  endLec?: string;
  selectedSubject?: string;
  customDate?: Date;
  templateConfig?: TemplateConfig;
}

/**
 * Resolves active lecture subject & faculty from user selection or current timetable slot
 */
export const getLectureSubject = (
  timetable?: AppConfig['timetable'],
  startLec?: string,
  endLec?: string,
  subjectsMap: Record<string, SubjectInfo> = {},
  customDate?: Date,
  selectedSubject?: string
): FormattedSubjectInfo | null => {
  // If user explicitly selected a target subject from the dropdown override
  if (selectedSubject && selectedSubject.trim()) {
    return resolveSubjectDetails(selectedSubject.trim(), subjectsMap);
  }

  if (!timetable || !startLec) return null;
  const now = customDate || new Date();
  const todayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const todaySlots = timetable[todayName] || [];
  if (todaySlots.length === 0) return null;

  const startIdx = parseInt(startLec, 10) - 1;
  if (isNaN(startIdx) || startIdx < 0 || startIdx >= todaySlots.length) {
    return null;
  }

  let endIdx = startIdx;
  if (endLec) {
    const parsedEnd = parseInt(endLec, 10) - 1;
    if (!isNaN(parsedEnd) && parsedEnd >= startIdx && parsedEnd < todaySlots.length) {
      endIdx = parsedEnd;
    }
  }

  // 1. Check if any slot in the active range [startIdx..endIdx] is a designated Lab / Practical
  const rangeSlots = todaySlots.slice(startIdx, endIdx + 1);
  const labSlot = rangeSlots.find(
    s => (s.s || '').endsWith(' Lab') || (s.s || '').toLowerCase().includes('lab') || (s.s || '').toLowerCase().includes('project')
  );
  if (labSlot && labSlot.s) {
    return resolveSubjectDetails(labSlot.s.trim(), subjectsMap);
  }

  // 2. Check adjacent slots in case of 2-period lab block
  if (startIdx < todaySlots.length - 1) {
    const nextSlot = todaySlots[startIdx + 1];
    if (nextSlot && ((nextSlot.s || '').endsWith(' Lab') || (nextSlot.s || '').toLowerCase().includes('lab'))) {
      const baseCurr = normalizeSubjectName(todaySlots[startIdx].s || '');
      const baseNext = normalizeSubjectName(nextSlot.s || '').replace(/\s+Lab$/i, '');
      if (baseCurr.toLowerCase() === baseNext.toLowerCase()) {
        return resolveSubjectDetails(nextSlot.s.trim(), subjectsMap);
      }
    }
  }

  // 3. Fallback to the primary slot subject
  const primarySlot = todaySlots[startIdx];
  if (!primarySlot || !primarySlot.s) return null;

  return resolveSubjectDetails(primarySlot.s.trim(), subjectsMap);
};

/**
 * Generates the standardized formatted attendance report text for WhatsApp
 */
export const generateReportText = (options: GenerateReportOptions): string => {
  const {
    students,
    config,
    outputMode,
    startLec,
    endLec,
    selectedSubject,
    customDate,
    templateConfig
  } = options;

  const tpl = templateConfig || config.templateConfig || DEFAULT_TEMPLATE_CONFIG;
  const lines: string[] = [];

  // 1. Header Line
  if (tpl.includeHeader) {
    const rawHeader = (tpl.customHeader || '').trim() || (config.semesterName ? `${config.semesterName} Attendance` : '');
    if (rawHeader) {
      let headerStr = tpl.useBoldTags ? `*${rawHeader}*` : rawHeader;
      if (tpl.useEmojis) {
        headerStr = `📋 ${headerStr}`;
      }
      lines.push(headerStr);
    }
  }

  // 2. Date & Day Line
  if (tpl.includeDate) {
    const dateObj = customDate || new Date();
    const dateStr = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const dayStr = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

    let rawDateText = '';
    if (tpl.dateFormat === 'dateFirst') {
      rawDateText = `${dateStr} (${dayStr})`;
    } else {
      rawDateText = `${dayStr}: ${dateStr}`;
    }

    let dateLine = tpl.useBoldTags ? `*${rawDateText}*` : rawDateText;
    if (tpl.useEmojis) {
      dateLine = `📅 ${dateLine}`;
    }
    lines.push(dateLine);
  }

  // 3. Lecture Slot Line
  let lecStr = (startLec || '1').trim();
  if (endLec && parseInt(endLec, 10) > parseInt(startLec, 10)) {
    lecStr += `-${endLec.trim()}`;
  }

  if (tpl.includeLecture) {
    const rawLecText = `Lecture - ${lecStr}`;
    let lectureLine = tpl.useBoldTags ? `*${rawLecText}*` : rawLecText;
    if (tpl.useEmojis) {
      lectureLine = `⏰ ${lectureLine}`;
    }
    lines.push(lectureLine);
  }

  // 4. Subject & Faculty Line
  if (tpl.includeSubject) {
    const subjectInfo = getLectureSubject(
      config.timetable,
      startLec,
      endLec,
      config.subjects,
      customDate,
      selectedSubject
    );
    if (subjectInfo && (subjectInfo.code || subjectInfo.name)) {
      const displaySub = subjectInfo.code || subjectInfo.name;
      let facultyText = '';
      if (tpl.includeFaculty && subjectInfo.faculty && subjectInfo.faculty !== '-') {
        facultyText = ` (${subjectInfo.faculty})`;
      }

      let subLine = '';
      if (tpl.useBoldTags) {
        subLine = `*Subject:* ${displaySub}${facultyText}`;
      } else {
        subLine = `Subject: ${displaySub}${facultyText}`;
      }
      if (tpl.useEmojis) {
        subLine = `📚 ${subLine}`;
      }
      lines.push(subLine);
    }
  }

  // 5. Class Stats Line
  if (tpl.includeStats) {
    const total = students.length;
    const present = students.filter(s => s.p).length;
    const absent = total - present;
    const statsContent = `Total: ${total} | Present: ${present} | Absent: ${absent}`;
    let statsLine = tpl.useBoldTags ? `*Stats:* ${statsContent}` : `Stats: ${statsContent}`;
    if (tpl.useEmojis) {
      statsLine = `📊 ${statsLine}`;
    }
    lines.push(statsLine);
  }

  // 6. Rolls List Line (Presentees or Absentees)
  const targetStudents = outputMode === 'presentees'
    ? students.filter(s => s.p)
    : students.filter(s => !s.p);

  const rollNumbers = targetStudents
    .map(s => s.roll)
    .sort((a, b) => a - b);

  let rollsFormatted = '';
  if (rollNumbers.length === 0) {
    rollsFormatted = 'NIL';
  } else if (tpl.rollDelimiter === 'space') {
    rollsFormatted = rollNumbers.join(' ');
  } else if (tpl.rollDelimiter === 'newline') {
    rollsFormatted = '\n' + rollNumbers.join('\n');
  } else {
    // default comma
    rollsFormatted = rollNumbers.join(', ');
  }

  const label = outputMode === 'presentees' ? 'Presentees' : 'Absentees';
  let listLine = '';
  if (tpl.useBoldTags) {
    listLine = `*${label}:* ${rollsFormatted}`;
  } else {
    listLine = `${label}: ${rollsFormatted}`;
  }
  if (tpl.useEmojis) {
    const emoji = outputMode === 'presentees' ? '✅' : '❌';
    listLine = `${emoji} ${listLine}`;
  }
  lines.push(listLine);

  // 7. Custom Footer Line
  if (tpl.customFooter && tpl.customFooter.trim()) {
    lines.push(tpl.customFooter.trim());
  }

  return lines.join('\n');
};
