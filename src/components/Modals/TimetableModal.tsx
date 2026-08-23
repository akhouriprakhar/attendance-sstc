import React, { useState, useEffect, useMemo } from 'react';
import { AppConfig } from '../../types';
import { resolveSubjectDetails } from '../../utils/textFormatter';

interface TimetableModalProps {
  isOpen: boolean;
  config: AppConfig;
  onClose: () => void;
  onSelectLectureSlot?: (startLec: string, endLec: string, subjectCode: string) => void;
}

const SUBJECT_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  "CSA": { bg: "rgba(6, 182, 212, 0.12)", border: "rgba(6, 182, 212, 0.4)", text: "#06b6d4" },
  "DBMS": { bg: "rgba(16, 185, 129, 0.12)", border: "rgba(16, 185, 129, 0.4)", text: "#10b981" },
  "ADA": { bg: "rgba(245, 158, 11, 0.12)", border: "rgba(245, 158, 11, 0.4)", text: "#f59e0b" },
  "JAVA": { bg: "rgba(99, 102, 241, 0.12)", border: "rgba(99, 102, 241, 0.4)", text: "#818cf8" },
  "D.S.": { bg: "rgba(244, 63, 94, 0.12)", border: "rgba(244, 63, 94, 0.4)", text: "#f43f5e" }
};

const DEFAULT_COLOR = { bg: "rgba(255, 255, 255, 0.05)", border: "#333333", text: "#cccccc" };

export const TimetableModal: React.FC<TimetableModalProps> = ({
  isOpen,
  config,
  onClose,
  onSelectLectureSlot
}) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  const [now, setNow] = useState(new Date());
  const [activeDayTab, setActiveDayTab] = useState<string>(
    days.includes(todayName) ? todayName : 'Monday'
  );
  const [viewMode, setViewMode] = useState<'day' | 'grid'>('day');
  const [filterSubjectKey, setFilterSubjectKey] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  const timetableMap = config?.timetable || {};
  const subjectsMap = config?.subjects || {};

  const currentHour = now.getHours();
  const currentMin = now.getMinutes();
  const nowInMins = currentHour * 60 + currentMin;

  const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const uniqueSubjectList = useMemo(() => {
    const map = new Map<string, { code: string; name: string }>();
    Object.values(timetableMap).forEach(slots => {
      slots.forEach(slot => {
        const parts = slot.s.split(/[\/&,]+/).map(p => p.trim()).filter(Boolean);
        parts.forEach(part => {
          const info = resolveSubjectDetails(part, subjectsMap);
          if (!map.has(part)) {
            map.set(part, { code: info.code, name: info.name });
          }
        });
      });
    });
    return Array.from(map.values());
  }, [timetableMap, subjectsMap]);

  const classStatus = useMemo(() => {
    const todaySlots = timetableMap[todayName] || [];
    if (todaySlots.length === 0) return { type: 'free', message: 'No classes today' };

    for (let i = 0; i < todaySlots.length; i++) {
      const cls = todaySlots[i];
      const info = resolveSubjectDetails(cls.s, subjectsMap);
      try {
        const [startStr, endStr] = cls.t.split('-');
        if (!startStr || !endStr) continue;

        const [sH, sM] = startStr.split(':').map(Number);
        const [eH, eM] = endStr.split(':').map(Number);

        const startMins = sH * 60 + sM;
        const endMins = eH * 60 + eM;

        if (nowInMins >= startMins && nowInMins <= endMins) {
          const minsLeft = endMins - nowInMins;
          return {
            type: 'active',
            subject: info.name,
            message: `Current: ${info.name} (${minsLeft} mins left)`
          };
        } else if (nowInMins < startMins) {
          const minsUntil = startMins - nowInMins;
          return {
            type: 'upcoming',
            subject: info.name,
            message: `Next Class: ${info.name} in ${minsUntil} mins (${cls.t})`
          };
        }
      } catch (e) {}
    }

    return { type: 'finished', message: 'All classes completed for today' };
  }, [timetableMap, todayName, nowInMins, subjectsMap]);

  if (!isOpen) return null;

  const isClassNowActive = (day: string, timeStr: string) => {
    if (day !== todayName) return false;
    try {
      const [startStr, endStr] = timeStr.split('-');
      if (!startStr || !endStr) return false;

      const [sH, sM] = startStr.split(':').map(Number);
      const [eH, eM] = endStr.split(':').map(Number);

      const startMins = sH * 60 + sM;
      const endMins = eH * 60 + eM;

      return nowInMins >= startMins && nowInMins <= endMins;
    } catch (e) {
      return false;
    }
  };

  const handleSelectSlot = (slotIdx: number, slotTime: string, slotSubject: string) => {
    if (!onSelectLectureSlot) return;
    try {
      const [startStr, endStr] = slotTime.split('-');
      let isMulti = false;
      if (startStr && endStr) {
        const [sH, sM] = startStr.split(':').map(Number);
        const [eH, eM] = endStr.split(':').map(Number);
        const duration = (eH * 60 + eM) - (sH * 60 + sM);
        isMulti = duration >= 75 || slotSubject.toLowerCase().includes('lab');
      }
      const startNum = `${slotIdx + 1}`;
      const endNum = isMulti ? `${slotIdx + 2}` : '';
      onSelectLectureSlot(startNum, endNum, slotSubject);
      onClose();
    } catch (e) {
      onSelectLectureSlot(`${slotIdx + 1}`, '', slotSubject);
      onClose();
    }
  };

  return (
    <div className="modal-overlay visible" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="timetable-modal-title">
      <div className="modal-content" style={{ maxWidth: '860px', height: '88vh', padding: '1.15rem' }} onClick={e => e.stopPropagation()}>
        {/* Header Bar */}
        <div className="panel-header" style={{ marginBottom: '0.65rem', borderBottom: '1px solid #333', paddingBottom: '0.65rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h3 id="timetable-modal-title" className="modal-title" style={{ margin: 0 }}>
                Class Timetable
              </h3>
              <span style={{
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                color: 'var(--accent-green)',
                background: 'rgba(48,209,88,0.12)',
                padding: '2px 8px',
                borderRadius: '4px',
                border: '1px solid rgba(48,209,88,0.3)'
              }}>
                {config?.semesterName || 'Class Schedule'}
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              Academic Schedule • {todayName}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <button
              type="button"
              className="btn secondary"
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', minHeight: '36px', opacity: viewMode === 'day' ? 1 : 0.6 }}
              onClick={() => setViewMode('day')}
              aria-pressed={viewMode === 'day'}
            >
              Day View
            </button>
            <button
              type="button"
              className="btn secondary"
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', minHeight: '36px', opacity: viewMode === 'grid' ? 1 : 0.6 }}
              onClick={() => setViewMode('grid')}
              aria-pressed={viewMode === 'grid'}
            >
              Matrix Grid
            </button>
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Close timetable modal">&times;</button>
          </div>
        </div>

        {/* Live Clock & Schedule Status */}
        <div style={{
          background: '#161616',
          border: '1px solid #282828',
          borderRadius: '8px',
          padding: '0.65rem 0.85rem',
          marginBottom: '0.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', display: 'block' }}>
              SYSTEM CLOCK
            </span>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)' }}>
              {timeString}
            </span>
          </div>

          <div style={{
            background: classStatus.type === 'active' ? 'rgba(48,209,88,0.12)' : 'rgba(255,255,255,0.05)',
            border: '1px solid ' + (classStatus.type === 'active' ? 'rgba(48,209,88,0.3)' : '#333'),
            padding: '0.35rem 0.75rem',
            borderRadius: '6px'
          }}>
            <span style={{
              fontSize: '0.78rem',
              fontWeight: 600,
              color: classStatus.type === 'active' ? 'var(--accent-green)' : 'var(--text-primary)',
              fontFamily: 'var(--font-body)'
            }}>
              {classStatus.message}
            </span>
          </div>
        </div>

        {/* Course Filter Pills */}
        <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.75rem', overflowX: 'auto', paddingBottom: '4px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
            SUBJECTS:
          </span>
          <button
            type="button"
            onClick={() => setFilterSubjectKey(null)}
            style={{
              background: filterSubjectKey === null ? 'var(--text-primary)' : '#222',
              color: filterSubjectKey === null ? 'var(--bg-dark)' : 'var(--text-secondary)',
              border: '1px solid #333',
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            All Subjects ({uniqueSubjectList.length})
          </button>
          {uniqueSubjectList.map(subItem => {
            const isActive = filterSubjectKey === subItem.code;
            const palette = SUBJECT_COLORS[subItem.code] || DEFAULT_COLOR;
            return (
              <button
                key={subItem.code}
                type="button"
                onClick={() => setFilterSubjectKey(isActive ? null : subItem.code)}
                style={{
                  background: isActive ? palette.text : palette.bg,
                  color: isActive ? '#000' : palette.text,
                  border: '1px solid ' + palette.border,
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
                title={subItem.name}
              >
                {subItem.name}
              </button>
            );
          })}
        </div>

        {/* Day Selector Pills */}
        {viewMode === 'day' && (
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.85rem', overflowX: 'auto', paddingBottom: '4px' }}>
            {days.map(day => {
              const isToday = day === todayName;
              const isActive = day === activeDayTab;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setActiveDayTab(day)}
                  style={{
                    background: isActive ? 'var(--accent-red)' : '#222',
                    color: isActive ? '#fff' : 'var(--text-secondary)',
                    border: '1px solid ' + (isActive ? 'var(--accent-red)' : '#333'),
                    padding: '0.4rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  {day}
                  {isToday && (
                    <span style={{
                      fontSize: '0.6rem',
                      background: 'rgba(255,255,255,0.2)',
                      padding: '1px 4px',
                      borderRadius: '4px',
                      fontFamily: 'var(--font-mono)'
                    }}>
                      TODAY
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Main Body */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {viewMode === 'day' ? (
            /* DAY TIMELINE VIEW */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {(timetableMap[activeDayTab] || []).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-secondary)' }}>
                  No classes scheduled for {activeDayTab}.
                </div>
              ) : (
                timetableMap[activeDayTab]
                  .map((cls, slotIdx) => ({ cls, slotIdx }))
                  .filter(({ cls }) => {
                    if (!filterSubjectKey) return true;
                    return cls.s.includes(filterSubjectKey);
                  })
                  .map(({ cls, slotIdx }) => {
                    const firstSubKey = cls.s.split(/[\/&,]+/)[0].trim();
                    const subInfo = resolveSubjectDetails(cls.s, subjectsMap);
                    const palette = SUBJECT_COLORS[firstSubKey] || DEFAULT_COLOR;
                    const isNow = isClassNowActive(activeDayTab, cls.t);

                    return (
                      <div
                        key={slotIdx}
                        style={{
                          background: isNow ? 'rgba(48,209,88,0.08)' : palette.bg,
                          borderLeft: '4px solid ' + (isNow ? 'var(--accent-green)' : palette.text),
                          borderTop: '1px solid ' + (isNow ? 'var(--accent-green)' : palette.border),
                          borderRight: '1px solid ' + (isNow ? 'var(--accent-green)' : palette.border),
                          borderBottom: '1px solid ' + (isNow ? 'var(--accent-green)' : palette.border),
                          padding: '0.85rem 1rem',
                          borderRadius: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '0.6rem'
                        }}
                      >
                        <div style={{ flex: 1, minWidth: '220px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                            <span style={{
                              fontWeight: 700,
                              fontSize: '1rem',
                              color: '#ffffff',
                              fontFamily: 'var(--font-body)'
                            }}>
                              {subInfo.name}
                            </span>
                            {subInfo.code && subInfo.code !== subInfo.name && (
                              <span style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                color: palette.text,
                                background: 'rgba(0,0,0,0.4)',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                border: '1px solid ' + palette.border
                              }}>
                                {subInfo.code}
                              </span>
                            )}
                            {isNow && (
                              <span style={{
                                fontSize: '0.65rem',
                                color: 'var(--accent-green)',
                                background: 'rgba(48,209,88,0.15)',
                                padding: '2px 6px',
                                borderRadius: '99px',
                                fontFamily: 'var(--font-mono)',
                                fontWeight: 700
                              }}>
                                ACTIVE NOW
                              </span>
                            )}
                          </div>
                          {subInfo.faculty && (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>
                              Faculty: {subInfo.faculty}
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <div style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.82rem',
                            color: 'var(--text-primary)',
                            background: '#0a0a0a',
                            padding: '0.35rem 0.65rem',
                            borderRadius: '6px',
                            border: '1px solid #333'
                          }}>
                            Lecture {slotIdx + 1} • {cls.t}
                          </div>

                          <button
                            type="button"
                            className="btn primary"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', minHeight: '36px' }}
                            onClick={() => handleSelectSlot(slotIdx, cls.t, cls.s)}
                            title="Set this lecture as active in the report panel"
                          >
                            Select Lecture
                          </button>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          ) : (
            /* FULL WEEKLY MATRIX GRID VIEW */
            <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #333' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', minWidth: '460px' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '0.65rem', border: '1px solid #333', background: '#141414', color: 'var(--text-secondary)', textAlign: 'left', width: '90px' }}>
                      Day
                    </th>
                    <th style={{ padding: '0.65rem', border: '1px solid #333', background: '#141414', color: 'var(--text-secondary)', textAlign: 'left' }}>
                      Scheduled Classes (Tap to Select)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {days.map(day => {
                    const slots = timetableMap[day] || [];
                    const isToday = day === todayName;

                    const filteredSlots = slots
                      .map((cls, slotIdx) => ({ cls, slotIdx }))
                      .filter(({ cls }) => {
                        if (!filterSubjectKey) return true;
                        return cls.s.includes(filterSubjectKey);
                      });

                    return (
                      <tr key={day} style={{ background: isToday ? 'rgba(255,59,48,0.06)' : 'transparent' }}>
                        <td style={{
                          padding: '0.75rem 0.6rem',
                          border: '1px solid #333',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          color: isToday ? 'var(--accent-red)' : '#ffffff',
                          whiteSpace: 'nowrap',
                          verticalAlign: 'top'
                        }}>
                          {day}
                          {isToday && <span style={{ display: 'block', fontSize: '0.62rem', color: 'var(--accent-red)' }}>[TODAY]</span>}
                        </td>
                        <td style={{ padding: '0.5rem', border: '1px solid #333' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {filteredSlots.length === 0 ? (
                              <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontStyle: 'italic' }}>
                                No scheduled classes
                              </span>
                            ) : (
                              filteredSlots.map(({ cls, slotIdx }) => {
                                const firstSubKey = cls.s.split(/[\/&,]+/)[0].trim();
                                const subInfo = resolveSubjectDetails(cls.s, subjectsMap);
                                const palette = SUBJECT_COLORS[firstSubKey] || DEFAULT_COLOR;
                                const isNow = isClassNowActive(day, cls.t);

                                return (
                                  <div
                                    key={slotIdx}
                                    onClick={() => handleSelectSlot(slotIdx, cls.t, cls.s)}
                                    style={{
                                      background: isNow ? 'rgba(48,209,88,0.18)' : palette.bg,
                                      color: palette.text,
                                      border: isNow ? '1.5px solid var(--accent-green)' : '1px solid ' + palette.border,
                                      padding: '0.5rem 0.75rem',
                                      borderRadius: '8px',
                                      cursor: 'pointer',
                                      minWidth: '140px',
                                      maxWidth: '220px',
                                      transition: 'transform 0.12s'
                                    }}
                                    title={`Lecture ${slotIdx + 1}: ${subInfo.name} (${cls.t}) - Click to select`}
                                  >
                                    <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#ffffff', marginBottom: '2px', lineHeight: 1.3 }}>
                                      {subInfo.name}
                                    </div>
                                    <div style={{ fontSize: '0.72rem', opacity: 0.85, fontFamily: 'var(--font-mono)', display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                                      <span>Lec {slotIdx + 1}</span>
                                      <span>•</span>
                                      <span>{cls.t}</span>
                                    </div>
                                    {subInfo.faculty && (
                                      <div style={{ fontSize: '0.68rem', opacity: 0.75, marginTop: '2px' }}>
                                        {subInfo.faculty}
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            💡 Tap any class slot to automatically set lecture number in Live Report.
          </span>
          <button type="button" className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
