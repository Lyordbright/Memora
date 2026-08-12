import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Layers,
  Brain,
  ArrowRight,
  ChevronDown,
  CheckCircle2,
  RotateCcw,
  Zap,
  Clock3,
  Search,
} from 'lucide-react';

const DEMO_CARDS = [
  {
    front: 'What is spaced repetition?',
    back: 'A learning technique that reviews information at increasing intervals to help move knowledge into long-term memory.',
    category: 'Learning',
  },
  {
    front: 'What does useState return?',
    back: 'An array containing the current state value and a function used to update that state.',
    category: 'React',
  },
  {
    front: 'What was Sakoku?',
    back: "Japan's historical policy of restricting foreign influence and contact, particularly during the Edo period.",
    category: 'History',
  },
];

const FAQS = [
  {
    q: 'What is Memora?',
    a: 'Memora is a study platform that combines flashcards, spaced repetition, and an AI Teacher to help you learn and retain information more effectively.',
  },
  {
    q: 'Is Memora free to use?',
    a: 'Yes. Creating an account, building decks, and using the core AI Teacher experience are free.',
  },
  {
    q: 'Can I create my own flashcards?',
    a: 'Yes. You can create your own decks and write custom front-and-back cards for any subject you are studying.',
  },
  {
    q: 'What does the AI Teacher do?',
    a: 'The AI Teacher takes a topic you provide and turns it into an interactive quiz with multiple-choice questions and explanations.',
  },
  {
    q: 'What happens when I get an answer wrong?',
    a: 'Missed questions can become review material so you can focus more attention on areas where you need improvement.',
  },
  {
    q: 'Does Memora track my progress?',
    a: 'Yes. Your study activity, quiz history, and performance can be used to help you understand your progress over time.',
  },
  {
    q: 'Do I need a Google account?',
    a: 'No. You can create an account with your email and password. Google sign-in is available as an additional option.',
  },
  {
    q: 'Can I use Memora on my phone?',
    a: 'Yes. The interface is designed to work across desktop and mobile screen sizes, making it convenient to study wherever you are.',
  },
];

const STEPS = [
  {
    n: '01',
    title: 'Create or generate',
    body: 'Build your own flashcards or give the AI Teacher a topic and let it create an interactive learning experience.',
    icon: Layers,
  },
  {
    n: '02',
    title: 'Study actively',
    body: 'Flip through your cards or test yourself with quizzes instead of simply rereading the same material.',
    icon: Brain,
  },
  {
    n: '03',
    title: 'Review what matters',
    body: 'Use spaced repetition and your study history to keep difficult material in your review cycle.',
    icon: Sparkles,
  },
];

function FlipHero() {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const flipTimer = setTimeout(() => setFlipped(true), 1800);

    const nextTimer = setTimeout(() => {
      setFlipped(false);
      setIndex((i) => (i + 1) % DEMO_CARDS.length);
    }, 5000);

    return () => {
      clearTimeout(flipTimer);
      clearTimeout(nextTimer);
    };
  }, [index]);

  const card = DEMO_CARDS[index];

  return (
    <div
      className="relative w-full max-w-md mx-auto"
      style={{ perspective: '1400px' }}
    >
      {/* Glow behind card */}
      <div
        style={{
          position: 'absolute',
          inset: '15%',
          background:
            'radial-gradient(circle, rgba(59,130,246,.18), transparent 65%)',
          filter: 'blur(35px)',
          pointerEvents: 'none',
        }}
      />

      {/* Decorative stack */}
      <motion.div
        animate={{ rotate: 5, y: 16, x: 13 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 24,
          background: 'var(--surface, #111827)',
          border: '1px solid rgba(255,255,255,.06)',
          opacity: 0.7,
        }}
      />

      <motion.div
        animate={{ rotate: -3, y: 8, x: 6 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 24,
          background: 'var(--surface, #111827)',
          border: '1px solid rgba(255,255,255,.08)',
        }}
      />

      {/* Main card */}
      <motion.div
        onClick={() => setFlipped((f) => !f)}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{
          duration: 0.7,
          ease: [0.4, 0, 0.2, 1],
        }}
        style={{
          position: 'relative',
          height: 330,
          cursor: 'pointer',
          transformStyle: 'preserve-3d',
          borderRadius: 24,
        }}
        whileHover={{ y: -6 }}
      >
        {/* Front */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 24,
            padding: 28,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background:
              'linear-gradient(135deg, var(--brand-start, #2563eb), var(--brand-end, #4f46e5))',
            boxShadow:
              '0 25px 70px rgba(0,0,0,.35), 0 0 45px rgba(59,130,246,.12)',
            backfaceVisibility: 'hidden',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '.08em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,.7)',
              }}
            >
              {card.category}
            </span>

            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                display: 'grid',
                placeItems: 'center',
                background: 'rgba(255,255,255,.12)',
              }}
            >
              <RotateCcw size={16} color="white" />
            </div>
          </div>

          <div>
            <p
              style={{
                margin: 0,
                color: 'rgba(255,255,255,.62)',
                fontSize: 12,
                marginBottom: 10,
              }}
            >
              QUESTION
            </p>

            <h3
              style={{
                margin: 0,
                color: '#fff',
                fontSize: 28,
                lineHeight: 1.15,
                fontWeight: 700,
              }}
            >
              {card.front}
            </h3>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: 'rgba(255,255,255,.7)',
              fontSize: 12,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#fff',
                opacity: 0.7,
              }}
            />
            Click to reveal answer
          </div>
        </div>

        {/* Back */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 24,
            padding: 28,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'var(--surface, #111827)',
            border: '1px solid rgba(59,130,246,.3)',
            boxShadow: '0 25px 70px rgba(0,0,0,.35)',
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '.08em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,.4)',
              }}
            >
              ANSWER
            </span>

            <CheckCircle2 size={18} className="text-spark" />
          </div>

          <p
            style={{
              color: 'rgba(255,255,255,.86)',
              fontSize: 19,
              lineHeight: 1.55,
              margin: 0,
            }}
          >
            {card.back}
          </p>

          <div
            style={{
              paddingTop: 16,
              borderTop: '1px solid rgba(255,255,255,.07)',
              color: 'rgba(255,255,255,.4)',
              fontSize: 12,
            }}
          >
            That's the basic Memora experience.
          </div>
        </div>
      </motion.div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 7,
          marginTop: 20,
        }}
      >
        {DEMO_CARDS.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setIndex(i);
              setFlipped(false);
            }}
            aria-label={`Show demo card ${i + 1}`}
            style={{
              width: i === index ? 22 : 7,
              height: 7,
              border: 0,
              borderRadius: 999,
              padding: 0,
              cursor: 'pointer',
              background:
                i === index
                  ? 'rgba(255,255,255,.75)'
                  : 'rgba(255,255,255,.18)',
              transition: 'all .25s ease',
            }}
          />
        ))}
      </div>

      <p
        style={{
          textAlign: 'center',
          color: 'rgba(255,255,255,.35)',
          fontSize: 12,
          marginTop: 12,
        }}
      >
        Tap the card to flip it
      </p>
    </div>
  );
}

function NavBar() {
  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(18px)',
        background: 'rgba(0,0,0,.35)',
        borderBottom: '1px solid rgba(255,255,255,.04)',
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '18px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <img
            src="/logo.png"
            alt="Memora"
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
            }}
          />

          <span
            style={{
              fontWeight: 800,
              fontSize: 20,
              letterSpacing: '-.03em',
            }}
          >
            Memora
          </span>
        </Link>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Link
            to="/login"
            style={{
              textDecoration: 'none',
              color: 'rgba(255,255,255,.65)',
              fontSize: 14,
              fontWeight: 600,
              padding: '10px 14px',
              borderRadius: 10,
              transition: 'all .2s ease',
            }}
          >
            Log in
          </Link>

          <Link
            to="/signup"
            style={{
              textDecoration: 'none',
              color: '#111',
              background: '#fff',
              fontSize: 14,
              fontWeight: 700,
              padding: '10px 16px',
              borderRadius: 11,
              transition: 'all .2s ease',
            }}
          >
            Sign up free
          </Link>
        </div>
      </div>
    </nav>
  );
}

function SectionHeading({ eyebrow, title, body }) {
  return (
    <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 55px' }}>
      {eyebrow && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            color: 'rgb(96,165,250)',
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: '.1em',
            textTransform: 'uppercase',
            marginBottom: 12,
          }}
        >
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: 'currentColor',
            }}
          />
          {eyebrow}
        </div>
      )}

      <h2
        style={{
          fontSize: 'clamp(28px, 4vw, 40px)',
          lineHeight: 1.1,
          fontWeight: 800,
          letterSpacing: '-.035em',
          margin: 0,
        }}
      >
        {title}
      </h2>

      {body && (
        <p
          style={{
            color: 'rgba(255,255,255,.5)',
            lineHeight: 1.7,
            margin: '16px auto 0',
            fontSize: 15,
          }}
        >
          {body}
        </p>
      )}
    </div>
  );
}

export default function Landing() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div
      style={{
        minHeight: '100vh',
        overflowX: 'hidden',
      }}
    >
      <NavBar />

      {/* HERO */}
      <section
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '80px 24px 110px',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(360px, .8fr)',
          gap: 70,
          alignItems: 'center',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              color: 'rgb(96,165,250)',
              background: 'rgba(96,165,250,.08)',
              border: '1px solid rgba(96,165,250,.18)',
              borderRadius: 999,
              padding: '7px 12px',
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 22,
            }}
          >
            <Sparkles size={13} />
            Now with an AI Teacher
          </div>

          <h1
            style={{
              fontSize: 'clamp(48px, 7vw, 78px)',
              lineHeight: .98,
              letterSpacing: '-.055em',
              fontWeight: 850,
              maxWidth: 760,
              margin: 0,
            }}
          >
            Remember{' '}
            <span
              style={{
                background:
                  'linear-gradient(90deg, #60a5fa, #818cf8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              smarter,
            </span>
            <br />
            not harder.
          </h1>

          <p
            style={{
              marginTop: 25,
              color: 'rgba(255,255,255,.58)',
              maxWidth: 570,
              fontSize: 18,
              lineHeight: 1.7,
            }}
          >
            Memora turns anything you want to learn into flashcards. Create
            your own decks or let the AI Teacher quiz you until the material
            actually sticks.
          </p>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 12,
              marginTop: 30,
            }}
          >
            <Link
              to="/signup"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 9,
                textDecoration: 'none',
                color: '#fff',
                fontWeight: 700,
                padding: '14px 20px',
                borderRadius: 13,
                background:
                  'linear-gradient(135deg, #2563eb, #4f46e5)',
                boxShadow: '0 14px 40px rgba(37,99,235,.2)',
              }}
            >
              Start learning free
              <ArrowRight size={17} />
            </Link>

            <Link
              to="/signup"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 9,
                textDecoration: 'none',
                color: 'rgba(255,255,255,.82)',
                fontWeight: 650,
                padding: '14px 20px',
                borderRadius: 13,
                background: 'rgba(255,255,255,.035)',
                border: '1px solid rgba(255,255,255,.09)',
              }}
            >
              <Sparkles size={17} className="text-spark" />
              Try AI Teacher
            </Link>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 20,
              marginTop: 28,
              color: 'rgba(255,255,255,.38)',
              fontSize: 12,
            }}
          >
            <span style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
              <CheckCircle2 size={14} />
              Free to start
            </span>

            <span style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
              <Zap size={14} />
              AI-powered quizzes
            </span>

            <span style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
              <Clock3 size={14} />
              Spaced repetition
            </span>
          </div>
        </div>

        <FlipHero />
      </section>

      {/* HOW IT WORKS */}
      <section
        style={{
          borderTop: '1px solid rgba(255,255,255,.05)',
          padding: '100px 24px',
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <SectionHeading
            eyebrow="Simple workflow"
            title="Everything you need to learn better"
            body="Memora keeps the learning loop simple: create, test, review, repeat."
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 18,
            }}
          >
            {STEPS.map((step) => {
              const Icon = step.icon;

              return (
                <motion.div
                  key={step.n}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    position: 'relative',
                    padding: 25,
                    borderRadius: 18,
                    background: 'rgba(255,255,255,.025)',
                    border: '1px solid rgba(255,255,255,.06)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 28,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: 'rgba(96,165,250,.55)',
                      }}
                    >
                      {step.n}
                    </span>

                    <div
                      style={{
                        width: 36,
                        height: 36,
                        display: 'grid',
                        placeItems: 'center',
                        borderRadius: 10,
                        background: 'rgba(96,165,250,.08)',
                      }}
                    >
                      <Icon size={18} className="text-spark" />
                    </div>
                  </div>

                  <h3
                    style={{
                      fontSize: 17,
                      margin: '0 0 9px',
                      fontWeight: 750,
                    }}
                  >
                    {step.title}
                  </h3>

                  <p
                    style={{
                      color: 'rgba(255,255,255,.48)',
                      fontSize: 13,
                      lineHeight: 1.7,
                      margin: 0,
                    }}
                  >
                    {step.body}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section
        style={{
          borderTop: '1px solid rgba(255,255,255,.05)',
          padding: '100px 24px',
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 20,
          }}
        >
          <motion.div
            whileHover={{ y: -5 }}
            style={{
              padding: 30,
              borderRadius: 20,
              background: 'rgba(255,255,255,.025)',
              border: '1px solid rgba(255,255,255,.06)',
            }}
          >
            <Layers size={23} className="text-blue-bright" />

            <h3
              style={{
                fontSize: 22,
                margin: '18px 0 10px',
                fontWeight: 750,
              }}
            >
              Your cards, your way
            </h3>

            <p
              style={{
                color: 'rgba(255,255,255,.5)',
                fontSize: 14,
                lineHeight: 1.7,
                marginBottom: 25,
              }}
            >
              Create your own decks and organize the material exactly how you
              want to study it.
            </p>

            <div
              style={{
                height: 180,
                borderRadius: 15,
                background: '#080d18',
                border: '1px solid rgba(255,255,255,.05)',
                padding: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: '75%',
                  height: 105,
                  borderRadius: 13,
                  background:
                    'linear-gradient(135deg, #2563eb, #4f46e5)',
                  boxShadow: '0 20px 45px rgba(37,99,235,.15)',
                  transform: 'rotate(-3deg)',
                }}
              />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            style={{
              padding: 30,
              borderRadius: 20,
              background: 'rgba(255,255,255,.025)',
              border: '1px solid rgba(96,165,250,.15)',
            }}
          >
            <Sparkles size={23} className="text-spark" />

            <h3
              style={{
                fontSize: 22,
                margin: '18px 0 10px',
                fontWeight: 750,
              }}
            >
              Meet your AI Teacher
            </h3>

            <p
              style={{
                color: 'rgba(255,255,255,.5)',
                fontSize: 14,
                lineHeight: 1.7,
                marginBottom: 25,
              }}
            >
              Give Memora a topic and get challenged with questions designed
              around what you're learning.
            </p>

            <div
              style={{
                height: 180,
                borderRadius: 15,
                background: '#080d18',
                border: '1px solid rgba(255,255,255,.05)',
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: 10,
              }}
            >
              <div
                style={{
                  height: 9,
                  width: '70%',
                  borderRadius: 999,
                  background: 'rgba(255,255,255,.1)',
                }}
              />

              <div
                style={{
                  padding: 13,
                  borderRadius: 10,
                  background: 'rgba(96,165,250,.08)',
                  border: '1px solid rgba(96,165,250,.2)',
                  color: 'rgba(255,255,255,.7)',
                  fontSize: 12,
                }}
              >
                Which concept best explains this?
              </div>

              <div
                style={{
                  height: 38,
                  borderRadius: 9,
                  background: 'rgba(255,255,255,.035)',
                }}
              />

              <div
                style={{
                  height: 38,
                  borderRadius: 9,
                  background: 'rgba(255,255,255,.035)',
                }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* WHY MEMORA */}
      <section
        style={{
          borderTop: '1px solid rgba(255,255,255,.05)',
          padding: '100px 24px',
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <SectionHeading
            eyebrow="Built for retention"
            title="More than just flashcards"
            body="Memora is designed around active recall, spaced repetition, and understanding where you need more practice."
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 16,
            }}
          >
            {[
              {
                icon: Brain,
                title: 'Active recall',
                body: 'Test yourself instead of passively rereading your notes.',
              },
              {
                icon: Clock3,
                title: 'Spaced repetition',
                body: 'Review cards at useful intervals so knowledge has a better chance of sticking.',
              },
              {
                icon: Search,
                title: 'Find anything fast',
                body: 'Organize decks with tags and quickly find the material you need.',
              },
              {
                icon: Sparkles,
                title: 'AI-powered learning',
                body: 'Turn a topic into an interactive quiz with explanations and feedback.',
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.title}
                  whileHover={{ y: -4 }}
                  style={{
                    padding: 22,
                    borderRadius: 16,
                    background: 'rgba(255,255,255,.025)',
                    border: '1px solid rgba(255,255,255,.06)',
                  }}
                >
                  <Icon size={19} className="text-spark" />

                  <h3
                    style={{
                      fontSize: 15,
                      fontWeight: 750,
                      margin: '17px 0 8px',
                    }}
                  >
                    {item.title}
                  </h3>

                  <p
                    style={{
                      margin: 0,
                      color: 'rgba(255,255,255,.45)',
                      fontSize: 12,
                      lineHeight: 1.7,
                    }}
                  >
                    {item.body}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        style={{
          borderTop: '1px solid rgba(255,255,255,.05)',
          padding: '100px 24px',
        }}
      >
        <div style={{ maxWidth: 850, margin: '0 auto' }}>
          <SectionHeading
            eyebrow="FAQ"
            title="Questions about Memora?"
            body="Everything you need to know before you start studying."
          />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {FAQS.map((item, index) => {
              const isOpen = openFaq === index;

              return (
                <div
                  key={item.q}
                  style={{
                    borderRadius: 15,
                    overflow: 'hidden',
                    background: isOpen
                      ? 'rgba(96,165,250,.045)'
                      : 'rgba(255,255,255,.025)',
                    border: isOpen
                      ? '1px solid rgba(96,165,250,.2)'
                      : '1px solid rgba(255,255,255,.06)',
                    transition: 'all .25s ease',
                  }}
                >
                  <button
                    onClick={() =>
                      setOpenFaq(isOpen ? null : index)
                    }
                    aria-expanded={isOpen}
                    style={{
                      width: '100%',
                      border: 0,
                      background: 'transparent',
                      color: 'inherit',
                      cursor: 'pointer',
                      padding: '20px 22px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 20,
                      textAlign: 'left',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: 'rgba(255,255,255,.85)',
                      }}
                    >
                      {item.q}
                    </span>

                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        flexShrink: 0,
                        display: 'grid',
                        placeItems: 'center',
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        background: 'rgba(255,255,255,.05)',
                      }}
                    >
                      <ChevronDown size={16} />
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                      >
                        <p
                          style={{
                            margin: 0,
                            padding: '0 22px 21px',
                            color: 'rgba(255,255,255,.5)',
                            fontSize: 13,
                            lineHeight: 1.75,
                          }}
                        >
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section
        style={{
          padding: '100px 24px 115px',
          borderTop: '1px solid rgba(255,255,255,.05)',
        }}
      >
        <div
          style={{
            maxWidth: 900,
            margin: '0 auto',
            textAlign: 'center',
            padding: '65px 30px',
            borderRadius: 26,
            background:
              'radial-gradient(circle at top, rgba(59,130,246,.11), transparent 55%), rgba(255,255,255,.025)',
            border: '1px solid rgba(255,255,255,.07)',
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              margin: '0 auto 20px',
              borderRadius: 14,
              display: 'grid',
              placeItems: 'center',
              background: 'rgba(96,165,250,.1)',
            }}
          >
            <Sparkles size={21} className="text-spark" />
          </div>

          <h2
            style={{
              fontSize: 'clamp(30px, 5vw, 46px)',
              lineHeight: 1.05,
              letterSpacing: '-.04em',
              margin: 0,
              fontWeight: 800,
            }}
          >
            Start remembering smarter.
          </h2>

          <p
            style={{
              color: 'rgba(255,255,255,.48)',
              margin: '15px auto 28px',
              fontSize: 14,
            }}
          >
            Create your first deck and start learning for free.
          </p>

          <Link
            to="/signup"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 9,
              textDecoration: 'none',
              color: '#fff',
              fontWeight: 700,
              padding: '14px 22px',
              borderRadius: 13,
              background:
                'linear-gradient(135deg, #2563eb, #4f46e5)',
              boxShadow: '0 15px 45px rgba(37,99,235,.2)',
            }}
          >
            Create your account
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: '1px solid rgba(255,255,255,.05)',
          padding: '35px 24px',
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
            }}
          >
            <img
              src="/logo.png"
              alt="Memora"
              style={{
                width: 25,
                height: 25,
                borderRadius: 7,
              }}
            />

            <span
              style={{
                color: 'rgba(255,255,255,.35)',
                fontSize: 12,
              }}
            >
              Memora — remember smarter
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 22,
              fontSize: 12,
            }}
          >
            <Link
              to="/privacy"
              style={{
                color: 'rgba(255,255,255,.35)',
                textDecoration: 'none',
              }}
            >
              Privacy Policy
            </Link>

            <Link
              to="/terms"
              style={{
                color: 'rgba(255,255,255,.35)',
                textDecoration: 'none',
              }}
            >
              Terms & Conditions
            </Link>
          </div>
        </div>
      </footer>

      {/* Responsive adjustments */}
      <style>
        {`
          @media (max-width: 850px) {
            nav + section {
              grid-template-columns: 1fr !important;
              padding-top: 55px !important;
              gap: 65px !important;
            }
          }

          @media (max-width: 600px) {
            nav {
              position: relative !important;
            }

            nav > div {
              padding-left: 16px !important;
              padding-right: 16px !important;
            }

            nav a {
              font-size: 13px !important;
            }

            nav a:last-child {
              padding: 9px 12px !important;
            }

            h1 {
              font-size: 48px !important;
            }
          }
        `}
      </style>
    </div>
  );
}

