import React from 'react';
import { useState, useRef } from 'react';
import { Camera, X } from 'lucide-react';
import AppShell from '../components/AppShell.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import * as authApi from '../api/auth.js';
import { getErrorMessage } from '../utils/errors.js';
import { fileToCompressedDataUrl } from '../utils/imageResize.js';
import { PasswordInput } from './Signup.jsx';

const inputClass =
  'w-full bg-ink border border-white/10 rounded-lg px-4 py-2.5 text-sm placeholder:text-mist/30 focus:border-blue-bright/50 outline-none';

function initials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
}

function AvatarSection() {
  const { user, refresh } = useAuth();
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(user?.avatarUrl || null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const dataUrl = await fileToCompressedDataUrl(file, { maxSize: 256, quality: 0.82 });
      setPreview(dataUrl);
      await authApi.updateProfile({ avatarUrl: dataUrl });
      await refresh();
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't update your photo."));
    } finally {
      setSaving(false);
      e.target.value = ''; // allow re-selecting the same file later
    }
  };

  const removeAvatar = async () => {
    setError('');
    setSaving(true);
    try {
      await authApi.updateProfile({ avatarUrl: null });
      setPreview(null);
      await refresh();
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't remove your photo."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-surface border border-white/5 rounded-xl p-6 mb-6">
      <h2 className="font-display font-semibold mb-1">Profile photo</h2>
      <p className="text-mist/50 text-xs mb-4">Shown in the sidebar. JPG or PNG, resized automatically.</p>
      <ErrorBanner message={error} onRetry={null} />

      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 shrink-0">
          {preview ? (
            <img src={preview} alt="" className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-brand-gradient flex items-center justify-center font-display font-semibold text-white">
              {initials(user?.name)}
            </div>
          )}
          {saving && (
            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center text-[10px] text-white">
              …
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={saving}
            className="flex items-center gap-1.5 bg-ink border border-white/10 text-sm font-medium px-3.5 py-2 rounded-lg hover:border-blue-bright/40 transition-colors disabled:opacity-60"
          >
            <Camera size={14} />
            {preview ? 'Change photo' : 'Upload photo'}
          </button>
          {preview && (
            <button
              type="button"
              onClick={removeAvatar}
              disabled={saving}
              className="flex items-center gap-1.5 text-mist/40 hover:text-red-400 text-sm px-2 transition-colors disabled:opacity-60"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </section>
  );
}

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

  return (
    <AppShell>
      <div className="max-w-lg mx-auto px-6 sm:px-8 py-10">
        <h1 className="font-display text-2xl font-bold mb-8">Settings</h1>

        <AvatarSection />

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
