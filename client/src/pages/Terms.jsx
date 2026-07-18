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

export default function Terms() {
  return (
    <LegalShell title="Terms & Conditions" updated="July 2026">
      <p>
        These terms cover the basics of using Memora. By creating an account,
        you agree to them.
      </p>

      <Section title="1. Your account">
        <p>
          You're responsible for keeping your login credentials secure and
          for all activity that happens under your account. Let us know
          right away if you think your account has been accessed without
          your permission.
        </p>
      </Section>

      <Section title="2. Acceptable use">
        <p>You agree not to use Memora to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Generate or store content that's illegal, hateful, or infringes someone else's rights.</li>
          <li>Attempt to disrupt, overload, or gain unauthorized access to the service or other users' accounts.</li>
          <li>Use the AI Teacher feature to generate content unrelated to studying or education, or to abuse the underlying AI providers' usage policies.</li>
        </ul>
      </Section>

      <Section title="3. AI-generated content">
        <p>
          Quiz questions, answer choices, and explanations in AI Teacher mode
          are generated automatically by third-party AI models. While we aim
          for accuracy, AI-generated content can occasionally be incomplete
          or incorrect. Use your own judgment, especially for topics where
          precision matters (medical, legal, financial, or safety-critical
          material).
        </p>
      </Section>

      <Section title="4. Your content">
        <p>
          You own the flashcards and decks you create. By using Memora, you
          grant it the limited right to store and process that content
          solely to provide the service back to you (e.g. displaying your
          decks, scheduling reviews, generating quizzes).
        </p>
      </Section>

      <Section title="5. Service availability">
        <p>
          Memora is provided "as is," without guarantees of uninterrupted
          availability. Features that depend on third-party AI providers
          (Gemini, Groq) may be temporarily unavailable if those providers
          have an outage or change their free-tier terms.
        </p>
      </Section>

      <Section title="6. Termination">
        <p>
          You can stop using Memora and request account deletion at any
          time. We reserve the right to suspend or terminate accounts that
          violate these terms.
        </p>
      </Section>

      <Section title="7. Limitation of liability">
        <p>
          Memora is offered without warranties of any kind. To the fullest
          extent permitted by law, the operator of this Memora instance
          isn't liable for indirect, incidental, or consequential damages
          arising from your use of the service.
        </p>
      </Section>

      <Section title="8. Changes to these terms">
        <p>
          These terms may be updated from time to time. The "Last updated"
          date above reflects the most recent change. Continuing to use
          Memora after an update means you accept the revised terms.
        </p>
      </Section>

      <p className="text-mist/40 text-xs pt-4 border-t border-white/5">
        This is a template set of terms provided for a self-built
        application and isn't a substitute for legal advice. Whoever
        operates this instance of Memora should have these terms reviewed
        by a lawyer before relying on them, especially before charging
        money or handling sensitive data at scale.
      </p>
    </LegalShell>
  );
}
