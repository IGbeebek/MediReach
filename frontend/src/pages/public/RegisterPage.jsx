import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ProgressBar from '../../components/ui/ProgressBar';

const STEPS = [
  { id: 1, title: 'Personal Info', fields: ['name', 'email', 'password'] },
  { id: 2, title: 'Contact Details', fields: ['phone', 'address'] },
  { id: 3, title: 'Verification', fields: [] },
];

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (step === 1) {
      if (!form.name.trim()) e.name = 'Name is required';
      if (!form.email.trim()) e.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
      if (!form.password) e.password = 'Password is required';
      else if (form.password.length < 8) e.password = 'At least 8 characters';
    }
    if (step === 2) {
      if (!form.phone.trim()) e.phone = 'Phone is required';
      if (!form.address.trim()) e.address = 'Address is required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = async () => {
    if (!validate()) return;
    if (step < 3) setStep(step + 1);
    else {
      setLoading(true);
      try {
        const result = await register(form);
        if (result.success) navigate('/customer');
        else setErrors({ submit: result.error });
      } catch {
        setErrors({ submit: 'Registration failed. Please try again.' });
      } finally {
        setLoading(false);
      }
    }
  };

  const prev = () => setStep(Math.max(1, step - 1));

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-charcoal text-cream flex-col justify-between p-10">
        <Link to="/" className="font-fraunces text-2xl font-semibold italic">
          MediReach
        </Link>
        <div>
          <p className="font-fraunces text-2xl font-semibold">Create your account</p>
          <p className="mt-2 text-cream/70">Join Nepal's trusted online pharmacy.</p>
          <div className="mt-8 space-y-4">
            {STEPS.map((s) => (
              <div
                key={s.id}
                className={`flex items-center gap-3 ${step >= s.id ? 'opacity-100' : 'opacity-50'}`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    step > s.id ? 'border-primary bg-primary text-white' : step === s.id ? 'border-primary bg-primary/20 text-primary' : 'border-cream/30'
                  }`}
                >
                  {step > s.id ? '✓' : s.id}
                </div>
                <span className="font-medium">{s.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-6 lg:p-12 bg-cream">
        <div className="max-w-md w-full mx-auto">
          <h1 className="font-fraunces text-2xl font-bold text-charcoal">Register</h1>
          <ProgressBar value={step} max={3} showLabel={false} className="mt-4" />

          {step === 1 && (
            <div className="mt-8 space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">Full name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-lg border border-charcoal/20 px-4 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                  placeholder="Ram Kumar"
                />
                {errors.name && <p className="text-sm text-soft-red mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full rounded-lg border border-charcoal/20 px-4 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                  placeholder="ram@example.com"
                />
                {errors.email && <p className="text-sm text-soft-red mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="w-full rounded-lg border border-charcoal/20 px-4 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                  placeholder="••••••••"
                />
                {errors.password && <p className="text-sm text-soft-red mt-1">{errors.password}</p>}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="mt-8 space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full rounded-lg border border-charcoal/20 px-4 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                  placeholder="98xxxxxxxx"
                />
                {errors.phone && <p className="text-sm text-soft-red mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">Address</label>
                <textarea
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  rows={3}
                  className="w-full rounded-lg border border-charcoal/20 px-4 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none resize-none"
                  placeholder="Thamel, Kathmandu"
                />
                {errors.address && <p className="text-sm text-soft-red mt-1">{errors.address}</p>}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="mt-8 p-4 rounded-xl bg-primary/5 border border-primary/20">
              <p className="font-fraunces font-medium text-charcoal">Review your details</p>
              <p className="text-sm text-charcoal/70 mt-2">{form.name} • {form.email}</p>
              <p className="text-sm text-charcoal/70">{form.phone} • {form.address}</p>
              <p className="text-sm text-charcoal/60 mt-3">Click Continue to create your account.</p>
              {errors.submit && <p className="text-sm text-soft-red mt-2">{errors.submit}</p>}
            </div>
          )}

          <div className="mt-8 flex gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={prev}
                className="rounded-lg border border-charcoal/20 px-4 py-2.5 font-medium text-charcoal hover:bg-charcoal/5"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={next}
              disabled={loading}
              className="rounded-lg bg-primary px-6 py-2.5 font-medium text-white hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {step < 3 ? 'Continue' : loading ? 'Creating...' : 'Create account'}
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-charcoal/60">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
