export default function MetricCard({ label, icon, value, trend, trendUp, info }) {
  return (
    <div className="metric-card">
      <div className="metric-card__header">
        <span className="metric-card__label">{label}</span>
        <span className="metric-card__icon">{icon}</span>
      </div>
      <div className="metric-card__value">{value}</div>
      {trend && (
        <div className={`metric-card__trend ${trendUp ? 'trend--up' : 'trend--down'}`}>
          {trendUp ? '↗' : '↘'} {trend}
        </div>
      )}
      {info && <div className="metric-card__info">⏱ {info}</div>}
    </div>
  );
}
