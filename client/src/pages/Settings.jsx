import { useState } from 'react';
import AppShell from '../components/AppShell.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import * as authApi from '../api/auth.js';
import { getErrorMessage } from '../utils/errors.js';
import { PasswordInput } from './Signup.jsx';

export default function Settings() {
  const { user, refresh } = useAuth();

  const [limit, setLimit] = useState(user?.dailyNewCardLimit ?? 20);
  const [savingLimit, setSavingLimit] = useState(false);
  const [limitSaved, setLimitSaved] = useState(false);
  const [limitError, setLimitError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const saveLimit = async (e) => {
    e.preventDefault();
    setSavingLimit(true);
    setLimitError('');
    setLimitSaved(false);
    try {
      await authApi.updateProfile({ dailyNewCardLimit: Number(limit) });
      await refresh();
      setLimitSaved(true);
    } catch (err) {
      setLimitError(getErrorMessage(err, "Couldn't save that setting."));
    } finally {
      setSavingLimit(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setSavingPassword(true);
    setPasswordError('');
    setPasswordSaved(false);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setPasswordSaved(true);
    } catch (err) {
      setPasswordError(getErrorMessage(err, "Couldn't change your password."));
    } finally {
      setSavingPassword(false);
    }
  };

  const inputClass =
    'w-full bg-ink border border-white/10 rounded-lg px-4 py-2.5 text-sm placeholder:text-mist/30 focus:border-blue-bright/50 outline-none';

  return (
    <AppShell>
      <div className="max-w-lg mx-auto px-6 sm:px-8 py-10">
        <h1 className="font-display text-2xl font-bold mb-8">Settings</h1>

        <section className="bg-surface border border-white/5 rounded-xl p-6 mb-6">
          <h2 className="font-display font-semibold mb-1">Daily new-card limit</h2>
          <p className="text-mist/50 text-xs mb-4">
            How many new cards enter your review queue per day. Cards already due for review are never capped.
          </p>
          <ErrorBanner message={limitError} onRetry={null} />
          <form onSubmit={saveLimit} className="flex gap-2.5">
            <input
              type="number"
              min={1}
              max={200}
              value={limit}
              onChange={(e) => {
                setLimit(e.target.value);
                setLimitSaved(false);
              }}
              className={inputClass + ' w-28'}
            />
            <button
              type="submit"
              disabled={savingLimit}
              className="bg-brand-gradient text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-card disabled:opacity-60"
            >
              {savingLimit ? 'Saving…' : limitSaved ? 'Saved ✓' : 'Save'}
            </button>
          </form>
        </section>

        {user?.authProvider === 'local' && (
          <section className="bg-surface border border-white/5 rounded-xl p-6">
            <h2 className="font-display font-semibold mb-1">Change password</h2>
            <p className="text-mist/50 text-xs mb-4">Update the password you use to log in.</p>
            <ErrorBanner message={passwordError} onRetry={null} />
            <form onSubmit={savePassword} className="space-y-3">
              <PasswordInput
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
              />
              <PasswordInput
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                minLength={8}
              />
              <button
                type="submit"
                disabled={savingPassword}
                className="bg-brand-gradient text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-card disabled:opacity-60"
              >
                {savingPassword ? 'Saving…' : passwordSaved ? 'Saved ✓' : 'Update password'}
              </button>
            </form>
          </section>
        )}

        {user?.authProvider === 'google' && (
          <p className="text-mist/40 text-xs">
            You're signed in with Google, so there's no separate Memora password to change.
          </p>
        )}
      </div>
    </AppShell>
  );
}