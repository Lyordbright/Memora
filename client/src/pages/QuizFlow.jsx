import { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import AppShell from '../components/AppShell.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import * as aiApi from '../api/ai.js';
import { getErrorMessage } from '../utils/errors.js';

export default function QuizFlow() {
  const location = useLocation();
  const navigate = useNavigate();
  const session = location.state?.session;

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [missed, setMissed] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  if (!session) {
    // Someone landed here directly without generating a quiz first.
    return <Navigate to="/ai-teacher" replace />;
  }

  const questions = session.questions;
  const q = questions[index];
  const isLast = index === questions.length - 1;
  const answered = selected !== null;

  const choose = (i) => {
    if (answered) return;
    setSelected(i);
    if (i === q.correctIndex) {
      setScore((s) => s + 1);
    } else {
      setMissed((m) => [...m, q]);
    }
  };

  const next = async () => {
    const updatedAnswers = [...answers, selected];

    if (isLast) {
      setSubmitting(true);
      setSubmitError('');
      try {
        await aiApi.completeQuizSession(session._id, updatedAnswers, score);
        navigate('/ai-teacher/summary', {
          state: { topic: session.topic, score, total: questions.length, missed },
        });
      } catch (err) {
        // The quiz result itself isn't lost — just the save. Let them
        // continue to the summary and note the save didn't go through.
        setSubmitError(getErrorMessage(err, "Couldn't save your results, but here's your score."));
        setTimeout(() => {
          navigate('/ai-teacher/summary', {
            state: { topic: session.topic, score, total: questions.length, missed },
          });
        }, 1800);
      } finally {
        setSubmitting(false);
      }
      return;
    }
    setAnswers(updatedAnswers);
    setSelected(null);
    setIndex((i) => i + 1);
  };

  const optionClass = (i) => {
    if (!answered) return 'bg-surface border-white/10 hover:border-spark/40';
    if (i === q.correctIndex) return 'bg-emerald-500/15 border-emerald-500/40';
    if (i === selected) return 'bg-red-500/15 border-red-500/40';
    return 'bg-surface border-white/5 opacity-50';
  };

  return (
    <AppShell>
      <div className="max-w-lg mx-auto px-6 sm:px-8 py-10">
        <div className="flex items-center justify-between text-xs text-mist/40 mb-2">
          <span>Question {index + 1} of {questions.length}</span>
          <span className="font-semibold text-spark">{score} correct</span>
        </div>
        <div className="h-1 bg-white/5 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-spark-gradient transition-all duration-300"
            style={{ width: `${((index + (answered ? 1 : 0)) / questions.length) * 100}%` }}
          />
        </div>

        <h2 className="font-display text-xl font-semibold mb-6 leading-snug">{q.question}</h2>

        <div className="space-y-2.5 mb-6">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => choose(i)}
              className={`w-full flex items-center justify-between text-left border rounded-xl px-4 py-3.5 text-sm font-medium transition-colors ${optionClass(i)}`}
            >
              {opt}
              {answered && i === q.correctIndex && <Check size={16} className="text-emerald-400" />}
              {answered && i === selected && i !== q.correctIndex && <X size={16} className="text-red-400" />}
            </button>
          ))}
        </div>

        {answered && (
          <div className="bg-surface border border-white/5 rounded-xl p-4 mb-6">
            <p className="text-sm text-mist/70 leading-relaxed">{q.explanation}</p>
          </div>
        )}

        {answered && <ErrorBanner message={submitError} onRetry={null} />}

        {answered && (
          <button
            onClick={next}
            disabled={submitting}
            className="w-full bg-spark-gradient text-white font-semibold py-3 rounded-xl shadow-card hover:shadow-glow transition-shadow disabled:opacity-60"
          >
            {submitting ? 'Saving…' : isLast ? 'See results' : 'Next question'}
          </button>
        )}
      </div>
    </AppShell>
  );
}
