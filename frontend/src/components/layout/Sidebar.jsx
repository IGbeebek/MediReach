import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import { ROLES } from '../../data/mockData';

const customerNav = [
  { to: '/customer', label: 'Dashboard', icon: '📊' },
  { to: '/customer/medicines', label: 'Medicines', icon: '💊' },
  { to: '/customer/cart', label: 'Cart', icon: '🛒', badge: 'cart' },
  { to: '/customer/prescriptions', label: 'Prescriptions', icon: '📄' },
  { to: '/customer/orders', label: 'My Orders', icon: '📋' },
  { to: '/customer/track', label: 'Track Order', icon: '🚚' },
  { to: '/customer/profile', label: 'Profile', icon: '👤' },
];

const pharmacistNav = [
  { to: '/pharmacist', label: 'Dashboard', icon: '📊' },
  { to: '/pharmacist/inventory', label: 'Inventory', icon: '📦' },
  { to: '/pharmacist/verify', label: 'Verify Prescriptions', icon: '✅', badge: 'rx' },
  { to: '/pharmacist/orders', label: 'Manage Orders', icon: '📋' },
];

const adminNav = [
  { to: '/admin', label: 'Dashboard', icon: '📊' },
  { to: '/admin/analytics', label: 'Analytics', icon: '📈' },
  { to: '/admin/users', label: 'User Management', icon: '👥' },
  { to: '/admin/medicines', label: 'Medicine Management', icon: '💊' },
  { to: '/admin/orders', label: 'All Orders', icon: '📋' },
];

function getNav(role) {
  if (role === ROLES.ADMIN) return adminNav;
  if (role === ROLES.PHARMACIST) return pharmacistNav;
  return customerNav;
}

export default function Sidebar({ badgeCounts = {} }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const nav = getNav(user.role);
  const base = user.role === ROLES.CUSTOMER ? '/customer' : user.role === ROLES.PHARMACIST ? '/pharmacist' : '/admin';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 rounded-lg bg-charcoal text-cream p-2"
        aria-label="Open menu"
      >
        ☰
      </button>
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-charcoal text-cream flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <Link to={base} className="font-fraunces text-xl font-semibold italic text-cream">
            MediReach
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="lg:hidden p-1 rounded hover:bg-white/10"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {nav.map((item) => {
            const isActive = location.pathname === item.to || (item.to !== base && location.pathname.startsWith(item.to + '/'));
            const count = item.badge === 'cart' ? badgeCounts.cart : item.badge === 'rx' ? badgeCounts.rx : null;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary text-white' : 'text-cream/80 hover:bg-white/10'
                }`}
              >
                <span>{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {count != null && count > 0 && (
                  <span className="rounded-full bg-soft-red px-2 py-0.5 text-xs text-white">{count}</span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2 bg-white/5">
            <Avatar name={user.name} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-cream/60 truncate">{user.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-2 w-full rounded-lg px-3 py-2 text-sm text-cream/80 hover:bg-soft-red/20 hover:text-soft-red transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
      {open && (
        <div
          className="fixed inset-0 bg-charcoal/50 z-40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}
    </>
  );
}
