/**
 * Generates a batch of multiple-choice quiz questions for a topic.
 * Tries Gemini first, falls back to Groq if Gemini fails or returns
 * malformed data. Every response is validated before being trusted.
 */

const GEMINI_URL = (model, key) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

function buildPrompt(topic, difficulty, numQuestions) {
  return `Generate ${numQuestions} multiple-choice quiz questions about "${topic}" at a ${difficulty} level.

Difficulty guide:
- beginner: assumes no prior knowledge of the topic
- intermediate: assumes familiarity with the basics
- advanced: assumes strong familiarity, tests edge cases and nuance

For each question provide:
- "question": the question text
- "options": an array of exactly 4 strings, one correct answer and three plausible, commonly-confused wrong answers (avoid obviously silly distractors)
- "correctIndex": the 0-based index of the correct option
- "explanation": a 1-2 sentence explanation of why that answer is correct

Respond with ONLY a raw JSON array matching this shape, no markdown code fences, no preamble, no trailing text:
[
  {
    "question": "string",
    "options": ["string", "string", "string", "string"],
    "correctIndex": 0,
    "explanation": "string"
  }
]`;
}

function stripCodeFences(text) {
  return text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
}

function validateQuestions(questions, numQuestions) {
  if (!Array.isArray(questions) || questions.length === 0) return false;

  return questions.every(
    (q) =>
      typeof q.question === 'string' &&
      q.question.trim().length > 0 &&
      Array.isArray(q.options) &&
      q.options.length === 4 &&
      q.options.every((o) => typeof o === 'string' && o.trim().length > 0) &&
      Number.isInteger(q.correctIndex) &&
      q.correctIndex >= 0 &&
      q.correctIndex <= 3 &&
      typeof q.explanation === 'string' &&
      q.explanation.trim().length > 0
  );
}

async function callGemini(prompt) {
  const url = GEMINI_URL(process.env.GEMINI_MODEL || 'gemini-2.5-flash', process.env.GEMINI_API_KEY);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, responseMimeType: 'application/json' },
    }),
  });

  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini returned no content');
  return JSON.parse(stripCodeFences(text));
}

async function callGroq(prompt) {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
      temperature: 0.7,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) throw new Error(`Groq API error: ${res.status}`);
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Groq returned no content');

  // Groq's json_object mode requires the schema to be an object, not a bare
  // array, so we ask for { "questions": [...] } and unwrap it here instead.
  const parsed = JSON.parse(stripCodeFences(text));
  return Array.isArray(parsed) ? parsed : parsed.questions;
}

async function generateQuiz({ topic, difficulty, numQuestions }) {
  const prompt = buildPrompt(topic, difficulty, numQuestions);

  // Try Gemini first.
  try {
    const questions = await callGemini(prompt);
    if (validateQuestions(questions, numQuestions)) {
      return { questions, generatedBy: 'gemini' };
    }
    console.warn('Gemini response failed validation, retrying once');
    const retry = await callGemini(prompt);
    if (validateQuestions(retry, numQuestions)) {
      return { questions: retry, generatedBy: 'gemini' };
    }
    throw new Error('Gemini response failed validation twice');
  } catch (err) {
    console.warn('Gemini failed, falling back to Groq:', err.message);
  }

  // Fall back to Groq.
  const groqPrompt = `${prompt}\n\nWrap the array in an object like {"questions": [...]}.`;
  const questions = await callGroq(groqPrompt);
  if (!validateQuestions(questions, numQuestions)) {
    throw new Error('Both Gemini and Groq failed to produce a valid quiz');
  }
  return { questions, generatedBy: 'groq' };
}

module.exports = { generateQuiz };
