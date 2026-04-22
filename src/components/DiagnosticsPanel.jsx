import { getActiveFaults } from '../logic/faultEngine';

export default function DiagnosticsPanel({ zones, eventLog, onResetFault }) {
  const activeFaults = getActiveFaults(zones);

  return (
    <div className="diagnostics-panel">
      <div className="panel-header">
        <h2 className="panel-title">Diagnostics</h2>
      </div>

      <div className="diag-zones">
        {Object.entries(zones).map(([zone, state]) => (
          <div key={zone} className={`diag-zone-row ${state.fault ? 'diag-fault' : 'diag-ok'}`}>
            <div className="diag-zone-label">Zone {zone}</div>
            <div className="diag-status-row">
              <DiagStatus label="Motor" ok={state.motor} />
              <DiagStatus label="Sensor" ok={state.sensor} />
              <DiagStatus label="Occupied" ok={state.occupied} neutral />
              <span className={`diag-fault-tag ${state.fault ? 'active' : ''}`}>
                {state.fault ? state.fault.replace('_', ' ') : 'OK'}
              </span>
            </div>
            {state.fault && (
              <button className="reset-fault-btn" onClick={() => onResetFault(zone)}>
                Reset Zone {zone}
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="event-log">
        <h4 className="event-log-title">Event Log</h4>
        <div className="event-log-scroll">
          {eventLog.length === 0 && <div className="no-events">No events yet</div>}
          {[...eventLog].reverse().map((evt) => (
            <div key={evt.id} className={`event-row event-${evt.type}`}>
              <span className="event-time">{evt.timestamp}</span>
              <span className={`event-type-badge ${evt.type}`}>{evt.type.toUpperCase()}</span>
              <span className="event-msg">{evt.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DiagStatus({ label, ok, neutral }) {
  const cls = neutral ? 'diag-neutral' : ok ? 'diag-green' : 'diag-red';
  return (
    <div className="diag-status-item">
      <span className={`diag-dot ${cls}`} />
      <span className="diag-item-label">{label}</span>
    </div>
  );
}
