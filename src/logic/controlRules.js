/**
 * PLC-style control rules for the conveyor system.
 * Each rule returns { motor: bool, reason: string } for each zone.
 */

export function evaluateZoneControl(zone, zones, mode) {
  const zoneState = zones[zone];
  const zoneOrder = ['A', 'B', 'C'];
  const idx = zoneOrder.indexOf(zone);
  const downstreamZone = zoneOrder[idx + 1];
  const downstream = downstreamZone ? zones[downstreamZone] : null;

  // INTERLOCK: E-Stop overrides everything
  if (zoneState.fault === 'ESTOP') {
    return { motor: false, reason: 'SAFE STOP: Emergency stop active' };
  }

  // INTERLOCK: Motor failure — cannot run
  if (zoneState.fault === 'MOTOR_FAILURE') {
    return { motor: false, reason: 'FAULT: Motor failure detected' };
  }

  // INTERLOCK: Sensor failure — stop for safety
  if (zoneState.fault === 'SENSOR_FAILURE') {
    return { motor: false, reason: 'FAULT: Sensor offline — stopping for safety' };
  }

  // INTERLOCK: Jam detected — safe stop
  if (zoneState.fault === 'JAM') {
    return { motor: false, reason: 'FAULT: Jam detected — awaiting reset' };
  }

  // INTERLOCK: Downstream zone is blocked or faulted
  if (downstream) {
    const downstreamBlocked =
      downstream.occupied && (downstream.fault !== null || !downstream.motor);
    if (downstreamBlocked) {
      return { motor: false, reason: `INTERLOCK: Zone ${downstreamZone} is blocked` };
    }
  }

  // MANUAL mode: do not auto-start motors
  if (mode === 'MANUAL') {
    return { motor: zoneState.motor, reason: 'MANUAL mode: operator controlled' };
  }

  // AUTO mode: run if zone has a package and no fault
  if (zoneState.occupied) {
    return { motor: true, reason: `AUTO: Package in Zone ${zone} — conveying` };
  }

  return { motor: false, reason: `AUTO: Zone ${zone} idle — no package` };
}

export function applyControlRules(zones, mode) {
  const decisions = {};
  for (const zone of ['A', 'B', 'C']) {
    decisions[zone] = evaluateZoneControl(zone, zones, mode);
  }
  return decisions;
}
