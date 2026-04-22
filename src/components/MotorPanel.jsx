export default function MotorPanel({ zone, motor, fault, mode, onToggle }) {
  return (
    <div className={`motor-panel ${motor ? 'motor-running' : ''} ${fault ? 'motor-fault' : ''}`}>
      <div className="motor-icon">
        <svg viewBox="0 0 40 40" width="36" height="36">
          <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="2" fill="none" />
          <circle cx="20" cy="20" r="6" fill={motor ? '#22c55e' : fault ? '#ef4444' : '#64748b'} />
          {motor && (
            <>
              <line x1="20" y1="4" x2="20" y2="10" stroke="#22c55e" strokeWidth="2" />
              <line x1="36" y1="20" x2="30" y2="20" stroke="#22c55e" strokeWidth="2" />
              <line x1="20" y1="36" x2="20" y2="30" stroke="#22c55e" strokeWidth="2" />
              <line x1="4" y1="20" x2="10" y2="20" stroke="#22c55e" strokeWidth="2" />
            </>
          )}
        </svg>
      </div>
      <div className="motor-info">
        <span className="motor-zone">M-{zone}</span>
        <span className={`motor-status ${motor ? 'status-run' : fault ? 'status-fault' : 'status-stop'}`}>
          {fault ? fault.replace('_', ' ') : motor ? 'RUNNING' : 'STOPPED'}
        </span>
      </div>
      {mode === 'MANUAL' && !fault && (
        <button className="motor-toggle-btn" onClick={onToggle}>
          {motor ? 'STOP' : 'START'}
        </button>
      )}
    </div>
  );
}
