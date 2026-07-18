/**
 * SM-2 based scheduler, adapted to a 4-button Again/Hard/Good/Easy scale
 * (the same UX Anki uses) instead of raw SM-2's 0-5 quality score.
 *
 * Mutates and returns a plain object matching the `srs` sub-schema on a card:
 * { status, interval, repetition, easeFactor, nextReviewDate, lastReviewedDate }
 */

const MIN_EASE_FACTOR = 1.3;

function applyReview(srs, rating) {
  const now = new Date();
  let { interval, repetition, easeFactor } = srs;

  switch (rating) {
    case 'again': {
      repetition = 0;
      interval = 1; // back tomorrow (or sooner, if you add same-day relearning steps)
      easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor - 0.2);
      break;
    }
    case 'hard': {
      repetition += 1;
      interval = Math.max(1, Math.round(interval * 1.2)) || 1;
      easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor - 0.15);
      break;
    }
    case 'good': {
      repetition += 1;
      if (repetition === 1) interval = 1;
      else if (repetition === 2) interval = 6;
      else interval = Math.round(interval * easeFactor);
      break;
    }
    case 'easy': {
      repetition += 1;
      if (repetition === 1) interval = 4;
      else if (repetition === 2) interval = 8;
      else interval = Math.round(interval * easeFactor * 1.3);
      easeFactor = easeFactor + 0.15;
      break;
    }
    default:
      throw new Error(`Unknown rating: ${rating}`);
  }

  const nextReviewDate = new Date(now);
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  return {
    status: rating === 'again' ? 'learning' : 'review',
    interval,
    repetition,
    easeFactor,
    nextReviewDate,
    lastReviewedDate: now,
  };
}

module.exports = { applyReview };
