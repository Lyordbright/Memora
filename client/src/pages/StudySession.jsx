import React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shuffle, HelpCircle } from 'lucide-react';
import AppShell from '../components/AppShell.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import * as studyApi from '../api/study.js';
import { getErrorMessage } from '../utils/errors.js';
import { previewIntervals, humanizeInterval } from '../utils/srsPreview.js';

const RATING_META = {
  again: { label: 'Again', className: 'bg-red-500/15 text-red-300 hover:bg-red-500/25' },
  hard: { label: 'Hard', className: 'bg-orange-500/15 text-orange-300 hover:bg-orange-500/25' },
  good: { label: 'Good', className: 'bg-blue-bright/15 text-blue-bright hover:bg-blue-bright/25' },
  easy: { label: 'Easy', className: 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25' },
};

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
  const [showHelp, setShowHelp] = useState(false);

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
  const preview = card ? previewIntervals(card.srs) : null;

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
        <div className="max-w-lg mx-auto px-6 sm:px-8 py-10">
          <div className="flex items-center justify-center h-64 text-mist/40 text-sm">Loading cards…</div>
        </div>
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
        <div className="flex items-center justify-between mb-4">
          {isCram ? (
            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-spark bg-spark/10 border border-spark/20 rounded-full px-3 py-1">
              Practice mode — reviewing every card
            </div>
          ) : (
            <span />
          )}
          {!isCram && (
            <Link
              to={deckId ? `/study/${deckId}?mode=cram` : '/study?mode=cram'}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-mist/50 hover:text-mist/80 transition-colors"
            >
              <Shuffle size={12} />
              Practice more
            </Link>
          )}
        </div>

        <div className="h-1 bg-white/5 rounded-full mb-10 overflow-hidden">
          <div
            className="h-full bg-brand-gradient transition-all duration-300"
            style={{ width: queue.length ? `${(index / queue.length) * 100}%` : '0%' }}
          />
        </div>

        {done ? (
          <div className="text-center py-16">
            <h2 className="font-display text-2xl font-bold mb-2">
              {isCram ? 'Practice complete' : 'All caught up'}
            </h2>
            <p className="text-mist/50 text-sm mb-8">
              {isCram
                ? "You've reviewed every card."
                : 'No more cards due right now — but you can keep practicing anytime.'}
            </p>
            <Link
              to={deckId ? `/study/${deckId}?mode=cram` : '/study?mode=cram'}
              className="inline-flex items-center gap-2 bg-brand-gradient text-white font-semibold px-5 py-3 rounded-xl shadow-card hover:shadow-glow transition-shadow"
            >
              <Shuffle size={15} />
              Keep practicing
            </Link>
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
                <div className="flex items-center justify-center gap-1.5 mt-6 mb-2">
                  <p className="text-center text-xs text-mist/40">How well did you know this?</p>
                  <button
                    onClick={() => setShowHelp((v) => !v)}
                    className="text-mist/30 hover:text-mist/60 transition-colors"
                    aria-label="What do these mean?"
                  >
                    <HelpCircle size={13} />
                  </button>
                </div>
                {showHelp && (
                  <p className="text-center text-xs text-mist/50 bg-surface border border-white/5 rounded-lg px-3 py-2 mb-3 leading-relaxed">
                    Pick honestly, not what you wish were true. Cards you know well come back
                    less often; ones you struggled with come back sooner so they stick.
                  </p>
                )}

                <ErrorBanner message={rateError} onRetry={null} />

                <div className="grid grid-cols-4 gap-2.5 mt-2">
                  {(['again', 'hard', 'good', 'easy']).map((key) => (
                    <button
                      key={key}
                      onClick={() => rate(key)}
                      disabled={rating}
                      className={`rounded-lg py-3 text-center transition-colors disabled:opacity-50 ${RATING_META[key].className}`}
                    >
                      <div className="text-sm font-semibold">{RATING_META[key].label}</div>
                      <div className="text-[10px] opacity-70 mt-0.5">{humanizeInterval(preview[key])}</div>
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
