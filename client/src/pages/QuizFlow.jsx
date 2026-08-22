import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Check, X, Timer, LogOut } from 'lucide-react';
import AppShell from '../components/AppShell.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import * as aiApi from '../api/ai.js';
import { getErrorMessage } from '../utils/errors.js';

export default function QuizFlow() {
  const location = useLocation();
  const navigate = useNavigate();
  const session = location.state?.session;
  const timed = Boolean(location.state?.timed);
  const timeLimit = location.state?.timeLimit || 25;

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [timedOut, setTimedOut] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [missed, setMissed] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(timeLimit);
  const timerRef = useRef(null);

  const questions = session?.questions || [];
  const q = questions[index];
  const isLast = index === questions.length - 1;
  const answered = selected !== null || timedOut;

  // Per-question countdown, only when timed mode is on.
  useEffect(() => {
    if (!timed || !session || answered) return;
    setSecondsLeft(timeLimit);
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, timed, session]);

  if (!session) {
    return <Navigate to="/ai-teacher" replace />;
  }

  const handleTimeout = () => {
    setTimedOut(true);
    setMissed((m) => [...m, q]);
  };

  const choose = (i) => {
    if (answered) return;
    clearInterval(timerRef.current);
    setSelected(i);
    if (i === q.correctIndex) {
      setScore((s) => s + 1);
    } else {
      setMissed((m) => [...m, q]);
    }
  };

  const next = async () => {
    const updatedAnswers = [...answers, timedOut ? -1 : selected];

    if (isLast) {
      setSubmitting(true);
      setSubmitError('');
      try {
        await aiApi.completeQuizSession(session._id, updatedAnswers, score);
        navigate('/ai-teacher/summary', {
          state: { topic: session.topic, score, total: questions.length, missed, allQuestions: questions },
        });
      } catch (err) {
        setSubmitError(getErrorMessage(err, "Couldn't save your results, but here's your score."));
        setTimeout(() => {
          navigate('/ai-teacher/summary', {
            state: { topic: session.topic, score, total: questions.length, missed, allQuestions: questions },
          });
        }, 1800);
      } finally {
        setSubmitting(false);
      }
      return;
    }
    setAnswers(updatedAnswers);
    setSelected(null);
    setTimedOut(false);
    setIndex((i) => i + 1);
  };

  const optionClass = (i) => {
    if (!answered) return 'bg-surface border-white/10 hover:border-spark/40';
    if (i === q.correctIndex) return 'bg-emerald-500/15 border-emerald-500/40';
    if (i === selected && i !== q.correctIndex) return 'bg-red-500/15 border-red-500/40';
    return 'bg-surface border-white/5 opacity-50';
  };

  return (
    <AppShell>
      <div className="max-w-lg mx-auto px-6 sm:px-8 py-10">
        <div className="flex items-center justify-between text-xs text-mist/40 mb-2">
          <span>Question {index + 1} of {questions.length}</span>
          <div className="flex items-center gap-3">
            {timed && !answered && (
              <span className={`flex items-center gap-1 font-mono ${secondsLeft <= 5 ? 'text-red-400' : 'text-mist/50'}`}>
                <Timer size={12} />
                {secondsLeft}s
              </span>
            )}
            <span className="font-semibold text-spark">{score} correct</span>
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="flex items-center gap-1 text-mist/40 hover:text-red-400 transition-colors"
            >
              <LogOut size={12} />
              Cancel
            </button>
          </div>
        </div>
        <div className="h-1 bg-white/5 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-spark-gradient transition-all duration-300"
            style={{ width: `${((index + (answered ? 1 : 0)) / questions.length) * 100}%` }}
          />
        </div>

        <h2 className="font-display text-xl font-semibold mb-6 leading-snug">{q.question}</h2>

        {timedOut && !selected && (
          <p className="text-xs text-red-400 mb-3">Time's up — here's the answer.</p>
        )}

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

      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-surface border border-white/10 rounded-2xl p-6 max-w-sm w-full">
            <h3 className="font-display font-semibold text-lg mb-2">Cancel this quiz?</h3>
            <p className="text-mist/55 text-sm mb-6">Your progress on this quiz won't be saved.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 bg-white/5 text-mist text-sm font-medium py-2.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                Keep going
              </button>
              <button
                onClick={() => navigate('/ai-teacher')}
                className="flex-1 bg-red-500/15 text-red-300 text-sm font-medium py-2.5 rounded-lg hover:bg-red-500/25 transition-colors"
              >
                Cancel quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
