import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Sparkles } from 'lucide-react';
import AppShell from '../components/AppShell.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import * as decksApi from '../api/decks.js';
import * as studyApi from '../api/study.js';
import { getErrorMessage } from '../utils/errors.js';

export default function Dashboard() {
  const navigate = useNavigate();
  const [decks, setDecks] = useState([]);
  const [dueByDeck, setDueByDeck] = useState({});
  const [totalDue, setTotalDue] = useState(0);
  const [activeTag, setActiveTag] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewDeck, setShowNewDeck] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [deckList, due] = await Promise.all([decksApi.listDecks(), studyApi.getDueQueue()]);
      setDecks(deckList);
      setTotalDue(due.dueCount + due.newCount);

      const counts = {};
      for (const item of due.queue) {
        counts[item.deckId] = (counts[item.deckId] || 0) + 1;
      }
      setDueByDeck(counts);
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't load your decks."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const allTags = [...new Set(decks.flatMap((d) => d.tags))];
  const filteredDecks = activeTag ? decks.filter((d) => d.tags.includes(activeTag)) : decks;

  const createDeck = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    setCreateError('');
    try {
      const deck = await decksApi.createDeck({ title: newTitle });
      setShowNewDeck(false);
      setNewTitle('');
      navigate(`/decks/${deck._id}`);
    } catch (err) {
      setCreateError(getErrorMessage(err, "Couldn't create the deck."));
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64 text-mist/40 text-sm">Loading your decks…</div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <div className="max-w-5xl mx-auto px-6 sm:px-8 py-10">
          <ErrorBanner message={error} onRetry={load} />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-6 sm:px-8 py-8 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold">Your decks</h1>
            <p className="text-mist/50 text-sm mt-1">
              {totalDue > 0 ? `${totalDue} cards due for review today` : 'Nothing due today — nice work'}
            </p>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <Link
              to="/ai-teacher"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-surface border border-spark/30 text-mist text-sm font-semibold px-4 py-2.5 rounded-lg hover:border-spark/60 transition-colors"
            >
              <Sparkles size={15} className="text-spark" />
              AI Teacher
            </Link>
            <button
              onClick={() => setShowNewDeck((v) => !v)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-brand-gradient text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-card hover:shadow-glow transition-shadow"
            >
              <Plus size={15} />
              New deck
            </button>
          </div>
        </div>

        {showNewDeck && (
          <form onSubmit={createDeck} className="flex gap-2.5 mb-2">
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Deck title"
              autoFocus
              className="flex-1 bg-surface border border-white/10 rounded-lg px-4 py-2.5 text-sm placeholder:text-mist/30 focus:border-blue-bright/50 outline-none"
            />
            <button
              type="submit"
              disabled={creating}
              className="bg-brand-gradient text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-card disabled:opacity-60"
            >
              {creating ? 'Creating…' : 'Create'}
            </button>
          </form>
        )}
        {createError && <p className="text-red-400 text-xs mb-6">{createError}</p>}

        {totalDue > 0 && (
          <Link
            to="/study"
            className="block mb-8 rounded-xl bg-gradient-to-r from-blue/20 to-spark/10 border border-blue-bright/20 p-5 hover:border-blue-bright/40 transition-colors"
          >
            <p className="font-display font-semibold">Study due cards</p>
            <p className="text-mist/55 text-sm mt-0.5">{totalDue} cards ready across all your decks</p>
          </Link>
        )}

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setActiveTag(null)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                !activeTag ? 'bg-blue-bright/20 text-blue-bright' : 'bg-surface text-mist/50 hover:text-mist'
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full capitalize transition-colors ${
                  activeTag === tag ? 'bg-blue-bright/20 text-blue-bright' : 'bg-surface text-mist/50 hover:text-mist'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {filteredDecks.length === 0 ? (
          <p className="text-mist/40 text-sm py-10 text-center">
            No decks yet — create one, or head to the AI Teacher to get started.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDecks.map((deck) => (
              <Link
                key={deck._id}
                to={`/decks/${deck._id}`}
                className="rounded-xl bg-surface border border-white/5 p-5 hover:border-blue-bright/30 transition-colors"
              >
                <h3 className="font-display font-semibold mb-1">{deck.title}</h3>
                <p className="text-mist/40 text-xs mb-4">{deck.cards.length} cards</p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5 flex-wrap">
                    {deck.tags.map((t) => (
                      <span key={t} className="text-[10px] uppercase tracking-wide text-mist/35 bg-white/5 px-2 py-0.5 rounded-full">
                        {t}
                      </span>
                    ))}
                  </div>
                  {dueByDeck[deck._id] > 0 && (
                    <span className="text-xs font-semibold text-blue-bright shrink-0 ml-2">
                      {dueByDeck[deck._id]} due
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
