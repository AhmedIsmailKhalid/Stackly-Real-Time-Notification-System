import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/common/Button';

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────

type Mode = 'login' | 'register';

// ─────────────────────────────────────────
// INPUT CLASS
// ─────────────────────────────────────────

const inputClass = [
  'w-full h-10 px-3.5 rounded-lg text-sm',
  'bg-white border border-surface-300',
  'text-surface-900 placeholder-surface-400',
  'transition-colors duration-150',
  'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500',
  'hover:border-surface-400',
].join(' ');

// ─────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────

const Login = () => {
  const { login, register } = useAuth();

  const [mode, setMode]         = useState<Mode>('login');
  const [isLoading, setLoading] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const [form, setForm] = useState({
    email:       '',
    password:    '',
    username:    '',
    displayName: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password });
      } else {
        await register({
          email:       form.email,
          password:    form.password,
          username:    form.username,
          displayName: form.displayName,
        });
      }
    } catch (err: unknown) {
      const message =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        (err as any).response?.data?.error
          ? (err as any).response.data.error
          : 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setForm((prev) => ({ ...prev, email: 'demo@stackly.dev', password: 'demo1234' }));
    setMode('login');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">

        {/* ── Logo ── */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center shadow-notification">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <span className="text-2xl font-semibold text-surface-900 tracking-tight">
            Stackly
          </span>
        </div>

        {/* ── Card ── */}
        <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-6 sm:p-8">

          {/* ── Header ── */}
          <div className="mb-5">
            <h1 className="text-lg font-semibold text-surface-900">
              {mode === 'login' ? 'Welcome back' : 'Create an account'}
            </h1>
            <p className="text-sm text-surface-500 mt-1">
              {mode === 'login'
                ? 'Sign in to your Stackly workspace'
                : 'Get started with Stackly today'}
            </p>
          </div>

          {/* ── Demo Banner ── */}
          {mode === 'login' && (
            <div className="mb-5 p-3 bg-brand-50 border border-brand-100 rounded-xl flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-brand-700">
                  Demo credentials
                </p>
                <p className="text-xs text-brand-600 mt-0.5 font-mono">
                  demo@stackly.dev · demo1234
                </p>
              </div>
              <button
                type="button"
                onClick={fillDemo}
                className="text-xs font-semibold text-brand-700 hover:text-brand-900 whitespace-nowrap transition-colors px-2 py-1 rounded-md hover:bg-brand-100"
              >
                Fill in
              </button>
            </div>
          )}

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Register only */}
            {mode === 'register' && (
              <>
                <div>
                  <label htmlFor="displayName" className="block text-xs font-medium text-surface-700 mb-1.5">
                    Full name
                  </label>
                  <input
                    id="displayName"
                    name="displayName"
                    type="text"
                    autoComplete="name"
                    required
                    value={form.displayName}
                    onChange={handleChange}
                    placeholder="Alex Rivera"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="username" className="block text-xs font-medium text-surface-700 mb-1.5">
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={form.username}
                    onChange={handleChange}
                    placeholder="alex_rivera"
                    className={inputClass}
                  />
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-surface-700 mb-1.5">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={inputClass}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-surface-700 mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
                minLength={8}
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={inputClass}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-xs text-red-700">{error}</p>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              fullWidth
              loading={isLoading}
              size="md"
              className="mt-1"
            >
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </Button>
          </form>

          {/* ── Mode Switch ── */}
          <p className="text-center text-xs text-surface-500 mt-5">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }}
              className="text-brand-600 font-semibold hover:text-brand-700 transition-colors"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;