import React from 'react';
import { useState, useEffect } from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { Sparkles, Save, Check, ChevronRight } from 'lucide-react';
import AppShell from '../components/AppShell.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import * as decksApi from '../api/decks.js';
import { getErrorMessage } from '../utils/errors.js';

export default function QuizSummary() {
  const location = useLocation();
  const { topic, score, total, missed = [], allQuestions = [] } = location.state || {};

  const [decks, setDecks] = useState([]);
  const [loadingDecks, setLoadingDecks] = useState(true);

  const [scope, setScope] = useState(missed.length > 0 ? 'missed' : 'all'); // 'all' | 'missed'
  const [destination, setDestination] = useState('new'); // 'new' | 'existing'
  const [newTitle, setNewTitle] = useState('');
  const [existingDeckId, setExistingDeckId] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (topic) setNewTitle(scope === 'missed' ? `${topic} — Missed` : topic);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, topic]);

  useEffect(() => {
    decksApi
      .listDecks()
      .then((list) => {
        setDecks(list);
        if (list.length > 0) setExistingDeckId(list[0]._id);
      })
      .finally(() => setLoadingDecks(false));
  }, []);

  if (score === undefined) {
    return <Navigate to="/ai-teacher" replace />;
  }

  const questionsToSave = scope === 'all' ? allQuestions : missed;

  const handleSave = async () => {
    if (destination === 'new' && !newTitle.trim()) {
      setSaveError('Give the deck a title first.');
      return;
    }
    if (destination === 'existing' && !existingDeckId) {
      setSaveError('Pick a deck to add these cards to.');
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      await decksApi.saveQuizToDeck({
        questions: questionsToSave,
        deckId: destination === 'existing' ? existingDeckId : undefined,
        title: destination === 'new' ? newTitle.trim() : undefined,
        tags: destination === 'new' ? [topic.toLowerCase(), 'ai-generated'] : undefined,
      });
      setSaved(true);
    } catch (err) {
      setSaveError(getErrorMessage(err, "Couldn't save that — try again."));
    } finally {
      setSaving(false);
    }
  };

  const toggleClass = (active) =>
    `py-2.5 rounded-lg text-sm font-medium transition-colors ${
      active
        ? 'bg-spark/20 text-spark border border-spark/40'
        : 'bg-surface border border-white/10 text-mist/50 hover:text-mist'
    }`;

  return (
    <AppShell>
      <div className="max-w-lg mx-auto px-6 sm:px-8 py-14">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-spark-gradient mb-5">
            <Sparkles size={22} className="text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold mb-1">
            {score}/{total}
          </h1>
          <p className="text-mist/50 text-sm">
            {missed.length === 0 ? 'Perfect score!' : `${missed.length} question${missed.length > 1 ? 's' : ''} missed`}
          </p>
        </div>

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

        {saved ? (
          <div className="flex items-center justify-center gap-2 bg-emerald-500/15 text-emerald-300 font-semibold py-3.5 rounded-xl mb-4">
            <Check size={16} />
            Saved to your decks
          </div>
        ) : (
          <div className="bg-surface border border-white/5 rounded-xl p-5 mb-6 space-y-5">
            <div>
              <p className="text-xs font-medium text-mist/50 mb-2">What do you want to save?</p>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setScope('all')} className={toggleClass(scope === 'all')}>
                  All questions ({allQuestions.length})
                </button>
                <button
                  onClick={() => setScope('missed')}
                  disabled={missed.length === 0}
                  className={toggleClass(scope === 'missed') + (missed.length === 0 ? ' opacity-40 cursor-not-allowed' : '')}
                >
                  Only missed ({missed.length})
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-mist/50 mb-2">Where should it go?</p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button onClick={() => setDestination('new')} className={toggleClass(destination === 'new')}>
                  New deck
                </button>
                <button
                  onClick={() => setDestination('existing')}
                  disabled={decks.length === 0}
                  className={toggleClass(destination === 'existing') + (decks.length === 0 ? ' opacity-40 cursor-not-allowed' : '')}
                >
                  Existing deck
                </button>
              </div>

              {destination === 'new' ? (
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Deck title"
                  className="w-full bg-ink border border-white/10 rounded-lg px-3.5 py-2.5 text-sm placeholder:text-mist/30 focus:border-spark/50 outline-none"
                />
              ) : loadingDecks ? (
                <p className="text-xs text-mist/40">Loading your decks…</p>
              ) : (
                <select
                  value={existingDeckId}
                  onChange={(e) => setExistingDeckId(e.target.value)}
                  className="w-full bg-ink border border-white/10 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-spark/50"
                >
                  {decks.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.title} ({d.cards.length} cards)
                    </option>
                  ))}
                </select>
              )}
            </div>

            <ErrorBanner message={saveError} onRetry={null} />

            <button
              onClick={handleSave}
              disabled={saving || questionsToSave.length === 0}
              className="w-full flex items-center justify-center gap-2 bg-brand-gradient text-white font-semibold py-3 rounded-xl shadow-card hover:shadow-glow transition-shadow disabled:opacity-60"
            >
              <Save size={15} />
              {saving ? 'Saving…' : `Save ${questionsToSave.length} card${questionsToSave.length === 1 ? '' : 's'}`}
            </button>
          </div>
        )}

        <Link
          to="/ai-teacher"
          className="flex items-center justify-center gap-1 text-sm text-mist/50 hover:text-mist py-2 transition-colors"
        >
          Try another topic
          <ChevronRight size={14} />
        </Link>
      </div>
    </AppShell>
  );
}
