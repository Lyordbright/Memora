const mongoose = require('mongoose');

const reviewLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    deckId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Deck',
      required: true,
    },
    cardId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    rating: {
      type: String,
      enum: ['again', 'hard', 'good', 'easy'],
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

reviewLogSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('ReviewLog', reviewLogSchema);
