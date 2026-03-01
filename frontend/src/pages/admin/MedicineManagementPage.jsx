import { useState } from 'react';
import { MEDICINE_CATEGORIES } from '../../data/constants';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/ui/Modal';

export default function MedicineManagementPage() {
  const { addToast } = useToast();
  const [list, setList] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '', brand: '', category: MEDICINE_CATEGORIES[0], price: '', stock: '', expiry: '', prescriptionRequired: false,
  });
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState('name');

  const filtered = [...list]
    .filter((m) => !filter || m.category === filter)
    .sort((a, b) => (sort === 'name' ? a.name.localeCompare(b.name) : a.price - b.price));

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', brand: '', category: MEDICINE_CATEGORIES[0], price: '', stock: '', expiry: '', prescriptionRequired: false });
    setModalOpen(true);
  };

  const openEdit = (m) => {
    setEditing(m);
    setForm({
      name: m.name, brand: m.brand, category: m.category, price: String(m.price), stock: String(m.stock), expiry: m.expiry, prescriptionRequired: m.prescriptionRequired,
    });
    setModalOpen(true);
  };

  const save = () => {
    if (editing) {
      setList((prev) =>
        prev.map((item) =>
          item.id === editing.id ? { ...item, ...form, price: Number(form.price), stock: Number(form.stock) } : item
        )
      );
      addToast('Medicine updated successfully');
    } else {
      setList((prev) => [
        ...prev,
        { id: 'm' + (prev.length + 1), ...form, price: Number(form.price), stock: Number(form.stock), soldCount: 0, description: '' },
      ]);
      addToast('Medicine added successfully');
    }
    setModalOpen(false);
  };

  const remove = (id) => {
    setList((prev) => prev.filter((m) => m.id !== id));
    addToast('Medicine removed successfully');
  };

  return (
    <div className="space-y-6 page-enter">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-fraunces text-xl font-semibold text-charcoal">Medicine management</h2>
        <div className="flex flex-wrap gap-2">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-lg border border-charcoal/20 px-3 py-2 text-sm">
            <option value="">All categories</option>
            {MEDICINE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-lg border border-charcoal/20 px-3 py-2 text-sm">
            <option value="name">Name</option>
            <option value="price">Price</option>
          </select>
          <button type="button" onClick={openAdd} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark">
            Add Medicine
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-charcoal/10 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-charcoal/5 text-left">
              <th className="px-4 py-3 font-medium text-charcoal">Name</th>
              <th className="px-4 py-3 font-medium text-charcoal">Brand</th>
              <th className="px-4 py-3 font-medium text-charcoal">Category</th>
              <th className="px-4 py-3 font-medium text-charcoal">Price</th>
              <th className="px-4 py-3 font-medium text-charcoal">Stock</th>
              <th className="px-4 py-3 font-medium text-charcoal">Expiry</th>
              <th className="px-4 py-3 font-medium text-charcoal">Rx</th>
              <th className="px-4 py-3 font-medium text-charcoal">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id} className="border-t border-charcoal/5">
                <td className="px-4 py-3 font-medium">{m.name}</td>
                <td className="px-4 py-3 text-charcoal/70">{m.brand}</td>
                <td className="px-4 py-3 text-charcoal/70">{m.category}</td>
                <td className="px-4 py-3">Rs. {m.price}</td>
                <td className="px-4 py-3">{m.stock}</td>
                <td className="px-4 py-3 text-charcoal/70">{m.expiry}</td>
                <td className="px-4 py-3">{m.prescriptionRequired ? 'Yes' : 'No'}</td>
                <td className="px-4 py-3">
                  <button type="button" onClick={() => openEdit(m)} className="text-primary font-medium hover:underline mr-2">Edit</button>
                  <button type="button" onClick={() => remove(m.id)} className="text-soft-red font-medium hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="p-8 text-center text-charcoal/50">No medicines added yet. Click "Add Medicine" to get started.</div>}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Medicine' : 'Add Medicine'} size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full rounded-lg border border-charcoal/20 px-4 py-2 focus:border-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">Brand</label>
            <input type="text" value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} className="w-full rounded-lg border border-charcoal/20 px-4 py-2 focus:border-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">Category</label>
            <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="w-full rounded-lg border border-charcoal/20 px-4 py-2 focus:border-primary outline-none">
              {MEDICINE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">Price (Rs.)</label>
              <input type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className="w-full rounded-lg border border-charcoal/20 px-4 py-2 focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">Stock</label>
              <input type="number" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} className="w-full rounded-lg border border-charcoal/20 px-4 py-2 focus:border-primary outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">Expiry</label>
            <input type="date" value={form.expiry} onChange={(e) => setForm((f) => ({ ...f, expiry: e.target.value }))} className="w-full rounded-lg border border-charcoal/20 px-4 py-2 focus:border-primary outline-none" />
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.prescriptionRequired} onChange={(e) => setForm((f) => ({ ...f, prescriptionRequired: e.target.checked }))} className="rounded text-primary" />
            <span className="text-sm text-charcoal">Prescription required</span>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border border-charcoal/20 px-4 py-2 font-medium">Cancel</button>
            <button type="button" onClick={save} className="rounded-lg bg-primary px-4 py-2 font-medium text-white hover:bg-primary-dark">Save</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
