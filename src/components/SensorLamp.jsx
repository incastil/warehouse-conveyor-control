export default function SensorLamp({ active, fault }) {
  let color = 'sensor-off';
  if (fault) color = 'sensor-fault';
  else if (active) color = 'sensor-on';

  return (
    <div className={`sensor-lamp ${color}`} title={fault ? `Fault: ${fault}` : active ? 'Sensor: TRIGGERED' : 'Sensor: OK'}>
      <div className="lamp-dot" />
      <span className="lamp-label">{fault ? 'FLT' : active ? 'ON' : 'OK'}</span>
    </div>
  );
}
