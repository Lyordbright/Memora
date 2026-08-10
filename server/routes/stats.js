const express = require('express');
const mongoose = require('mongoose');
const Deck = require('../models/Deck');
const ReviewLog = require('../models/ReviewLog');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();
router.use(requireAuth);

// GET /api/stats/overview
router.get('/overview', async (req, res) => {
  const userId = req.user._id;

  const decks = await Deck.find({ userId });
  const totalDecks = decks.length;
  const totalCards = decks.reduce((sum, d) => sum + d.cards.length, 0);
  const cardsInReview = decks.reduce(
    (sum, d) => sum + d.cards.filter((c) => c.srs.status !== 'new').length,
    0
  );

  const totalReviews = await ReviewLog.countDocuments({ userId });

  // Rating breakdown — the closest proxy we have to "retention": a low
  // "again" share means most cards are being remembered, not forgotten.
  const ratingAgg = await ReviewLog.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
  ]);
  const ratingBreakdown = { again: 0, hard: 0, good: 0, easy: 0 };
  ratingAgg.forEach((r) => {
    ratingBreakdown[r._id] = r.count;
  });

  // Daily activity for the last 90 days, for a GitHub-style heatmap.
  const since = new Date();
  since.setDate(since.getDate() - 89);
  since.setHours(0, 0, 0, 0);

  const activityAgg = await ReviewLog.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
  ]);
  const activityMap = {};
  activityAgg.forEach((a) => {
    activityMap[a._id] = a.count;
  });

  // Fill in every day in the range (including zero-review days) so the
  // frontend doesn't have to handle sparse data.
  const dailyActivity = [];
  for (let i = 0; i < 90; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    dailyActivity.push({ date: key, count: activityMap[key] || 0 });
  }

  res.json({
    totalDecks,
    totalCards,
    cardsInReview,
    totalReviews,
    currentStreak: req.user.streak.current,
    longestStreak: req.user.streak.longest,
    ratingBreakdown,
    dailyActivity,
  });
});

module.exports = router;
