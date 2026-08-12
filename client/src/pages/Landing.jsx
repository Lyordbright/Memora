import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Layers, Brain, ArrowRight } from 'lucide-react';
import InstallButton from '../components/InstallButton.jsx';

const DEMO_CARDS = [
  { front: 'Mitochondria', back: 'The powerhouse of the cell' },
  { front: 'useState', back: 'Returns [state, setState]' },
  { front: 'Sakoku', back: "Japan's isolationist policy, 1633–1853" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

function Reveal({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

function FlipHero() {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const flipTimer = setTimeout(() => setFlipped(true), 1400);
    const nextTimer = setTimeout(() => {
      setFlipped(false);
      setIndex((i) => (i + 1) % DEMO_CARDS.length);
    }, 3200);
    return () => {
      clearTimeout(flipTimer);
      clearTimeout(nextTimer);
    };
  }, [index]);

  const card = DEMO_CARDS[index];

  return (
    <div className="relative w-full max-w-sm mx-auto" style={{ perspective: '1200px' }}>
      <div className="absolute inset-0 translate-y-4 translate-x-3 rounded-2xl bg-surface border border-white/5 rotate-3" />
      <div className="absolute inset-0 translate-y-2 translate-x-1.5 rounded-2xl bg-surface border border-white/5 rotate-1" />

      <motion.div
        className="relative h-56 rounded-2xl cursor-pointer"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0.0, 0.2, 1] }}
        onClick={() => setFlipped((f) => !f)}
      >
        <div
          className="absolute inset-0 rounded-2xl bg-brand-gradient shadow-glow flex items-center justify-center p-8 text-center"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <p className="font-display text-2xl font-semibold text-white">{card.front}</p>
        </div>
        <div
          className="absolute inset-0 rounded-2xl bg-surface border border-blue-bright/30 flex items-center justify-center p-8 text-center"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <p className="font-body text-lg text-mist/90">{card.back}</p>
        </div>
      </motion.div>
      <p className="text-center text-sm text-mist/40 mt-5">tap the card — this is how it feels</p>
    </div>
  );
}

function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`sticky top-0 z-40 flex items-center justify-between px-6 md:px-12 py-5 transition-colors duration-300 ${
        scrolled ? 'bg-ink/80 backdrop-blur-md border-b border-white/5' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="" className="w-8 h-8 rounded-lg" />
          <span className="font-display font-bold text-xl tracking-tight">Memora</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium text-mist/70 hover:text-mist px-4 py-2 transition-colors">
            Log in
          </Link>
          <Link
            to="/signup"
            className="text-sm font-semibold bg-mist text-ink px-4 py-2 rounded-full hover:bg-white transition-colors"
          >
            Sign up free
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}

const STEPS = [
  {
    n: '01',
    title: 'Start with a topic or your own cards',
    body: 'Type any subject and let the AI teacher build a quiz, or write your own front-and-back cards by hand.',
    icon: Layers,
  },
  {
    n: '02',
    title: 'Study or get quizzed',
    body: 'Flip through your deck at your own pace, or answer multiple-choice questions with instant feedback.',
    icon: Brain,
  },
  {
    n: '03',
    title: 'Weak spots become a review deck',
    body: 'Anything you miss is saved automatically and resurfaces on a schedule built to make it stick.',
    icon: Sparkles,
  },
];

const WHY_ITEMS = [
  {
    title: 'Real spaced repetition',
    body: 'A proper SM-2 scheduler behind every card — the same algorithm Anki is built on — with Again/Hard/Good/Easy ratings.',
  },
  {
    title: 'A daily new-card limit',
    body: "Add 200 cards at once and Memora paces them out so you're never overwhelmed on day one.",
  },
  {
    title: 'Tag anything, find it fast',
    body: 'Organize decks with your own tags and filter your dashboard down instantly.',
  },
  {
    title: 'Every quiz, saved',
    body: 'Full history of past AI Teacher sessions, searchable by topic, with a complete replay of each question.',
  },
];

const FAQS = [
  {
    q: 'Is Memora free to use?',
    a: 'Yes. Creating an account, building decks, and using the AI teacher are all free.',
  },
  {
    q: 'What happens to questions I get wrong?',
    a: 'Any missed question from an AI Teacher quiz can be saved as its own flashcard deck with one click, so it comes back around in your regular spaced-repetition review.',
  },
  {
    q: 'Can I use my own study material?',
    a: 'Yes — manual decks let you write your own front-and-back cards for anything, no AI required.',
  },
  {
    q: 'Do I need a Google account to sign up?',
    a: 'No. You can sign up with just an email and password, or use Google sign-in if you prefer.',
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <NavBar />
      <InstallButton />

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pt-10 pb-24 grid md:grid-cols-2 gap-16 items-center">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 text-xs font-medium text-spark bg-spark/10 border border-spark/20 rounded-full px-3 py-1.5 mb-6"
          >
            <Sparkles size={13} />
            Now with an AI teacher
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="font-display text-5xl md:text-6xl font-bold leading-[1.05] tracking-tight"
          >
            Remember <span className="text-gradient">smarter,</span>
            <br />
            not harder.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="mt-6 text-lg text-mist/60 max-w-md leading-relaxed"
          >
            Memora turns anything you want to learn into flashcards — write
            your own, or hand a topic to the AI teacher and let it quiz you
            until it sticks.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.24 }}
            className="mt-9 flex flex-col sm:flex-row gap-3"
          >
            <Link
              to="/signup"
              className="group inline-flex items-center justify-center gap-2 bg-brand-gradient text-white font-semibold px-6 py-3.5 rounded-xl shadow-card hover:shadow-glow transition-shadow"
            >
              Create flashcards
              <ArrowRight size={17} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 bg-surface border border-spark/30 text-mist font-semibold px-6 py-3.5 rounded-xl hover:border-spark/60 hover:bg-spark/5 transition-colors"
            >
              <Sparkles size={17} className="text-spark" />
              Ask the AI teacher
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <FlipHero />
        </motion.div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-20 border-t border-white/5">
        <Reveal>
          <h2 className="font-display text-3xl font-bold text-center mb-16">How Memora works</h2>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-10">
          {STEPS.map((step, i) => (
            <Reveal key={step.n} delay={i * 0.1}>
              <div className="flex items-center gap-3 mb-4">
                <span className="font-display text-sm font-bold text-blue-bright/50">{step.n}</span>
                <div className="h-px flex-1 bg-white/10" />
                <step.icon size={18} className="text-spark" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-mist/55 text-sm leading-relaxed">{step.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Feature split */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-20 border-t border-white/5 grid md:grid-cols-2 gap-8">
        <Reveal className="rounded-2xl bg-surface border border-white/5 p-8">
          <Layers size={22} className="text-blue-bright mb-4" />
          <h3 className="font-display text-xl font-semibold mb-2">Manual decks</h3>
          <p className="text-mist/55 text-sm leading-relaxed mb-6">
            Write your own front-and-back cards, tag them however makes sense
            to you, and flip through a clean card stack whenever you want to
            review.
          </p>
          <div className="rounded-xl bg-ink border border-white/5 h-40 flex items-center justify-center">
            <div className="w-40 h-24 rounded-lg bg-brand-gradient shadow-card" />
          </div>
        </Reveal>
        <Reveal delay={0.1} className="rounded-2xl bg-surface border border-spark/20 p-8">
          <Sparkles size={22} className="text-spark mb-4" />
          <h3 className="font-display text-xl font-semibold mb-2">AI teacher</h3>
          <p className="text-mist/55 text-sm leading-relaxed mb-6">
            Type a topic, pick a difficulty, and get quizzed with multiple
            choice questions — each answer comes with an explanation on the
            spot.
          </p>
          <div className="rounded-xl bg-ink border border-white/5 h-40 p-4 flex flex-col justify-center gap-2">
            <div className="h-2.5 w-3/4 rounded-full bg-white/10" />
            <div className="h-8 rounded-lg bg-spark/15 border border-spark/30" />
            <div className="h-8 rounded-lg bg-white/5" />
          </div>
        </Reveal>
      </section>

      {/* Why Memora */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-20 border-t border-white/5">
        <Reveal>
          <h2 className="font-display text-3xl font-bold text-center mb-4">Why people stick with Memora</h2>
        </Reveal>
        <Reveal delay={0.06}>
          <p className="text-mist/55 text-center max-w-xl mx-auto mb-16">
            Most flashcard apps stop at "make a card." Memora is built around the
            two things that actually make studying work: getting quizzed on
            material you don't know yet, and reviewing it on a schedule that
            fights the forgetting curve.
          </p>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {WHY_ITEMS.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.08} className="rounded-xl bg-surface border border-white/5 p-5">
              <h3 className="font-display font-semibold text-sm mb-2">{item.title}</h3>
              <p className="text-mist/50 text-xs leading-relaxed">{item.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 md:px-12 py-20 border-t border-white/5">
        <Reveal>
          <h2 className="font-display text-3xl font-bold text-center mb-12">Questions</h2>
        </Reveal>
        <div className="space-y-8">
          {FAQS.map((item, i) => (
            <Reveal key={item.q} delay={i * 0.08}>
              <h3 className="font-display font-semibold mb-1.5">{item.q}</h3>
              <p className="text-mist/55 text-sm leading-relaxed">{item.a}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-24 border-t border-white/5 text-center">
        <Reveal>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Start remembering smarter today</h2>
          <p className="text-mist/55 mb-8">Free to use. No credit card.</p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 bg-brand-gradient text-white font-semibold px-7 py-3.5 rounded-xl shadow-card hover:shadow-glow transition-shadow"
          >
            Sign up free
            <ArrowRight size={17} />
          </Link>
        </Reveal>
      </section>

      <footer className="border-t border-white/5 py-10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="" className="w-5 h-5 rounded-md" />
            <span className="text-xs text-mist/40">Memora — remember smarter</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-mist/40">
            <Link to="/privacy" className="hover:text-mist/70 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-mist/70 transition-colors">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
