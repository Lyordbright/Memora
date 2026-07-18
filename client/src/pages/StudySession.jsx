import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import AppShell from '../components/AppShell.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import * as studyApi from '../api/study.js';
import { getErrorMessage } from '../utils/errors.js';

const RATING_BUTTONS = [
  { key: 'again', label: 'Again', sub: '<1d', className: 'bg-red-500/15 text-red-300 hover:bg-red-500/25' },
  { key: 'hard', label: 'Hard', sub: '~1d', className: 'bg-orange-500/15 text-orange-300 hover:bg-orange-500/25' },
  { key: 'good', label: 'Good', sub: '~3d', className: 'bg-blue-bright/15 text-blue-bright hover:bg-blue-bright/25' },
  { key: 'easy', label: 'Easy', sub: '~6d', className: 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25' },
];

export default function StudySession() {
  const { deckId } = useParams();
  const [searchParams] = useSearchParams();
  const isCram = searchParams.get('mode') === 'cram';

  const [queue, setQueue] = useState([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [rateError, setRateError] = useState('');
  const [rating, setRating] = useState(false);

  const load = () => {
    setLoading(true);
    setLoadError('');
    const fetcher = isCram ? studyApi.getCramQueue(deckId) : studyApi.getDueQueue(deckId).then((d) => d.queue);
    fetcher
      .then(setQueue)
      .catch((err) => setLoadError(getErrorMessage(err, "Couldn't load today's cards.")))
      .finally(() => setLoading(false));
  };

  useEffect(load, [deckId, isCram]);

  const card = queue[index];
  const done = index >= queue.length;

  const rate = async (key) => {
    setRating(true);
    setRateError('');
    try {
      await studyApi.submitReview(card.deckId, card.cardId, key);
      setFlipped(false);
      setIndex((i) => i + 1);
    } catch (err) {
      // Keep the card on screen so the rating isn't silently lost.
      setRateError(getErrorMessage(err, "Couldn't save that — try again."));
    } finally {
      setRating(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64 text-mist/40 text-sm">Loading today's cards…</div>
      </AppShell>
    );
  }

  if (loadError) {
    return (
      <AppShell>
        <div className="max-w-lg mx-auto px-6 sm:px-8 py-10">
          <ErrorBanner message={loadError} onRetry={load} />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-lg mx-auto px-6 sm:px-8 py-10">
        {isCram && (
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-spark bg-spark/10 border border-spark/20 rounded-full px-3 py-1 mb-4">
            Cram mode — reviewing every card
          </div>
        )}
        <div className="h-1 bg-white/5 rounded-full mb-10 overflow-hidden">
          <div
            className="h-full bg-brand-gradient transition-all duration-300"
            style={{ width: queue.length ? `${(index / queue.length) * 100}%` : '0%' }}
          />
        </div>

        {done ? (
          <div className="text-center py-20">
            <h2 className="font-display text-2xl font-bold mb-2">
              {isCram ? 'Deck complete' : 'All caught up'}
            </h2>
            <p className="text-mist/50 text-sm">
              {isCram ? "You've reviewed every card in this deck." : 'No more cards due right now. Come back tomorrow.'}
            </p>
          </div>
        ) : (
          <>
            <div style={{ perspective: '1200px' }}>
              <motion.div
                className="relative h-72 rounded-2xl cursor-pointer"
                style={{ transformStyle: 'preserve-3d' }}
                animate={{ rotateY: flipped ? 180 : 0 }}
                transition={{ duration: 0.5 }}
                onClick={() => setFlipped((f) => !f)}
              >
                <div
                  className="absolute inset-0 rounded-2xl bg-surface border border-white/10 flex items-center justify-center p-8 text-center"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <p className="font-display text-2xl font-semibold">{card.front}</p>
                </div>
                <div
                  className="absolute inset-0 rounded-2xl bg-brand-gradient flex items-center justify-center p-8 text-center"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <p className="text-white/95 leading-relaxed whitespace-pre-line">{card.back}</p>
                </div>
              </motion.div>
            </div>

            {!flipped ? (
              <p className="text-center text-sm text-mist/40 mt-6">tap the card to reveal the answer</p>
            ) : (
              <>
                <ErrorBanner message={rateError} onRetry={null} />
                <div className="grid grid-cols-4 gap-2.5 mt-6">
                  {RATING_BUTTONS.map((btn) => (
                    <button
                      key={btn.key}
                      onClick={() => rate(btn.key)}
                      disabled={rating}
                      className={`rounded-lg py-3 text-center transition-colors disabled:opacity-50 ${btn.className}`}
                    >
                      <div className="text-sm font-semibold">{btn.label}</div>
                      <div className="text-[10px] opacity-70">{btn.sub}</div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
