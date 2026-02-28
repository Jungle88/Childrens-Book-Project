'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { trackEvent } from '@/components/GoogleAnalytics';
import Link from 'next/link';
import type { Character } from '@/lib/types';

const INTEREST_SUGGESTIONS = [
  'Dinosaurs', 'Space', 'Animals', 'Ocean', 'Trucks', 'Superheroes',
  'Robots', 'Sport', 'Music', 'Nature', 'Cooking', 'Art',
  'Storms & Weather', 'Rescue Workers', 'Pirates', 'Dragons',
  'Fairies', 'Science', 'Building Things', 'Bugs & Insects',
];

const LESSON_CATEGORIES = [
  {
    emoji: '🧠',
    name: 'Mental Models',
    items: ['First Principles', 'Growth Mindset', 'Cause & Effect', 'Empathy', 'Curiosity', 'Systems Thinking', 'Probability', 'Second-Order Thinking'],
  },
  {
    emoji: '💪',
    name: 'Character Traits',
    items: ['Kindness', 'Resilience', 'Honesty', 'Patience', 'Courage', 'Gratitude', 'Sharing', 'Responsibility', 'Persistence', 'Teamwork', 'Creativity'],
  },
  {
    emoji: '🌱',
    name: 'Life Moments',
    items: ['Starting School', 'New Sibling', 'Moving House', 'Saying Goodbye (pet/person)', 'Making Friends', 'Dealing with Bullying', 'Parents Separating', 'Going to Hospital', 'Overcoming Fear'],
  },
  {
    emoji: '📚',
    name: 'Learning Skills',
    items: ['Learning to Read', 'Learning to Write', 'Learning Numbers', 'Learning Colors & Shapes', 'Learning Time'],
  },
];

const FORMATS = [
  { id: 'a4-book' as const, emoji: '📖', label: 'A4 Folded Book', desc: 'Print, fold & staple' },
  { id: 'comic' as const, emoji: '📄', label: 'Single Page Comic', desc: 'One-page comic PDF' },
  { id: 'digital' as const, emoji: '💻', label: 'Digital Storybook', desc: 'Read on screen' },
];

export default function CreatePage() {
  const router = useRouter();

  // Form state
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState(5);
  const [interests, setInterests] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState('');
  const [lessons, setLessons] = useState<string[]>([]);
  const [lessonInput, setLessonInput] = useState('');
  const [showCharacters, setShowCharacters] = useState(false);
  const [characters, setCharacters] = useState<Character[]>([{ name: '', relationship: 'friend' }]);
  const [format, setFormat] = useState<'a4-book' | 'comic' | 'digital'>('digital');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const addInterest = (val: string) => {
    const trimmed = val.trim();
    if (trimmed && !interests.includes(trimmed)) {
      setInterests(prev => [...prev, trimmed]);
    }
    setInterestInput('');
  };

  const removeInterest = (val: string) => setInterests(prev => prev.filter(i => i !== val));

  const toggleLesson = (val: string) => {
    setLessons(prev => prev.includes(val) ? prev.filter(l => l !== val) : [...prev, val]);
  };

  const addCustomLesson = () => {
    const trimmed = lessonInput.trim();
    if (trimmed && !lessons.includes(trimmed)) {
      setLessons(prev => [...prev, trimmed]);
    }
    setLessonInput('');
  };

  const addCharacter = () => setCharacters(prev => [...prev, { name: '', relationship: 'friend' }]);
  const removeCharacter = (idx: number) => setCharacters(prev => prev.filter((_, i) => i !== idx));
  const updateCharacter = (idx: number, field: keyof Character, val: string) => {
    setCharacters(prev => prev.map((c, i) => i === idx ? { ...c, [field]: val } : c));
  };

  const canSubmit = childName.trim() && interests.length > 0 && lessons.length > 0;

  const handleGenerate = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError('');

    try {
      const validChars = showCharacters ? characters.filter(c => c.name.trim()) : [];
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childName: childName.trim(),
          childAge,
          interests,
          lessons,
          characters: validChars,
          format,
        }),
      });

      if (!res.ok) throw new Error('Failed to generate story');
      const data = await res.json();
      trackEvent('story_created', { storyId: data.id, format, childAge });

      localStorage.setItem(`story_${data.id}`, JSON.stringify(data));

      const library = JSON.parse(localStorage.getItem('storybook_library') || '[]');
      library.unshift({ id: data.id, title: data.title, childName: childName.trim(), createdAt: new Date().toISOString() });
      localStorage.setItem('storybook_library', JSON.stringify(library));

      router.push(`/read/${data.id}`);
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="text-6xl mb-6">✨</motion.div>
          <h2 className="text-2xl font-bold text-brown mb-2">Creating {childName}&apos;s Story...</h2>
          <p className="text-brown-light">Writing the story, painting the pictures...</p>
          <p className="text-brown-light text-sm mt-2">This may take up to 30 seconds</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <nav className="flex items-center justify-between px-6 py-4 max-w-3xl mx-auto">
        <Link href="/" className="text-2xl font-bold text-brown">✨ Storybook</Link>
        <Link href="/library" className="text-brown-light hover:text-brown transition">Library</Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 pb-20">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-bold text-brown mb-2">Create a Story</h1>
          <p className="text-brown-light mb-10">Fill in the details and we&apos;ll create a magical personalized story.</p>

          {/* ── Child's Name & Age ── */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-brown mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold">1</span>
              Child&apos;s Name & Age
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  maxLength={50}
                  placeholder="Child's name"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-cream text-brown focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <label className="text-brown font-medium whitespace-nowrap">Age: {childAge}</label>
                  <input
                    type="range"
                    min={2}
                    max={10}
                    value={childAge}
                    onChange={(e) => setChildAge(Number(e.target.value))}
                    className="flex-1 accent-purple-600"
                  />
                </div>
                <div className="flex justify-between text-xs text-brown-light mt-1">
                  <span>2</span><span>10</span>
                </div>
              </div>
            </div>
          </section>

          {/* ── Interests ── */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-brown mb-1 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold">2</span>
              Interests
            </h2>
            <p className="text-brown-light text-sm mb-4 ml-10">Type anything your child loves, or tap a suggestion below.</p>

            <div className="flex gap-2 mb-4 ml-10">
              <input
                type="text"
                value={interestInput}
                onChange={(e) => setInterestInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); addInterest(interestInput); }
                }}
                placeholder="Type an interest and press Enter..."
                className="flex-1 px-4 py-3 rounded-xl border border-border bg-cream text-brown focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <button
                onClick={() => addInterest(interestInput)}
                disabled={!interestInput.trim()}
                className="px-5 py-3 rounded-xl bg-gold-500 text-brown font-medium hover:bg-gold-600 transition disabled:opacity-40"
              >
                Add
              </button>
            </div>

            {/* Selected interests */}
            {interests.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4 ml-10">
                {interests.map(i => (
                  <motion.button
                    key={i}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    onClick={() => removeInterest(i)}
                    className="px-4 py-2 rounded-full bg-purple-600 text-white text-sm font-medium flex items-center gap-1 hover:bg-purple-700 transition"
                  >
                    {i} <span className="ml-1 opacity-70">×</span>
                  </motion.button>
                ))}
              </div>
            )}

            {/* Suggestions */}
            <div className="ml-10">
              <p className="text-xs text-brown-light mb-2 uppercase tracking-wide">Suggestions</p>
              <div className="flex flex-wrap gap-2">
                {INTEREST_SUGGESTIONS.filter(s => !interests.includes(s)).map(s => (
                  <button
                    key={s}
                    onClick={() => addInterest(s)}
                    className="px-3 py-1.5 rounded-full border border-border text-brown text-sm hover:border-purple-400 hover:bg-purple-50 transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* ── Lessons ── */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-brown mb-1 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold">3</span>
              Lessons
            </h2>
            <p className="text-brown-light text-sm mb-4 ml-10">What should the story teach? Pick from categories or type your own.</p>

            {/* Custom lesson input */}
            <div className="flex gap-2 mb-4 ml-10">
              <input
                type="text"
                value={lessonInput}
                onChange={(e) => setLessonInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); addCustomLesson(); }
                }}
                placeholder='Type a custom lesson, e.g. "saying goodbye to our dog Charlie"'
                className="flex-1 px-4 py-3 rounded-xl border border-border bg-cream text-brown focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <button
                onClick={addCustomLesson}
                disabled={!lessonInput.trim()}
                className="px-5 py-3 rounded-xl bg-gold-500 text-brown font-medium hover:bg-gold-600 transition disabled:opacity-40"
              >
                Add
              </button>
            </div>

            {/* Selected lessons */}
            {lessons.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4 ml-10">
                {lessons.map(l => (
                  <motion.button
                    key={l}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    onClick={() => toggleLesson(l)}
                    className="px-4 py-2 rounded-full bg-gold-500 text-brown text-sm font-medium flex items-center gap-1 hover:bg-gold-600 transition"
                  >
                    {l} <span className="ml-1 opacity-70">×</span>
                  </motion.button>
                ))}
              </div>
            )}

            {/* Lesson categories */}
            <div className="space-y-3 ml-10">
              {LESSON_CATEGORIES.map(cat => (
                <div key={cat.name} className="border border-border rounded-xl overflow-hidden bg-cream">
                  <button
                    onClick={() => setExpandedCategory(expandedCategory === cat.name ? null : cat.name)}
                    className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-cream-dark transition"
                  >
                    <span className="font-bold text-brown">{cat.emoji} {cat.name}</span>
                    <span className="text-gold-500 text-lg">{expandedCategory === cat.name ? '−' : '+'}</span>
                  </button>
                  <AnimatePresence>
                    {expandedCategory === cat.name && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 flex flex-wrap gap-2">
                          {cat.items.map(item => (
                            <button
                              key={item}
                              onClick={() => toggleLesson(item)}
                              className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                                lessons.includes(item)
                                  ? 'bg-gold-500 text-brown border border-gold-500'
                                  : 'border border-border text-brown hover:border-gold-400'
                              }`}
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </section>

          {/* ── Characters (optional) ── */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-brown mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold">4</span>
              Characters
              <span className="text-sm font-normal text-brown-light">(optional)</span>
            </h2>

            <div className="ml-10">
              <label className="flex items-center gap-3 cursor-pointer mb-4">
                <div
                  className={`w-12 h-7 rounded-full transition-colors relative ${showCharacters ? 'bg-purple-600' : 'bg-border'}`}
                  onClick={() => setShowCharacters(!showCharacters)}
                >
                  <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${showCharacters ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-brown">Add friends, siblings, or pets to the story</span>
              </label>

              <AnimatePresence>
                {showCharacters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-3">
                      {characters.map((char, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={char.name}
                            onChange={(e) => updateCharacter(idx, 'name', e.target.value)}
                            placeholder="Name"
                            className="flex-1 px-4 py-2 rounded-xl border border-border bg-cream text-brown focus:outline-none focus:ring-2 focus:ring-purple-400"
                          />
                          <select
                            value={char.relationship}
                            onChange={(e) => updateCharacter(idx, 'relationship', e.target.value)}
                            className="px-3 py-2 rounded-xl border border-border bg-cream text-brown focus:outline-none focus:ring-2 focus:ring-purple-400"
                          >
                            <option value="friend">Friend</option>
                            <option value="sibling">Sibling</option>
                            <option value="pet">Pet</option>
                          </select>
                          {characters.length > 1 && (
                            <button onClick={() => removeCharacter(idx)} className="text-brown-light hover:text-red-500 px-2">×</button>
                          )}
                        </div>
                      ))}
                      <button onClick={addCharacter} className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                        + Add another character
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* ── Format ── */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-brown mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold">5</span>
              Format
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 ml-10">
              {FORMATS.map(f => (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  className={`p-4 rounded-xl border text-center transition ${
                    format === f.id
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-cream border-border text-brown hover:border-purple-400'
                  }`}
                >
                  <div className="text-2xl mb-1">{f.emoji}</div>
                  <div className="text-sm font-bold">{f.label}</div>
                  <div className={`text-xs mt-1 ${format === f.id ? 'text-purple-200' : 'text-brown-light'}`}>{f.desc}</div>
                </button>
              ))}
            </div>
          </section>

          {/* ── Submit ── */}
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

          <button
            onClick={handleGenerate}
            disabled={!canSubmit}
            className="w-full bg-gold-500 text-brown py-4 rounded-full font-bold text-lg hover:bg-gold-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            ✨ Create Story
          </button>

          {!canSubmit && (
            <p className="text-center text-brown-light text-sm mt-3">
              {!childName.trim() ? 'Enter a name' : interests.length === 0 ? 'Add at least one interest' : 'Pick at least one lesson'} to continue
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
