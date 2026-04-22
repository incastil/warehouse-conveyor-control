export default function MetricsCard({ label, value, unit, highlight }) {
  return (
    <div className={`metrics-card ${highlight ? 'metrics-highlight' : ''}`}>
      <span className="metrics-label">{label}</span>
      <div className="metrics-value-row">
        <span className="metrics-value">{value}</span>
        {unit && <span className="metrics-unit">{unit}</span>}
      </div>
    </div>
  );
}
