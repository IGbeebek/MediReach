import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import UploadZone from '../../components/ui/UploadZone';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import api from '../../services/api';

export default function PrescriptionUploadPage() {
  const { accessToken } = useAuth();
  const { addToast } = useToast();
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewModal, setPreviewModal] = useState(null);

  const fetchPrescriptions = async () => {
    try {
      const res = await api.getMyPrescriptions(accessToken);
      setPrescriptions(res.data?.prescriptions ?? []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const handleFileSelect = (f) => {
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return addToast('Please select a file first', 'error');
    try {
      setUploading(true);
      await api.uploadPrescription(file, notes, accessToken);
      addToast('Prescription uploaded! Pending verification.');
      setFile(null);
      setNotes('');
      fetchPrescriptions();
    } catch (err) {
      addToast(err.message || 'Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const statusColor = (s) => {
    if (s === 'approved') return 'text-primary';
    if (s === 'rejected') return 'text-soft-red';
    return 'text-amber-500';
  };

  return (
    <div className="space-y-8 page-enter">
      <div>
        <h2 className="font-fraunces text-xl font-semibold text-charcoal">Upload prescription</h2>
        <p className="text-charcoal/60 text-sm mt-1">Upload a clear image of your prescription for verification.</p>
      </div>

      <UploadZone onFileSelect={handleFileSelect} />
      {file && (
        <div className="rounded-xl border border-charcoal/10 bg-white p-4 space-y-3">
          <p className="text-sm font-medium text-charcoal">Selected: {file.name}</p>
          {file.type?.startsWith('image/') && (
            <img
              src={URL.createObjectURL(file)}
              alt="Preview"
              className="max-h-48 rounded-lg object-contain"
            />
          )}
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes (optional) e.g. which medicines you need"
            rows={2}
            className="w-full rounded-lg border border-charcoal/20 px-4 py-2 focus:border-primary outline-none resize-none text-sm"
          />
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            className="rounded-lg bg-primary px-6 py-2.5 font-medium text-white hover:bg-primary-dark disabled:opacity-50"
          >
            {uploading ? 'Uploading…' : 'Upload Prescription'}
          </button>
        </div>
      )}

      <div>
        <h3 className="font-fraunces font-semibold text-charcoal mb-4">My prescriptions</h3>
        {loading ? (
          <p className="text-charcoal/50 text-sm">Loading…</p>
        ) : prescriptions.length === 0 ? (
          <EmptyState
            icon="📄"
            title="No prescriptions yet"
            description="Upload a prescription above. Once verified, you can order prescription-only medicines."
          />
        ) : (
          <ul className="space-y-3">
            {prescriptions.map((rx) => (
              <li
                key={rx.id}
                className="rounded-xl border border-charcoal/10 bg-white p-4 hover:shadow-card transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => setPreviewModal(rx)}
                      className="shrink-0 h-16 w-16 rounded-lg bg-charcoal/5 overflow-hidden border border-charcoal/10 hover:border-primary/50 transition-colors"
                    >
                      <img
                        src={rx.image_url}
                        alt="Prescription"
                        className="h-full w-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<span class="flex h-full w-full items-center justify-center text-2xl">📄</span>'; }}
                      />
                    </button>
                    <div className="min-w-0">
                      <p className="text-sm text-charcoal/60">
                        {new Date(rx.created_at).toLocaleDateString('en-NP', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                      {rx.notes && <p className="text-sm text-charcoal/70 mt-0.5 truncate">{rx.notes}</p>}
                      <p className={`text-sm font-medium mt-1 capitalize ${statusColor(rx.status)}`}>
                        {rx.status}
                      </p>
                      {rx.status === 'rejected' && rx.notes && (
                        <p className="text-xs text-soft-red mt-0.5">Reason: {rx.notes}</p>
                      )}
                      {rx.reviewed_by_name && (
                        <p className="text-xs text-charcoal/40 mt-0.5">Reviewed by {rx.reviewed_by_name}</p>
                      )}
                    </div>
                  </div>
                  <StatusBadge status={rx.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Image preview modal */}
      {previewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setPreviewModal(null)}>
          <div className="relative max-w-2xl w-full bg-white rounded-xl p-4" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setPreviewModal(null)} className="absolute top-2 right-2 text-charcoal/50 hover:text-charcoal text-xl">×</button>
            <img src={previewModal.image_url} alt="Prescription" className="w-full rounded-lg max-h-[70vh] object-contain" />
            <div className="mt-3 text-sm text-charcoal/60">
              <p>Uploaded: {new Date(previewModal.created_at).toLocaleString()}</p>
              <p className="capitalize">Status: <span className={`font-medium ${statusColor(previewModal.status)}`}>{previewModal.status}</span></p>
              {previewModal.notes && <p>Notes: {previewModal.notes}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
