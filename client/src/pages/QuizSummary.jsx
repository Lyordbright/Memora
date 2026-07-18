import { useState } from 'react';
import { useLocation, useNavigate, Link, Navigate } from 'react-router-dom';
import { Sparkles, Save, Check } from 'lucide-react';
import AppShell from '../components/AppShell.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import * as decksApi from '../api/decks.js';
import { getErrorMessage } from '../utils/errors.js';

export default function QuizSummary() {
  const location = useLocation();
  const { topic, score, total, missed } = location.state || {};
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  if (score === undefined) {
    return <Navigate to="/ai-teacher" replace />;
  }

  const saveMissedAsDeck = async () => {
    setSaving(true);
    setSaveError('');
    try {
      await decksApi.createDeckFromMissed(topic, missed);
      setSaved(true);
    } catch (err) {
      setSaveError(getErrorMessage(err, "Couldn't save that deck — try again."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-lg mx-auto px-6 sm:px-8 py-14 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-spark-gradient mb-5">
          <Sparkles size={22} className="text-white" />
        </div>
        <h1 className="font-display text-3xl font-bold mb-1">
          {score}/{total}
        </h1>
        <p className="text-mist/50 text-sm mb-10">
          {missed.length === 0 ? 'Perfect score — nothing to review.' : `${missed.length} question${missed.length > 1 ? 's' : ''} to review`}
        </p>

        {missed.length > 0 && (
          <div className="text-left space-y-3 mb-8">
            {missed.map((q, i) => (
              <div key={i} className="bg-surface border border-white/5 rounded-xl p-4">
                <p className="text-sm font-medium mb-1.5">{q.question}</p>
                <p className="text-xs text-emerald-400 mb-1">Correct: {q.options[q.correctIndex]}</p>
                <p className="text-xs text-mist/50 leading-relaxed">{q.explanation}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <ErrorBanner message={saveError} onRetry={null} />
          {missed.length > 0 && (
            <button
              onClick={saveMissedAsDeck}
              disabled={saving || saved}
              className="flex items-center justify-center gap-2 bg-brand-gradient text-white font-semibold py-3 rounded-xl shadow-card hover:shadow-glow transition-shadow disabled:opacity-70"
            >
              {saved ? <Check size={15} /> : <Save size={15} />}
              {saved ? 'Saved as a deck' : saving ? 'Saving…' : 'Save missed questions as a deck'}
            </button>
          )}
          <Link to="/ai-teacher" className="text-sm text-mist/50 hover:text-mist py-2 transition-colors">
            Try another topic
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
