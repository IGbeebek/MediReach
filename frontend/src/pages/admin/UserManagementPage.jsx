import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import Modal from '../../components/ui/Modal';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';

export default function UserManagementPage() {
  const { accessToken } = useAuth();
  const { addToast } = useToast();

  const [tab, setTab] = useState('customer');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Add Pharmacist modal
  const [modalOpen, setModalOpen] = useState(false);
  const [pharmaForm, setPharmaForm] = useState({ name: '', email: '', password: '', phone: '', address: '' });
  const [pharmaLoading, setPharmaLoading] = useState(false);

  // Delete confirmation modal
  const [deleteModal, setDeleteModal] = useState({ open: false, user: null });
  const [deleteLoading, setDeleteLoading] = useState(false);

  /* ── Fetch users whenever tab or page changes ─────────────────── */
  const fetchUsers = () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', page);
    params.set('limit', 20);
    params.set('role', tab);

    api.getAllUsers(params.toString(), accessToken)
      .then((res) => {
        setUsers(res.data?.users ?? []);
        setTotalPages(res.data?.pagination?.totalPages ?? 1);
      })
      .catch(() => addToast('Failed to load users', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, [accessToken, tab, page]);

  /* ── Client-side search filter ────────────────────────────────── */
  const filtered = filter
    ? users.filter(
        (u) =>
          u.name?.toLowerCase().includes(filter.toLowerCase()) ||
          u.email?.toLowerCase().includes(filter.toLowerCase())
      )
    : users;

  /* ── Toggle user status (active ↔ blocked) ────────────────────── */
  const toggleStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'blocked' : 'active';
    try {
      await api.updateUserStatus(user.id, { status: newStatus }, accessToken);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
      );
      addToast(`${user.name} has been ${newStatus === 'blocked' ? 'suspended' : 'activated'}`);
    } catch (err) {
      addToast(err.message || 'Failed to update user status', 'error');
    }
  };

  /* ── Delete user ──────────────────────────────────────────────── */
  const confirmDelete = async () => {
    if (!deleteModal.user) return;
    setDeleteLoading(true);
    try {
      await api.deleteUser(deleteModal.user.id, accessToken);
      setUsers((prev) => prev.filter((u) => u.id !== deleteModal.user.id));
      addToast(`${deleteModal.user.name} has been deleted`);
      setDeleteModal({ open: false, user: null });
    } catch (err) {
      addToast(err.message || 'Failed to delete user', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  /* ── Add Pharmacist ───────────────────────────────────────────── */
  const handleAddPharmacist = async () => {
    if (!pharmaForm.name.trim() || !pharmaForm.email.trim() || !pharmaForm.password.trim()) {
      addToast('Name, email, and password are required', 'error');
      return;
    }
    setPharmaLoading(true);
    try {
      const res = await api.createPharmacist(pharmaForm, accessToken);
      addToast('Pharmacist added successfully');
      setModalOpen(false);
      setPharmaForm({ name: '', email: '', password: '', phone: '', address: '' });
      // If on pharmacist tab, add to list
      if (tab === 'pharmacist') {
        setUsers((prev) => [res.data?.user, ...prev].filter(Boolean));
      }
    } catch (err) {
      addToast(err.message || 'Failed to add pharmacist', 'error');
    } finally {
      setPharmaLoading(false);
    }
  };

  return (
    <div className="space-y-6 page-enter">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-fraunces text-xl font-semibold text-charcoal">User management</h2>
        {tab === 'pharmacist' && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Add Pharmacist
          </button>
        )}
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────── */}
      <div className="flex gap-2 p-1 rounded-lg bg-charcoal/5 border border-charcoal/10 w-fit">
        <button
          type="button"
          onClick={() => { setTab('customer'); setPage(1); }}
          className={`rounded-md px-4 py-2 text-sm font-medium capitalize ${tab === 'customer' ? 'bg-primary text-white' : 'text-charcoal/70'}`}
        >
          Customers
        </button>
        <button
          type="button"
          onClick={() => { setTab('pharmacist'); setPage(1); }}
          className={`rounded-md px-4 py-2 text-sm font-medium capitalize ${tab === 'pharmacist' ? 'bg-primary text-white' : 'text-charcoal/70'}`}
        >
          Pharmacists
        </button>
      </div>

      {/* ── Search ──────────────────────────────────────────────── */}
      <input
        type="search"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Search by name or email..."
        className="w-full max-w-sm rounded-lg border border-charcoal/20 px-4 py-2 focus:border-primary outline-none"
      />

      {/* ── Table ───────────────────────────────────────────────── */}
      {loading ? (
        <div className="py-12 text-center text-charcoal/60">Loading…</div>
      ) : (
        <>
          <div className="rounded-xl border border-charcoal/10 bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-charcoal/5 text-left">
                  <th className="px-4 py-3 font-medium text-charcoal">User</th>
                  <th className="px-4 py-3 font-medium text-charcoal">Email</th>
                  <th className="px-4 py-3 font-medium text-charcoal hidden sm:table-cell">Phone</th>
                  <th className="px-4 py-3 font-medium text-charcoal">Joined</th>
                  <th className="px-4 py-3 font-medium text-charcoal">Status</th>
                  <th className="px-4 py-3 font-medium text-charcoal">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-t border-charcoal/5">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} size="sm" />
                        <span className="font-medium text-charcoal">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-charcoal/70">{u.email}</td>
                    <td className="px-4 py-3 text-charcoal/70 hidden sm:table-cell">{u.phone || '—'}</td>
                    <td className="px-4 py-3 text-charcoal/70">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={u.status === 'active' ? 'primary' : 'soft-red'}>
                        {u.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggleStatus(u)}
                        className={`font-medium hover:underline mr-3 ${u.status === 'active' ? 'text-amber-600' : 'text-primary'}`}
                      >
                        {u.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteModal({ open: true, user: u })}
                        className="text-soft-red font-medium hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="p-8 text-center text-charcoal/50">
                No {tab === 'customer' ? 'customers' : 'pharmacists'} found.
              </div>
            )}
          </div>

          {/* ── Pagination ───────────────────────────────────────── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border border-charcoal/20 px-3 py-1.5 text-sm disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-charcoal/60">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-charcoal/20 px-3 py-1.5 text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* ── Delete Confirmation Modal ────────────────────────────── */}
      <Modal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, user: null })}
        title="Delete user"
      >
        <p className="text-sm text-charcoal/70 mb-4">
          Are you sure you want to permanently delete{' '}
          <span className="font-semibold text-charcoal">{deleteModal.user?.name}</span>?
          This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setDeleteModal({ open: false, user: null })}
            className="rounded-lg border border-charcoal/20 px-4 py-2 font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirmDelete}
            disabled={deleteLoading}
            className="rounded-lg bg-soft-red px-4 py-2 font-medium text-white hover:bg-soft-red/90 disabled:opacity-60"
          >
            {deleteLoading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </Modal>

      {/* ── Add Pharmacist Modal ─────────────────────────────────── */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Pharmacist">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">Name *</label>
            <input
              type="text"
              value={pharmaForm.name}
              onChange={(e) => setPharmaForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-lg border border-charcoal/20 px-4 py-2 outline-none focus:border-primary"
              placeholder="Dr. Name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">Email *</label>
            <input
              type="email"
              value={pharmaForm.email}
              onChange={(e) => setPharmaForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full rounded-lg border border-charcoal/20 px-4 py-2 outline-none focus:border-primary"
              placeholder="pharmacist@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">Password *</label>
            <input
              type="password"
              value={pharmaForm.password}
              onChange={(e) => setPharmaForm((f) => ({ ...f, password: e.target.value }))}
              className="w-full rounded-lg border border-charcoal/20 px-4 py-2 outline-none focus:border-primary"
              placeholder="Min. 8 characters"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">Phone</label>
            <input
              type="text"
              value={pharmaForm.phone}
              onChange={(e) => setPharmaForm((f) => ({ ...f, phone: e.target.value }))}
              className="w-full rounded-lg border border-charcoal/20 px-4 py-2 outline-none focus:border-primary"
              placeholder="98XXXXXXXX"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">Address</label>
            <input
              type="text"
              value={pharmaForm.address}
              onChange={(e) => setPharmaForm((f) => ({ ...f, address: e.target.value }))}
              className="w-full rounded-lg border border-charcoal/20 px-4 py-2 outline-none focus:border-primary"
              placeholder="Kathmandu, Nepal"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-lg border border-charcoal/20 px-4 py-2 font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddPharmacist}
              disabled={pharmaLoading}
              className="rounded-lg bg-primary px-4 py-2 font-medium text-white hover:bg-primary-dark disabled:opacity-60"
            >
              {pharmaLoading ? 'Adding…' : 'Add Pharmacist'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
