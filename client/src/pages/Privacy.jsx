import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

function LegalShell({ title, updated, children }) {
  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-6 md:px-12 py-12">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-mist/40 hover:text-mist/70 mb-8 transition-colors">
          <ArrowLeft size={13} />
          Back to Memora
        </Link>
        <h1 className="font-display text-3xl font-bold mb-1">{title}</h1>
        <p className="text-mist/40 text-xs mb-10">Last updated {updated}</p>
        <div className="space-y-8 text-sm text-mist/70 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section>
      <h2 className="font-display text-lg font-semibold text-mist mb-2">{title}</h2>
      <div className="space-y-2.5">{children}</div>
    </section>
  );
}

export default function Privacy() {
  return (
    <LegalShell title="Privacy Policy" updated="July 2026">
      <p>
        This policy explains what information Memora collects, how it's used,
        and the choices you have. It's written to be plain and specific
        rather than exhaustive legal boilerplate — if anything here isn't
        clear, reach out and ask.
      </p>

      <Section title="1. Information we collect">
        <p>When you create an account, we collect:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Your name and email address (or the name/email associated with your Google account, if you sign in that way).</li>
          <li>A securely hashed version of your password, if you sign up with email and password — we never store your actual password.</li>
          <li>The flashcard decks, tags, and cards you create.</li>
          <li>Topics, difficulty levels, and results from AI Teacher quiz sessions.</li>
          <li>Basic study activity — review dates, streaks, and spaced-repetition scheduling data — needed to run the app's core features.</li>
        </ul>
      </Section>

      <Section title="2. How your information is used">
        <p>Your information is used to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Operate your account and keep you signed in securely.</li>
          <li>Store and sync your decks, cards, and quiz history across sessions.</li>
          <li>Generate AI Teacher quizzes based on the topics you provide.</li>
          <li>Calculate spaced-repetition schedules and study streaks.</li>
        </ul>
        <p>We do not sell your personal information, and we do not use your data to serve you ads.</p>
      </Section>

      <Section title="3. Third-party services">
        <p>Memora relies on a small number of third-party providers to function:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-mist">Google (OAuth)</strong> — if you choose to sign in with Google, Google shares your name, email, and profile photo with Memora to create your account.</li>
          <li><strong className="text-mist">Google Gemini / Groq (AI providers)</strong> — when you use AI Teacher mode, the topic and difficulty you enter are sent to one of these providers to generate quiz questions. Your account credentials are never shared with them.</li>
          <li><strong className="text-mist">Database hosting</strong> — your account data is stored in a MongoDB database operated on infrastructure chosen by whoever runs this instance of Memora.</li>
        </ul>
      </Section>

      <Section title="4. Cookies">
        <p>
          Memora uses a single essential cookie to keep you logged in (an
          httpOnly authentication token). This cookie is required for the app
          to function and isn't used for advertising or cross-site tracking.
        </p>
      </Section>

      <Section title="5. Data retention and deletion">
        <p>
          Your data is retained for as long as your account exists. If you'd
          like your account and associated data deleted, contact whoever
          operates this instance of Memora to request removal.
        </p>
      </Section>

      <Section title="6. Your rights">
        <p>
          Depending on where you live, you may have rights to access,
          correct, export, or delete your personal data. To exercise any of
          these rights, contact the site operator using the details they've
          provided.
        </p>
      </Section>

      <Section title="7. Changes to this policy">
        <p>
          If this policy changes, the "Last updated" date at the top of this
          page will reflect that. Continued use of Memora after a change
          means you accept the updated policy.
        </p>
      </Section>

      <p className="text-mist/40 text-xs pt-4 border-t border-white/5">
        This is a template policy provided for a self-built application and
        isn't a substitute for legal advice. Whoever operates this instance of
        Memora is responsible for making sure this policy accurately reflects
        their actual data practices and complies with applicable law (such as
        GDPR or CCPA) before publishing it live.
      </p>
    </LegalShell>
  );
}
