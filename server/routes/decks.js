const express = require('express');
const Deck = require('../models/Deck');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();
router.use(requireAuth);

// GET /api/decks/tags/all — distinct tags across the user's decks, for autocomplete.
// Must be declared before /:id so "tags" isn't parsed as a deck id.
router.get('/tags/all', async (req, res) => {
  const tags = await Deck.distinct('tags', { userId: req.user._id });
  res.json({ tags: tags.sort() });
});

// GET /api/decks — list current user's decks, optional ?tag= filter
router.get('/', async (req, res) => {
  const filter = { userId: req.user._id };
  if (req.query.tag) filter.tags = req.query.tag.toLowerCase();

  const decks = await Deck.find(filter).sort({ updatedAt: -1 });
  res.json({ decks });
});

// GET /api/decks/:id
router.get('/:id', async (req, res) => {
  const deck = await Deck.findOne({ _id: req.params.id, userId: req.user._id });
  if (!deck) return res.status(404).json({ error: 'Deck not found' });
  res.json({ deck });
});

// POST /api/decks — create a manual deck
router.post('/', async (req, res) => {
  const { title, description, tags, cards } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const deck = await Deck.create({
    userId: req.user._id,
    title,
    description,
    tags: tags || [],
    cards: cards || [],
    source: 'manual',
  });
  res.status(201).json({ deck });
});

// PATCH /api/decks/:id — update title/description/tags
router.patch('/:id', async (req, res) => {
  const { title, description, tags } = req.body;
  const deck = await Deck.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { $set: { ...(title && { title }), ...(description !== undefined && { description }), ...(tags && { tags }) } },
    { new: true }
  );
  if (!deck) return res.status(404).json({ error: 'Deck not found' });
  res.json({ deck });
});

// DELETE /api/decks/:id
router.delete('/:id', async (req, res) => {
  const deck = await Deck.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!deck) return res.status(404).json({ error: 'Deck not found' });
  res.json({ success: true });
});

// POST /api/decks/:id/cards/bulk — add many cards in one request (e.g. pasted list)
router.post('/:id/cards/bulk', async (req, res) => {
  const { cards } = req.body; // [{ front, back }]
  if (!Array.isArray(cards) || cards.length === 0) {
    return res.status(400).json({ error: 'At least one card is required' });
  }
  const valid = cards.filter((c) => c.front?.trim() && c.back?.trim());
  if (valid.length === 0) {
    return res.status(400).json({ error: 'No valid front/back pairs found' });
  }

  const deck = await Deck.findOne({ _id: req.params.id, userId: req.user._id });
  if (!deck) return res.status(404).json({ error: 'Deck not found' });

  deck.cards.push(...valid);
  await deck.save();
  res.status(201).json({ deck, added: valid.length });
});

// POST /api/decks/:id/cards — add a card (starts due immediately, status "new")
router.post('/:id/cards', async (req, res) => {
  const { front, back } = req.body;
  if (!front || !back) return res.status(400).json({ error: 'Front and back are required' });

  const deck = await Deck.findOne({ _id: req.params.id, userId: req.user._id });
  if (!deck) return res.status(404).json({ error: 'Deck not found' });

  deck.cards.push({ front, back });
  await deck.save();
  res.status(201).json({ deck });
});

// PATCH /api/decks/:id/cards/:cardId — edit a card's front/back
router.patch('/:id/cards/:cardId', async (req, res) => {
  const { front, back } = req.body;
  const deck = await Deck.findOne({ _id: req.params.id, userId: req.user._id });
  if (!deck) return res.status(404).json({ error: 'Deck not found' });

  const card = deck.cards.id(req.params.cardId);
  if (!card) return res.status(404).json({ error: 'Card not found' });

  if (front) card.front = front;
  if (back) card.back = back;
  await deck.save();
  res.json({ deck });
});

// DELETE /api/decks/:id/cards/:cardId
router.delete('/:id/cards/:cardId', async (req, res) => {
  const deck = await Deck.findOne({ _id: req.params.id, userId: req.user._id });
  if (!deck) return res.status(404).json({ error: 'Deck not found' });

  deck.cards.id(req.params.cardId)?.deleteOne();
  await deck.save();
  res.json({ deck });
});

// POST /api/decks/from-missed — build a new deck from a quiz session's missed questions
router.post('/from-missed', async (req, res) => {
  const { topic, questions } = req.body; // questions: [{ question, options, correctIndex, explanation }]
  if (!topic || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: 'Topic and at least one missed question are required' });
  }

  const cards = questions.map((q) => ({
    front: q.question,
    back: `${q.options[q.correctIndex]}\n\n${q.explanation}`,
  }));

  const deck = await Deck.create({
    userId: req.user._id,
    title: `${topic} — Missed`,
    tags: [topic.toLowerCase(), 'ai-generated'],
    cards,
    source: 'ai-missed',
  });

  res.status(201).json({ deck });
});

module.exports = router;
