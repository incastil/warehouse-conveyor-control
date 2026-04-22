# Warehouse Conveyor Control System

> A portfolio project simulating an industrial warehouse conveyor/sortation system with PLC-style control logic, fault handling, real-time metrics, and a SCADA-inspired dashboard.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)
![Status](https://img.shields.io/badge/status-active-brightgreen)

---

## Overview

This project simulates a warehouse conveyor control system inspired by industrial automation environments (Amazon Robotics / RME-style). It demonstrates control logic, fault handling, monitoring, and performance tracking concepts relevant to automation engineering and robotics coursework.

---

## Features

### Week 1 — Core Simulation Loop
- 3 conveyor zones (Zone A → Zone B → Zone C)
- Each zone tracks sensor state, motor state, and occupancy
- Packages spawn at Zone A and travel through the full line in real time
- Start / Pause / Reset controls

### Week 2 — PLC-Style Control Logic
- Rule-based control engine (`src/logic/controlRules.js`)
- **Interlocks**: upstream zone stops when downstream is blocked
- **Safe-stop state**: system halts on any active fault
- **Manual / Automatic mode**: manual lets operators toggle motors directly
- Active rule reason displayed per zone (e.g. "INTERLOCK: Zone B is blocked")

### Week 3 — Faults, Alarms & Diagnostics
- Fault injection buttons per zone: **JAM**, **SENSOR FAILURE**, **MOTOR FAILURE**
- **Emergency Stop (E-STOP)** halts all zones simultaneously
- Alarm panel with timestamps, severity labels (CRITICAL / WARNING), and ACK flow
- Event log with typed entries: START, STOP, FAULT, RECOVERY, RESET
- Diagnostics view showing zone-by-zone health
- Critical faults require explicit reset before the system can restart

### Week 4 — Metrics & Operational Visibility
- Packages completed counter
- Throughput (packages per minute) with live trend chart
- Average cycle time per package through the full line
- Total downtime seconds while any zone is faulted
- Fault event count

### Week 5 — Polish
- Industrial SCADA-style dark UI (monospace font, status LEDs, belt animation)
- Fully modular architecture — logic layer separated from UI layer
- Clean component structure ready for extension

---

## Architecture

```
src/
├── data/
│   └── simulationDefaults.js   # Constants: zone state, fault types, tick rate
├── logic/
│   ├── controlRules.js         # PLC-style interlock rules (pure functions)
│   ├── faultEngine.js          # Fault injection, alarm building, reset logic
│   └── metrics.js              # Throughput, downtime, cycle time calculations
├── components/
│   ├── ConveyorLane.jsx        # Zone visualization: belt, packages, faults
│   ├── SensorLamp.jsx          # LED-style sensor status indicator
│   ├── MotorPanel.jsx          # Motor state display with manual toggle
│   ├── AlarmPanel.jsx          # Active/acknowledged alarm list
│   ├── MetricsCard.jsx         # Single metric display card
│   └── DiagnosticsPanel.jsx    # Zone health table + event log
├── App.jsx                     # Main state orchestrator
└── App.css                     # Industrial SCADA-style theme
```

### Control Flow

```
Simulation Tick (1 Hz)
    │
    ▼
applyControlRules(zones, mode)
    │
    ├── Check faults  (ESTOP > MOTOR_FAILURE > SENSOR_FAILURE > JAM)
    ├── Check downstream interlocks
    ├── AUTO mode:   run if occupied and fault-free
    └── MANUAL mode: pass through operator state
    │
    ▼
Update motor states → Advance packages → Update occupancy → Record metrics
```

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Usage Guide

| Action | How |
|--------|-----|
| Start simulation | Click **▶ START** |
| Pause | Click **⏸ PAUSE** |
| Inject a fault | Click **JAM / SENSOR / MOTOR** on any zone |
| Emergency stop | Click **⚠ E-STOP** |
| Clear faults | Click **✓ CLEAR FAULTS** or use Diagnostics view |
| Switch mode | **AUTO / MANUAL** toggle in header |
| Manual motor control | Switch to MANUAL, then START/STOP per zone |
| View event log | Click **🔍 Diagnostics** |
| Acknowledge alarm | Click **ACK** in Alarm Panel |

---

## Stretch Goals (Future)

- [ ] Multiple conveyor lines with a merge/sort point
- [ ] Variable speed control per zone
- [ ] Maintenance mode with lockout/tagout simulation
- [ ] Simulated barcode scanning and sort destinations
- [ ] SCADA overview screen with all zones at once
- [ ] Unit tests for `controlRules.js` and `faultEngine.js`
- [ ] Vercel / Netlify live demo deployment

---

## Relevance to Automation Engineering

This project demonstrates skills directly applicable to Reliability Maintenance Engineering (RME) and automation roles:

- **Control logic** — PLC-style interlock rules, safe-stop states, mode transitions
- **Fault management** — Alarm severity, acknowledgment workflows, event logging
- **Operational metrics** — Throughput, downtime, cycle time (warehouse KPIs)
- **Software structure** — Modular, testable logic decoupled from UI
- **Robotics integration** — Foundation for adding robot arm or AGV simulation nodes

---

*Built as a portfolio project for an Automation Engineer / RME-style GitHub profile.*
