import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/ui/Modal';
import StatusBadge from '../../components/ui/StatusBadge';
import api from '../../services/api';

export default function VerifyPrescriptionsPage() {
  const { accessToken } = useAuth();
  const { addToast } = useToast();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [reasonModal, setReasonModal] = useState({ open: false, rx: null });
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(null);
  const [previewModal, setPreviewModal] = useState(null);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const res = await api.getAllPrescriptions(filter === 'all' ? '' : filter, accessToken);
      setPrescriptions(res.data?.prescriptions ?? []);
    } catch {
      addToast('Failed to load prescriptions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, [filter]);

  const handleApprove = async (rx) => {
    try {
      setProcessing(rx.id);
      await api.reviewPrescription(rx.id, { status: 'approved' }, accessToken);
      addToast('Prescription approved!');
      fetchPrescriptions();
    } catch (err) {
      addToast(err.message || 'Failed to approve', 'error');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = (rx) => {
    setReasonModal({ open: true, rx });
    setReason('');
  };

  const submitReject = async () => {
    const rx = reasonModal.rx;
    try {
      setProcessing(rx.id);
      await api.reviewPrescription(rx.id, { status: 'rejected', notes: reason || undefined }, accessToken);
      addToast('Prescription rejected');
      setReasonModal({ open: false, rx: null });
      setReason('');
      fetchPrescriptions();
    } catch (err) {
      addToast(err.message || 'Failed to reject', 'error');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="space-y-6 page-enter">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="font-fraunces text-xl font-semibold text-charcoal">Verify prescriptions</h2>
        <div className="flex gap-2">
          {['pending', 'approved', 'rejected', 'all'].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                filter === f ? 'bg-primary text-white' : 'bg-charcoal/10 text-charcoal hover:bg-charcoal/20'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-charcoal/50 text-sm">Loading prescriptions…</p>
      ) : prescriptions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-charcoal/20 py-12 text-center text-charcoal/60">
          No {filter !== 'all' ? filter : ''} prescriptions found.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {prescriptions.map((rx) => (
            <div
              key={rx.id}
              className="rounded-xl border border-charcoal/10 bg-white p-5 shadow-card hover-lift"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="font-fraunces font-semibold text-charcoal truncate">{rx.customer_name || 'Customer'}</p>
                  <p className="text-sm text-charcoal/60">{rx.customer_email}</p>
                  <p className="text-xs text-charcoal/40 mt-0.5">
                    {new Date(rx.created_at).toLocaleDateString('en-NP', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <StatusBadge status={rx.status} />
              </div>

              {/* Prescription image preview */}
              <button
                type="button"
                onClick={() => setPreviewModal(rx)}
                className="mt-4 w-full h-40 rounded-lg bg-charcoal/5 overflow-hidden border border-charcoal/10 hover:border-primary/50 transition-colors"
              >
                <img
                  src={rx.image_url}
                  alt="Prescription"
                  className="h-full w-full object-contain"
                  onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<span class="flex h-full w-full items-center justify-center text-charcoal/40 text-sm">Click to view</span>'; }}
                />
              </button>

              {rx.notes && (
                <p className="mt-2 text-sm text-charcoal/60 truncate">Notes: {rx.notes}</p>
              )}
              {rx.reviewed_by_name && (
                <p className="mt-1 text-xs text-charcoal/40">Reviewed by {rx.reviewed_by_name}</p>
              )}

              {rx.status === 'pending' && (
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleApprove(rx)}
                    disabled={processing === rx.id}
                    className="flex-1 rounded-lg bg-primary py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
                  >
                    {processing === rx.id ? 'Processing…' : 'Approve'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReject(rx)}
                    disabled={processing === rx.id}
                    className="flex-1 rounded-lg border border-soft-red text-soft-red py-2 text-sm font-medium hover:bg-soft-red/10 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reject reason modal */}
      <Modal
        open={reasonModal.open}
        onClose={() => setReasonModal({ open: false })}
        title="Reject prescription"
      >
        <p className="text-sm text-charcoal/70 mb-2">Reason for rejection (optional):</p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-charcoal/20 px-4 py-2 focus:border-primary outline-none resize-none"
          placeholder="e.g. Image unclear, prescription expired"
        />
        <div className="flex justify-end gap-2 mt-4">
          <button type="button" onClick={() => setReasonModal({ open: false })} className="rounded-lg border border-charcoal/20 px-4 py-2 font-medium">
            Cancel
          </button>
          <button type="button" onClick={submitReject} disabled={processing} className="rounded-lg bg-soft-red px-4 py-2 font-medium text-white disabled:opacity-50">
            Reject
          </button>
        </div>
      </Modal>

      {/* Image preview modal */}
      {previewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setPreviewModal(null)}>
          <div className="relative max-w-3xl w-full bg-white rounded-xl p-4" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setPreviewModal(null)} className="absolute top-2 right-2 text-charcoal/50 hover:text-charcoal text-xl z-10">×</button>
            <img src={previewModal.image_url} alt="Prescription" className="w-full rounded-lg max-h-[75vh] object-contain" />
            <div className="mt-3 flex items-center justify-between text-sm text-charcoal/60">
              <div>
                <p className="font-medium text-charcoal">{previewModal.customer_name}</p>
                <p>{new Date(previewModal.created_at).toLocaleString()}</p>
                {previewModal.notes && <p>Notes: {previewModal.notes}</p>}
              </div>
              {previewModal.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { handleApprove(previewModal); setPreviewModal(null); }}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => { handleReject(previewModal); setPreviewModal(null); }}
                    className="rounded-lg border border-soft-red text-soft-red px-4 py-2 text-sm font-medium hover:bg-soft-red/10"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
