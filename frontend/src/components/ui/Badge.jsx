export default function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-charcoal/10 text-charcoal',
    primary: 'bg-primary/15 text-primary',
    amber: 'bg-amber/15 text-amber',
    'soft-red': 'bg-soft-red/10 text-soft-red',
    success: 'bg-primary/15 text-primary',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant] || variants.default} ${className}`}
    >
      {children}
    </span>
  );
}
