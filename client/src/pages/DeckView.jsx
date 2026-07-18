import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Plus, Play, Tag as TagIcon, Trash2, Pencil, Check, X, Shuffle, ClipboardList } from 'lucide-react';
import AppShell from '../components/AppShell.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import * as decksApi from '../api/decks.js';
import { getErrorMessage } from '../utils/errors.js';

export default function DeckView() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const [deck, setDeck] = useState(null);
  const [allTags, setAllTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');

  // Title editing
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');

  // Tag input + autocomplete
  const [tagInput, setTagInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const tagInputRef = useRef(null);

  // Card add (single + bulk)
  const [bulkMode, setBulkMode] = useState(false);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [adding, setAdding] = useState(false);

  // Card inline editing
  const [editingCardId, setEditingCardId] = useState(null);
  const [cardDraft, setCardDraft] = useState({ front: '', back: '' });

  const load = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [d, tags] = await Promise.all([decksApi.getDeck(deckId), decksApi.listAllTags()]);
      setDeck(d);
      setAllTags(tags);
    } catch (err) {
      setLoadError(getErrorMessage(err, "Couldn't load this deck."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [deckId]);

  // --- Title ---
  const startEditTitle = () => {
    setTitleDraft(deck.title);
    setEditingTitle(true);
  };

  const saveTitle = async () => {
    if (!titleDraft.trim()) return setEditingTitle(false);
    setActionError('');
    try {
      const updated = await decksApi.updateDeck(deckId, { title: titleDraft.trim() });
      setDeck(updated);
      setEditingTitle(false);
    } catch (err) {
      setActionError(getErrorMessage(err, "Couldn't rename the deck."));
    }
  };

  const removeDeck = async () => {
    if (!window.confirm(`Delete "${deck.title}"? This can't be undone.`)) return;
    setActionError('');
    try {
      await decksApi.deleteDeck(deckId);
      navigate('/dashboard');
    } catch (err) {
      setActionError(getErrorMessage(err, "Couldn't delete the deck."));
    }
  };

  // --- Tags ---
  const addTag = async (tagRaw) => {
    const tag = tagRaw.trim().toLowerCase();
    if (!tag || deck.tags.includes(tag)) {
      setTagInput('');
      setShowSuggestions(false);
      return;
    }
    setActionError('');
    try {
      const updated = await decksApi.updateDeck(deckId, { tags: [...deck.tags, tag] });
      setDeck(updated);
      if (!allTags.includes(tag)) setAllTags([...allTags, tag].sort());
    } catch (err) {
      setActionError(getErrorMessage(err, "Couldn't add that tag."));
    } finally {
      setTagInput('');
      setShowSuggestions(false);
    }
  };

  const removeTag = async (tag) => {
    setActionError('');
    try {
      const updated = await decksApi.updateDeck(deckId, { tags: deck.tags.filter((t) => t !== tag) });
      setDeck(updated);
    } catch (err) {
      setActionError(getErrorMessage(err, "Couldn't remove that tag."));
    }
  };

  const tagSuggestions = allTags.filter(
    (t) => t.includes(tagInput.trim().toLowerCase()) && tagInput.trim() && !deck?.tags.includes(t)
  );

  // --- Cards: add ---
  const addCard = async (e) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;
    setAdding(true);
    setActionError('');
    try {
      const updated = await decksApi.addCard(deckId, newFront, newBack);
      setDeck(updated);
      setNewFront('');
      setNewBack('');
    } catch (err) {
      setActionError(getErrorMessage(err, "Couldn't add that card."));
    } finally {
      setAdding(false);
    }
  };

  const parseBulkText = (text) =>
    text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        // Accept "front - back", "front — back", "front\tback", or "front | back"
        const match = line.split(/\t| - | — | \| /);
        if (match.length < 2) return null;
        const [front, ...rest] = match;
        return { front: front.trim(), back: rest.join(' ').trim() };
      })
      .filter(Boolean);

  const addBulkCards = async (e) => {
    e.preventDefault();
    const cards = parseBulkText(bulkText);
    if (cards.length === 0) {
      setActionError('No valid "front - back" lines found. Separate each pair with a dash, pipe, or tab.');
      return;
    }
    setAdding(true);
    setActionError('');
    try {
      const updated = await decksApi.addCardsBulk(deckId, cards);
      setDeck(updated);
      setBulkText('');
      setBulkMode(false);
    } catch (err) {
      setActionError(getErrorMessage(err, "Couldn't add those cards."));
    } finally {
      setAdding(false);
    }
  };

  // --- Cards: edit / delete ---
  const startEditCard = (card) => {
    setEditingCardId(card._id);
    setCardDraft({ front: card.front, back: card.back });
  };

  const saveCard = async (cardId) => {
    setActionError('');
    try {
      const updated = await decksApi.updateCard(deckId, cardId, cardDraft);
      setDeck(updated);
      setEditingCardId(null);
    } catch (err) {
      setActionError(getErrorMessage(err, "Couldn't save that card."));
    }
  };

  const removeCard = async (cardId) => {
    setActionError('');
    try {
      const updated = await decksApi.deleteCard(deckId, cardId);
      setDeck(updated);
    } catch (err) {
      setActionError(getErrorMessage(err, "Couldn't remove that card."));
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64 text-mist/40 text-sm">Loading deck…</div>
      </AppShell>
    );
  }

  if (loadError || !deck) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto px-6 sm:px-8 py-10">
          <ErrorBanner message={loadError || 'Deck not found.'} onRetry={load} />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-6 sm:px-8 py-10">
        <div className="flex items-start sm:items-center justify-between gap-3 mb-2 flex-col sm:flex-row">
          {editingTitle ? (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                autoFocus
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveTitle()}
                className="bg-ink border border-blue-bright/40 rounded-lg px-3 py-1.5 text-xl font-display font-bold outline-none flex-1"
              />
              <button onClick={saveTitle} className="text-emerald-400 shrink-0">
                <Check size={18} />
              </button>
              <button onClick={() => setEditingTitle(false)} className="text-mist/40 shrink-0">
                <X size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group">
              <h1 className="font-display text-2xl font-bold">{deck.title}</h1>
              <button
                onClick={startEditTitle}
                className="text-mist/20 hover:text-mist/60 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Pencil size={14} />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Link
              to={`/study/${deckId}`}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-brand-gradient text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-card hover:shadow-glow transition-shadow"
            >
              <Play size={14} />
              Study
            </Link>
            <Link
              to={`/study/${deckId}?mode=cram`}
              title="Review every card, ignoring the schedule"
              className="flex items-center justify-center gap-2 bg-surface border border-white/10 text-mist/70 text-sm font-medium px-3 py-2.5 rounded-lg hover:border-spark/40 transition-colors"
            >
              <Shuffle size={14} />
            </Link>
            <button
              onClick={removeDeck}
              className="flex items-center justify-center bg-surface border border-white/10 text-mist/40 hover:text-red-400 hover:border-red-400/40 px-3 py-2.5 rounded-lg transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap mb-8 relative">
          <TagIcon size={12} className="text-mist/40" />
          {deck.tags.map((t) => (
            <span key={t} className="flex items-center gap-1 text-xs text-mist/50 bg-white/5 px-2 py-0.5 rounded-full">
              {t}
              <button onClick={() => removeTag(t)} className="hover:text-red-400">
                <X size={10} />
              </button>
            </span>
          ))}
          <div className="relative">
            <input
              ref={tagInputRef}
              value={tagInput}
              onChange={(e) => {
                setTagInput(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag(tagInput))}
              placeholder="+ add tag"
              className="bg-transparent text-xs text-mist/50 placeholder:text-mist/30 outline-none w-24"
            />
            {showSuggestions && tagSuggestions.length > 0 && (
              <div className="absolute z-10 top-full left-0 mt-1 bg-surface border border-white/10 rounded-lg shadow-card overflow-hidden min-w-[8rem]">
                {tagSuggestions.slice(0, 6).map((t) => (
                  <button
                    key={t}
                    onMouseDown={() => addTag(t)}
                    className="block w-full text-left px-3 py-1.5 text-xs text-mist/70 hover:bg-white/5"
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <ErrorBanner message={actionError} onRetry={null} />

        <div className="space-y-2 mb-8">
          {deck.cards.length === 0 && (
            <p className="text-mist/40 text-sm py-6 text-center">No cards yet — add your first one below.</p>
          )}
          {deck.cards.map((card) =>
            editingCardId === card._id ? (
              <div key={card._id} className="flex flex-col sm:flex-row gap-2 bg-surface border border-blue-bright/30 rounded-lg px-4 py-3">
                <input
                  value={cardDraft.front}
                  onChange={(e) => setCardDraft({ ...cardDraft, front: e.target.value })}
                  className="flex-1 bg-ink border border-white/10 rounded-md px-2.5 py-1.5 text-sm outline-none"
                />
                <input
                  value={cardDraft.back}
                  onChange={(e) => setCardDraft({ ...cardDraft, back: e.target.value })}
                  className="flex-1 bg-ink border border-white/10 rounded-md px-2.5 py-1.5 text-sm outline-none"
                />
                <div className="flex gap-2 justify-end sm:justify-start shrink-0">
                  <button onClick={() => saveCard(card._id)} className="text-emerald-400">
                    <Check size={16} />
                  </button>
                  <button onClick={() => setEditingCardId(null)} className="text-mist/40">
                    <X size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div
                key={card._id}
                className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 bg-surface border border-white/5 rounded-lg px-4 py-3 group"
              >
                <span className="flex-1 text-sm font-medium">{card.front}</span>
                <span className="flex-1 text-sm text-mist/50">{card.back}</span>
                <div className="flex gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity self-end sm:self-auto">
                  <button onClick={() => startEditCard(card)} className="text-mist/30 hover:text-blue-bright">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => removeCard(card._id)} className="text-mist/30 hover:text-red-400">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )
          )}
        </div>

        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-mist/40">{bulkMode ? 'Bulk add cards' : 'Add a card'}</span>
          <button
            onClick={() => setBulkMode((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-mist/40 hover:text-mist/70 transition-colors"
          >
            <ClipboardList size={12} />
            {bulkMode ? 'Switch to single card' : 'Paste multiple'}
          </button>
        </div>

        {bulkMode ? (
          <form onSubmit={addBulkCards} className="space-y-2.5">
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder={'One card per line, e.g.\nHola - Hello\nGracias - Thank you'}
              rows={5}
              className="w-full bg-ink border border-white/10 rounded-lg px-3.5 py-2.5 text-sm placeholder:text-mist/30 focus:border-blue-bright/50 outline-none resize-y"
            />
            <button
              type="submit"
              disabled={adding || !bulkText.trim()}
              className="w-full flex items-center justify-center gap-1.5 bg-brand-gradient text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-card disabled:opacity-60"
            >
              {adding ? 'Adding…' : 'Add cards'}
            </button>
          </form>
        ) : (
          <form onSubmit={addCard} className="flex flex-col sm:flex-row gap-2.5">
            <input
              value={newFront}
              onChange={(e) => setNewFront(e.target.value)}
              placeholder="Front"
              className="flex-1 bg-ink border border-white/10 rounded-lg px-3.5 py-2.5 text-sm placeholder:text-mist/30 focus:border-blue-bright/50 outline-none"
            />
            <input
              value={newBack}
              onChange={(e) => setNewBack(e.target.value)}
              placeholder="Back"
              className="flex-1 bg-ink border border-white/10 rounded-lg px-3.5 py-2.5 text-sm placeholder:text-mist/30 focus:border-blue-bright/50 outline-none"
            />
            <button
              type="submit"
              disabled={adding}
              className="flex items-center justify-center gap-1.5 bg-surface border border-white/10 text-sm font-medium px-4 py-2.5 rounded-lg hover:border-blue-bright/40 transition-colors disabled:opacity-60"
            >
              <Plus size={14} />
              {adding ? 'Adding…' : 'Add'}
            </button>
          </form>
        )}
      </div>
    </AppShell>
  );
}
