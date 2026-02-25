import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MEDICINE_CATEGORIES } from '../../data/mockData';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/ui/Badge';
import api from '../../services/api';

export default function MedicineCatalog() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('name');
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { addToast } = useToast();

  useEffect(() => {
    setLoading(true);
    api.getMedicines()
      .then((res) => setMedicines(res.data?.medicines ?? []))
      .catch(() => addToast('Failed to load medicines', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = medicines.filter(
      (m) =>
        (m.name.toLowerCase().includes(search.toLowerCase()) ||
          (m.brand || m.manufacturer || '').toLowerCase().includes(search.toLowerCase())) &&
        (!category || m.category === category)
    );
    if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'price-low') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'price-high') list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [medicines, search, category, sort]);

  const handleAddToCart = async (e, medicine) => {
    e.preventDefault();
    try {
      await addToCart(medicine, 1);
      addToast('Added to cart');
    } catch (err) {
      addToast(err.message || 'Failed to add to cart', 'error');
    }
  };

  return (
    <div className="space-y-6 page-enter">
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search medicines..."
          className="flex-1 rounded-lg border border-charcoal/20 px-4 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory('')}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              !category ? 'bg-primary text-white' : 'bg-charcoal/10 text-charcoal hover:bg-charcoal/20'
            }`}
          >
            All
          </button>
          {MEDICINE_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                category === c ? 'bg-primary text-white' : 'bg-charcoal/10 text-charcoal hover:bg-charcoal/20'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-lg border border-charcoal/20 px-3 py-2.5 text-sm focus:border-primary outline-none"
        >
          <option value="name">Sort by name</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>
      </div>

      {loading ? (
        <div className="py-12 text-center text-charcoal/60">Loading medicines…</div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((m) => (
              <Link
                key={m.id}
                to={`/customer/medicines/${m.id}`}
                className="group rounded-xl border border-charcoal/10 bg-white p-5 shadow-card hover-lift transition-all duration-300 flex flex-col"
              >
                <div className="text-3xl mb-2">💊</div>
                <h3 className="font-fraunces font-semibold text-charcoal group-hover:text-primary transition-colors line-clamp-2">
                  {m.name}
                </h3>
                <p className="text-sm text-charcoal/60 mt-0.5">{m.brand || m.manufacturer} • {m.category}</p>
                <div className="mt-auto pt-4 flex items-center justify-between gap-2">
                  <span className="font-fraunces font-semibold text-primary">Rs. {m.price}</span>
                  <div className="flex items-center gap-2">
                    {m.stock < 20 && <Badge variant="amber">Low stock</Badge>}
                    {m.prescriptionRequired && <Badge variant="soft-red">Rx</Badge>}
                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(e, m)}
                      className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-dark transition-colors"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {filtered.length === 0 && medicines.length > 0 && (
            <div className="rounded-xl border border-dashed border-charcoal/20 py-12 text-center text-charcoal/60">
              No medicines match your filters.
            </div>
          )}
          {medicines.length === 0 && (
            <div className="rounded-xl border border-dashed border-charcoal/20 py-12 text-center text-charcoal/60">
              No medicines available yet. Check back later!
            </div>
          )}
        </>
      )}
    </div>
  );
}
