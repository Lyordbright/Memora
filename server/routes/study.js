const express = require('express');
const Deck = require('../models/Deck');
const ReviewLog = require('../models/ReviewLog');
const requireAuth = require('../middleware/requireAuth');
const { applyReview } = require('../utils/srs');

const router = express.Router();
router.use(requireAuth);

/**
 * Builds today's study queue: all due review/learning cards (no cap, since
 * they're time-sensitive) plus new cards up to the user's daily limit.
 * Optionally scoped to a single deck via req.query.deckId.
 *
 * Each entry includes the card's current srs state (interval, repetition,
 * easeFactor) so the frontend can compute an accurate "you'll see this again
 * in N days" preview per rating button, instead of a generic static guess.
 */
async function buildQueue(userId, dailyLimit, deckId) {
  const filter = { userId };
  if (deckId) filter._id = deckId;

  const decks = await Deck.find(filter);
  const now = new Date();

  const due = [];
  const fresh = [];

  for (const deck of decks) {
    for (const card of deck.cards) {
      const entry = {
        deckId: deck._id,
        deckTitle: deck.title,
        cardId: card._id,
        front: card.front,
        back: card.back,
        srsStatus: card.srs.status,
        srs: {
          interval: card.srs.interval,
          repetition: card.srs.repetition,
          easeFactor: card.srs.easeFactor,
        },
      };
      if (card.srs.status === 'new') {
        fresh.push(entry);
      } else if (card.srs.nextReviewDate <= now) {
        due.push(entry);
      }
    }
  }

  // Review cards first (time-sensitive), then new cards up to the daily cap.
  return [...due, ...fresh.slice(0, dailyLimit)];
}

// GET /api/study/due — today's full queue across all decks
router.get('/due', async (req, res) => {
  const queue = await buildQueue(req.user._id, req.user.dailyNewCardLimit);
  res.json({
    queue,
    dueCount: queue.filter((c) => c.srsStatus !== 'new').length,
    newCount: queue.filter((c) => c.srsStatus === 'new').length,
  });
});

// GET /api/study/due/:deckId — today's queue scoped to one deck
router.get('/due/:deckId', async (req, res) => {
  const queue = await buildQueue(req.user._id, req.user.dailyNewCardLimit, req.params.deckId);
  res.json({
    queue,
    dueCount: queue.filter((c) => c.srsStatus !== 'new').length,
    newCount: queue.filter((c) => c.srsStatus === 'new').length,
  });
});

// GET /api/study/all/:deckId — every card in one deck, ignoring schedule (practice/cram mode)
router.get('/all/:deckId', async (req, res) => {
  const deck = await Deck.findOne({ _id: req.params.deckId, userId: req.user._id });
  if (!deck) return res.status(404).json({ error: 'Deck not found' });

  const queue = deck.cards.map((card) => ({
    deckId: deck._id,
    deckTitle: deck.title,
    cardId: card._id,
    front: card.front,
    back: card.back,
    srsStatus: card.srs.status,
    srs: {
      interval: card.srs.interval,
      repetition: card.srs.repetition,
      easeFactor: card.srs.easeFactor,
    },
  }));

  res.json({ queue });
});

// GET /api/study/all — every card across every deck, ignoring schedule
// (practice mode when nothing is due but the user wants to keep studying)
router.get('/all', async (req, res) => {
  const decks = await Deck.find({ userId: req.user._id });

  const queue = decks.flatMap((deck) =>
    deck.cards.map((card) => ({
      deckId: deck._id,
      deckTitle: deck.title,
      cardId: card._id,
      front: card.front,
      back: card.back,
      srsStatus: card.srs.status,
      srs: {
        interval: card.srs.interval,
        repetition: card.srs.repetition,
        easeFactor: card.srs.easeFactor,
      },
    }))
  );

  res.json({ queue });
});

// POST /api/study/review — submit a rating for one card, returns updated schedule
router.post('/review', async (req, res) => {
  const { deckId, cardId, rating } = req.body;
  if (!['again', 'hard', 'good', 'easy'].includes(rating)) {
    return res.status(400).json({ error: 'Rating must be one of: again, hard, good, easy' });
  }

  const deck = await Deck.findOne({ _id: deckId, userId: req.user._id });
  if (!deck) return res.status(404).json({ error: 'Deck not found' });

  const card = deck.cards.id(cardId);
  if (!card) return res.status(404).json({ error: 'Card not found' });

  card.srs = applyReview(card.srs, rating);
  await deck.save();

  // Log this review for the stats dashboard (streak calendar, rating
  // breakdown, activity over time). Non-fatal if it fails — the review
  // itself already succeeded, so we don't want to error the whole request.
  try {
    await ReviewLog.create({ userId: req.user._id, deckId, cardId, rating });
  } catch (err) {
    console.error('Failed to write review log:', err);
  }

  // Update the user's study streak.
  const today = new Date().toDateString();
  const lastStudy = req.user.streak.lastStudyDate ? new Date(req.user.streak.lastStudyDate).toDateString() : null;
  if (lastStudy !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const wasYesterday = lastStudy === yesterday.toDateString();

    req.user.streak.current = wasYesterday ? req.user.streak.current + 1 : 1;
    req.user.streak.longest = Math.max(req.user.streak.longest, req.user.streak.current);
    req.user.streak.lastStudyDate = new Date();
    await req.user.save();
  }

  res.json({ card });
});

module.exports = router;
