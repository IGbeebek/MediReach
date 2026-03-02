import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { useNotifications } from '../../context/NotificationContext';
import Breadcrumb from '../../components/ui/Breadcrumb';
import ProgressBar from '../../components/ui/ProgressBar';
import Badge from '../../components/ui/Badge';
import api from '../../services/api';

export default function MedicineDetailPage() {
  const { id } = useParams();
  const [qty, setQty] = useState(1);
  const [medicine, setMedicine] = useState(null);
  const [alternatives, setAlternatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const { addNotification } = useNotifications();

  useEffect(() => {
    setLoading(true);
    api.getMedicine(id)
      .then((res) => {
        const med = res.data?.medicine;
        setMedicine(med);
        // Fetch same-category alternatives
        if (med) {
          api.getMedicines(`category=${encodeURIComponent(med.category)}`)
            .then((r) => {
              const others = (r.data?.medicines ?? []).filter((m) => m.id !== med.id).slice(0, 3);
              setAlternatives(others);
            })
            .catch(() => {});
        }
      })
      .catch(() => addToast('Medicine not found', 'error'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="page-enter py-12 text-center text-charcoal/60">Loading…</div>;
  }

  if (!medicine) {
    return (
      <div className="page-enter">
        <p className="text-charcoal/60">Medicine not found.</p>
        <Link to="/customer/medicines" className="text-primary mt-2 inline-block">Back to catalog</Link>
      </div>
    );
  }

  const handleAddToCart = async () => {
    try {
      await addToCart(medicine, qty);
      addToast(`${medicine.name} added to cart`, 'cart', { name: medicine.name, qty, price: medicine.price });
      addNotification(`${medicine.name} added to cart`, 'cart', { name: medicine.name, qty, price: medicine.price });
    } catch (err) {
      addToast(err.message || 'Failed to add to cart', 'error');
    }
  };

  return (
    <div className="page-enter space-y-8">
      <Breadcrumb
        items={[
          { to: '/customer', label: 'Dashboard' },
          { to: '/customer/medicines', label: 'Medicines' },
          { label: medicine.name },
        ]}
      />

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 rounded-xl border border-charcoal/10 bg-white p-6">
          <div className="flex gap-6">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-4xl">
              💊
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="font-fraunces text-2xl font-semibold text-charcoal">{medicine.name}</h1>
              <p className="text-charcoal/60 mt-1">{medicine.brand || medicine.manufacturer} • {medicine.category}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {medicine.prescriptionRequired && <Badge variant="soft-red">Prescription required</Badge>}
                {medicine.stock < 20 && <Badge variant="amber">Low stock</Badge>}
              </div>
            </div>
          </div>
          <p className="mt-6 text-charcoal/80">{medicine.description}</p>
          <div className="mt-6">
            <p className="text-sm font-medium text-charcoal">Stock</p>
            <ProgressBar value={medicine.stock} max={200} className="mt-1" />
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-charcoal/60">
            <span>Expiry: {medicine.expiry || medicine.expiryDate || '—'}</span>
            <span>Sold: {(medicine.soldCount ?? 0).toLocaleString()}</span>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-charcoal">Qty:</label>
              <input
                type="number"
                min={1}
                max={medicine.stock}
                value={qty}
                onChange={(e) => setQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-20 rounded-lg border border-charcoal/20 px-2 py-1.5 text-center"
              />
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              className="rounded-lg bg-primary px-6 py-2.5 font-medium text-white hover:bg-primary-dark transition-colors"
            >
              Add to Cart
            </button>
            <button
              type="button"
              className="rounded-lg border border-charcoal/20 px-6 py-2.5 font-medium text-charcoal hover:bg-charcoal/5"
            >
              Wishlist ♡
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-charcoal/10 bg-white p-6 h-fit">
          <h3 className="font-fraunces font-semibold text-charcoal">Alternatives</h3>
          <ul className="mt-3 space-y-3">
            {alternatives.map((m) => (
              <li key={m.id}>
                <Link
                  to={`/customer/medicines/${m.id}`}
                  className="flex items-center gap-3 rounded-lg p-2 hover:bg-charcoal/5 transition-colors"
                >
                  <span className="text-2xl">💊</span>
                  <div className="min-w-0">
                    <p className="font-medium text-charcoal truncate">{m.name}</p>
                    <p className="text-xs text-charcoal/60">Rs. {m.price}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          {alternatives.length === 0 && <p className="text-sm text-charcoal/50">No alternatives in same category.</p>}
        </div>
      </div>
    </div>
  );
}
