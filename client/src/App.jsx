import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Dashboard from './pages/Dashboard.jsx';
import DeckView from './pages/DeckView.jsx';
import StudySession from './pages/StudySession.jsx';
import AITeacherSetup from './pages/AITeacherSetup.jsx';
import QuizFlow from './pages/QuizFlow.jsx';
import QuizSummary from './pages/QuizSummary.jsx';
import History from './pages/History.jsx';
import QuizReplay from './pages/QuizReplay.jsx';
import Settings from './pages/Settings.jsx';
import Privacy from './pages/Privacy.jsx';
import Terms from './pages/Terms.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

function protect(element) {
  return <ProtectedRoute>{element}</ProtectedRoute>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/dashboard" element={protect(<Dashboard />)} />
      <Route path="/decks/:deckId" element={protect(<DeckView />)} />
      <Route path="/study" element={protect(<StudySession />)} />
      <Route path="/study/:deckId" element={protect(<StudySession />)} />
      <Route path="/ai-teacher" element={protect(<AITeacherSetup />)} />
      <Route path="/ai-teacher/quiz" element={protect(<QuizFlow />)} />
      <Route path="/ai-teacher/summary" element={protect(<QuizSummary />)} />
      <Route path="/history" element={protect(<History />)} />
      <Route path="/history/:sessionId" element={protect(<QuizReplay />)} />
      <Route path="/settings" element={protect(<Settings />)} />
    </Routes>
  );
}
