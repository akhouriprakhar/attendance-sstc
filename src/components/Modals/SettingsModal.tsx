import React, { useState, useEffect, useMemo } from 'react';
import { AppConfig, Student, TemplateConfig, DEFAULT_TEMPLATE_CONFIG } from '../../types';
import { GENERIC_SETUP_PROMPT, validateClassSetupJson } from '../../utils/setupValidator';
import { generateReportText } from '../../utils/textFormatter';

interface SettingsModalProps {
  isOpen: boolean;
  config: AppConfig;
  students?: Student[];
  onClose: () => void;
  onSaveConfig: (newConfig: AppConfig) => void;
  onSaveStudents: (newStudents: Student[]) => void;
  onImportFullSetup?: (newStudents: Student[], newConfig: AppConfig) => void;
  onImportTimetable: (timetable: any) => void;
  onImportRoster: (roster: any[]) => void;
  onImportSubjects: (subjects: any) => void;
  onDownloadBackup: () => void;
  onResetClass?: () => void;
}

const PROMPT_TIMETABLE = `I am uploading an image/PDF/screenshot of a class timetable schedule. Please extract all lectures and practicals from Monday to Saturday and output ONLY a valid JSON object matching this exact schema with clean, readable subject names (e.g. "DS", "Blockchain", "TOC", "CN", "IoT", "Minor Project") and distinct lab titles (e.g. "DS Lab", "IoT Lab", "CN Lab") with no raw course codes or elective prefixes:

{
  "Monday": [
    { "t": "10:00-10:50", "s": "DS" },
    { "t": "10:50-11:40", "s": "TOC" },
    { "t": "11:40-13:20", "s": "DS Lab" }
  ],
  "Tuesday": [
    { "t": "10:00-10:50", "s": "Blockchain" }
  ]
}`;

const PROMPT_ROSTER = `I am uploading an image/PDF/screenshot of a student class list or attendance roll call sheet. Please extract all student roll numbers and full names, and output ONLY a valid JSON array matching this exact schema with no extra conversational text or markdown codeblocks:

[
  { "roll": 1, "name": "Alice Smith" },
  { "roll": 2, "name": "Bob Johnson" },
  { "roll": 3, "name": "Charlie Brown" }
]`;

const PROMPT_TEACHERS = `I am uploading an image/PDF/screenshot of subject faculty assignments. Please extract all subjects and faculty/professor names, and output ONLY a valid JSON object matching this exact schema with clean, readable subject and lab names (e.g. "DS", "DS Lab", "Blockchain", "TOC", "CN", "CN Lab", "IoT", "IoT Lab", "Minor Project") with no raw course codes or elective prefixes:

{
  "DS": { "name": "Data Science", "faculty": "Dr. Smith" },
  "DS Lab": { "name": "Data Science Lab", "faculty": "Dr. Smith" },
  "TOC": { "name": "Theory of Computation", "faculty": "Prof. Davis" },
  "Blockchain": { "name": "Blockchain", "faculty": "Dr. Wilson" }
}`;

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  config,
  students = [],
  onClose,
  onSaveConfig,
  onSaveStudents,
  onImportFullSetup,
  onImportTimetable,
  onImportRoster,
  onImportSubjects,
  onDownloadBackup,
  onResetClass
}) => {
  const [activeTab, setActiveTab] = useState<'template' | 'smart' | 'manual' | 'backup'>('template');
  const [jsonText, setJsonText] = useState('');

  // Template Config State
  const [templateState, setTemplateState] = useState<TemplateConfig>(() => {
    return config.templateConfig ? { ...DEFAULT_TEMPLATE_CONFIG, ...config.templateConfig } : DEFAULT_TEMPLATE_CONFIG;
  });
  const [previewMode, setPreviewMode] = useState<'absentees' | 'presentees'>('absentees');
  const [templateSavedToast, setTemplateSavedToast] = useState(false);

  // Smart Import Textarea states
  const [fullSetupInput, setFullSetupInput] = useState('');
  const [timetableInput, setTimetableInput] = useState('');
  const [rosterInput, setRosterInput] = useState('');
  const [teachersInput, setTeachersInput] = useState('');
  const [fullSetupError, setFullSetupError] = useState<string | null>(null);

  // Copy status indicators
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setJsonText(JSON.stringify(config, null, 2));
      setTemplateState(config.templateConfig ? { ...DEFAULT_TEMPLATE_CONFIG, ...config.templateConfig } : DEFAULT_TEMPLATE_CONFIG);
    }
  }, [config, isOpen]);

  // Sample or actual students for live template preview
  const previewStudents = useMemo(() => {
    if (students && students.length > 0) {
      return students;
    }
    return [
      { roll: 1, name: 'Alex Johnson', p: true },
      { roll: 2, name: 'Bethany Smith', p: true },
      { roll: 4, name: 'Chris Evans', p: false },
      { roll: 12, name: 'David Miller', p: false },
      { roll: 38, name: 'Emma Watson', p: false },
    ];
  }, [students]);

  const livePreviewText = useMemo(() => {
    return generateReportText({
      students: previewStudents,
      config,
      outputMode: previewMode,
      startLec: '2',
      templateConfig: templateState
    });
  }, [previewStudents, config, previewMode, templateState]);

  const handleSaveTemplate = () => {
    onSaveConfig({
      ...config,
      templateConfig: templateState
    });
    setTemplateSavedToast(true);
    if (navigator.vibrate) navigator.vibrate(10);
    setTimeout(() => setTemplateSavedToast(false), 2000);
  };

  const handleResetTemplate = () => {
    setTemplateState(DEFAULT_TEMPLATE_CONFIG);
    onSaveConfig({
      ...config,
      templateConfig: DEFAULT_TEMPLATE_CONFIG
    });
    setTemplateSavedToast(true);
    if (navigator.vibrate) navigator.vibrate(10);
    setTimeout(() => setTemplateSavedToast(false), 2000);
  };

  if (!isOpen) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(label);
    if (navigator.vibrate) navigator.vibrate(10);
    setTimeout(() => setCopiedPrompt(null), 2000);
  };

  const handleApplyFullSetup = () => {
    setFullSetupError(null);
    const result = validateClassSetupJson(fullSetupInput);
    if (!result.success || !result.students || !result.config) {
      setFullSetupError(result.error || "Setup couldn't be imported. Please check the information generated by your AI and try again.");
      return;
    }

    if (onImportFullSetup) {
      onImportFullSetup(result.students, result.config);
    } else {
      onSaveStudents(result.students);
      onSaveConfig(result.config);
    }

    alert('Complete Class Setup Imported & Applied Successfully!');
    setFullSetupInput('');
    onClose();
  };

  const handleApplyTimetable = () => {
    try {
      const parsed = JSON.parse(timetableInput);
      onImportTimetable(parsed);
      alert('Timetable Imported & Applied Successfully!');
      setTimetableInput('');
    } catch (e) {
      alert('Invalid JSON format for Timetable. Check syntax or re-copy AI prompt.');
    }
  };

  const handleApplyRoster = () => {
    try {
      const parsed = JSON.parse(rosterInput);
      if (!Array.isArray(parsed)) {
        alert('Roster must be a JSON array of student objects e.g. [{"roll": 1, "name": "..."}]');
        return;
      }
      onImportRoster(parsed);
      alert('Student Roster Imported & Applied Successfully!');
      setRosterInput('');
    } catch (e) {
      alert('Invalid JSON format for Student Roster. Check syntax or re-copy AI prompt.');
    }
  };

  const handleApplyTeachers = () => {
    try {
      const parsed = JSON.parse(teachersInput);
      onImportSubjects(parsed);
      alert('Teacher & Faculty Details Imported Successfully!');
      setTeachersInput('');
    } catch (e) {
      alert('Invalid JSON format for Faculty details. Check syntax or re-copy AI prompt.');
    }
  };

  const handleSaveManual = () => {
    try {
      const parsed = JSON.parse(jsonText);
      onSaveConfig(parsed);
      alert('Settings Saved!');
      onClose();
    } catch (e) {
      alert("Invalid JSON format. Check syntax.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (parsed.students && Array.isArray(parsed.students)) {
          onSaveStudents(parsed.students);
        }
        if (parsed.config) {
          onSaveConfig(parsed.config);
        } else if (!parsed.students && (parsed.subjects || parsed.timetable)) {
          onSaveConfig(parsed);
        }
        alert("Import Successful!");
        onClose();
      } catch (err) {
        alert("Invalid JSON file format.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal-overlay visible" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="settings-modal-title">
      <div className="modal-content" style={{ maxWidth: '780px', height: '88vh' }} onClick={e => e.stopPropagation()}>
        <div className="panel-header" style={{ marginBottom: '0.75rem' }}>
          <div>
            <h3 id="settings-modal-title" className="modal-title" style={{ margin: 0 }}>
              Class Settings & Data Importer
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
              Import Class Setup, Timetables, Rosters & Faculty details
            </p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close settings modal">&times;</button>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem', overflowX: 'auto', flexShrink: 0 }}>
          <button
            type="button"
            className="btn secondary"
            onClick={() => setActiveTab('template')}
            style={{ opacity: activeTab === 'template' ? 1 : 0.6, fontSize: '0.8rem', whiteSpace: 'nowrap' }}
            aria-selected={activeTab === 'template'}
          >
            💬 WhatsApp Template
          </button>
          <button
            type="button"
            className="btn secondary"
            onClick={() => setActiveTab('smart')}
            style={{ opacity: activeTab === 'smart' ? 1 : 0.6, fontSize: '0.8rem', whiteSpace: 'nowrap' }}
            aria-selected={activeTab === 'smart'}
          >
            AI Smart Importer
          </button>
          <button
            type="button"
            className="btn secondary"
            onClick={() => setActiveTab('manual')}
            style={{ opacity: activeTab === 'manual' ? 1 : 0.6, fontSize: '0.8rem' }}
          >
            Raw Config Editor
          </button>
          <button
            type="button"
            className="btn secondary"
            onClick={() => setActiveTab('backup')}
            style={{ opacity: activeTab === 'backup' ? 1 : 0.6, fontSize: '0.8rem' }}
          >
            Offline Backup & Restore
          </button>
        </div>

        {/* Tab 0: WhatsApp Template Customization & Live Preview */}
        {activeTab === 'template' && (
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '4px' }}>
            {templateSavedToast && (
              <div style={{
                background: 'rgba(48, 209, 88, 0.15)',
                border: '1px solid var(--accent-green)',
                color: 'var(--accent-green)',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                ✓ Template settings saved and applied to live reports!
              </div>
            )}

            {/* Live Preview Card */}
            <div style={{
              background: '#0c1015',
              border: '1px solid #1f2c34',
              borderRadius: '10px',
              padding: '0.85rem 1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#25D366', display: 'inline-block' }}></span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#e9edef', letterSpacing: '0.3px' }}>
                    Live WhatsApp Message Preview
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.3rem' }}>
                  <button
                    type="button"
                    className="btn secondary"
                    style={{
                      fontSize: '0.7rem',
                      padding: '0.2rem 0.5rem',
                      minHeight: '28px',
                      background: previewMode === 'absentees' ? '#25D366' : 'transparent',
                      color: previewMode === 'absentees' ? '#000' : 'var(--text-secondary)',
                      borderColor: previewMode === 'absentees' ? '#25D366' : '#333'
                    }}
                    onClick={() => setPreviewMode('absentees')}
                  >
                    Absentees
                  </button>
                  <button
                    type="button"
                    className="btn secondary"
                    style={{
                      fontSize: '0.7rem',
                      padding: '0.2rem 0.5rem',
                      minHeight: '28px',
                      background: previewMode === 'presentees' ? '#25D366' : 'transparent',
                      color: previewMode === 'presentees' ? '#000' : 'var(--text-secondary)',
                      borderColor: previewMode === 'presentees' ? '#25D366' : '#333'
                    }}
                    onClick={() => setPreviewMode('presentees')}
                  >
                    Presentees
                  </button>
                </div>
              </div>

              <div style={{
                background: '#05070a',
                border: '1px solid #182229',
                borderRadius: '8px',
                padding: '0.75rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                lineHeight: 1.6,
                color: '#d1d7db',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                userSelect: 'text'
              }}>
                {livePreviewText}
              </div>
            </div>

            {/* Template Settings Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              
              {/* Group 1: Header */}
              <div style={{ background: '#161616', border: '1px solid #2a2a2a', padding: '0.85rem 1rem', borderRadius: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={templateState.includeHeader}
                    onChange={e => setTemplateState(prev => ({ ...prev, includeHeader: e.target.checked }))}
                    style={{ width: '16px', height: '16px', minHeight: 'auto', accentColor: 'var(--accent-red)' }}
                  />
                  Include Title / Header Line
                </label>
                {templateState.includeHeader && (
                  <div style={{ marginTop: '0.5rem', paddingLeft: '1.6rem' }}>
                    <input
                      type="text"
                      placeholder={`Custom Header (e.g. ${config.semesterName || 'CSE-5A'} Attendance)`}
                      value={templateState.customHeader}
                      onChange={e => setTemplateState(prev => ({ ...prev, customHeader: e.target.value }))}
                      style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem', minHeight: '34px' }}
                    />
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginTop: '3px' }}>
                      Leave empty to auto-use semester name (e.g. &quot;{config.semesterName || 'Class'} Attendance&quot;)
                    </span>
                  </div>
                )}
              </div>

              {/* Group 2: Date & Day */}
              <div style={{ background: '#161616', border: '1px solid #2a2a2a', padding: '0.85rem 1rem', borderRadius: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={templateState.includeDate}
                    onChange={e => setTemplateState(prev => ({ ...prev, includeDate: e.target.checked }))}
                    style={{ width: '16px', height: '16px', minHeight: 'auto', accentColor: 'var(--accent-red)' }}
                  />
                  Include Date & Day
                </label>
                {templateState.includeDate && (
                  <div style={{ marginTop: '0.5rem', paddingLeft: '1.6rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="dateFormat"
                        value="dayFirst"
                        checked={templateState.dateFormat === 'dayFirst'}
                        onChange={() => setTemplateState(prev => ({ ...prev, dateFormat: 'dayFirst' }))}
                        style={{ width: '14px', height: '14px', minHeight: 'auto', accentColor: 'var(--accent-red)' }}
                      />
                      Day First (Friday: 29/08/2026)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="dateFormat"
                        value="dateFirst"
                        checked={templateState.dateFormat === 'dateFirst'}
                        onChange={() => setTemplateState(prev => ({ ...prev, dateFormat: 'dateFirst' }))}
                        style={{ width: '14px', height: '14px', minHeight: 'auto', accentColor: 'var(--accent-red)' }}
                      />
                      Date First (29/08/2026 (Friday))
                    </label>
                  </div>
                )}
              </div>

              {/* Group 3: Lecture & Subject Inclusions */}
              <div style={{ background: '#161616', border: '1px solid #2a2a2a', padding: '0.85rem 1rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  Content Inclusions
                </span>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.82rem' }}>
                  <input
                    type="checkbox"
                    checked={templateState.includeLecture}
                    onChange={e => setTemplateState(prev => ({ ...prev, includeLecture: e.target.checked }))}
                    style={{ width: '16px', height: '16px', minHeight: 'auto', accentColor: 'var(--accent-red)' }}
                  />
                  Include Lecture Slot Number (e.g. &quot;Lecture - 2&quot;)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.82rem' }}>
                  <input
                    type="checkbox"
                    checked={templateState.includeSubject}
                    onChange={e => setTemplateState(prev => ({ ...prev, includeSubject: e.target.checked }))}
                    style={{ width: '16px', height: '16px', minHeight: 'auto', accentColor: 'var(--accent-red)' }}
                  />
                  Include Subject Name / Code (from timetable schedule)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.82rem', paddingLeft: templateState.includeSubject ? '1.6rem' : '0' }}>
                  <input
                    type="checkbox"
                    disabled={!templateState.includeSubject}
                    checked={templateState.includeFaculty}
                    onChange={e => setTemplateState(prev => ({ ...prev, includeFaculty: e.target.checked }))}
                    style={{ width: '16px', height: '16px', minHeight: 'auto', accentColor: 'var(--accent-red)' }}
                  />
                  Include Faculty / Professor Name (e.g. &quot;DBMS (Prof. Sharma)&quot;)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.82rem' }}>
                  <input
                    type="checkbox"
                    checked={templateState.includeStats}
                    onChange={e => setTemplateState(prev => ({ ...prev, includeStats: e.target.checked }))}
                    style={{ width: '16px', height: '16px', minHeight: 'auto', accentColor: 'var(--accent-red)' }}
                  />
                  Include Class Stats Summary (Total: 60 | Present: 55 | Absent: 5)
                </label>
              </div>

              {/* Group 4: WhatsApp Formatting & Delimiter */}
              <div style={{ background: '#161616', border: '1px solid #2a2a2a', padding: '0.85rem 1rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  Formatting & Delimiters
                </span>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.82rem' }}>
                  <input
                    type="checkbox"
                    checked={templateState.useBoldTags}
                    onChange={e => setTemplateState(prev => ({ ...prev, useBoldTags: e.target.checked }))}
                    style={{ width: '16px', height: '16px', minHeight: 'auto', accentColor: 'var(--accent-red)' }}
                  />
                  WhatsApp Bold Tags (*text* for clear emphasis)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.82rem' }}>
                  <input
                    type="checkbox"
                    checked={templateState.useEmojis}
                    onChange={e => setTemplateState(prev => ({ ...prev, useEmojis: e.target.checked }))}
                    style={{ width: '16px', height: '16px', minHeight: 'auto', accentColor: 'var(--accent-red)' }}
                  />
                  Visual Emojis (📅, ⏰, 📚, 📊, ❌, ✅)
                </label>

                <div style={{ marginTop: '0.35rem' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Roll Numbers Delimiter:
                  </span>
                  <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="rollDelimiter"
                        value="comma"
                        checked={templateState.rollDelimiter === 'comma'}
                        onChange={() => setTemplateState(prev => ({ ...prev, rollDelimiter: 'comma' }))}
                        style={{ width: '14px', height: '14px', minHeight: 'auto', accentColor: 'var(--accent-red)' }}
                      />
                      Comma (4, 12, 38)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="rollDelimiter"
                        value="space"
                        checked={templateState.rollDelimiter === 'space'}
                        onChange={() => setTemplateState(prev => ({ ...prev, rollDelimiter: 'space' }))}
                        style={{ width: '14px', height: '14px', minHeight: 'auto', accentColor: 'var(--accent-red)' }}
                      />
                      Space (4 12 38)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="rollDelimiter"
                        value="newline"
                        checked={templateState.rollDelimiter === 'newline'}
                        onChange={() => setTemplateState(prev => ({ ...prev, rollDelimiter: 'newline' }))}
                        style={{ width: '14px', height: '14px', minHeight: 'auto', accentColor: 'var(--accent-red)' }}
                      />
                      New Line (Vertical list)
                    </label>
                  </div>
                </div>
              </div>

              {/* Group 5: Custom Footer */}
              <div style={{ background: '#161616', border: '1px solid #2a2a2a', padding: '0.85rem 1rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'var(--font-mono)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                  Custom Footer / Signature (Optional)
                </span>
                <input
                  type="text"
                  placeholder="e.g. Submitted by Class Representative"
                  value={templateState.customFooter}
                  onChange={e => setTemplateState(prev => ({ ...prev, customFooter: e.target.value }))}
                  style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem', minHeight: '34px' }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn primary"
                  onClick={handleSaveTemplate}
                  style={{ flex: 2, fontSize: '0.85rem' }}
                >
                  Save Template Settings
                </button>
                <button
                  type="button"
                  className="btn secondary"
                  onClick={handleResetTemplate}
                  style={{ flex: 1, fontSize: '0.8rem' }}
                  title="Reset to default clean WhatsApp format"
                >
                  Reset to Default
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Tab 1: AI Photo/PDF Smart Importer */}
        {activeTab === 'smart' && (
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Section 0: Full Class Setup */}
            <div style={{ background: '#161616', border: '1px solid var(--accent-red)', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    🌟 All-in-One Class Setup Importer
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Paste full AI setup JSON (includes students, subjects & timetable)
                  </span>
                </div>
                <button
                  type="button"
                  className="btn secondary"
                  style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }}
                  onClick={() => copyToClipboard(GENERIC_SETUP_PROMPT, 'fullsetup')}
                >
                  {copiedPrompt === 'fullsetup' ? 'Setup Prompt Copied!' : 'Copy Setup Prompt'}
                </button>
              </div>

              <textarea
                placeholder='Paste AI Setup JSON here (e.g. {"className": "...", "students": [...], "timetable": {...}})...'
                value={fullSetupInput}
                onChange={e => {
                  setFullSetupInput(e.target.value);
                  if (fullSetupError) setFullSetupError(null);
                }}
                style={{ width: '100%', height: '80px', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', padding: '0.5rem', marginBottom: '0.5rem', resize: 'none' }}
              />

              {fullSetupError && (
                <div style={{ color: 'var(--accent-red)', fontSize: '0.78rem', marginBottom: '0.5rem' }}>
                  ⚠️ {fullSetupError}
                </div>
              )}

              <button
                type="button"
                className="btn primary"
                style={{ width: '100%', fontSize: '0.8rem', padding: '0.4rem' }}
                onClick={handleApplyFullSetup}
                disabled={!fullSetupInput.trim()}
              >
                Import & Apply Complete Class Setup
              </button>
            </div>

            {/* Section 1: Timetable Import */}
            <div style={{ background: '#161616', border: '1px solid #2a2a2a', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    1. Class Timetable Importer
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Upload timetable screenshot to AI and paste JSON result below
                  </span>
                </div>
                <button
                  type="button"
                  className="btn secondary"
                  style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }}
                  onClick={() => copyToClipboard(PROMPT_TIMETABLE, 'timetable')}
                >
                  {copiedPrompt === 'timetable' ? 'Prompt Copied' : 'Copy AI Prompt'}
                </button>
              </div>

              <textarea
                placeholder='Paste AI JSON result here (e.g. {"Monday": [{"t": "10:00-10:50", "s": "CSA"}]})...'
                value={timetableInput}
                onChange={e => setTimetableInput(e.target.value)}
                style={{ width: '100%', height: '70px', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', padding: '0.5rem', marginBottom: '0.5rem', resize: 'none' }}
              />

              <button
                type="button"
                className="btn primary"
                style={{ width: '100%', fontSize: '0.8rem', padding: '0.4rem' }}
                onClick={handleApplyTimetable}
                disabled={!timetableInput.trim()}
              >
                Import & Update Timetable
              </button>
            </div>

            {/* Section 2: Student Roster List Import */}
            <div style={{ background: '#161616', border: '1px solid #2a2a2a', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    2. Student Roster List Importer
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Upload student list PDF/Image to AI and paste student JSON array below
                  </span>
                </div>
                <button
                  type="button"
                  className="btn secondary"
                  style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }}
                  onClick={() => copyToClipboard(PROMPT_ROSTER, 'roster')}
                >
                  {copiedPrompt === 'roster' ? 'Prompt Copied' : 'Copy AI Prompt'}
                </button>
              </div>

              <textarea
                placeholder='Paste AI JSON array here (e.g. [{"roll": 1, "name": "Anshu Raj"}])...'
                value={rosterInput}
                onChange={e => setRosterInput(e.target.value)}
                style={{ width: '100%', height: '70px', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', padding: '0.5rem', marginBottom: '0.5rem', resize: 'none' }}
              />

              <button
                type="button"
                className="btn primary"
                style={{ width: '100%', fontSize: '0.8rem', padding: '0.4rem' }}
                onClick={handleApplyRoster}
                disabled={!rosterInput.trim()}
              >
                Import & Update Student Roster
              </button>
            </div>

            {/* Section 3: Teacher & Faculty Details Import */}
            <div style={{ background: '#161616', border: '1px solid #2a2a2a', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    3. Teacher & Faculty Details Importer
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Upload subject faculty list to AI and paste subject JSON object below
                  </span>
                </div>
                <button
                  type="button"
                  className="btn secondary"
                  style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }}
                  onClick={() => copyToClipboard(PROMPT_TEACHERS, 'teachers')}
                >
                  {copiedPrompt === 'teachers' ? 'Prompt Copied' : 'Copy AI Prompt'}
                </button>
              </div>

              <textarea
                placeholder='Paste AI JSON object here (e.g. {"CSA": {"name": "...", "faculty": "..."}})...'
                value={teachersInput}
                onChange={e => setTeachersInput(e.target.value)}
                style={{ width: '100%', height: '70px', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', padding: '0.5rem', marginBottom: '0.5rem', resize: 'none' }}
              />

              <button
                type="button"
                className="btn primary"
                style={{ width: '100%', fontSize: '0.8rem', padding: '0.4rem' }}
                onClick={handleApplyTeachers}
                disabled={!teachersInput.trim()}
              >
                Import & Update Faculty Details
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Manual Config Textarea */}
        {activeTab === 'manual' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              Edit raw JSON configuration directly:
            </p>
            <textarea
              value={jsonText}
              onChange={e => setJsonText(e.target.value)}
              style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.8rem', minHeight: '220px', resize: 'none' }}
            />
            <button className="btn primary" style={{ marginTop: '1rem' }} onClick={handleSaveManual}>
              Save Raw Changes
            </button>
          </div>
        )}

        {/* Tab 3: Backup & Restore */}
        {activeTab === 'backup' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                Download Complete Offline Backup
              </label>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                Saves an offline timestamped JSON backup of all student roster stats and subjects to your computer.
              </p>
              <button className="btn primary" style={{ width: '100%' }} onClick={onDownloadBackup}>
                Download Backup (.json)
              </button>
            </div>

            <div style={{ borderTop: '1px solid #333', paddingTop: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                Restore Backup / Import Config
              </label>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                Upload a JSON backup file to restore your configuration instantly.
              </p>
              <input
                type="file"
                id="config-upload-input"
                accept=".json"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
              <button
                className="btn"
                style={{ width: '100%' }}
                onClick={() => document.getElementById('config-upload-input')?.click()}
              >
                Restore JSON File
              </button>
            </div>

            {onResetClass && (
              <div style={{ borderTop: '1px solid #333', paddingTop: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-red)', marginBottom: '0.35rem' }}>
                  Reset All Class Data
                </label>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  Clears the current roster and configuration, returning the app to the initial setup screen.
                </p>
                <button
                  className="btn"
                  style={{ width: '100%', borderColor: 'rgba(255,59,48,0.5)', color: 'var(--accent-red)' }}
                  onClick={() => {
                    onResetClass();
                    onClose();
                  }}
                >
                  ⚠️ Reset Class & Return to Setup
                </button>
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: '1rem', textAlign: 'right', borderTop: '1px solid #333', paddingTop: '0.5rem' }}>
          <button type="button" className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
