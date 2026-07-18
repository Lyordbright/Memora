import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 009 18z" />
      <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 013.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 000 9c0 1.45.35 2.83.96 4.05l3.01-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.59-2.59C13.46.89 11.43 0 9 0A9 9 0 00.96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
    </svg>
  );
}

function AuthShell({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center gap-2.5 justify-center mb-10">
          <img src="/logo.png" alt="" className="w-7 h-7 rounded-lg" />
          <span className="font-display font-bold text-lg">Memora</span>
        </Link>

        <div className="bg-surface border border-white/5 rounded-2xl p-8">
          <h1 className="font-display text-2xl font-semibold text-center mb-1">{title}</h1>
          <p className="text-mist/50 text-sm text-center mb-7">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

const inputClass =
  'w-full bg-ink border border-white/10 rounded-lg px-4 py-2.5 text-sm text-mist placeholder:text-mist/30 focus:border-blue-bright/50 outline-none transition-colors';

// Shared password input with a show/hide toggle, used on both Signup and Login.
function PasswordInput({ value, onChange, placeholder = 'Password', minLength }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? 'text' : 'password'}
        placeholder={placeholder}
        className={inputClass + ' pr-10'}
        value={value}
        onChange={onChange}
        required
        minLength={minLength}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-mist/30 hover:text-mist/60 transition-colors"
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

export default function Signup() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = '/api/auth/google';
  };

  return (
    <AuthShell title="Create your account" subtitle="Start remembering smarter, for free">
      <button
        onClick={handleGoogleSignup}
        className="w-full flex items-center justify-center gap-2.5 bg-white text-ink font-semibold text-sm py-2.5 rounded-lg hover:bg-mist/90 transition-colors mb-5"
      >
        <GoogleIcon />
        Continue with Google
      </button>

      <div className="flex items-center gap-3 mb-5">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs text-mist/30">or</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <input
          type="text"
          placeholder="Name"
          className={inputClass}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className={inputClass}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <PasswordInput
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          minLength={8}
        />
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-gradient text-white font-semibold text-sm py-2.5 rounded-lg shadow-card hover:shadow-glow transition-shadow disabled:opacity-60"
        >
          {loading ? 'Creating account…' : 'Sign up free'}
        </button>
      </form>

      <p className="text-center text-xs text-mist/40 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-bright hover:underline">
          Log in
        </Link>
      </p>
      <p className="text-center text-[11px] text-mist/30 mt-3">
        By signing up, you agree to Memora's{' '}
        <Link to="/terms" className="hover:text-mist/60 underline">Terms</Link> and{' '}
        <Link to="/privacy" className="hover:text-mist/60 underline">Privacy Policy</Link>.
      </p>
    </AuthShell>
  );
}

export { AuthShell, GoogleIcon, inputClass, PasswordInput };