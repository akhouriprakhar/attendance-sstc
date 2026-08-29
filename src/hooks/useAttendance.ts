import { useState, useEffect, useCallback } from 'react';
import { Student, AppConfig, BackupData } from '../types';
import { normalizeTimetableMap } from '../utils/setupValidator';

const STORAGE_KEY_STUDENTS = 'trace_students_v4';
const STORAGE_KEY_CONFIG = 'trace_config_v4';
const STORAGE_KEY_SNAPSHOT = 'trace_backup_snapshot';
const STORAGE_KEY_LAST_COPIED = 'trace_last_copied_session';

export const formatTitleCase = (str: string): string => {
  if (!str) return '';
  const trimmed = str.trim();
  if (trimmed.length <= 4 && trimmed === trimmed.toUpperCase() && !trimmed.includes(' ')) {
    return trimmed;
  }
  return trimmed
    .toLowerCase()
    .split(' ')
    .map(word => {
      if (!word) return '';
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};

const DEFAULT_CONFIG: AppConfig = {
  semesterName: "",
  subjects: {},
  timetable: {},
  minAttendanceReq: 75
};

const getInitialStudents = (): Student[] => {
  return [];
};

const sanitizeStudents = (raw: any[]): Student[] => {
  if (!Array.isArray(raw)) return [];
  return raw.map((s, idx) => {
    const roll = typeof s.roll === 'number' && s.roll > 0 ? s.roll : idx + 1;
    const rawName = typeof s.name === 'string' && s.name.trim() ? s.name.trim() : `Student ${roll}`;
    const name = formatTitleCase(rawName);
    const p = Boolean(s.p);
    return { roll, name, p };
  }).sort((a, b) => a.roll - b.roll);
};

export const useAttendance = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [config, setConfigState] = useState<AppConfig>(DEFAULT_CONFIG);
  const [editMode, setEditMode] = useState(false);

  const writeSnapshot = useCallback((stList: Student[], cfg: AppConfig) => {
    try {
      const snapshot: BackupData = {
        version: "v4-resilient",
        timestamp: new Date().toISOString(),
        students: stList,
        config: cfg
      };
      localStorage.setItem(STORAGE_KEY_SNAPSHOT, JSON.stringify(snapshot));
    } catch (e) {}
  }, []);

  useEffect(() => {
    try {
      let loadedConfig = DEFAULT_CONFIG;
      const savedConfig = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (savedConfig) {
        try {
          const parsed = JSON.parse(savedConfig);
          loadedConfig = {
            ...parsed,
            timetable: normalizeTimetableMap(parsed.timetable)
          };
        } catch (e) {}
      }
      setConfigState(loadedConfig);

      let loadedStudents: Student[] = [];
      const savedStudents = localStorage.getItem(STORAGE_KEY_STUDENTS);

      if (savedStudents) {
        try {
          const parsed = JSON.parse(savedStudents);
          loadedStudents = sanitizeStudents(parsed);
        } catch (e) {
          const snapshotRaw = localStorage.getItem(STORAGE_KEY_SNAPSHOT);
          if (snapshotRaw) {
            const snap: BackupData = JSON.parse(snapshotRaw);
            loadedStudents = sanitizeStudents(snap.students);
          } else {
            loadedStudents = getInitialStudents();
          }
        }
      } else {
        loadedStudents = getInitialStudents();
      }

      setStudents(loadedStudents);
      writeSnapshot(loadedStudents, loadedConfig);
    } catch (e) {
      console.error('Error loading localStorage:', e);
      setStudents(getInitialStudents());
    }
  }, [writeSnapshot]);

  const saveStudents = useCallback((newList: Student[]) => {
    const sanitized = sanitizeStudents(newList);
    setStudents(sanitized);
    try {
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(sanitized));
      writeSnapshot(sanitized, config);
    } catch (e) {}
  }, [config, writeSnapshot]);

  const toggleStudent = useCallback((idx: number) => {
    setStudents(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], p: !copy[idx].p };
      try {
        localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(copy));
        writeSnapshot(copy, config);
      } catch (e) {}
      return copy;
    });
    if (navigator.vibrate) navigator.vibrate(10);
  }, [config, writeSnapshot]);

  const toggleStudentByRoll = useCallback((rollNum: number) => {
    setStudents(prev => {
      const copy = prev.map(s => {
        if (s.roll === rollNum) {
          return { ...s, p: !s.p };
        }
        return s;
      });
      try {
        localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(copy));
        writeSnapshot(copy, config);
      } catch (e) {}
      return copy;
    });
    if (navigator.vibrate) navigator.vibrate(15);
  }, [config, writeSnapshot]);

  const toggleAll = useCallback(() => {
    setStudents(prev => {
      const anyUnchecked = prev.some(s => !s.p);
      const copy = prev.map(s => ({ ...s, p: anyUnchecked }));
      try {
        localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(copy));
        writeSnapshot(copy, config);
      } catch (e) {}
      return copy;
    });
    if (navigator.vibrate) navigator.vibrate(10);
  }, [config, writeSnapshot]);

  const saveLastCopiedSession = useCallback(() => {
    try {
      const stateMap = students.map(s => ({ roll: s.roll, p: s.p }));
      localStorage.setItem(STORAGE_KEY_LAST_COPIED, JSON.stringify(stateMap));
    } catch (e) {}
  }, [students]);

  const restoreLastCopiedSession = useCallback(() => {
    try {
      const savedRaw = localStorage.getItem(STORAGE_KEY_LAST_COPIED);
      if (!savedRaw) return false;
      const stateMap: { roll: number; p: boolean }[] = JSON.parse(savedRaw);
      const map = new Map(stateMap.map(item => [item.roll, item.p]));

      setStudents(prev => {
        const copy = prev.map(s => ({
          ...s,
          p: map.has(s.roll) ? Boolean(map.get(s.roll)) : false
        }));
        try {
          localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(copy));
          writeSnapshot(copy, config);
        } catch (e) {}
        return copy;
      });
      if (navigator.vibrate) navigator.vibrate(10);
      return true;
    } catch (e) {
      return false;
    }
  }, [config, writeSnapshot]);

  const saveStudentProcess = useCallback((newRoll: number, rawName: string, isEdit: boolean, editIdx: number) => {
    const formattedName = formatTitleCase(rawName);
    setStudents(prev => {
      let list = prev.map(s => ({ ...s }));

      if (isEdit && editIdx >= 0 && editIdx < list.length) {
        const targetRoll = list[editIdx].roll;
        list = list.filter((_, i) => i !== editIdx);
        if (newRoll !== targetRoll) {
          list = list.map(s => ({
            ...s,
            roll: s.roll > targetRoll ? s.roll - 1 : s.roll
          }));
          if (list.some(s => s.roll === newRoll)) {
            list = list.map(s => ({
              ...s,
              roll: s.roll >= newRoll ? s.roll + 1 : s.roll
            }));
          }
        }
        list.push({
          roll: newRoll,
          name: formattedName,
          p: prev[editIdx]?.p ?? false
        });
      } else {
        if (list.some(s => s.roll === newRoll)) {
          list = list.map(s => ({
            ...s,
            roll: s.roll >= newRoll ? s.roll + 1 : s.roll
          }));
        }
        list.push({
          roll: newRoll,
          name: formattedName,
          p: false
        });
      }

      const sanitized = sanitizeStudents(list);
      try {
        localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(sanitized));
        writeSnapshot(sanitized, config);
      } catch (e) {}
      return sanitized;
    });
  }, [config, writeSnapshot]);

  const deleteStudent = useCallback((idx: number) => {
    setStudents(prev => {
      if (idx < 0 || idx >= prev.length) return prev;
      const targetRoll = prev[idx].roll;
      const updated = prev
        .filter((_, i) => i !== idx)
        .map(s => ({
          ...s,
          roll: s.roll > targetRoll ? s.roll - 1 : s.roll
        }));
      const sanitized = sanitizeStudents(updated);
      try {
        localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(sanitized));
        writeSnapshot(sanitized, config);
      } catch (e) {}
      return sanitized;
    });
  }, [config, writeSnapshot]);

  const importTimetableOnly = useCallback((newTimetable: any) => {
    const normalizedTimetable = normalizeTimetableMap(newTimetable);
    const updatedConfig = {
      ...config,
      timetable: normalizedTimetable
    };
    setConfigState(updatedConfig);
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(updatedConfig));
      writeSnapshot(students, updatedConfig);
    } catch (e) {}
  }, [config, students, writeSnapshot]);

  const importRosterOnly = useCallback((newRoster: any[]) => {
    const formattedRoster = newRoster.map(s => ({
      ...s,
      name: formatTitleCase(s.name || '')
    }));
    const sanitized = sanitizeStudents(formattedRoster);
    setStudents(sanitized);
    try {
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(sanitized));
      writeSnapshot(sanitized, config);
    } catch (e) {}
  }, [config, writeSnapshot]);

  const importSubjectsOnly = useCallback((newSubjects: any) => {
    const formattedSubjects: Record<string, { name: string; faculty: string }> = {};
    if (newSubjects && typeof newSubjects === 'object') {
      Object.keys(newSubjects).forEach(subCode => {
        const item = newSubjects[subCode] || {};
        formattedSubjects[subCode] = {
          name: formatTitleCase(item.name || subCode),
          faculty: formatTitleCase(item.faculty || '-')
        };
      });
    }

    const updatedConfig = {
      ...config,
      subjects: formattedSubjects
    };
    setConfigState(updatedConfig);
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(updatedConfig));
      writeSnapshot(students, updatedConfig);
    } catch (e) {}
  }, [config, students, writeSnapshot]);

  const setConfig = useCallback((newConfig: AppConfig) => {
    const normalizedConfig: AppConfig = {
      ...newConfig,
      timetable: normalizeTimetableMap(newConfig.timetable)
    };
    setConfigState(normalizedConfig);
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(normalizedConfig));
      writeSnapshot(students, normalizedConfig);
    } catch (e) {}
  }, [students, writeSnapshot]);

  const downloadBackupJSON = useCallback(() => {
    const backup: BackupData = {
      version: "v4-backup",
      timestamp: new Date().toISOString(),
      students,
      config
    };
    const jsonStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Trace_Attendance_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [students, config]);

  const importFullSetup = useCallback((newStudents: Student[], newConfig: AppConfig) => {
    const sanitizedStudents = sanitizeStudents(newStudents);
    const normalizedConfig: AppConfig = {
      ...newConfig,
      timetable: normalizeTimetableMap(newConfig.timetable)
    };
    setStudents(sanitizedStudents);
    setConfigState(normalizedConfig);
    try {
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(sanitizedStudents));
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(normalizedConfig));
      writeSnapshot(sanitizedStudents, normalizedConfig);
    } catch (e) {}
  }, [writeSnapshot]);

  return {
    students,
    config,
    editMode,
    setEditMode,
    toggleStudent,
    toggleStudentByRoll,
    toggleAll,
    saveLastCopiedSession,
    restoreLastCopiedSession,
    saveStudentProcess,
    deleteStudent,
    setConfig,
    saveStudents,
    importFullSetup,
    importTimetableOnly,
    importRosterOnly,
    importSubjectsOnly,
    downloadBackupJSON
  };
};