import { useState } from 'react';
import { ROLES } from '../../data/mockData';
import Modal from '../../components/ui/Modal';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';

export default function UserManagementPage() {
  const [tab, setTab] = useState('customers');
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState('');

  const users = [];
  const customers = users.filter((u) => u.role === ROLES.CUSTOMER);
  const pharmacists = users.filter((u) => u.role === ROLES.PHARMACIST);
  const list = tab === 'customers' ? customers : pharmacists;
  const filtered = filter
    ? list.filter((u) => u.name.toLowerCase().includes(filter.toLowerCase()) || u.email.toLowerCase().includes(filter.toLowerCase()))
    : list;

  return (
    <div className="space-y-6 page-enter">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-fraunces text-xl font-semibold text-charcoal">User management</h2>
        {tab === 'pharmacists' && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Add Pharmacist
          </button>
        )}
      </div>

      <div className="flex gap-2 p-1 rounded-lg bg-charcoal/5 border border-charcoal/10 w-fit">
        <button
          type="button"
          onClick={() => setTab('customers')}
          className={`rounded-md px-4 py-2 text-sm font-medium capitalize ${tab === 'customers' ? 'bg-primary text-white' : 'text-charcoal/70'}`}
        >
          Customers
        </button>
        <button
          type="button"
          onClick={() => setTab('pharmacists')}
          className={`rounded-md px-4 py-2 text-sm font-medium capitalize ${tab === 'pharmacists' ? 'bg-primary text-white' : 'text-charcoal/70'}`}
        >
          Pharmacists
        </button>
      </div>

      <input
        type="search"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Search by name or email..."
        className="w-full max-w-sm rounded-lg border border-charcoal/20 px-4 py-2 focus:border-primary outline-none"
      />

      <div className="rounded-xl border border-charcoal/10 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-charcoal/5 text-left">
              <th className="px-4 py-3 font-medium text-charcoal">User</th>
              <th className="px-4 py-3 font-medium text-charcoal">Email</th>
              <th className="px-4 py-3 font-medium text-charcoal">Join date</th>
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
                <td className="px-4 py-3 text-charcoal/70">{u.joinDate}</td>
                <td className="px-4 py-3"><Badge variant={u.status === 'active' ? 'primary' : 'soft-red'}>{u.status}</Badge></td>
                <td className="px-4 py-3">
                  <button type="button" className="text-amber font-medium hover:underline mr-2">Suspend</button>
                  <button type="button" className="text-soft-red font-medium hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="p-8 text-center text-charcoal/50">No users found.</div>}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Pharmacist">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">Name</label>
            <input type="text" className="w-full rounded-lg border border-charcoal/20 px-4 py-2 outline-none focus:border-primary" placeholder="Dr. Name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">Email</label>
            <input type="email" className="w-full rounded-lg border border-charcoal/20 px-4 py-2 outline-none focus:border-primary" placeholder="pharmacist@pharma.com" />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border border-charcoal/20 px-4 py-2 font-medium">Cancel</button>
            <button type="button" className="rounded-lg bg-primary px-4 py-2 font-medium text-white hover:bg-primary-dark">Add</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
