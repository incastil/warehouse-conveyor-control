import { useState, useEffect, useRef, useCallback } from 'react';
import ConveyorLane from './components/ConveyorLane';
import AlarmPanel from './components/AlarmPanel';
import MetricsCard from './components/MetricsCard';
import DiagnosticsPanel from './components/DiagnosticsPanel';
import { INITIAL_ZONE_STATE, SIM_TICK_MS, MAX_EVENT_HISTORY, MODE } from './data/simulationDefaults';
import { applyControlRules } from './logic/controlRules';
import { injectFault, clearFault, clearAllFaults, buildAlarmEntry } from './logic/faultEngine';
import {
  createMetricsState,
  recordPackageCompleted,
  recordFault,
  updateThroughput,
  getAveragePackageTime,
  getThroughputPerMinute,
  recordDowntime,
} from './logic/metrics';
import './App.css';

let packageIdCounter = 1;

function createPackage(zone) {
  return { id: packageIdCounter++, zone, progress: 0, enteredAt: Date.now() };
}

function logEvent(type, message) {
  return {
    id: `${Date.now()}-${Math.random()}`,
    timestamp: new Date().toLocaleTimeString(),
    type,
    message,
  };
}

export default function App() {
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState(MODE.AUTO);
  const [zones, setZones] = useState(INITIAL_ZONE_STATE);
  const [packages, setPackages] = useState([]);
  const [alarms, setAlarms] = useState([]);
  const [eventLog, setEventLog] = useState([]);
  const [metrics, setMetrics] = useState(createMetricsState());
  const [decisions, setDecisions] = useState({});
  const [activeView, setActiveView] = useState('dashboard');

  const zonesRef = useRef(zones);
  const metricsRef = useRef(metrics);

  zonesRef.current = zones;
  metricsRef.current = metrics;

  const addEvent = useCallback((type, message) => {
    setEventLog((prev) => [...prev, logEvent(type, message)].slice(-MAX_EVENT_HISTORY));
  }, []);

  const addAlarm = useCallback((zone, faultType) => {
    const entry = buildAlarmEntry(zone, faultType, new Date().toLocaleTimeString());
    setAlarms((prev) => [...prev, entry]);
  }, []);

  // Main simulation tick
  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      setZones((prevZones) => {
        const ctrl = applyControlRules(prevZones, mode);
        setDecisions(ctrl);
        const newZones = { ...prevZones };
        for (const zone of ['A', 'B', 'C']) {
          newZones[zone] = { ...newZones[zone], motor: ctrl[zone].motor };
        }
        return newZones;
      });

      setPackages((prevPkgs) => {
        const currentZones = zonesRef.current;
        const updated = [];
        let metricsUpdates = { ...metricsRef.current };

        for (const pkg of prevPkgs) {
          const zoneState = currentZones[pkg.zone];
          if (!zoneState || !zoneState.motor) {
            updated.push(pkg);
            continue;
          }

          const newProgress = pkg.progress + 25;
          if (newProgress >= 100) {
            const zoneOrder = ['A', 'B', 'C'];
            const idx = zoneOrder.indexOf(pkg.zone);
            if (idx < zoneOrder.length - 1) {
              updated.push({ ...pkg, zone: zoneOrder[idx + 1], progress: 0 });
            } else {
              const elapsed = Date.now() - pkg.enteredAt;
              metricsUpdates = recordPackageCompleted(metricsUpdates, elapsed);
            }
          } else {
            updated.push({ ...pkg, progress: newProgress });
          }
        }

        // Update occupancy
        setZones((prevZones) => {
          const z = { ...prevZones };
          for (const zoneKey of ['A', 'B', 'C']) {
            z[zoneKey] = { ...z[zoneKey], occupied: updated.some((p) => p.zone === zoneKey) };
          }
          return z;
        });

        setMetrics(updateThroughput(metricsUpdates));
        return updated;
      });

      // Spawn new package in Zone A
      setPackages((prev) => {
        const inZoneA = prev.filter((p) => p.zone === 'A');
        const currentZones = zonesRef.current;
        if (inZoneA.length === 0 && !currentZones.A.fault) {
          return [...prev, createPackage('A')];
        }
        return prev;
      });
    }, SIM_TICK_MS);

    return () => clearInterval(interval);
  }, [running, mode]);

  // Downtime tracking
  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      const faulted = Object.values(zonesRef.current).some((z) => z.fault !== null);
      if (faulted) {
        setMetrics((prev) => recordDowntime(prev, 1));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [running]);

  const handleStart = () => {
    setRunning(true);
    addEvent('start', 'Conveyor system started');
    setMetrics((prev) => ({ ...prev, startedAt: Date.now(), lastThroughputCheck: Date.now() }));
  };

  const handlePause = () => {
    setRunning(false);
    setZones((prev) => {
      const z = { ...prev };
      for (const zone of ['A', 'B', 'C']) {
        z[zone] = { ...z[zone], motor: false };
      }
      return z;
    });
    setDecisions({});
    addEvent('stop', 'Conveyor system paused');
  };

  const handleReset = () => {
    setRunning(false);
    setZones(INITIAL_ZONE_STATE);
    setPackages([]);
    setAlarms([]);
    setEventLog([logEvent('reset', 'System reset — all zones cleared')]);
    setMetrics(createMetricsState());
    setDecisions({});
  };

  const handleFaultInject = (zone, faultType) => {
    setZones((prev) => injectFault(prev, zone, faultType));
    addEvent('fault', `Zone ${zone}: ${faultType.replace(/_/g, ' ')} injected`);
    addAlarm(zone, faultType);
    setMetrics((prev) => recordFault(prev));
  };

  const handleResetFault = (zone) => {
    setZones((prev) => clearFault(prev, zone));
    addEvent('recovery', `Zone ${zone}: Fault cleared — system resumed`);
  };

  const handleMotorToggle = (zone) => {
    setZones((prev) => ({
      ...prev,
      [zone]: { ...prev[zone], motor: !prev[zone].motor },
    }));
  };

  const handleEstop = () => {
    setRunning(false);
    const zones = ['A', 'B', 'C'];
    setZones((prev) => {
      let z = { ...prev };
      for (const zone of zones) {
        z = injectFault(z, zone, 'ESTOP');
      }
      return z;
    });
    for (const zone of zones) addAlarm(zone, 'ESTOP');
    addEvent('fault', 'EMERGENCY STOP — all zones halted');
    setMetrics((prev) => recordFault(prev));
  };

  const handleAcknowledgeAlarm = (id) => {
    setAlarms((prev) => prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)));
  };

  const handleClearAlarms = () => setAlarms([]);

  const handleFullReset = () => {
    setZones((prev) => clearAllFaults(prev));
    addEvent('recovery', 'Full system reset — all faults cleared');
  };

  const hasAnyFault = Object.values(zones).some((z) => z.fault !== null);
  const activeAlarmCount = alarms.filter((a) => !a.acknowledged).length;

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">⬡</span>
            <div>
              <h1 className="app-title">Warehouse Conveyor Control System</h1>
              <p className="app-subtitle">Automation Control Dashboard · v1.0</p>
            </div>
          </div>
        </div>
        <div className="header-right">
          <div className={`system-status ${running ? 'status-running' : hasAnyFault ? 'status-fault' : 'status-idle'}`}>
            <span className="status-dot" />
            {running ? 'RUNNING' : hasAnyFault ? 'FAULT' : 'IDLE'}
          </div>
          <div className="mode-toggle">
            <button className={`mode-btn ${mode === MODE.AUTO ? 'active' : ''}`} onClick={() => setMode(MODE.AUTO)}>AUTO</button>
            <button className={`mode-btn ${mode === MODE.MANUAL ? 'active' : ''}`} onClick={() => setMode(MODE.MANUAL)}>MANUAL</button>
          </div>
        </div>
      </header>

      <div className="toolbar">
        <div className="toolbar-left">
          {!running ? (
            <button className="btn btn-start" onClick={handleStart} disabled={hasAnyFault}>▶ START</button>
          ) : (
            <button className="btn btn-pause" onClick={handlePause}>⏸ PAUSE</button>
          )}
          <button className="btn btn-reset" onClick={handleReset}>↺ RESET</button>
          {hasAnyFault && (
            <button className="btn btn-clear-faults" onClick={handleFullReset}>✓ CLEAR FAULTS</button>
          )}
        </div>
        <div className="toolbar-right">
          <button className="btn btn-estop" onClick={handleEstop}>⚠ E-STOP</button>
          <button
            className={`btn btn-view ${activeView === 'diagnostics' ? 'active' : ''}`}
            onClick={() => setActiveView(activeView === 'dashboard' ? 'diagnostics' : 'dashboard')}
          >
            {activeView === 'dashboard' ? '🔍 Diagnostics' : '◀ Dashboard'}
            {activeAlarmCount > 0 && activeView === 'dashboard' && (
              <span className="alarm-badge-small">{activeAlarmCount}</span>
            )}
          </button>
        </div>
      </div>

      <div className="metrics-bar">
        <MetricsCard label="Packages Completed" value={metrics.packagesCompleted} highlight />
        <MetricsCard label="Throughput" value={getThroughputPerMinute(metrics)} unit="pkg/min" />
        <MetricsCard label="Avg. Cycle Time" value={getAveragePackageTime(metrics)} unit="sec" />
        <MetricsCard label="Total Downtime" value={metrics.totalDowntimeSeconds} unit="sec" />
        <MetricsCard label="Fault Count" value={metrics.faultCount} />
        <MetricsCard
          label="Trend"
          value={
            metrics.throughputHistory.length > 1
              ? metrics.throughputHistory.at(-1).rate >= metrics.throughputHistory.at(-2).rate
                ? '▲ Up'
                : '▼ Down'
              : '—'
          }
        />
      </div>

      {activeView === 'dashboard' ? (
        <div className="main-content">
          <div className="conveyor-section">
            <div className="conveyor-flow">
              <div className="flow-label">INPUT →</div>
              {['A', 'B', 'C'].map((zone, i) => (
                <div key={zone} className="zone-wrapper">
                  <ConveyorLane
                    zone={zone}
                    state={zones[zone]}
                    decision={decisions[zone]}
                    mode={mode}
                    packages={packages}
                    onMotorToggle={handleMotorToggle}
                    onFaultInject={handleFaultInject}
                  />
                  {i < 2 && <div className="zone-arrow">→</div>}
                </div>
              ))}
              <div className="flow-label">→ OUTPUT</div>
            </div>

            {metrics.throughputHistory.length > 0 && (
              <div className="throughput-chart">
                <h3 className="chart-title">Throughput History</h3>
                <div className="chart-bars">
                  {metrics.throughputHistory.map((pt, i) => (
                    <div key={i} className="chart-bar-col">
                      <div
                        className="chart-bar"
                        style={{ height: `${Math.min(pt.rate * 10, 80)}px` }}
                        title={`${pt.rate} pkg/min @ ${pt.time}`}
                      />
                      <span className="chart-bar-label">{pt.rate}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="side-panel">
            <AlarmPanel
              alarms={alarms}
              onAcknowledge={handleAcknowledgeAlarm}
              onClearAll={handleClearAlarms}
            />
          </div>
        </div>
      ) : (
        <div className="main-content">
          <DiagnosticsPanel
            zones={zones}
            eventLog={eventLog}
            onResetFault={handleResetFault}
          />
        </div>
      )}
    </div>
  );
}
