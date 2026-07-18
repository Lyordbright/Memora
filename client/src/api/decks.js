import client from './client.js';

export const listDecks = (tag) =>
  client.get('/decks', { params: tag ? { tag } : {} }).then((r) => r.data.decks);

export const listAllTags = () => client.get('/decks/tags/all').then((r) => r.data.tags);

export const getDeck = (id) => client.get(`/decks/${id}`).then((r) => r.data.deck);

export const createDeck = (payload) => client.post('/decks', payload).then((r) => r.data.deck);

export const updateDeck = (id, payload) => client.patch(`/decks/${id}`, payload).then((r) => r.data.deck);

export const deleteDeck = (id) => client.delete(`/decks/${id}`).then((r) => r.data);

export const addCard = (deckId, front, back) =>
  client.post(`/decks/${deckId}/cards`, { front, back }).then((r) => r.data.deck);

export const addCardsBulk = (deckId, cards) =>
  client.post(`/decks/${deckId}/cards/bulk`, { cards }).then((r) => r.data.deck);

export const updateCard = (deckId, cardId, payload) =>
  client.patch(`/decks/${deckId}/cards/${cardId}`, payload).then((r) => r.data.deck);

export const deleteCard = (deckId, cardId) =>
  client.delete(`/decks/${deckId}/cards/${cardId}`).then((r) => r.data.deck);

export const createDeckFromMissed = (topic, questions) =>
  client.post('/decks/from-missed', { topic, questions }).then((r) => r.data.deck);
