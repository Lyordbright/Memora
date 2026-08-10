import client from './client.js';

export const getDueQueue = (deckId) =>
  client.get(deckId ? `/study/due/${deckId}` : '/study/due').then((r) => r.data);

// Practice mode: every card, ignoring the schedule. Pass a deckId to scope
// to one deck, or omit it to practice across every deck at once.
export const getCramQueue = (deckId) =>
  client.get(deckId ? `/study/all/${deckId}` : '/study/all').then((r) => r.data.queue);

export const submitReview = (deckId, cardId, rating) =>
  client.post('/study/review', { deckId, cardId, rating }).then((r) => r.data.card);
