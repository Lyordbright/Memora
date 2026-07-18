import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import AppShell from '../components/AppShell.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import * as aiApi from '../api/ai.js';
import { getErrorMessage } from '../utils/errors.js';

export default function History() {
  const [query, setQuery] = useState('');
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryTick, setRetryTick] = useState(0);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => {
      setError('');
      aiApi
        .listQuizSessions(query || undefined)
        .then(setSessions)
        .catch((err) => setError(getErrorMessage(err, "Couldn't load your quiz history.")))
        .finally(() => setLoading(false));
    }, 250); // light debounce so typing doesn't fire a request per keystroke
    return () => clearTimeout(timeout);
  }, [query, retryTick]);

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-6 sm:px-8 py-10">
        <h1 className="font-display text-2xl font-bold mb-6">Quiz history</h1>

        <div className="relative mb-6">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mist/30" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by topic"
            className="w-full bg-surface border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm placeholder:text-mist/30 focus:border-blue-bright/50 outline-none"
          />
        </div>

        {loading ? (
          <p className="text-center text-mist/40 text-sm py-10">Loading…</p>
        ) : error ? (
          <ErrorBanner message={error} onRetry={() => setRetryTick((t) => t + 1)} />
        ) : sessions.length === 0 ? (
          <p className="text-center text-mist/40 text-sm py-10">No quizzes found.</p>
        ) : (
          <div className="space-y-2.5">
            {sessions.map((s) => (
              <Link
                key={s._id}
                to={`/history/${s._id}`}
                className="flex items-center justify-between bg-surface border border-white/5 rounded-xl px-5 py-4 hover:border-blue-bright/30 transition-colors"
              >
                <div>
                  <p className="font-medium text-sm">{s.topic}</p>
                  <p className="text-xs text-mist/40 capitalize mt-0.5">
                    {s.difficulty} · {new Date(s.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <span className="text-sm font-semibold text-blue-bright">
                  {s.score}/{s.questions.length}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
