'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { trackEvent } from '@/components/GoogleAnalytics';
import Link from 'next/link';

const INTERESTS = [
  '🦕 Dinosaurs', '🚀 Space', '👸 Princesses', '🚛 Trucks',
  '🐾 Animals', '🌊 Ocean', '🍳 Cooking', '🦸 Superheroes',
  '🧚 Fairies', '🤖 Robots', '⚽ Sport', '🎵 Music',
  '🌿 Nature', '🏴‍☠️ Pirates', '🔬 Science', '🎨 Art',
];

const MENTAL_MODELS = [
  { id: 'First Principles Thinking', label: 'First Principles', desc: 'Break big problems into small parts' },
  { id: 'Growth Mindset', label: 'Growth Mindset', desc: 'Mistakes help us learn' },
  { id: 'Cause & Effect', label: 'Cause & Effect', desc: 'Actions have consequences' },
  { id: 'Empathy & Perspective', label: 'Empathy & Perspective', desc: "See through others' eyes" },
  { id: 'Curiosity & Questioning', label: 'Curiosity', desc: 'Ask "why?" and "what if?"' },
  { id: 'Systems Thinking', label: 'Systems Thinking', desc: 'Everything is connected' },
  { id: 'Probabilistic Thinking', label: 'Probabilistic Thinking', desc: 'Some things are more likely' },
  { id: 'Second-Order Thinking', label: 'Second-Order Thinking', desc: 'Think about what happens next' },
];

const CHARACTER_TRAITS = [
  { id: 'Kindness', label: 'Kindness' },
  { id: 'Resilience & Grit', label: 'Resilience & Grit' },
  { id: 'Honesty', label: 'Honesty' },
  { id: 'Patience', label: 'Patience' },
  { id: 'Courage', label: 'Courage' },
  { id: 'Gratitude', label: 'Gratitude' },
  { id: 'Sharing & Generosity', label: 'Sharing & Generosity' },
  { id: 'Responsibility', label: 'Responsibility' },
  { id: 'Creativity', label: 'Creativity' },
  { id: 'Teamwork', label: 'Teamwork' },
];

const SETTINGS = [
  { id: 'Enchanted Forest', emoji: '🌲', label: 'Enchanted Forest' },
  { id: 'Outer Space', emoji: '🌌', label: 'Outer Space' },
  { id: 'Underwater Kingdom', emoji: '🐠', label: 'Underwater Kingdom' },
  { id: 'Magical School', emoji: '🏰', label: 'Magical School' },
  { id: 'Neighborhood Adventure', emoji: '🏘️', label: 'Neighborhood Adventure' },
  { id: 'Dinosaur World', emoji: '🦕', label: 'Dinosaur World' },
  { id: 'Pirate Ship', emoji: '🏴‍☠️', label: 'Pirate Ship' },
];

export default function CreatePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [interests, setInterests] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState('');
  const [mentalModels, setMentalModels] = useState<string[]>([]);
  const [characterTraits, setCharacterTraits] = useState<string[]>([]);
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState(5);
  const [friendNames, setFriendNames] = useState('');
  const [setting, setSetting] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [nameError, setNameError] = useState('');

  const totalGoals = mentalModels.length + characterTraits.length;

  const toggleInterest = (interest: string) => {
    setInterests((prev) => prev.includes(interest) ? prev.filter((i) => i !== interest) : prev.length >= 5 ? prev : [...prev, interest]);
  };

  const addCustomInterest = () => {
    if (customInterest.trim() && !interests.includes(customInterest.trim())) {
      setInterests((prev) => [...prev, customInterest.trim()]);
      setCustomInterest('');
    }
  };

  const toggleModel = (id: string) => {
    if (mentalModels.includes(id)) {
      setMentalModels((prev) => prev.filter((m) => m !== id));
    } else if (totalGoals < 3) {
      setMentalModels((prev) => [...prev, id]);
    }
  };

  const toggleTrait = (id: string) => {
    if (characterTraits.includes(id)) {
      setCharacterTraits((prev) => prev.filter((t) => t !== id));
    } else if (totalGoals < 3) {
      setCharacterTraits((prev) => [...prev, id]);
    }
  };

  const handleGenerate = async () => {
    if (!childName.trim()) { setNameError('Please enter your child\'s name'); return; }
    if (childName.trim().length > 50) { setNameError('Name must be 50 characters or less'); return; }
    if (!setting) return;
    setNameError('');
    setLoading(true);
    setError('');

    try {
      const cleanInterests = interests.map((i) => i.replace(/^[^\w]*\s/, '').trim());
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childName: childName.trim(),
          childAge,
          interests: cleanInterests,
          mentalModels,
          characterTraits,
          friendNames: friendNames.split(',').map((n) => n.trim()).filter(Boolean),
          setting,
        }),
      });

      if (!res.ok) throw new Error('Failed to generate story');
      const data = await res.json();
      trackEvent('story_created', { storyId: data.id, setting, childAge });

      // Save full story to localStorage for immediate reading
      localStorage.setItem(`story_${data.id}`, JSON.stringify(data));

      // Save to localStorage library
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="text-6xl mb-6"
          >
            ✨
          </motion.div>
          <h2 className="text-2xl font-bold text-brown mb-2">Creating {childName}&apos;s Story...</h2>
          <p className="text-brown-light">Weaving magic, adventure, and life lessons together</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-4xl mx-auto">
        <Link href="/" className="text-2xl font-bold text-brown">✨ Storybook</Link>
        <Link href="/library" className="text-brown-light hover:text-brown transition">Library</Link>
      </nav>

      {/* Progress */}
      <div className="max-w-2xl mx-auto px-6 mb-8">
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                s <= step ? 'bg-purple-600 text-white' : 'bg-border text-brown-light'
              }`}>
                {s}
              </div>
              {s < 3 && <div className={`flex-1 h-1 rounded ${s < step ? 'bg-purple-600' : 'bg-border'}`} />}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-brown-light">
          <span>Interests</span><span>Learning Goals</span><span>Personalize</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 pb-20">
        <AnimatePresence mode="wait">
          {/* Step 1: Interests */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-3xl font-bold text-brown mb-2">What does your child love?</h2>
              <p className="text-brown-light mb-6">Pick 1-5 interests that shape the story! ({interests.length}/5 selected)</p>

              <div className="flex flex-wrap gap-3 mb-6">
                {INTERESTS.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`px-4 py-2 rounded-full border transition text-sm font-medium ${
                      interests.includes(interest)
                        ? 'bg-purple-600 text-white border-purple-600'
                        : interests.length >= 5
                        ? 'bg-cream border-border text-brown-light opacity-50 cursor-not-allowed'
                        : 'bg-cream border-border text-brown hover:border-purple-400'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 mb-8">
                <input
                  type="text"
                  value={customInterest}
                  onChange={(e) => setCustomInterest(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCustomInterest()}
                  placeholder="Add your own..."
                  className="flex-1 px-4 py-2 rounded-full border border-border bg-cream text-brown focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <button onClick={addCustomInterest} className="px-4 py-2 rounded-full bg-gold-500 text-brown font-medium hover:bg-gold-600 transition">
                  Add
                </button>
              </div>

              <button
                onClick={() => interests.length > 0 && setStep(2)}
                disabled={interests.length === 0}
                className="w-full bg-purple-600 text-white py-3 rounded-full font-bold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next: Choose Learning Goals →
              </button>
            </motion.div>
          )}

          {/* Step 2: Learning Goals */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-3xl font-bold text-brown mb-2">What should they learn?</h2>
              <p className="text-brown-light mb-6">Pick 1-3 lessons to weave into the story ({totalGoals}/3 selected)</p>

              <h3 className="text-lg font-bold text-brown mb-3">🧠 Mental Models — How to Think</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {MENTAL_MODELS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => toggleModel(m.id)}
                    className={`text-left p-4 rounded-xl border transition ${
                      mentalModels.includes(m.id)
                        ? 'bg-purple-600 text-white border-purple-600'
                        : totalGoals >= 3
                        ? 'bg-cream border-border text-brown-light opacity-50 cursor-not-allowed'
                        : 'bg-cream border-border text-brown hover:border-purple-400'
                    }`}
                  >
                    <div className="font-bold text-sm">{m.label}</div>
                    <div className={`text-xs mt-1 ${mentalModels.includes(m.id) ? 'text-purple-200' : 'text-brown-light'}`}>{m.desc}</div>
                  </button>
                ))}
              </div>

              <h3 className="text-lg font-bold text-brown mb-3">💪 Character Traits</h3>
              <div className="flex flex-wrap gap-3 mb-8">
                {CHARACTER_TRAITS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => toggleTrait(t.id)}
                    className={`px-4 py-2 rounded-full border transition text-sm font-medium ${
                      characterTraits.includes(t.id)
                        ? 'bg-gold-500 text-brown border-gold-500'
                        : totalGoals >= 3
                        ? 'bg-cream border-border text-brown-light opacity-50 cursor-not-allowed'
                        : 'bg-cream border-border text-brown hover:border-gold-400'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-full border border-border text-brown font-bold hover:bg-cream-dark transition">
                  ← Back
                </button>
                <button
                  onClick={() => totalGoals > 0 && setStep(3)}
                  disabled={totalGoals === 0}
                  className="flex-1 bg-purple-600 text-white py-3 rounded-full font-bold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next: Personalize →
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Personalization */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-3xl font-bold text-brown mb-2">Make it personal</h2>
              <p className="text-brown-light mb-6">These details bring the story to life!</p>

              <div className="space-y-6">
                <div>
                  <label className="block text-brown font-bold mb-2">Child&apos;s Name *</label>
                  <input
                    type="text"
                    value={childName}
                    onChange={(e) => { setChildName(e.target.value); setNameError(''); }}
                    maxLength={50}
                    placeholder="e.g., Luna"
                    className={`w-full px-4 py-3 rounded-xl border bg-cream text-brown focus:outline-none focus:ring-2 focus:ring-purple-400 ${nameError ? 'border-red-400' : 'border-border'}`}
                  />
                  {nameError && <p className="text-red-500 text-sm mt-1">{nameError}</p>}
                </div>

                <div>
                  <label className="block text-brown font-bold mb-2">Age: {childAge}</label>
                  <input
                    type="range"
                    min={2}
                    max={10}
                    value={childAge}
                    onChange={(e) => setChildAge(Number(e.target.value))}
                    className="w-full accent-purple-600"
                  />
                  <div className="flex justify-between text-xs text-brown-light">
                    <span>2</span><span>10</span>
                  </div>
                </div>

                <div>
                  <label className="block text-brown font-bold mb-2">Friend/Sibling Names (optional)</label>
                  <input
                    type="text"
                    value={friendNames}
                    onChange={(e) => setFriendNames(e.target.value)}
                    placeholder="e.g., Max, Ella (comma-separated)"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-cream text-brown focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-brown font-bold mb-2">Choose a Setting *</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {SETTINGS.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSetting(s.id)}
                        className={`p-4 rounded-xl border text-center transition ${
                          setting === s.id
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-cream border-border text-brown hover:border-purple-400'
                        }`}
                      >
                        <div className="text-2xl mb-1">{s.emoji}</div>
                        <div className="text-sm font-medium">{s.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

              <div className="flex gap-3 mt-8">
                <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-full border border-border text-brown font-bold hover:bg-cream-dark transition">
                  ← Back
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={!childName.trim() || !setting}
                  className="flex-1 bg-gold-500 text-brown py-3 rounded-full font-bold hover:bg-gold-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ✨ Create Story
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
