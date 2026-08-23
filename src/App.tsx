import React, { useState, useEffect, useCallback } from 'react';
import { useAttendance } from './hooks/useAttendance';
import { ReportPanel } from './components/ReportPanel';
import { StudentList } from './components/StudentList';
import { InitialSetup } from './components/InitialSetup';
import { StudentModal } from './components/Modals/StudentModal';
import { TimetableModal } from './components/Modals/TimetableModal';
import { SettingsModal } from './components/Modals/SettingsModal';
import './index.css';

const App: React.FC = () => {
  const {
    students,
    config,
    editMode,
    setEditMode,
    toggleStudent,
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
  } = useAttendance();

  // Modal States
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editIdx, setEditIdx] = useState(-1);
  const [isTimetableModalOpen, setIsTimetableModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedLectureRange, setSelectedLectureRange] = useState<{ start: string; end: string } | null>(null);

  const handleOpenAddStudent = () => {
    setEditIdx(-1);
    setIsStudentModalOpen(true);
  };

  const handleOpenEditStudent = (idx: number) => {
    setEditIdx(idx);
    setIsStudentModalOpen(true);
  };

  const handleSelectLectureSlot = (startLec: string, endLec: string) => {
    setSelectedLectureRange({ start: startLec, end: endLec });
  };

  const handleResetClass = () => {
    if (window.confirm("Are you sure you want to reset all class data? This will clear the student roster and return to the initial setup screen.")) {
      saveStudents([]);
      setConfig({ semesterName: '', subjects: {}, timetable: {}, minAttendanceReq: 75 });
    }
  };

  // Global Keyboard Shortcuts Listener
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    const isTyping = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

    // Escape closes all open modals
    if (e.key === 'Escape') {
      setIsStudentModalOpen(false);
      setIsTimetableModalOpen(false);
      setIsSettingsModalOpen(false);
      return;
    }

    // Slash or Ctrl+F focuses the search input
    if ((e.key === '/' || (e.ctrlKey && e.key === 'f')) && !isTyping) {
      e.preventDefault();
      const searchInput = document.getElementById('student-search-input');
      if (searchInput) {
        searchInput.focus();
      }
      return;
    }

    // Ctrl+A / Cmd+A outside text inputs toggles all attendance
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a' && !isTyping) {
      e.preventDefault();
      if (e.shiftKey) {
        // Mark all absent
        const allAbsent = students.map(s => ({ ...s, p: false }));
        saveStudents(allAbsent);
      } else {
        toggleAll();
      }
      return;
    }
  }, [students, saveStudents, toggleAll]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div id="app-container" className={`app-container ${editMode ? 'edit-mode' : ''}`}>
      {students.length === 0 ? (
        <InitialSetup
          onCompleteSetup={(newStudents, newConfig) => {
            importFullSetup(newStudents, newConfig);
          }}
          onOpenAddModal={handleOpenAddStudent}
        />
      ) : (
        <>
          {/* Left Panel: Live WhatsApp Report */}
          <ReportPanel
            students={students}
            config={config}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
            onCopySession={saveLastCopiedSession}
            onRestoreLastSession={restoreLastCopiedSession}
            selectedLectureRange={selectedLectureRange}
          />

          {/* Right Panel: Student List */}
          <StudentList
            students={students}
            editMode={editMode}
            onToggleStudent={toggleStudent}
            onToggleAll={toggleAll}
            onToggleEditMode={() => setEditMode(!editMode)}
            onOpenTimetable={() => setIsTimetableModalOpen(true)}
            onOpenAddModal={handleOpenAddStudent}
            onOpenEditModal={handleOpenEditStudent}
            onDeleteStudent={deleteStudent}
          />
        </>
      )}

      {/* Modals */}
      <StudentModal
        isOpen={isStudentModalOpen}
        editIdx={editIdx}
        editingStudent={editIdx >= 0 && editIdx < students.length ? students[editIdx] : null}
        onClose={() => setIsStudentModalOpen(false)}
        onSave={saveStudentProcess}
      />

      <TimetableModal
        isOpen={isTimetableModalOpen}
        config={config}
        onClose={() => setIsTimetableModalOpen(false)}
        onSelectLectureSlot={handleSelectLectureSlot}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        config={config}
        onClose={() => setIsSettingsModalOpen(false)}
        onSaveConfig={setConfig}
        onSaveStudents={saveStudents}
        onImportFullSetup={importFullSetup}
        onImportTimetable={importTimetableOnly}
        onImportRoster={importRosterOnly}
        onImportSubjects={importSubjectsOnly}
        onDownloadBackup={downloadBackupJSON}
        onResetClass={handleResetClass}
      />
    </div>
  );
};

export default App;