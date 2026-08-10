import React from 'react';
import { useState, useEffect } from 'react';
import { Flame, Layers, CheckCircle2, TrendingUp } from 'lucide-react';
import AppShell from '../components/AppShell.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import * as statsApi from '../api/stats.js';
import { getErrorMessage } from '../utils/errors.js';

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="rounded-xl bg-surface border border-white/5 p-5">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${accent}`}>
        <Icon size={16} className="text-white" />
      </div>
      <p className="font-display text-2xl font-bold">{value}</p>
      <p className="text-mist/50 text-xs mt-0.5">{label}</p>
    </div>
  );
}

function activityColor(count) {
  if (count === 0) return 'bg-white/5';
  if (count <= 3) return 'bg-blue-bright/25';
  if (count <= 8) return 'bg-blue-bright/55';
  if (count <= 15) return 'bg-blue-bright/80';
  return 'bg-brand-gradient';
}

function ActivityHeatmap({ dailyActivity }) {
  // Arrange into weeks (columns of 7 days) for a GitHub-style grid.
  const weeks = [];
  for (let i = 0; i < dailyActivity.length; i += 7) {
    weeks.push(dailyActivity.slice(i, i + 7));
  }

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-1 min-w-max">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day) => (
              <div
                key={day.date}
                title={`${day.date}: ${day.count} review${day.count === 1 ? '' : 's'}`}
                className={`w-3 h-3 rounded-sm ${activityColor(day.count)}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function RatingBar({ breakdown }) {
  const total = breakdown.again + breakdown.hard + breakdown.good + breakdown.easy;
  if (total === 0) {
    return <p className="text-mist/40 text-sm">No reviews yet — this fills in as you study.</p>;
  }

  const segments = [
    { key: 'again', color: 'bg-red-400', label: 'Again' },
    { key: 'hard', color: 'bg-orange-400', label: 'Hard' },
    { key: 'good', color: 'bg-blue-bright', label: 'Good' },
    { key: 'easy', color: 'bg-emerald-400', label: 'Easy' },
  ];

  return (
    <div>
      <div className="h-3 rounded-full overflow-hidden flex mb-3">
        {segments.map((s) => {
          const pct = (breakdown[s.key] / total) * 100;
          return pct > 0 ? <div key={s.key} className={s.color} style={{ width: `${pct}%` }} /> : null;
        })}
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-1.5">
        {segments.map((s) => (
          <div key={s.key} className="flex items-center gap-1.5 text-xs text-mist/60">
            <span className={`w-2 h-2 rounded-full ${s.color}`} />
            {s.label} — {breakdown[s.key]}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Stats() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    statsApi
      .getStatsOverview()
      .then(setData)
      .catch((err) => setError(getErrorMessage(err, "Couldn't load your stats.")))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64 text-mist/40 text-sm">Loading stats…</div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <div className="max-w-4xl mx-auto px-6 sm:px-8 py-10">
          <ErrorBanner message={error} onRetry={load} />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-8 sm:py-10">
        <h1 className="font-display text-2xl font-bold mb-8">Your stats</h1>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Flame} label="Current streak" value={`${data.currentStreak}d`} accent="bg-spark" />
          <StatCard icon={TrendingUp} label="Longest streak" value={`${data.longestStreak}d`} accent="bg-brand-gradient" />
          <StatCard icon={CheckCircle2} label="Total reviews" value={data.totalReviews} accent="bg-blue" />
          <StatCard icon={Layers} label="Decks" value={data.totalDecks} accent="bg-surface border border-white/10" />
        </div>

        <div className="rounded-xl bg-surface border border-white/5 p-6 mb-6">
          <h2 className="font-display font-semibold mb-1">Activity, last 90 days</h2>
          <p className="text-mist/40 text-xs mb-4">Each square is a day — darker means more reviews.</p>
          <ActivityHeatmap dailyActivity={data.dailyActivity} />
        </div>

        <div className="rounded-xl bg-surface border border-white/5 p-6">
          <h2 className="font-display font-semibold mb-1">How your reviews break down</h2>
          <p className="text-mist/40 text-xs mb-4">
            A lower "Again" share generally means you're retaining more of what you study.
          </p>
          <RatingBar breakdown={data.ratingBreakdown} />
        </div>
      </div>
    </AppShell>
  );
}
