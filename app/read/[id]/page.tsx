'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { trackEvent } from '@/components/GoogleAnalytics';
import Link from 'next/link';
import type { Story, StoryPage } from '@/lib/types';

function IllustrationBlock({ page }: { page: StoryPage }) {
  if (page.illustrationUrl) {
    return (
      <div className="rounded-xl overflow-hidden mb-6 border border-border">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={page.illustrationUrl} alt={page.illustrationDescription} className="w-full h-auto" />
      </div>
    );
  }
  // Fallback: colored mood block with description
  return (
    <div
      className="rounded-xl mb-6 p-8 flex items-center justify-center min-h-[200px]"
      style={{ backgroundColor: page.moodColor + '22', borderLeft: `4px solid ${page.moodColor}` }}
    >
      <p className="text-brown-light text-sm italic text-center max-w-md">{page.illustrationDescription}</p>
    </div>
  );
}

function Border({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <div className="relative p-6 md:p-10 max-w-2xl mx-auto">
      <div className="absolute inset-0 rounded-2xl border-2 opacity-20" style={{ borderColor: color }} />
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
    const cached = localStorage.getItem(`story_${id}`);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.pages) { setStory(parsed); setLoading(false); return; }
      } catch { /* ignore */ }
    }
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
    const storyFormat = (story as any).format || 'digital';
    const doc = new jsPDF('p', 'mm', 'a4');
    const w = doc.internal.pageSize.getWidth();
    const h = doc.internal.pageSize.getHeight();

    if (storyFormat === 'a4-book') {
      // A4 booklet: 4 pages on 2 sheets, ordered for fold-and-staple
      // Sheet 1 front: page 4 (left) + page 1 (right)
      // Sheet 1 back:  page 2 (left) + page 3 (right)
      const halfW = w / 2;
      const pages = story.pages;

      const drawHalfPage = (page: StoryPage, x: number) => {
        doc.setFillColor(253, 248, 240);
        doc.rect(x, 0, halfW, h, 'F');
        doc.setDrawColor(page.moodColor || '#D4A754');
        doc.setLineWidth(0.3);
        doc.roundedRect(x + 5, 5, halfW - 10, h - 10, 3, 3);
        doc.setFontSize(10);
        doc.setFont('times', 'normal');
        doc.setTextColor(45, 27, 14);
        const lines = doc.splitTextToSize(page.text, halfW - 20);
        doc.text(lines, x + 10, 25);
        doc.setFontSize(8);
        doc.setTextColor(150, 130, 110);
        doc.text(`Page ${page.pageNumber}`, x + halfW / 2, h - 10, { align: 'center' });
      };

      // Sheet 1 front
      doc.setFillColor(253, 248, 240); doc.rect(0, 0, w, h, 'F');
      if (pages[3]) drawHalfPage(pages[3], 0);
      if (pages[0]) drawHalfPage(pages[0], halfW);

      // Sheet 1 back
      doc.addPage();
      doc.setFillColor(253, 248, 240); doc.rect(0, 0, w, h, 'F');
      if (pages[1]) drawHalfPage(pages[1], 0);
      if (pages[2]) drawHalfPage(pages[2], halfW);

    } else if (storyFormat === 'comic') {
      // Single page comic: 2x2 grid
      doc.setFillColor(253, 248, 240); doc.rect(0, 0, w, h, 'F');
      doc.setFont('times', 'bold'); doc.setFontSize(16); doc.setTextColor(45, 27, 14);
      doc.text(story.title, w / 2, 15, { align: 'center' });

      const panelW = (w - 30) / 2;
      const panelH = (h - 40) / 2;
      const positions = [[10, 25], [10 + panelW + 10, 25], [10, 25 + panelH + 10], [10 + panelW + 10, 25 + panelH + 10]];

      story.pages.forEach((page, i) => {
        const [px, py] = positions[i];
        doc.setDrawColor(page.moodColor || '#D4A754');
        doc.setLineWidth(0.5);
        doc.roundedRect(px, py, panelW, panelH, 3, 3);
        doc.setFillColor(page.moodColor || '#D4A754');
        doc.rect(px, py, panelW, 1, 'F');
        doc.setFontSize(8);
        doc.setFont('times', 'normal');
        doc.setTextColor(45, 27, 14);
        const lines = doc.splitTextToSize(page.text, panelW - 10);
        doc.text(lines.slice(0, 12), px + 5, py + 10);
      });

    } else {
      // Standard PDF (digital format fallback)
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
    }

    doc.save(`${story.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
    trackEvent('story_downloaded', { storyId: id, format: storyFormat });
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
                <IllustrationBlock page={cur} />
                <p className="text-lg md:text-xl leading-relaxed text-brown">{cur.text}</p>
                <p className="text-center text-brown-light text-sm mt-8">— {cur.pageNumber} —</p>
                {pg === tot - 1 && (
                  <div className="text-center mt-8 pt-6 border-t border-border">
                    <p className="text-2xl mb-2">✨</p>
                    <p className="text-brown font-bold mb-1">The End</p>
                    <p className="text-brown-light text-sm mb-4">A story for {story.childName}</p>
                    <div className="flex gap-3 justify-center">
                      <button onClick={(e) => { e.stopPropagation(); setPg(-1); }} className="px-4 py-2 text-sm rounded-full border border-border text-brown hover:bg-cream-dark transition">Read Again</button>
                      <button onClick={(e) => { e.stopPropagation(); router.push('/create'); }} className="px-4 py-2 text-sm rounded-full bg-purple-600 text-white hover:bg-purple-700 transition">New Story</button>
                    </div>
                    {(story as any).costs && (
                      <p className="text-brown-light/50 text-xs mt-6">COGS: ~${(story as any).costs.total.toFixed(2)}</p>
                    )}
                  </div>
                )}
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
      {(story as any).costs && (
        <div className="px-4 py-2 border-t border-border text-center">
          <span className="text-xs text-brown-light/50">COGS: ~${(story as any).costs.total.toFixed(3)} (text ${(story as any).costs.textGeneration.toFixed(3)} + {(story as any).pages.filter((p: any) => p.illustrationUrl).length}x illustrations ${(story as any).costs.illustrations.toFixed(3)})</span>
        </div>
      )}
    </div>
  );
}
