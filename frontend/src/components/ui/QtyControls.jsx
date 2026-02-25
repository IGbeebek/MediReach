export default function QtyControls({ qty, onIncrease, onDecrease, min = 0 }) {
  return (
    <div className="inline-flex items-center rounded-lg border border-charcoal/20 bg-cream">
      <button
        type="button"
        onClick={onDecrease}
        disabled={qty <= min}
        className="flex h-9 w-9 items-center justify-center rounded-l-lg text-charcoal/70 hover:bg-charcoal/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Decrease"
      >
        −
      </button>
      <span className="flex h-9 min-w-[2rem] items-center justify-center px-2 font-medium text-charcoal">
        {qty}
      </span>
      <button
        type="button"
        onClick={onIncrease}
        className="flex h-9 w-9 items-center justify-center rounded-r-lg text-charcoal/70 hover:bg-charcoal/10 transition-colors"
        aria-label="Increase"
      >
        +
      </button>
    </div>
  );
}
