export default function AlarmPanel({ alarms, onAcknowledge, onClearAll }) {
  const active = alarms.filter((a) => !a.acknowledged);
  const acknowledged = alarms.filter((a) => a.acknowledged);

  return (
    <div className="alarm-panel">
      <div className="panel-header">
        <h2 className="panel-title">
          Alarm Panel
          {active.length > 0 && (
            <span className="alarm-badge">{active.length}</span>
          )}
        </h2>
        {alarms.length > 0 && (
          <button className="clear-btn" onClick={onClearAll}>
            Clear All
          </button>
        )}
      </div>

      {alarms.length === 0 && (
        <div className="no-alarms">
          <span className="check-icon">✓</span>
          <span>No active alarms</span>
        </div>
      )}

      {active.length > 0 && (
        <div className="alarm-group">
          <h4 className="alarm-group-title">Active</h4>
          {active.map((alarm) => (
            <AlarmRow key={alarm.id} alarm={alarm} onAck={() => onAcknowledge(alarm.id)} />
          ))}
        </div>
      )}

      {acknowledged.length > 0 && (
        <div className="alarm-group">
          <h4 className="alarm-group-title acknowledged-title">Acknowledged</h4>
          {acknowledged.slice(-5).map((alarm) => (
            <AlarmRow key={alarm.id} alarm={alarm} acknowledged />
          ))}
        </div>
      )}
    </div>
  );
}

function AlarmRow({ alarm, onAck, acknowledged }) {
  return (
    <div className={`alarm-row severity-${alarm.severity.toLowerCase()} ${acknowledged ? 'ack' : ''}`}>
      <div className="alarm-meta">
        <span className={`severity-badge ${alarm.severity.toLowerCase()}`}>{alarm.severity}</span>
        <span className="alarm-zone">Zone {alarm.zone}</span>
        <span className="alarm-time">{alarm.timestamp}</span>
      </div>
      <div className="alarm-message">{alarm.message}</div>
      {!acknowledged && (
        <button className="ack-btn" onClick={onAck}>
          ACK
        </button>
      )}
    </div>
  );
}
