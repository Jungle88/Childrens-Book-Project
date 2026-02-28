'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { trackEvent } from '@/components/GoogleAnalytics';
import Link from 'next/link';
import type { Story, StoryPage } from '@/lib/types';

function Border({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <div className="relative p-8 md:p-12 max-w-2xl mx-auto">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 500" preserveAspectRatio="none">
        <rect x="10" y="10" width="380" height="480" rx="20" fill="none" stroke={color} strokeWidth="3" opacity="0.3" />
        <circle cx="25" cy="25" r="5" fill={color} opacity="0.3" />
        <circle cx="375" cy="25" r="5" fill={color} opacity="0.3" />
        <circle cx="25" cy="475" r="5" fill={color} opacity="0.3" />
        <circle cx="375" cy="475" r="5" fill={color} opacity="0.3" />
      </svg>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default function ReadPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [story, setStory] = useState<Story | null>(null);
  const [pg, setPg] = useState(-1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/stories/${id}`).then(r => r.json()).then(d => { if (!d.error) setStory(d); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  const tot = story?.pages.length || 0;
  const goNext = useCallback(() => { if (pg < tot - 1) setPg(p => p + 1); }, [pg, tot]);
  const goPrev = useCallback(() => { if (pg > -1) setPg(p => p - 1); }, [pg]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'ArrowRight' || e.key === ' ') goNext(); if (e.key === 'ArrowLeft') goPrev(); };
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h);
  }, [goNext, goPrev]);

  const share = async () => {
    const url = `${window.location.origin}/shared/${id}`;
    if (navigator.share) await navigator.share({ title: story?.title, url });
    else { await navigator.clipboard.writeText(url); alert('Link copied!'); }
    trackEvent('story_shared', { storyId: id });
  };

  const downloadPdf = async () => {
    const { jsPDF } = await import('jspdf');
    if (!story) return;
    const doc = new jsPDF('p', 'mm', 'a4');
    const w = doc.internal.pageSize.getWidth(), h = doc.internal.pageSize.getHeight();
    doc.setFillColor(253, 248, 240); doc.rect(0, 0, w, h, 'F');
    doc.setFont('times', 'bold'); doc.setFontSize(28); doc.setTextColor(45, 27, 14);
    doc.text(doc.splitTextToSize(story.title, w - 40), w / 2, h / 3, { align: 'center' });
    if (story.subtitle) { doc.setFontSize(14); doc.setFont('times', 'italic'); doc.text(story.subtitle, w / 2, h / 3 + 20, { align: 'center' }); }
    if (story.dedication) { doc.setFontSize(11); doc.text(doc.splitTextToSize(story.dedication, w - 40), w / 2, h / 2, { align: 'center' }); }
    for (const p of story.pages) {
      doc.addPage(); doc.setFillColor(253, 248, 240); doc.rect(0, 0, w, h, 'F');
      doc.setDrawColor(p.moodColor || '#D4A754'); doc.setLineWidth(0.5); doc.roundedRect(10, 10, w - 20, h - 20, 5, 5);
      doc.setFontSize(12); doc.setFont('times', 'normal'); doc.setTextColor(45, 27, 14);
      doc.text(doc.splitTextToSize(p.text, w - 40), 20, 40);
      doc.setFontSize(9); doc.setTextColor(150, 130, 110); doc.text(`Page ${p.pageNumber}`, w / 2, h - 15, { align: 'center' });
    }
    doc.save(`${story.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
    trackEvent('story_downloaded', { storyId: id });
  };

  const saveToLib = () => {
    if (!story) return;
    const lib = JSON.parse(localStorage.getItem('storybook_library') || '[]');
    if (!lib.find((s: { id: string }) => s.id === story.id)) {
      lib.unshift({ id: story.id, title: story.title, childName: story.childName, createdAt: story.createdAt });
      localStorage.setItem('storybook_library', JSON.stringify(lib));
      alert('Saved!');
    } else alert('Already saved!');
  };

  if (loading) return <div className="min-h-screen bg-cream flex items-center justify-center"><motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="text-5xl">✨</motion.div></div>;
  if (!story) return <div className="min-h-screen bg-cream flex items-center justify-center text-center"><div><h2 className="text-2xl font-bold text-brown mb-4">Story not found</h2><Link href="/create" className="text-purple-600 hover:underline">Create a new story</Link></div></div>;

  const cur: StoryPage | null = pg >= 0 ? story.pages[pg] : null;

  return (
    <div className="min-h-screen bg-cream flex flex-col" onClick={goNext}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-border" onClick={e => e.stopPropagation()}>
        <button onClick={() => router.push('/create')} className="text-brown-light hover:text-brown text-sm">← New Story</button>
        <div className="flex gap-2">
          <button onClick={share} className="px-3 py-1 text-sm rounded-full border border-border text-brown hover:bg-cream-dark transition">Share</button>
          <button onClick={downloadPdf} className="px-3 py-1 text-sm rounded-full border border-border text-brown hover:bg-cream-dark transition">PDF</button>
          <button onClick={saveToLib} className="px-3 py-1 text-sm rounded-full border border-border text-brown hover:bg-cream-dark transition">Save</button>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          {pg === -1 ? (
            <motion.div key="cover" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="text-center max-w-lg">
              <div className="text-6xl mb-6">📖</div>
              <h1 className="text-4xl font-bold text-brown mb-4">{story.title}</h1>
              {story.subtitle && <p className="text-lg text-brown-light italic mb-6">{story.subtitle}</p>}
              {story.dedication && <p className="text-sm text-gold-500 italic border-t border-border pt-4 mt-4">{story.dedication}</p>}
              <p className="text-brown-light text-sm mt-8 animate-pulse">Tap or press → to begin</p>
            </motion.div>
          ) : cur ? (
            <motion.div key={pg} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}>
              <Border color={cur.moodColor}>
                <p className="text-lg md:text-xl leading-relaxed text-brown">{cur.text}</p>
                <p className="text-center text-brown-light text-sm mt-8">— {cur.pageNumber} —</p>
              </Border>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
      <div className="px-4 py-3 border-t border-border flex items-center justify-between" onClick={e => e.stopPropagation()}>
        <button onClick={goPrev} disabled={pg <= -1} className="px-4 py-2 text-sm text-brown-light hover:text-brown disabled:opacity-30">← Prev</button>
        <div className="flex gap-1">{Array.from({ length: tot + 1 }).map((_, i) => <button key={i} onClick={() => setPg(i - 1)} className={`w-2 h-2 rounded-full transition ${i - 1 === pg ? 'bg-purple-600' : 'bg-border'}`} />)}</div>
        <button onClick={goNext} disabled={pg >= tot - 1} className="px-4 py-2 text-sm text-brown-light hover:text-brown disabled:opacity-30">Next →</button>
      </div>
    </div>
  );
}
