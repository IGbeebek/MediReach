export default function ProgressBar({ value, max = 100, showLabel = true, className = '' }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const isLow = pct < 25;
  const isMid = pct >= 25 && pct < 60;
  return (
    <div className={className}>
      <div className="h-2 w-full rounded-full bg-charcoal/10 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isLow ? 'bg-soft-red' : isMid ? 'bg-amber' : 'bg-primary'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <p className="mt-1 text-xs text-charcoal/60">
          {value} / {max} {showLabel ? `(${pct}%)` : ''}
        </p>
      )}
    </div>
  );
}
