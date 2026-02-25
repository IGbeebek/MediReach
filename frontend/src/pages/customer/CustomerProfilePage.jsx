import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../../components/ui/Avatar';
import { useToast } from '../../context/ToastContext';

export default function CustomerProfilePage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [password, setPassword] = useState({ current: '', new: '', confirm: '' });
  const [notifications, setNotifications] = useState(true);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    addToast('Profile updated');
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (password.new !== password.confirm) {
      addToast('Passwords do not match', 'error');
      return;
    }
    addToast('Password updated');
    setPassword({ current: '', new: '', confirm: '' });
  };

  return (
    <div className="max-w-2xl space-y-8 page-enter">
      <div className="flex items-center gap-4">
        <Avatar name={user?.name} size="lg" />
        <div>
          <h2 className="font-fraunces text-xl font-semibold text-charcoal">{user?.name}</h2>
          <p className="text-charcoal/60">{user?.email}</p>
        </div>
      </div>

      <form onSubmit={handleSaveProfile} className="rounded-xl border border-charcoal/10 bg-white p-6 space-y-4">
        <h3 className="font-fraunces font-semibold text-charcoal">Personal info</h3>
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full rounded-lg border border-charcoal/20 px-4 py-2.5 focus:border-primary outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="w-full rounded-lg border border-charcoal/20 px-4 py-2.5 focus:border-primary outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">Phone</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className="w-full rounded-lg border border-charcoal/20 px-4 py-2.5 focus:border-primary outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">Address</label>
          <textarea
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            rows={2}
            className="w-full rounded-lg border border-charcoal/20 px-4 py-2.5 focus:border-primary outline-none resize-none"
          />
        </div>
        <button type="submit" className="rounded-lg bg-primary px-6 py-2.5 font-medium text-white hover:bg-primary-dark">
          Save changes
        </button>
      </form>

      <form onSubmit={handleChangePassword} className="rounded-xl border border-charcoal/10 bg-white p-6 space-y-4">
        <h3 className="font-fraunces font-semibold text-charcoal">Change password</h3>
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">Current password</label>
          <input
            type="password"
            value={password.current}
            onChange={(e) => setPassword((p) => ({ ...p, current: e.target.value }))}
            className="w-full rounded-lg border border-charcoal/20 px-4 py-2.5 focus:border-primary outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">New password</label>
          <input
            type="password"
            value={password.new}
            onChange={(e) => setPassword((p) => ({ ...p, new: e.target.value }))}
            className="w-full rounded-lg border border-charcoal/20 px-4 py-2.5 focus:border-primary outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">Confirm new password</label>
          <input
            type="password"
            value={password.confirm}
            onChange={(e) => setPassword((p) => ({ ...p, confirm: e.target.value }))}
            className="w-full rounded-lg border border-charcoal/20 px-4 py-2.5 focus:border-primary outline-none"
          />
        </div>
        <button type="submit" className="rounded-lg bg-primary px-6 py-2.5 font-medium text-white hover:bg-primary-dark">
          Update password
        </button>
      </form>

      <div className="rounded-xl border border-charcoal/10 bg-white p-6">
        <h3 className="font-fraunces font-semibold text-charcoal mb-3">Notification preferences</h3>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={notifications}
            onChange={(e) => setNotifications(e.target.checked)}
            className="rounded text-primary"
          />
          <span className="text-sm text-charcoal">Email me order updates and offers</span>
        </label>
      </div>
    </div>
  );
}
