import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Student, AppConfig } from '../types';

type OutputMode = 'presentees' | 'absentees';

export const getDefaultLectureFromTimetable = (timetable?: AppConfig['timetable']): { start: string; end: string } => {
  if (!timetable) return { start: '1', end: '' };
  const now = new Date();
  const todayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const todaySlots = timetable[todayName] || [];
  if (todaySlots.length === 0) return { start: '1', end: '' };

  const currentHour = now.getHours();
  const currentMin = now.getMinutes();
  const nowInMins = currentHour * 60 + currentMin;

  // 1. Check if current time is within an active lecture slot
  for (let i = 0; i < todaySlots.length; i++) {
    const slot = todaySlots[i];
    try {
      const [startStr, endStr] = slot.t.split('-');
      if (!startStr || !endStr) continue;
      const [sH, sM] = startStr.split(':').map(Number);
      const [eH, eM] = endStr.split(':').map(Number);
      const startMins = sH * 60 + sM;
      const endMins = eH * 60 + eM;

      if (nowInMins >= startMins && nowInMins <= endMins) {
        const duration = endMins - startMins;
        const isMulti = duration >= 75 || slot.s.toLowerCase().includes('lab');
        return {
          start: `${i + 1}`,
          end: isMulti ? `${i + 2}` : ''
        };
      }
    } catch (e) {}
  }

  // 2. Check if there is an upcoming lecture today
  for (let i = 0; i < todaySlots.length; i++) {
    const slot = todaySlots[i];
    try {
      const [startStr, endStr] = slot.t.split('-');
      if (!startStr) continue;
      const [sH, sM] = startStr.split(':').map(Number);
      const startMins = sH * 60 + sM;

      if (nowInMins < startMins) {
        const [eH, eM] = endStr ? endStr.split(':').map(Number) : [0, 0];
        const duration = (eH * 60 + eM) - startMins;
        const isMulti = duration >= 75 || slot.s.toLowerCase().includes('lab');
        return {
          start: `${i + 1}`,
          end: isMulti ? `${i + 2}` : ''
        };
      }
    } catch (e) {}
  }

  return { start: '1', end: '' };
};

interface ReportPanelProps {
  students: Student[];
  config: AppConfig;
  onOpenSettings: () => void;
  onCopySession: () => void;
  onRestoreLastSession: () => boolean;
  selectedLectureRange?: { start: string; end: string } | null;
}

export const ReportPanel: React.FC<ReportPanelProps> = ({
  students,
  config,
  onOpenSettings,
  onCopySession,
  onRestoreLastSession,
  selectedLectureRange
}) => {
  const [outputMode, setOutputMode] = useState<OutputMode>(() => {
    try {
      const saved = localStorage.getItem('trace_output_mode');
      if (saved === 'presentees' || saved === 'absentees') return saved;
    } catch (e) {}
    return 'absentees';
  });

  const defaultLec = useMemo(() => getDefaultLectureFromTimetable(config?.timetable), [config]);
  const [startLec, setStartLec] = useState(defaultLec.start);
  const [endLec, setEndLec] = useState(defaultLec.end);
  const userEditedRef = useRef(false);

  // Sync with timetable default when config changes (if user hasn't manually edited)
  useEffect(() => {
    if (!userEditedRef.current) {
      setStartLec(defaultLec.start);
      setEndLec(defaultLec.end);
    }
  }, [defaultLec]);

  // Sync if lecture was selected externally (e.g. from Timetable modal)
  useEffect(() => {
    if (selectedLectureRange) {
      setStartLec(selectedLectureRange.start);
      setEndLec(selectedLectureRange.end || '');
      userEditedRef.current = true;
    }
  }, [selectedLectureRange]);

  const [copyText, setCopyText] = useState('Copy Report');
  const [restoreText, setRestoreText] = useState('Restore Last Session');

  const handleSelectOutputMode = (mode: OutputMode) => {
    setOutputMode(mode);
    try {
      localStorage.setItem('trace_output_mode', mode);
    } catch (e) {}
    if (navigator.vibrate) navigator.vibrate(10);
  };

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  // 5 Minutes Prior Real-Time Haptic Alert State
  const [remindAttendance, setRemindAttendance] = useState(false);
  const hasVibratedRef = useRef(false);

  // PWA Install Prompt Listener
  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallPWA = () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choice: any) => {
      if (choice.outcome === 'accepted') {
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    });
  };

  // Real-Time 5-Minutes Prior Check strictly aligned with Timetable college hours
  useEffect(() => {
    const checkSchedule = () => {
      const now = new Date();
      const todayName = now.toLocaleDateString('en-US', { weekday: 'long' });
      const timetableMap = config?.timetable || {};
      const todaySlots = timetableMap[todayName] || [];

      const currentHour = now.getHours();
      const currentMin = now.getMinutes();
      const nowInMins = currentHour * 60 + currentMin;

      let isNearEndOfClass = false;

      for (const slot of todaySlots) {
        try {
          const [, endStr] = slot.t.split('-');
          if (!endStr) continue;
          const [eH, eM] = endStr.split(':').map(Number);
          const endMins = eH * 60 + eM;

          // Check if current system clock is 5 minutes prior to class end (e.g. endMins - 5 <= nowInMins < endMins)
          if (nowInMins >= endMins - 5 && nowInMins < endMins) {
            isNearEndOfClass = true;
            break;
          }
        } catch (e) {}
      }

      if (isNearEndOfClass) {
        setRemindAttendance(true);
        if (!hasVibratedRef.current) {
          if (navigator.vibrate) navigator.vibrate(50);
          hasVibratedRef.current = true;
        }
      } else {
        setRemindAttendance(false);
        hasVibratedRef.current = false;
      }
    };

    checkSchedule();
    const interval = setInterval(checkSchedule, 10000);
    return () => clearInterval(interval);
  }, [config]);

  const total = students.length;
  const present = useMemo(() => students.filter(s => s.p).length, [students]);
  const absent = total - present;
  const sessionRate = total > 0 ? Math.round((present / total) * 100) : 0;

  // Explicit User-Selected Output Logic (Presentees vs Absentees)
  const reportText = useMemo(() => {
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const dayStr = today.toLocaleDateString('en-US', { weekday: 'long' });
    let lecStr = startLec;
    if (endLec && parseInt(endLec, 10) > parseInt(startLec, 10)) {
      lecStr += `-${endLec}`;
    }

    if (outputMode === 'presentees') {
      const presentList = students
        .filter(s => s.p)
        .map(s => s.roll)
        .sort((a, b) => a - b);
      const presenteesStr = presentList.join(', ');
      return `${dayStr}: ${dateStr}\nLecture - ${lecStr}\nPresentees: ${presenteesStr || "NIL"}`;
    } else {
      const absentList = students
        .filter(s => !s.p)
        .map(s => s.roll)
        .sort((a, b) => a - b);
      const absenteesStr = absentList.join(', ');
      return `${dayStr}: ${dateStr}\nLecture - ${lecStr}\nAbsentees: ${absenteesStr || "NIL"}`;
    }
  }, [students, startLec, endLec, outputMode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText);
    onCopySession();
    setCopyText('Copied!');
    if (navigator.vibrate) navigator.vibrate(10);
    setTimeout(() => setCopyText('Copy Report'), 1500);
  };

  const handleRestoreLast = () => {
    const success = onRestoreLastSession();
    if (success) {
      setRestoreText('Restored!');
      setTimeout(() => setRestoreText('Restore Last Session'), 1500);
    } else {
      alert('No previous copied class session found in memory.');
    }
  };

  return (
    <div className="panel report-panel">
      <div className="panel-header">
        <h2>Live Report</h2>
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          {isInstallable && (
            <button
              className="btn secondary"
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.7rem' }}
              onClick={handleInstallPWA}
              title="Install app to phone home screen"
            >
              Install App
            </button>
          )}
          <button className="icon-btn" onClick={onOpenSettings} title="Settings">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.04 4.95,18.95L7.44,17.95C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.95L19.05,18.95C19.27,19.04 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" />
            </svg>
          </button>
        </div>
      </div>

      {remindAttendance && (
        <div style={{
          background: 'rgba(245,158,11,0.1)',
          border: '1px solid rgba(245,158,11,0.3)',
          padding: '0.5rem 0.75rem',
          borderRadius: '6px',
          marginBottom: '0.75rem',
          fontSize: '0.78rem',
          color: '#f59e0b',
          fontFamily: 'var(--font-mono)'
        }}>
          Notice: 5 minutes remaining in lecture. Take attendance.
        </div>
      )}

      <div className="lecture-control">
        <div className="lecture-input-group">
          <label htmlFor="start-lec-input">START LECTURE</label>
          <input
            id="start-lec-input"
            type="number"
            value={startLec}
            min={1}
            onChange={e => setStartLec(e.target.value)}
            aria-label="Starting Lecture Number"
          />
        </div>
        <div className="lecture-input-group">
          <label htmlFor="end-lec-input">END LECTURE (OPTIONAL)</label>
          <input
            id="end-lec-input"
            type="number"
            value={endLec}
            placeholder="-"
            min={1}
            onChange={e => setEndLec(e.target.value)}
            aria-label="Ending Lecture Number (Optional)"
          />
        </div>
      </div>

      <div className="output-mode-selector" role="group" aria-label="Attendance report output type">
        <div className="selector-header">
          <span className="selector-label">What do you want to report?</span>
        </div>
        <div className="selector-buttons">
          <button
            type="button"
            className={`selector-btn ${outputMode === 'presentees' ? 'active' : ''}`}
            onClick={() => handleSelectOutputMode('presentees')}
            aria-pressed={outputMode === 'presentees'}
          >
            <span className="selector-icon">✓</span>
            <span className="selector-text">Presentees</span>
            <span className="selector-count">({present})</span>
          </button>
          <button
            type="button"
            className={`selector-btn ${outputMode === 'absentees' ? 'active' : ''}`}
            onClick={() => handleSelectOutputMode('absentees')}
            aria-pressed={outputMode === 'absentees'}
          >
            <span className="selector-icon">✗</span>
            <span className="selector-text">Absentees</span>
            <span className="selector-count">({absent})</span>
          </button>
        </div>
      </div>

      <div id="report-output" aria-live="polite" aria-label="Generated attendance report preview">
        {reportText}
      </div>

      <div className="report-actions">
        <button
          type="button"
          className="btn primary copy-report-btn"
          onClick={handleCopy}
          aria-label="Copy attendance report to clipboard"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z" />
          </svg>
          {copyText}
        </button>
        <button
          type="button"
          className="btn secondary restore-btn"
          onClick={handleRestoreLast}
          title="Instantly retrieve exact attendance state of last copied session"
          aria-label="Restore last copied session attendance"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <path d="M13,3A9,9 0 0,0 4,12H1L4.89,15.89L4.96,16.03L9,12H6A7,7 0 0,1 13,5A7,7 0 0,1 20,12A7,7 0 0,1 13,19C11.07,19 9.32,18.21 8.06,16.94L6.64,18.36C8.27,20 10.5,21 13,21A9,9 0 0,0 22,12A9,9 0 0,0 13,3Z" />
          </svg>
          {restoreText}
        </button>
      </div>

      <div className="stats-footer">
        <div className="stat-item">
          <div className="label">Total</div>
          <div className="value">{total}</div>
        </div>
        <div className="stat-item">
          <div className="label">Present</div>
          <div className="value present-val">{present}</div>
        </div>
        <div className="stat-item">
          <div className="label">Absent</div>
          <div className="value absent-val">{absent}</div>
        </div>
        <div className="stat-item">
          <div className="label">Rate</div>
          <div className={`value rate-val ${sessionRate >= 75 ? 'good' : 'warning'}`}>
            {sessionRate}%
          </div>
        </div>
      </div>
    </div>
  );
};
