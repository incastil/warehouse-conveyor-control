import { FAULT_TYPES, FAULT_SEVERITY } from '../data/simulationDefaults';

export function injectFault(zones, zone, faultType) {
  return {
    ...zones,
    [zone]: {
      ...zones[zone],
      fault: faultType,
      motor: false,
    },
  };
}

export function clearFault(zones, zone) {
  return {
    ...zones,
    [zone]: {
      ...zones[zone],
      fault: null,
    },
  };
}

export function clearAllFaults(zones) {
  const cleared = {};
  for (const z of Object.keys(zones)) {
    cleared[z] = { ...zones[z], fault: null, motor: false };
  }
  return cleared;
}

export function hasActiveFault(zones) {
  return Object.values(zones).some((z) => z.fault !== null);
}

export function getActiveFaults(zones) {
  const faults = [];
  for (const [zone, state] of Object.entries(zones)) {
    if (state.fault) {
      faults.push({
        zone,
        type: state.fault,
        severity: FAULT_SEVERITY[state.fault] || 'WARNING',
      });
    }
  }
  return faults;
}

export function requiresResetAfterFault(faultType) {
  return (
    faultType === FAULT_TYPES.JAM ||
    faultType === FAULT_TYPES.MOTOR_FAILURE ||
    faultType === FAULT_TYPES.ESTOP
  );
}

export function buildAlarmEntry(zone, faultType, timestamp) {
  return {
    id: `${Date.now()}-${Math.random()}`,
    timestamp,
    zone,
    type: faultType,
    severity: FAULT_SEVERITY[faultType] || 'WARNING',
    message: getFaultMessage(zone, faultType),
    acknowledged: false,
  };
}

function getFaultMessage(zone, faultType) {
  const messages = {
    JAM: `Zone ${zone}: Package jam detected — conveyor stopped`,
    SENSOR_FAILURE: `Zone ${zone}: Sensor offline — check wiring`,
    MOTOR_FAILURE: `Zone ${zone}: Motor failure — maintenance required`,
    ESTOP: `Zone ${zone}: Emergency stop triggered`,
  };
  return messages[faultType] || `Zone ${zone}: Unknown fault`;
}
