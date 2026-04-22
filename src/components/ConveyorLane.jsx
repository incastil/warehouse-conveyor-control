import SensorLamp from './SensorLamp';
import MotorPanel from './MotorPanel';

export default function ConveyorLane({ zone, state, decision, mode, packages, onMotorToggle, onFaultInject }) {
  const zonePackages = packages.filter((p) => p.zone === zone);

  return (
    <div className={`conveyor-lane ${state.fault ? 'lane-fault' : ''}`}>
      <div className="lane-header">
        <h3 className="lane-title">Zone {zone}</h3>
        <SensorLamp active={state.occupied} fault={state.fault === 'SENSOR_FAILURE' ? state.fault : null} />
      </div>

      {/* Belt visualization */}
      <div className={`belt ${state.motor ? 'belt-moving' : ''} ${state.fault ? 'belt-faulted' : ''}`}>
        <div className="belt-track">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="belt-segment" />
          ))}
        </div>
        <div className="packages-on-belt">
          {zonePackages.map((pkg) => (
            <div
              key={pkg.id}
              className={`package ${state.motor ? 'package-moving' : ''}`}
              style={{ '--progress': `${pkg.progress}%` }}
            >
              <span className="pkg-id">#{pkg.id.toString().slice(-3)}</span>
            </div>
          ))}
        </div>
        {state.fault && (
          <div className="fault-overlay">
            <span className="fault-label">⚠ {state.fault.replace('_', ' ')}</span>
          </div>
        )}
      </div>

      <MotorPanel
        zone={zone}
        motor={state.motor}
        fault={state.fault}
        mode={mode}
        onToggle={() => onMotorToggle(zone)}
      />

      <div className="control-reason">
        <span className="reason-label">▶</span>
        <span className="reason-text">{decision?.reason || '—'}</span>
      </div>

      {/* Fault injection buttons */}
      <div className="fault-buttons">
        <button className="fault-btn jam" onClick={() => onFaultInject(zone, 'JAM')} disabled={!!state.fault}>
          JAM
        </button>
        <button className="fault-btn sensor" onClick={() => onFaultInject(zone, 'SENSOR_FAILURE')} disabled={!!state.fault}>
          SENSOR
        </button>
        <button className="fault-btn motor" onClick={() => onFaultInject(zone, 'MOTOR_FAILURE')} disabled={!!state.fault}>
          MOTOR
        </button>
      </div>
    </div>
  );
}
