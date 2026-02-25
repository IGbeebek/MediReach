export default function EmptyState({ icon = '📦', title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-charcoal/20 bg-charcoal/[0.02] py-12 px-6 text-center">
      <span className="text-4xl mb-3">{icon}</span>
      <h3 className="font-fraunces text-lg font-semibold text-charcoal">{title}</h3>
      {description && <p className="mt-1 text-sm text-charcoal/60 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
