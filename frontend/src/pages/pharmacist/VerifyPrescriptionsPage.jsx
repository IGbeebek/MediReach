import { useState } from 'react';
import Modal from '../../components/ui/Modal';
import StatusBadge from '../../components/ui/StatusBadge';

export default function VerifyPrescriptionsPage() {
  const prescriptions = [];
  const pending = prescriptions.filter((r) => r.status === 'Pending');
  const [reasonModal, setReasonModal] = useState({ open: false, rx: null, action: null });
  const [reason, setReason] = useState('');

  const handleApprove = (rx) => {
    // Mock: would update in real app
    setReasonModal({ open: false });
  };

  const handleReject = (rx) => {
    setReasonModal({ open: true, rx, action: 'reject' });
  };

  const submitReject = () => {
    setReasonModal({ open: false, rx: null, action: null });
    setReason('');
  };

  return (
    <div className="space-y-6 page-enter">
      <h2 className="font-fraunces text-xl font-semibold text-charcoal">Verify prescriptions</h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pending.map((rx) => (
          <div
            key={rx.id}
            className="rounded-xl border border-charcoal/10 bg-white p-5 shadow-card hover-lift"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-fraunces font-semibold text-charcoal">{rx.medicine}</p>
                <p className="text-sm text-charcoal/60">Customer • {rx.date}</p>
              </div>
              <StatusBadge status={rx.status} />
            </div>
            <div className="mt-4 h-32 rounded-lg bg-charcoal/5 flex items-center justify-center text-charcoal/40 text-sm">
              Image preview placeholder
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => handleApprove(rx)}
                className="flex-1 rounded-lg bg-primary py-2 text-sm font-medium text-white hover:bg-primary-dark"
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => handleReject(rx)}
                className="flex-1 rounded-lg border border-soft-red text-soft-red py-2 text-sm font-medium hover:bg-soft-red/10"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      {pending.length === 0 && (
        <div className="rounded-xl border border-dashed border-charcoal/20 py-12 text-center text-charcoal/60">
          No pending prescriptions to verify.
        </div>
      )}

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
          <button type="button" onClick={submitReject} className="rounded-lg bg-soft-red px-4 py-2 font-medium text-white">
            Reject
          </button>
        </div>
      </Modal>
    </div>
  );
}
