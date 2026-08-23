import { SubjectInfo } from '../types';

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
 * Known domain abbreviation mappings for clean initials
 */
const KNOWN_ABBREVIATIONS: Record<string, string> = {
  'database management system': 'DBMS',
  'database management systems': 'DBMS',
  'computer system architecture': 'CSA',
  'data structures': 'DS',
  'discrete structures': 'DS',
  'analysis & design of algorithms': 'ADA',
  'design & analysis of algorithms': 'DAA',
  'operating system': 'OS',
  'operating systems': 'OS',
  'computer networks': 'CN',
  'artificial intelligence': 'AI',
  'machine learning': 'ML',
  'software engineering': 'SE',
  'object oriented programming': 'OOP',
  'theory of computation': 'TOC',
  'web technology': 'WT',
  'python programming': 'PYTHON',
  'java programming': 'JAVA'
};

/**
 * Extracts clean, concise uppercase initials for a given subject title or code
 * e.g. "Python Lab" -> "PL"
 *      "Database Management System" -> "DBMS"
 *      "CSA" -> "CSA"
 */
export const getCleanSingleInitial = (raw: string): string => {
  const trimmed = (raw || '').trim();
  if (!trimmed) return '';

  const lower = trimmed.toLowerCase();
  if (KNOWN_ABBREVIATIONS[lower]) {
    return KNOWN_ABBREVIATIONS[lower];
  }

  // If already a short acronym (<= 5 chars with no spaces)
  if (trimmed.length <= 5 && !trimmed.includes(' ')) {
    return trimmed.toUpperCase();
  }

  // Common stop words to ignore when generating initials
  const stopWords = new Set(['and', '&', 'of', 'in', 'the', 'for', 'to', 'a', 'an', 'with']);

  // Extract capital letters from words
  const words = trimmed.split(/[\s\-_\/]+/).filter(w => !stopWords.has(w.toLowerCase()));
  if (words.length === 1) {
    return words[0].slice(0, 4).toUpperCase();
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
 * Resolves full name, clean initials/codes, and faculty names with natural '&' / 'a, b & c' formatting
 */
export const resolveSubjectDetails = (
  rawIdentifier: string,
  subjectsMap: Record<string, SubjectInfo> = {}
): FormattedSubjectInfo => {
  const raw = (rawIdentifier || '').trim();
  if (!raw) {
    return { name: 'Scheduled Class', code: '', faculty: '' };
  }

  // Check if direct single key in subjectsMap
  if (subjectsMap[raw]) {
    const info = subjectsMap[raw];
    const cleanCode = info.name && info.name !== raw ? raw : getCleanSingleInitial(raw);
    return {
      name: info.name || raw,
      code: cleanCode,
      faculty: info.faculty && info.faculty !== '-' ? info.faculty : ''
    };
  }

  // Split multiple subjects separated by '/', '&', or ','
  const parts = raw.split(/[\/&,]+/).map(p => p.trim()).filter(Boolean);

  if (parts.length > 1) {
    const fullNames: string[] = [];
    const codes: string[] = [];
    const faculties: string[] = [];

    for (const part of parts) {
      let resolvedName = part;
      let resolvedCode = getCleanSingleInitial(part);
      let resolvedFaculty = '';

      if (subjectsMap[part]) {
        resolvedName = subjectsMap[part].name || part;
        resolvedCode = subjectsMap[part].name ? part : getCleanSingleInitial(part);
        resolvedFaculty = subjectsMap[part].faculty || '';
      } else {
        // Search in subject entries
        const matched = Object.entries(subjectsMap).find(
          ([code, sub]) =>
            code.toLowerCase() === part.toLowerCase() ||
            (sub.name && sub.name.toLowerCase() === part.toLowerCase())
        );
        if (matched) {
          resolvedName = matched[1].name || matched[0];
          resolvedCode = matched[0];
          resolvedFaculty = matched[1].faculty || '';
        }
      }

      fullNames.push(resolvedName);
      codes.push(resolvedCode);
      if (resolvedFaculty && resolvedFaculty !== '-') {
        faculties.push(resolvedFaculty);
      }
    }

    return {
      name: formatConjunction(fullNames),
      code: formatConjunction(codes),
      faculty: formatConjunction(faculties)
    };
  }

  // Single subject search by name/code
  const matched = Object.entries(subjectsMap).find(
    ([code, sub]) =>
      code.toLowerCase() === raw.toLowerCase() ||
      (sub.name && sub.name.toLowerCase() === raw.toLowerCase())
  );

  if (matched) {
    return {
      name: matched[1].name || matched[0],
      code: matched[0],
      faculty: matched[1].faculty && matched[1].faculty !== '-' ? matched[1].faculty : ''
    };
  }

  return {
    name: raw,
    code: getCleanSingleInitial(raw),
    faculty: ''
  };
};
