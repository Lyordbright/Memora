import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import AppShell from '../components/AppShell.jsx';
import * as aiApi from '../api/ai.js';

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];
const COUNTS = [5, 10, 15];

export default function AITeacherSetup() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('beginner');
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setLoading(true);
    setError('');
    try {
      const session = await aiApi.generateQuiz(topic, difficulty, count);
      navigate('/ai-teacher/quiz', { state: { session } });
    } catch (err) {
      setError(err.response?.data?.error || 'Could not generate a quiz right now. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-lg mx-auto px-6 sm:px-8 py-14">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-spark-gradient mb-4">
            <Sparkles size={20} className="text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold">What do you want to learn?</h1>
          <p className="text-mist/50 text-sm mt-1.5">Give the AI teacher a topic and it'll quiz you on it</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. World War 2, React Hooks, Cell biology"
            className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3.5 text-sm placeholder:text-mist/30 focus:border-spark/50 outline-none"
            autoFocus
          />

          <div>
            <label className="text-xs font-medium text-mist/50 mb-2 block">Difficulty</label>
            <div className="grid grid-cols-3 gap-2">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`py-2.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                    difficulty === d
                      ? 'bg-spark/20 text-spark border border-spark/40'
                      : 'bg-surface border border-white/10 text-mist/50 hover:text-mist'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-mist/50 mb-2 block">Number of questions</label>
            <div className="grid grid-cols-3 gap-2">
              {COUNTS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCount(c)}
                  className={`py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    count === c
                      ? 'bg-spark/20 text-spark border border-spark/40'
                      : 'bg-surface border border-white/10 text-mist/50 hover:text-mist'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={loading || !topic.trim()}
            className="w-full bg-spark-gradient text-white font-semibold py-3.5 rounded-xl shadow-card hover:shadow-glow transition-shadow disabled:opacity-50"
          >
            {loading ? 'Generating quiz…' : 'Start quiz'}
          </button>
        </form>
      </div>
    </AppShell>
  );
}
