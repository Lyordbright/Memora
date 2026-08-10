const MIN_EASE_FACTOR = 1.3;
const DEFAULT_SRS = { interval: 0, repetition: 0, easeFactor: 2.5 };

/**
 * Given a card's current srs state, returns the interval (in days) that
 * each possible rating would produce — without actually applying it.
 * Mirrors server/utils/srs.js's applyReview() exactly, so what the user
 * sees here matches what actually happens when they tap a button.
 */
export function previewIntervals(srs) {
  const ratings = ['again', 'hard', 'good', 'easy'];
  const result = {};
  const safeSrs = srs || DEFAULT_SRS;

  for (const rating of ratings) {
    let { interval, repetition, easeFactor } = safeSrs;

    switch (rating) {
      case 'again':
        repetition = 0;
        interval = 1;
        easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor - 0.2);
        break;
      case 'hard':
        repetition += 1;
        interval = Math.max(1, Math.round(interval * 1.2)) || 1;
        easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor - 0.15);
        break;
      case 'good':
        repetition += 1;
        if (repetition === 1) interval = 1;
        else if (repetition === 2) interval = 6;
        else interval = Math.round(interval * easeFactor);
        break;
      case 'easy':
        repetition += 1;
        if (repetition === 1) interval = 4;
        else if (repetition === 2) interval = 8;
        else interval = Math.round(interval * easeFactor * 1.3);
        break;
      default:
        break;
    }

    result[rating] = interval;
  }

  return result;
}

/** Turns a day count into a short, plain-English label. */
export function humanizeInterval(days) {
  if (days <= 0) return 'later today';
  if (days === 1) return 'in 1 day';
  if (days < 30) return `in ${days} days`;
  if (days < 60) return 'in about a month';
  return `in ${Math.round(days / 30)} months`;
}
