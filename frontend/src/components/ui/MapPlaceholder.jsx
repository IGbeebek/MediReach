export default function MapPlaceholder({ className = '' }) {
  return (
    <div
      className={`rounded-xl border border-charcoal/10 bg-charcoal/5 flex items-center justify-center min-h-[200px] ${className}`}
    >
      <div className="text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary animate-float">
          📍
        </div>
        <p className="mt-2 text-sm text-charcoal/60">Map placeholder — integrate Google Maps here</p>
      </div>
    </div>
  );
}
