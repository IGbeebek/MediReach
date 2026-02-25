import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import UploadZone from '../../components/ui/UploadZone';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';

export default function PrescriptionUploadPage() {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const myPrescriptions = [];

  const handleFileSelect = (f) => {
    setFile(f);
    setProgress(0);
    if (f) {
      setUploading(true);
      const interval = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            clearInterval(interval);
            setUploading(false);
            return 100;
          }
          return p + 10;
        });
      }, 200);
    }
  };

  return (
    <div className="space-y-8 page-enter">
      <div>
        <h2 className="font-fraunces text-xl font-semibold text-charcoal">Upload prescription</h2>
        <p className="text-charcoal/60 text-sm mt-1">Upload a clear image of your prescription for verification.</p>
      </div>

      <UploadZone onFileSelect={handleFileSelect} />
      {file && (
        <div className="rounded-xl border border-charcoal/10 bg-white p-4">
          <p className="text-sm font-medium text-charcoal">Selected: {file.name}</p>
          {uploading && (
            <div className="mt-2 h-2 w-full rounded-full bg-charcoal/10 overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          )}
          {progress === 100 && <p className="text-sm text-primary mt-2">Upload complete. Pending verification.</p>}
        </div>
      )}

      <div>
        <h3 className="font-fraunces font-semibold text-charcoal mb-4">Past prescriptions</h3>
        {myPrescriptions.length === 0 ? (
          <EmptyState
            icon="📄"
            title="No prescriptions yet"
            description="Upload a prescription above. Once verified, you can order prescription-only medicines."
          />
        ) : (
          <ul className="space-y-3">
            {myPrescriptions.map((rx) => (
              <li
                key={rx.id}
                className="flex items-center justify-between rounded-xl border border-charcoal/10 bg-white p-4"
              >
                <div>
                  <p className="font-medium text-charcoal">{rx.medicine}</p>
                  <p className="text-sm text-charcoal/60">{rx.date}</p>
                  {rx.rejectReason && <p className="text-sm text-soft-red mt-1">{rx.rejectReason}</p>}
                </div>
                <StatusBadge status={rx.status} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
