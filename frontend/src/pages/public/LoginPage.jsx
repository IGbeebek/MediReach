import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ROLES = { CUSTOMER: 'customer', PHARMACIST: 'pharmacist', ADMIN: 'admin' };

export default function LoginPage() {
  const [role, setRole] = useState(ROLES.CUSTOMER);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || (role === ROLES.CUSTOMER ? '/customer' : role === ROLES.PHARMACIST ? '/pharmacist' : '/admin');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        const base = result.user.role === ROLES.CUSTOMER ? '/customer' : result.user.role === ROLES.PHARMACIST ? '/pharmacist' : '/admin';
        navigate(from.startsWith('/customer') || from.startsWith('/pharmacist') || from.startsWith('/admin') ? from : base);
      } else {
        setError(result.error || 'Login failed');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-charcoal text-cream flex-col justify-between p-10">
        <Link to="/" className="font-fraunces text-2xl font-semibold italic">
          MediReach
        </Link>
        <div>
          <p className="font-fraunces text-2xl font-semibold">
            Your trusted pharmacy, one click away.
          </p>
          <p className="mt-2 text-cream/70">
            Sign in to order medicines, track deliveries, and manage prescriptions.
          </p>
        </div>
        <div className="flex gap-6 text-sm text-cream/60">
          <span>🔒 Secure</span>
          <span>✓ Verified medicines</span>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-6 lg:p-12 bg-cream">
        <div className="max-w-md w-full mx-auto">
          <h1 className="font-fraunces text-2xl font-bold text-charcoal">Sign in</h1>
          <p className="text-charcoal/60 text-sm mt-1">Choose your role and sign in.</p>

          <div className="flex gap-2 mt-6 p-1 rounded-lg bg-charcoal/5 border border-charcoal/10">
            {[ROLES.CUSTOMER, ROLES.PHARMACIST, ROLES.ADMIN].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 rounded-md py-2 text-sm font-medium capitalize transition-colors ${
                  role === r ? 'bg-primary text-white' : 'text-charcoal/70 hover:bg-charcoal/10'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-charcoal/20 px-4 py-2.5 text-charcoal focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-charcoal/20 px-4 py-2.5 text-charcoal focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                placeholder="••••••••"
              />
            </div>
            {error && (
              <p className="text-sm text-soft-red">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary py-2.5 font-medium text-white hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-charcoal/60">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
