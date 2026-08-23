import React, { useState, useEffect } from 'react';
import { Student } from '../../types';

interface StudentModalProps {
  isOpen: boolean;
  editIdx: number;
  editingStudent: Student | null;
  onClose: () => void;
  onSave: (roll: number, name: string, isEdit: boolean, editIdx: number) => void;
}

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  editIdx,
  editingStudent,
  onClose,
  onSave
}) => {
  const [roll, setRoll] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    if (editingStudent) {
      setRoll(editingStudent.roll.toString());
      setName(editingStudent.name);
    } else {
      setRoll('');
      setName('');
    }
  }, [editingStudent, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedRoll = parseInt(roll, 10);
    if (isNaN(parsedRoll) || !name.trim()) return;
    onSave(parsedRoll, name.trim(), editIdx !== -1, editIdx);
    onClose();
  };

  return (
    <div className="modal-overlay visible" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="student-modal-title">
      <div className="modal-content student-modal-content" onClick={e => e.stopPropagation()}>
        <div className="panel-header" style={{ marginBottom: '1rem' }}>
          <h3 id="student-modal-title" className="modal-title" style={{ margin: 0 }}>
            {editIdx !== -1 ? "✏️ Edit Student" : "➕ Add Student"}
          </h3>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close dialog">
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="student-roll-input" style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
              ROLL NUMBER
            </label>
            <input
              id="student-roll-input"
              type="number"
              value={roll}
              placeholder="e.g. 1"
              min={1}
              onChange={e => setRoll(e.target.value)}
              required
              aria-required="true"
            />
          </div>
          <div className="form-group">
            <label htmlFor="student-name-input" style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
              FULL NAME
            </label>
            <input
              id="student-name-input"
              type="text"
              value={name}
              placeholder="e.g. Alex Johnson"
              onChange={e => setName(e.target.value)}
              required
              aria-required="true"
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn primary">
              Save Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
