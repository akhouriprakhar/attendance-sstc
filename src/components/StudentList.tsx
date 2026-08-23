import React, { useState } from 'react';
import { Student } from '../types';

interface StudentListProps {
  students: Student[];
  editMode: boolean;
  onToggleStudent: (idx: number) => void;
  onToggleAll: () => void;
  onToggleEditMode: () => void;
  onOpenTimetable: () => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (idx: number) => void;
  onDeleteStudent: (idx: number) => void;
}

export const StudentList: React.FC<StudentListProps> = ({
  students,
  editMode,
  onToggleStudent,
  onToggleAll,
  onToggleEditMode,
  onOpenTimetable,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteStudent
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showRollGrid, setShowRollGrid] = useState(false);

  const filteredStudents = students
    .map((s, originalIdx) => ({ student: s, originalIdx }))
    .filter(({ student }) => {
      const q = searchTerm.toLowerCase().trim();
      return !q || student.name.toLowerCase().includes(q) || student.roll.toString().includes(q);
    });

  return (
    <div className="panel list-panel">
      <div className="panel-header list-panel-header">
        <h2>Student Roster</h2>
        <div className="list-header-actions">
          <button
            type="button"
            className={`btn secondary header-action-btn ${showRollGrid ? 'active-grid-btn' : ''}`}
            onClick={() => setShowRollGrid(!showRollGrid)}
            title="Toggle compact 1-tap roll grid"
            aria-label="Toggle compact roll number grid"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M3,3H11V11H3V3M5,5V9H9V5H5M13,3H21V11H13V3M15,5V9H19V5H15M3,13H11V21H3V13M5,15V19H9V15H5M13,13H21V21H13V13M15,15V19H19V15H15Z" />
            </svg>
            {showRollGrid ? "Hide Grid" : "Roll Grid"}
          </button>
          <button
            type="button"
            className="btn secondary header-action-btn"
            onClick={onToggleAll}
            title="Mark all students present or absent"
            aria-label="Toggle attendance for all students"
          >
            Mark All
          </button>
          <button
            type="button"
            className="btn header-action-btn"
            onClick={onOpenTimetable}
            title="Open class timetable schedule"
            aria-label="Open timetable schedule"
          >
            Timetable
          </button>
        </div>
      </div>

      {editMode && (
        <div className="edit-mode-banner">
          <span>✏️ <strong>Edit Mode Active</strong> — Tap edit or delete on any student below</span>
        </div>
      )}

      {/* Compact 1-Tap Roll Number Grid */}
      {showRollGrid && (
        <div className="roll-grid-wrapper" aria-label="Quick roll number attendance grid">
          <div className="roll-grid-header">
            <span>TAP TO TOGGLE STATUS</span>
            <span className="grid-legend">
              <span className="legend-dot present"></span> Present
              <span className="legend-dot absent"></span> Absent
            </span>
          </div>
          <div className="roll-grid">
            {students.map((s, idx) => (
              <button
                key={s.roll}
                type="button"
                className={`roll-grid-item ${s.p ? 'is-present' : 'is-absent'}`}
                onClick={() => onToggleStudent(idx)}
                title={`${s.name} (#${s.roll}) - ${s.p ? 'Present' : 'Absent'}`}
                aria-label={`Student ${s.name}, Roll ${s.roll}, status ${s.p ? 'Present' : 'Absent'}`}
              >
                #{s.roll}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="search-bar">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
        </svg>
        <input
          id="student-search-input"
          type="text"
          placeholder="Search by name or roll number... (Press / to focus)"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          aria-label="Search student list"
        />
        {searchTerm && (
          <button
            type="button"
            className="clear-search-btn"
            onClick={() => setSearchTerm('')}
            aria-label="Clear search query"
          >
            &times;
          </button>
        )}
      </div>

      <div id="student-list-container" role="list">
        {filteredStudents.length === 0 ? (
          <div className="empty-search-state">
            <span>🔍 No students found matching "{searchTerm}"</span>
          </div>
        ) : (
          filteredStudents.map(({ student: s, originalIdx }) => (
            <div
              key={s.roll}
              className={`student-item ${s.p ? 'student-present' : 'student-absent'}`}
              role="listitem"
            >
              <input
                type="checkbox"
                id={`cb-${s.roll}`}
                checked={s.p}
                onChange={() => onToggleStudent(originalIdx)}
                aria-label={`Mark ${s.name} present or absent`}
              />
              <label className="row-content" htmlFor={`cb-${s.roll}`}>
                <div className="status-indicator" aria-hidden="true"></div>
                <div className="roll-badge">#{s.roll}</div>
                <div className="student-name" title={s.name}>{s.name}</div>
              </label>

              <button
                type="button"
                className="action-btn edit"
                onClick={() => onOpenEditModal(originalIdx)}
                title={`Edit ${s.name}`}
                aria-label={`Edit student ${s.name}`}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"/>
                </svg>
              </button>
              <button
                type="button"
                className="action-btn delete"
                onClick={() => onDeleteStudent(originalIdx)}
                title={`Delete ${s.name}`}
                aria-label={`Delete student ${s.name}`}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/>
                </svg>
              </button>
            </div>
          ))
        )}
      </div>

      <div className="list-footer-actions">
        <button
          type="button"
          className={`btn ${editMode ? 'primary active-edit-btn' : 'secondary'}`}
          style={{ flex: 1 }}
          onClick={onToggleEditMode}
          aria-pressed={editMode}
        >
          {editMode ? "✓ Done Editing" : "✏️ Edit Mode"}
        </button>
        {editMode && (
          <button
            type="button"
            className="btn primary add-student-btn"
            style={{ flex: 1 }}
            onClick={onOpenAddModal}
            aria-label="Add new student"
          >
            + Add Student
          </button>
        )}
      </div>
    </div>
  );
};
