'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import type { Story, StoryPage } from '@/lib/types';

export default function SharedClient({ id }: { id: string }) {
  const [story, setStory] = useState<Story | null>(null);
  const [pg, setPg] = useState(-1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/stories/${id}`).then(r => r.json()).then(d => { if (!d.error) setStory(d); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  const tot = story?.pages.length || 0;
  const next = useCallback(() => { if (pg < tot - 1) setPg(p => p + 1); }, [pg, tot]);
  const prev = useCallback(() => { if (pg > -1) setPg(p => p - 1); }, [pg]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'ArrowRight' || e.key === ' ') next(); if (e.key === 'ArrowLeft') prev(); };
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h);
  }, [next, prev]);

  if (loading) return <div className="min-h-screen bg-cream flex items-center justify-center"><motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="text-5xl">✨</motion.div></div>;
  if (!story) return <div className="min-h-screen bg-cream flex items-center justify-center text-center"><div><h2 className="text-2xl font-bold text-brown mb-4">Story not found</h2><Link href="/create" className="text-purple-600 hover:underline">Create your own →</Link></div></div>;

  const cur: StoryPage | null = pg >= 0 ? story.pages[pg] : null;
  const last = pg === tot - 1;

  return (
    <div className="min-h-screen bg-cream flex flex-col" onClick={next}>
      <div className="px-4 py-3 text-center border-b border-border" onClick={e => e.stopPropagation()}><span className="text-brown font-bold">✨ Storybook</span></div>
      <div className="flex-1 flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          {pg === -1 ? (
            <motion.div key="cover" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center max-w-lg">
              <div className="text-6xl mb-6">📖</div>
              <h1 className="text-4xl font-bold text-brown mb-4">{story.title}</h1>
              {story.subtitle && <p className="text-lg text-brown-light italic mb-6">{story.subtitle}</p>}
              {story.dedication && <p className="text-sm text-gold-500 italic border-t border-border pt-4 mt-4">{story.dedication}</p>}
              <p className="text-brown-light text-sm mt-8 animate-pulse">Tap or press → to read</p>
            </motion.div>
          ) : cur ? (
            <motion.div key={pg} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
              <div className="max-w-2xl mx-auto p-8 md:p-12">
                <div className="border-2 rounded-2xl p-6 md:p-10" style={{ borderColor: cur.moodColor + '40' }}>
                  <p className="text-lg md:text-xl leading-relaxed text-brown">{cur.text}</p>
                  <p className="text-center text-brown-light text-sm mt-8">— {cur.pageNumber} —</p>
                </div>
              </div>
              {last && <div className="text-center mt-6" onClick={e => e.stopPropagation()}><Link href="/create" className="inline-block bg-gold-500 text-brown px-8 py-3 rounded-full font-bold hover:bg-gold-600 transition">✨ Create Your Own Story</Link></div>}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
      <div className="px-4 py-3 border-t border-border flex items-center justify-between" onClick={e => e.stopPropagation()}>
        <button onClick={prev} disabled={pg <= -1} className="px-4 py-2 text-sm text-brown-light hover:text-brown disabled:opacity-30">← Prev</button>
        <div className="flex gap-1">{Array.from({ length: tot + 1 }).map((_, i) => <button key={i} onClick={() => setPg(i - 1)} className={`w-2 h-2 rounded-full ${i - 1 === pg ? 'bg-purple-600' : 'bg-border'}`} />)}</div>
        <button onClick={next} disabled={pg >= tot - 1} className="px-4 py-2 text-sm text-brown-light hover:text-brown disabled:opacity-30">Next →</button>
      </div>
    </div>
  );
}
