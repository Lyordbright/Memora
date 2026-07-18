const express = require('express');
const QuizSession = require('../models/QuizSession');
const requireAuth = require('../middleware/requireAuth');
const { generateQuiz } = require('../utils/aiQuiz');

const router = express.Router();
router.use(requireAuth);

// POST /api/ai/generate-quiz — { topic, difficulty, numQuestions }
router.post('/generate-quiz', async (req, res) => {
  try {
    const { topic, difficulty, numQuestions } = req.body;

    if (!topic || !topic.trim()) {
      return res.status(400).json({ error: 'Topic is required' });
    }
    if (!['beginner', 'intermediate', 'advanced'].includes(difficulty)) {
      return res.status(400).json({ error: 'Difficulty must be beginner, intermediate, or advanced' });
    }
    const count = Number(numQuestions);
    if (![5, 10, 15].includes(count)) {
      return res.status(400).json({ error: 'numQuestions must be 5, 10, or 15' });
    }

    const { questions, generatedBy } = await generateQuiz({ topic, difficulty, numQuestions: count });

    // Save the session immediately (userAnswers/score filled in once they finish).
    const session = await QuizSession.create({
      userId: req.user._id,
      topic,
      difficulty,
      generatedBy,
      questions,
    });

    res.status(201).json({ session });
  } catch (err) {
    console.error('generate-quiz failed:', err.message);
    res.status(502).json({ error: 'Could not generate a quiz right now. Please try again.' });
  }
});

// POST /api/ai/quiz-sessions/:id/complete — submit answers + score once finished
router.post('/quiz-sessions/:id/complete', async (req, res) => {
  const { userAnswers, score } = req.body;

  const session = await QuizSession.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { $set: { userAnswers, score } },
    { new: true }
  );
  if (!session) return res.status(404).json({ error: 'Quiz session not found' });

  res.json({ session });
});

// GET /api/ai/quiz-sessions — history, optional ?topic= search
router.get('/quiz-sessions', async (req, res) => {
  const filter = { userId: req.user._id };
  if (req.query.topic) filter.topic = new RegExp(req.query.topic, 'i');

  const sessions = await QuizSession.find(filter).sort({ createdAt: -1 });
  res.json({ sessions });
});

// GET /api/ai/quiz-sessions/:id — full detail/replay view
router.get('/quiz-sessions/:id', async (req, res) => {
  const session = await QuizSession.findOne({ _id: req.params.id, userId: req.user._id });
  if (!session) return res.status(404).json({ error: 'Quiz session not found' });
  res.json({ session });
});

module.exports = router;
