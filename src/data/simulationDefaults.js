export const ZONES = ['A', 'B', 'C'];

export const INITIAL_ZONE_STATE = {
  A: { motor: false, sensor: true, occupied: false, fault: null, blocked: false },
  B: { motor: false, sensor: true, occupied: false, fault: null, blocked: false },
  C: { motor: false, sensor: true, occupied: false, fault: null, blocked: false },
};

export const FAULT_TYPES = {
  JAM: 'JAM',
  SENSOR_FAILURE: 'SENSOR_FAILURE',
  MOTOR_FAILURE: 'MOTOR_FAILURE',
  ESTOP: 'ESTOP',
};

export const FAULT_SEVERITY = {
  [FAULT_TYPES.JAM]: 'CRITICAL',
  [FAULT_TYPES.SENSOR_FAILURE]: 'WARNING',
  [FAULT_TYPES.MOTOR_FAILURE]: 'CRITICAL',
  [FAULT_TYPES.ESTOP]: 'CRITICAL',
};

export const MODE = {
  MANUAL: 'MANUAL',
  AUTO: 'AUTO',
};

export const SIM_TICK_MS = 1000;
export const MAX_EVENT_HISTORY = 50;
export const MAX_METRIC_HISTORY = 10;
