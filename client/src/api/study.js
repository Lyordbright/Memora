import client from './client.js';

export const getDueQueue = (deckId) =>
  client.get(deckId ? `/study/due/${deckId}` : '/study/due').then((r) => r.data);

export const getCramQueue = (deckId) => client.get(`/study/all/${deckId}`).then((r) => r.data.queue);

export const submitReview = (deckId, cardId, rating) =>
  client.post('/study/review', { deckId, cardId, rating }).then((r) => r.data.card);
