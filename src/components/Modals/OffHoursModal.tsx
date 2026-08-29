import React from 'react';
import { CollegeHoursStatus } from '../../utils/collegeHours';

interface OffHoursModalProps {
  status: CollegeHoursStatus;
  onProceed: () => void;
}

export const OffHoursModal: React.FC<OffHoursModalProps> = ({ status, onProceed }) => {
  const getIcon = () => {
    if (status.isSunday) return '🏖️';
    if (status.isBeforeStart) return '🌅';
    return '🌙';
  };

  const getTitle = () => {
    if (status.isSunday) return 'Sunday Off-Day';
    if (status.isBeforeStart) return 'Before College Hours';
    return 'College Hours Ended';
  };

  return (
    <div
      className="modal-overlay visible off-hours-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="off-hours-title"
    >
      <div
        className="modal-content off-hours-content"
        style={{
          maxWidth: '480px',
          textAlign: 'center',
          padding: '2rem 1.5rem',
          border: '1px solid #333',
          background: 'linear-gradient(180deg, #181818 0%, #101010 100%)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.8)'
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '0.75rem', lineHeight: 1 }}>
          {getIcon()}
        </div>

        <h3
          id="off-hours-title"
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '0.5rem'
          }}
        >
          {getTitle()}
        </h3>

        <p
          style={{
            fontSize: '0.92rem',
            color: '#e0e0e0',
            lineHeight: 1.5,
            marginBottom: '0.75rem',
            fontWeight: 500
          }}
        >
          {status.message}
        </p>

        <div
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid #282828',
            borderRadius: '8px',
            padding: '0.65rem 0.85rem',
            marginBottom: '1.5rem',
            textAlign: 'left',
            fontSize: '0.76rem',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-mono)'
          }}
        >
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '3px' }}>
            📅 Active College Schedule:
          </div>
          <div>• Mon – Fri: 10:00 AM – 04:30 PM</div>
          <div>• Saturday: 10:00 AM – 02:00 PM</div>
          <div>• Sunday: Off-day</div>
        </div>

        <button
          type="button"
          className="btn primary"
          onClick={onProceed}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            fontSize: '0.92rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          <span>Proceed to Roster / Continue to App</span>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z" />
          </svg>
        </button>

        <span
          style={{
            display: 'block',
            fontSize: '0.72rem',
            color: 'var(--text-secondary)',
            marginTop: '0.65rem'
          }}
        >
          You can mark proxy attendance, edit rosters, or export past reports anytime.
        </span>
      </div>
    </div>
  );
};
