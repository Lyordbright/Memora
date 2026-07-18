import client from './client.js';

export const generateQuiz = (topic, difficulty, numQuestions) =>
  client.post('/ai/generate-quiz', { topic, difficulty, numQuestions }).then((r) => r.data.session);

export const completeQuizSession = (sessionId, userAnswers, score) =>
  client
    .post(`/ai/quiz-sessions/${sessionId}/complete`, { userAnswers, score })
    .then((r) => r.data.session);

export const listQuizSessions = (topic) =>
  client.get('/ai/quiz-sessions', { params: topic ? { topic } : {} }).then((r) => r.data.sessions);

export const getQuizSession = (id) => client.get(`/ai/quiz-sessions/${id}`).then((r) => r.data.session);
