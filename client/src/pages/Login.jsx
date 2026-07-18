import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthShell, GoogleIcon, inputClass, PasswordInput } from './Signup.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  return (
    <AuthShell title="Welcome back" subtitle="Log in to keep your streak going">
      <button
        onClick={handleGoogleLogin}
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
        />
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-gradient text-white font-semibold text-sm py-2.5 rounded-lg shadow-card hover:shadow-glow transition-shadow disabled:opacity-60"
        >
          {loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <p className="text-center text-xs text-mist/40 mt-6">
        New to Memora?{' '}
        <Link to="/signup" className="text-blue-bright hover:underline">
          Sign up free
        </Link>
      </p>
    </AuthShell>
  );
}