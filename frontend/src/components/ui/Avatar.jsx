export default function Avatar({ src, name, size = 'md' }) {
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-sm' : size === 'lg' ? 'w-14 h-14 text-xl' : 'w-10 h-10 text-base';
  const initial = name ? name.trim().split(/\s+/).map((n) => n[0]).join('').slice(0, 2).toUpperCase() : '?';
  return (
    <div
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-fraunces font-semibold overflow-hidden`}
    >
      {src ? <img src={src} alt={name || 'Avatar'} className="w-full h-full object-cover" /> : initial}
    </div>
  );
}
