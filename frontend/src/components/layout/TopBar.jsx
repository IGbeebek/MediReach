import { useState } from 'react';
import Avatar from '../ui/Avatar';
import { useAuth } from '../../context/AuthContext';

export default function TopBar({ title, searchPlaceholder = 'Search...', onSearch }) {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch?.(search);
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-charcoal/10 bg-cream/95 backdrop-blur px-4 py-3 lg:pl-4 lg:pr-6">
      <h1 className="font-fraunces text-xl font-semibold text-charcoal truncate">{title}</h1>
      <div className="flex items-center gap-3 flex-1 justify-end max-w-2xl">
        {onSearch && (
          <form onSubmit={handleSearch} className="hidden sm:block flex-1 max-w-xs">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-lg border border-charcoal/20 bg-white px-3 py-2 text-sm placeholder:text-charcoal/50 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
            />
          </form>
        )}
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative rounded-lg p-2 text-charcoal/70 hover:bg-charcoal/10 transition-colors"
            aria-label="Notifications"
          >
            🔔
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-soft-red" />
          </button>
          {notifOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} aria-hidden />
              <div className="absolute right-0 top-full mt-1 w-72 rounded-xl border border-charcoal/10 bg-white py-2 shadow-card z-20">
                <p className="px-4 py-2 text-sm font-medium text-charcoal">Notifications</p>
                <p className="px-4 py-4 text-sm text-charcoal/50">No new notifications.</p>
              </div>
            </>
          )}
        </div>
        <Avatar name={user?.name} size="sm" />
      </div>
    </header>
  );
}
