export default function SkeletonLoader({ className = '', lines = 1 }) {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 rounded bg-charcoal/10 mt-2"
          style={{ width: i === lines - 1 && lines > 1 ? '70%' : '100%' }}
        />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-charcoal/10 bg-white p-5 animate-pulse">
      <div className="h-10 w-10 rounded-lg bg-charcoal/10" />
      <div className="mt-3 h-4 w-3/4 rounded bg-charcoal/10" />
      <div className="mt-2 h-3 w-1/2 rounded bg-charcoal/10" />
      <div className="mt-4 h-8 w-20 rounded bg-charcoal/10" />
    </div>
  );
}
