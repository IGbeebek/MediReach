import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export default function AnalyticsPage() {
  const { accessToken } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [weeklySalesData, setWeeklySalesData] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [orderStatusDonut, setOrderStatusDonut] = useState([
    { label: 'Delivered', value: 0, color: '#4a7c59' },
    { label: 'Shipped', value: 0, color: '#3b82f6' },
    { label: 'Packed', value: 0, color: '#f59e0b' },
    { label: 'Pending', value: 0, color: '#6b7280' },
  ]);
  const [topSellingMedicines, setTopSellingMedicines] = useState([]);
  const [revenueLineData, setRevenueLineData] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [prescriptionRate, setPrescriptionRate] = useState({ approved: 0, rejected: 0, pending: 0, total: 0 });

  useEffect(() => {
    api.getAdminStats(accessToken)
      .then((res) => {
        const a = res.data.analytics;
        if (a) {
          setWeeklySalesData(a.weeklySales || [0, 0, 0, 0, 0, 0, 0]);
          setOrderStatusDonut(a.orderStatusDonut || orderStatusDonut);
          setTopSellingMedicines(a.topSellingMedicines || []);
          setRevenueLineData(a.weeklyRevenue || [0, 0, 0, 0, 0, 0, 0]);
          if (a.prescriptionRate) setPrescriptionRate(a.prescriptionRate);
        }
      })
      .catch(() => addToast('Failed to load analytics', 'error'))
      .finally(() => setLoading(false));
  }, [accessToken]);

  const maxBar = Math.max(...weeklySalesData, 1);
  const maxLine = Math.max(...revenueLineData, 1);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  if (loading) {
    return <div className="page-enter py-12 text-center text-charcoal/60">Loading analytics…</div>;
  }

  return (
    <div className="space-y-8 page-enter">
      <h2 className="font-fraunces text-xl font-semibold text-charcoal">Analytics</h2>

      <div className="rounded-xl border border-charcoal/10 bg-white p-6">
        <h3 className="font-fraunces font-semibold text-charcoal mb-4">Weekly sales (Rs. 000)</h3>
        <div className="flex items-end gap-2 h-48">
          {weeklySalesData.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t bg-primary transition-all duration-500 hover:bg-primary-dark"
                style={{ height: `${(v / maxBar) * 100}%`, minHeight: '4px' }}
              />
              <span className="text-xs text-charcoal/60">{days[i]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-charcoal/10 bg-white p-6">
          <h3 className="font-fraunces font-semibold text-charcoal mb-4">Order status (donut)</h3>
          <div className="flex flex-wrap items-center gap-6">
            <div className="relative h-40 w-40 rounded-full border-8 border-charcoal/10">
              {orderStatusDonut.reduce((acc, d, i) => {
                const prev = orderStatusDonut.slice(0, i).reduce((s, x) => s + x.value, 0);
                const pct = (prev / 100) * 360;
                return (
                  <div
                    key={d.label}
                    className="absolute inset-0 rounded-full border-8 border-transparent"
                    style={{
                      borderTopColor: d.color,
                      transform: `rotate(${pct}deg)`,
                      borderTopWidth: `${d.value}%`,
                    }}
                  />
                );
              }, null)}
            </div>
            <ul className="space-y-1">
              {orderStatusDonut.map((d) => (
                <li key={d.label} className="flex items-center gap-2 text-sm">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: d.color }} />
                  {d.label}: {d.value}%
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-xl border border-charcoal/10 bg-white p-6">
          <h3 className="font-fraunces font-semibold text-charcoal mb-4">Top 5 selling medicines</h3>
          <ol className="space-y-2">
            {topSellingMedicines.map((m, i) => (
              <li key={m.name} className="flex items-center justify-between text-sm">
                <span className="text-charcoal/70">{i + 1}. {m.name}</span>
                <span className="font-medium text-charcoal">{m.sold.toLocaleString()}</span>
              </li>
            ))}
            {topSellingMedicines.length === 0 && (
              <li className="text-sm text-charcoal/50">No sales data yet.</li>
            )}
          </ol>
        </div>
      </div>

      <div className="rounded-xl border border-charcoal/10 bg-white p-6">
        <h3 className="font-fraunces font-semibold text-charcoal mb-4">Revenue overview (last 7 periods)</h3>
        <div className="flex items-end gap-1 h-40">
          {revenueLineData.map((v, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-primary/70 hover:bg-primary transition-all"
              style={{ height: `${(v / maxLine) * 100}%`, minHeight: '4px' }}
              title={v}
            />
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-charcoal/10 bg-white p-6">
        <h3 className="font-fraunces font-semibold text-charcoal mb-2">Prescription verification rate</h3>
        <p className="text-charcoal/70 text-sm">
          {prescriptionRate.total > 0
            ? `Based on ${prescriptionRate.total} prescriptions: Approved ${prescriptionRate.approved}%, Rejected ${prescriptionRate.rejected}%, Pending ${prescriptionRate.pending}%.`
            : 'No prescriptions submitted yet.'}
        </p>
      </div>
    </div>
  );
}
