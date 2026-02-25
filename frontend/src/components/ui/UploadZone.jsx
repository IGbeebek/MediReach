import { useCallback, useState } from 'react';

export default function UploadZone({ onFileSelect, accept = 'image/*', multiple = false }) {
  const [drag, setDrag] = useState(false);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDrag(false);
      const files = e.dataTransfer?.files;
      if (files?.length) onFileSelect(multiple ? Array.from(files) : files[0]);
    },
    [onFileSelect, multiple]
  );

  const handleChange = useCallback(
    (e) => {
      const files = e.target.files;
      if (files?.length) onFileSelect(multiple ? Array.from(files) : files[0]);
    },
    [onFileSelect, multiple]
  );

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={handleDrop}
      className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
        drag ? 'border-primary bg-primary/5' : 'border-charcoal/20 bg-charcoal/[0.02] hover:border-primary/50'
      }`}
    >
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
        id="upload-zone"
      />
      <label htmlFor="upload-zone" className="cursor-pointer">
        <span className="text-4xl block mb-2">📄</span>
        <p className="font-fraunces text-charcoal font-medium">Drop your prescription here or click to upload</p>
        <p className="text-sm text-charcoal/50 mt-1">PNG, JPG up to 5MB</p>
      </label>
    </div>
  );
}
