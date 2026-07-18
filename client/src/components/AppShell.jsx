import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Layers, Sparkles, History as HistoryIcon, Flame, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const NAV = [
  { to: '/dashboard', label: 'Decks', icon: Layers },
  { to: '/ai-teacher', label: 'AI Teacher', icon: Sparkles },
  { to: '/history', label: 'History', icon: HistoryIcon },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

export default function AppShell({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const streak = user?.streak?.current || 0;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen md:flex">
      {/* Mobile top bar */}
      <header className="md:hidden flex items-center justify-between h-14 px-4 border-b border-white/5 fixed top-0 inset-x-0 bg-ink z-20">
        <Link to="/dashboard" className="flex items-center gap-2">
          <img src="/logo.png" alt="" className="w-6 h-6 rounded-md" />
          <span className="font-display font-bold text-base">Memora</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-mist/60">
            <Flame size={14} className="text-spark" />
            {streak}
          </div>
          <button onClick={handleLogout} className="text-mist/40 hover:text-mist/70">
            <LogOut size={15} />
          </button>
        </div>
      </header>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 border-r border-white/5 flex-col justify-between py-6 px-4 shrink-0">
        <div>
          <Link to="/dashboard" className="flex items-center gap-2.5 px-2 mb-9">
            <img src="/logo.png" alt="" className="w-7 h-7 rounded-lg" />
            <span className="font-display font-bold text-lg">Memora</span>
          </Link>

          <nav className="space-y-1">
            {NAV.map((item) => {
              const active = location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-blue/15 text-blue-bright'
                      : 'text-mist/55 hover:text-mist hover:bg-white/5'
                  }`}
                >
                  <item.icon size={17} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-surface border border-white/5 text-sm">
            <Flame size={16} className="text-spark" />
            <span className="text-mist/70">{streak} day streak</span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-mist/40 hover:text-mist/70 transition-colors"
          >
            <LogOut size={14} />
            Log out
          </button>
        </div>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 h-16 border-t border-white/5 bg-ink z-20 flex items-center">
        {NAV.map((item) => {
          const active = location.pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex-1 flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${
                active ? 'text-blue-bright' : 'text-mist/40'
              }`}
            >
              <item.icon size={19} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <main className="flex-1 overflow-y-auto pt-14 pb-16 md:pt-0 md:pb-0">{children}</main>
    </div>
  );
}
