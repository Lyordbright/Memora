import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Check, X, Save } from 'lucide-react';
import AppShell from '../components/AppShell.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import * as aiApi from '../api/ai.js';
import * as decksApi from '../api/decks.js';
import { getErrorMessage } from '../utils/errors.js';

export default function QuizReplay() {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    aiApi
      .getQuizSession(sessionId)
      .then(setSession)
      .catch((err) => setError(getErrorMessage(err, "Couldn't load this quiz.")))
      .finally(() => setLoading(false));
  };

  useEffect(load, [sessionId]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64 text-mist/40 text-sm">Loading quiz…</div>
      </AppShell>
    );
  }

  if (error || !session) {
    return (
      <AppShell>
        <div className="max-w-lg mx-auto px-6 sm:px-8 py-10">
          <ErrorBanner message={error || 'Quiz not found.'} onRetry={load} />
        </div>
      </AppShell>
    );
  }

  const missed = session.questions.filter((q, i) => session.userAnswers[i] !== q.correctIndex);

  const saveMissedAsDeck = async () => {
    setSaving(true);
    setSaveError('');
    try {
      await decksApi.createDeckFromMissed(session.topic, missed);
      setSaved(true);
    } catch (err) {
      setSaveError(getErrorMessage(err, "Couldn't save that deck — try again."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-lg mx-auto px-6 sm:px-8 py-10">
        <Link to="/history" className="inline-flex items-center gap-1.5 text-xs text-mist/40 hover:text-mist/70 mb-6 transition-colors">
          <ArrowLeft size={13} />
          Back to history
        </Link>

        <h1 className="font-display text-2xl font-bold capitalize">{session.topic}</h1>
        <p className="text-mist/50 text-sm mt-1 mb-8 capitalize">
          {session.difficulty} · {session.score}/{session.questions.length} correct
        </p>

        <div className="space-y-3 mb-8">
          {session.questions.map((q, i) => {
            const userAnswer = session.userAnswers[i];
            const wasCorrect = userAnswer === q.correctIndex;
            return (
              <div key={i} className="bg-surface border border-white/5 rounded-xl p-4">
                <p className="text-sm font-medium mb-3">{q.question}</p>
                <div className="space-y-1.5 mb-3">
                  {q.options.map((opt, oi) => {
                    let style = 'text-mist/40';
                    if (oi === q.correctIndex) style = 'text-emerald-400';
                    else if (oi === userAnswer) style = 'text-red-400';
                    return (
                      <div key={oi} className={`flex items-center gap-2 text-xs ${style}`}>
                        {oi === q.correctIndex && <Check size={12} />}
                        {oi === userAnswer && oi !== q.correctIndex && <X size={12} />}
                        <span>{opt}</span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-mist/50 leading-relaxed border-t border-white/5 pt-2.5">{q.explanation}</p>
              </div>
            );
          })}
        </div>

        {missed.length > 0 && (
          <>
            <ErrorBanner message={saveError} onRetry={null} />
            <button
              onClick={saveMissedAsDeck}
              disabled={saving || saved}
              className="w-full flex items-center justify-center gap-2 bg-brand-gradient text-white font-semibold py-3 rounded-xl shadow-card hover:shadow-glow transition-shadow disabled:opacity-70"
            >
              <Save size={15} />
              {saved ? 'Saved as a deck' : saving ? 'Saving…' : 'Save missed questions as a deck'}
            </button>
          </>
        )}
      </div>
    </AppShell>
  );
}
