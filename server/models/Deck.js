const mongoose = require('mongoose');

// Each card carries its own SM-2 spaced repetition state.
const srsSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['new', 'learning', 'review'],
      default: 'new',
    },
    interval: { type: Number, default: 0 }, // days until next review
    repetition: { type: Number, default: 0 }, // consecutive correct reviews
    easeFactor: { type: Number, default: 2.5 },
    nextReviewDate: { type: Date, default: Date.now }, // due immediately until reviewed
    lastReviewedDate: { type: Date },
  },
  { _id: false }
);

const cardSchema = new mongoose.Schema({
  front: { type: String, required: true, trim: true },
  back: { type: String, required: true, trim: true },
  srs: { type: srsSchema, default: () => ({}) },
});

const deckSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
      set: (tags) => tags.map((t) => t.trim().toLowerCase()).filter(Boolean),
      index: true,
    },
    source: {
      type: String,
      enum: ['manual', 'ai-missed'],
      default: 'manual',
    },
    cards: {
      type: [cardSchema],
      default: [],
    },
  },
  { timestamps: true }
);

deckSchema.index({ userId: 1, tags: 1 });

module.exports = mongoose.model('Deck', deckSchema);
