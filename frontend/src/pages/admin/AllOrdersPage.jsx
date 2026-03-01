import { useState, useEffect } from 'react';
import { ORDER_STATUSES } from '../../data/constants';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/ui/StatusBadge';
import api from '../../services/api';

export default function AllOrdersPage() {
  const { accessToken } = useAuth();
  const { addToast } = useToast();
  const [statusFilter, setStatusFilter] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', page);
    params.set('limit', 20);
    if (statusFilter) params.set('status', statusFilter);
    api.getAllOrders(params.toString(), accessToken)
      .then((res) => {
        setOrders(res.data?.orders ?? []);
        setTotalPages(res.data?.pagination?.totalPages ?? 1);
      })
      .catch(() => addToast('Failed to load orders', 'error'))
      .finally(() => setLoading(false));
  }, [accessToken, statusFilter, page]);

  const exportCsv = () => {
    const headers = ['Order #', 'Grand Total', 'Payment', 'Status', 'Date'];
    const rows = orders.map((o) => [
      o.orderNumber,
      o.grandTotal,
      o.paymentMethod,
      o.status,
      new Date(o.createdAt).toLocaleDateString(),
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'medireach-orders.csv';
    a.click();
    URL.revokeObjectURL(url);
    addToast('Orders exported to CSV successfully');
  };

  return (
    <div className="space-y-6 page-enter">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-fraunces text-xl font-semibold text-charcoal">All orders</h2>
        <button
          type="button"
          onClick={exportCsv}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          Export CSV
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => { setStatusFilter(''); setPage(1); }} className={`rounded-full px-4 py-2 text-sm font-medium ${!statusFilter ? 'bg-primary text-white' : 'bg-charcoal/10 text-charcoal'}`}>All</button>
        {ORDER_STATUSES.map((s) => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }} className={`rounded-full px-4 py-2 text-sm font-medium capitalize ${statusFilter === s ? 'bg-primary text-white' : 'bg-charcoal/10 text-charcoal'}`}>{s.replace('_', ' ')}</button>
        ))}
      </div>

      {loading ? (
        <div className="py-12 text-center text-charcoal/60">Loading…</div>
      ) : (
        <>
          <div className="rounded-xl border border-charcoal/10 bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-charcoal/5 text-left">
                    <th className="px-4 py-3 font-medium text-charcoal">Order #</th>
                    <th className="px-4 py-3 font-medium text-charcoal">Total</th>
                    <th className="px-4 py-3 font-medium text-charcoal">Payment</th>
                    <th className="px-4 py-3 font-medium text-charcoal">Date</th>
                    <th className="px-4 py-3 font-medium text-charcoal">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-t border-charcoal/5">
                      <td className="px-4 py-3 font-medium">{o.orderNumber}</td>
                      <td className="px-4 py-3">Rs. {o.grandTotal}</td>
                      <td className="px-4 py-3 uppercase text-xs">{o.paymentMethod}</td>
                      <td className="px-4 py-3 text-charcoal/70">{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {orders.length === 0 && <div className="p-8 text-center text-charcoal/50">No orders match filters.</div>}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-lg border px-3 py-1 text-sm disabled:opacity-40">Prev</button>
              <span className="text-sm py-1">Page {page} of {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="rounded-lg border px-3 py-1 text-sm disabled:opacity-40">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
