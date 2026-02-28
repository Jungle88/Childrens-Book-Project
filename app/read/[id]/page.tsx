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
      <div className="rounded-2xl overflow-hidden mb-8 shadow-lg border-2 border-amber-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={page.illustrationUrl} alt={page.illustrationDescription} className="w-full h-auto" />
      </div>
    );
  }
  // Fallback: illustrated mood block
  return (
    <div
      className="rounded-2xl mb-8 p-12 flex items-center justify-center min-h-[280px] shadow-inner"
      style={{ 
        background: `linear-gradient(135deg, ${page.moodColor}15, ${page.moodColor}30)`,
        borderLeft: `6px solid ${page.moodColor}`,
      }}
    >
      <p className="text-brown-light/60 text-sm italic text-center max-w-md">✨ {page.illustrationDescription}</p>
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
  const [dir, setDir] = useState(1);

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
  const goNext = useCallback(() => { if (pg < tot - 1) { setDir(1); setPg(p => p + 1); } }, [pg, tot]);
  const goPrev = useCallback(() => { if (pg > -1) { setDir(-1); setPg(p => p - 1); } }, [pg]);

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
      const halfW = w / 2;
      const pages = story.pages;
      const drawHalfPage = (page: StoryPage, x: number) => {
        doc.setFillColor(253, 248, 240);
        doc.rect(x, 0, halfW, h, 'F');
        doc.setDrawColor(page.moodColor || '#D4A754');
        doc.setLineWidth(0.3);
        doc.roundedRect(x + 5, 5, halfW - 10, h - 10, 3, 3);
        // Add illustration if available
        if (page.illustrationUrl && page.illustrationUrl.startsWith('data:')) {
          try { doc.addImage(page.illustrationUrl, 'PNG', x + 8, 8, halfW - 16, (halfW - 16) * 1.33); } catch { /* skip */ }
        }
        const textY = page.illustrationUrl ? (halfW - 16) * 1.33 + 15 : 25;
        doc.setFontSize(10);
        doc.setFont('times', 'normal');
        doc.setTextColor(45, 27, 14);
        const lines = doc.splitTextToSize(page.text, halfW - 20);
        doc.text(lines, x + 10, textY);
        doc.setFontSize(8);
        doc.setTextColor(150, 130, 110);
        doc.text(`Page ${page.pageNumber}`, x + halfW / 2, h - 10, { align: 'center' });
      };
      doc.setFillColor(253, 248, 240); doc.rect(0, 0, w, h, 'F');
      if (pages[3]) drawHalfPage(pages[3], 0);
      if (pages[0]) drawHalfPage(pages[0], halfW);
      doc.addPage();
      doc.setFillColor(253, 248, 240); doc.rect(0, 0, w, h, 'F');
      if (pages[1]) drawHalfPage(pages[1], 0);
      if (pages[2]) drawHalfPage(pages[2], halfW);
    } else if (storyFormat === 'comic') {
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
        if (page.illustrationUrl && page.illustrationUrl.startsWith('data:')) {
          try { doc.addImage(page.illustrationUrl, 'PNG', px + 2, py + 2, panelW - 4, panelH / 2); } catch { /* skip */ }
        }
        doc.setFontSize(8);
        doc.setFont('times', 'normal');
        doc.setTextColor(45, 27, 14);
        const textY = page.illustrationUrl ? py + panelH / 2 + 8 : py + 10;
        const lines = doc.splitTextToSize(page.text, panelW - 10);
        doc.text(lines.slice(0, 12), px + 5, textY);
      });
    } else {
      // Title page
      doc.setFillColor(253, 248, 240); doc.rect(0, 0, w, h, 'F');
      doc.setFont('times', 'bold'); doc.setFontSize(28); doc.setTextColor(45, 27, 14);
      doc.text(doc.splitTextToSize(story.title, w - 40), w / 2, h / 3, { align: 'center' });
      if (story.subtitle) { doc.setFontSize(14); doc.setFont('times', 'italic'); doc.text(story.subtitle, w / 2, h / 3 + 20, { align: 'center' }); }
      if (story.dedication) { doc.setFontSize(11); doc.text(doc.splitTextToSize(story.dedication, w - 40), w / 2, h / 2, { align: 'center' }); }
      for (const p of story.pages) {
        doc.addPage(); doc.setFillColor(253, 248, 240); doc.rect(0, 0, w, h, 'F');
        doc.setDrawColor(p.moodColor || '#D4A754'); doc.setLineWidth(0.5); doc.roundedRect(10, 10, w - 20, h - 20, 5, 5);
        // Add illustration
        if (p.illustrationUrl && p.illustrationUrl.startsWith('data:')) {
          try { doc.addImage(p.illustrationUrl, 'PNG', 20, 20, w - 40, (w - 40) * 0.75); } catch { /* skip */ }
        }
        const textY = p.illustrationUrl ? (w - 40) * 0.75 + 30 : 40;
        doc.setFontSize(12); doc.setFont('times', 'normal'); doc.setTextColor(45, 27, 14);
        doc.text(doc.splitTextToSize(p.text, w - 40), 20, textY);
        doc.setFontSize(9); doc.setTextColor(150, 130, 110); doc.text(`Page ${p.pageNumber}`, w / 2, h - 15, { align: 'center' });
      }
    }

    doc.save(`${story.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
    trackEvent('story_downloaded', { storyId: id, format: storyFormat });
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="text-6xl">📖</motion.div>
    </div>
  );
  if (!story) return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center text-center">
      <div>
        <h2 className="text-2xl font-bold text-brown mb-4">Story not found</h2>
        <Link href="/create" className="text-purple-600 hover:underline">Create a new story</Link>
      </div>
    </div>
  );

  const cur: StoryPage | null = pg >= 0 ? story.pages[pg] : null;
  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0, rotateY: d > 0 ? -15 : 15 }),
    center: { x: 0, opacity: 1, rotateY: 0 },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0, rotateY: d > 0 ? 15 : -15 }),
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-amber-50 flex flex-col" onClick={goNext}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white/50 backdrop-blur-sm border-b border-amber-200/50" onClick={e => e.stopPropagation()}>
        <button onClick={() => router.push('/create')} className="text-amber-700/60 hover:text-amber-800 text-sm font-medium">← New Story</button>
        <h2 className="text-sm font-medium text-amber-800/70 truncate max-w-[200px]">{story.title}</h2>
        <div className="flex gap-2">
          <button onClick={share} className="px-3 py-1.5 text-xs rounded-full bg-white border border-amber-200 text-amber-700 hover:bg-amber-50 transition shadow-sm">Share</button>
          <button onClick={downloadPdf} className="px-3 py-1.5 text-xs rounded-full bg-white border border-amber-200 text-amber-700 hover:bg-amber-50 transition shadow-sm">PDF ↓</button>
        </div>
      </div>

      {/* Book Area */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8" style={{ perspective: '1200px' }}>
        <AnimatePresence mode="wait" custom={dir}>
          {pg === -1 ? (
            <motion.div
              key="cover"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center max-w-lg mx-auto"
            >
              {/* Book cover */}
              <div className="bg-white rounded-3xl shadow-2xl border-2 border-amber-200 p-10 md:p-14 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-r from-amber-300 to-amber-200" />
                <div className="absolute top-4 right-4 text-4xl opacity-20">✨</div>
                <div className="absolute bottom-4 left-4 text-4xl opacity-20">📖</div>
                <div className="text-7xl mb-8">📚</div>
                <h1 className="text-3xl md:text-4xl font-bold text-amber-900 mb-4 leading-tight" style={{ fontFamily: 'Georgia, serif' }}>{story.title}</h1>
                {story.subtitle && <p className="text-lg text-amber-700/70 italic mb-8" style={{ fontFamily: 'Georgia, serif' }}>{story.subtitle}</p>}
                <div className="w-16 h-0.5 bg-amber-300 mx-auto mb-6" />
                {story.dedication && <p className="text-sm text-amber-600/80 italic" style={{ fontFamily: 'Georgia, serif' }}>{story.dedication}</p>}
                <p className="text-amber-400 text-xs mt-10 animate-pulse tracking-widest uppercase">Tap to begin →</p>
              </div>
            </motion.div>
          ) : cur ? (
            <motion.div
              key={pg}
              custom={dir}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="w-full max-w-2xl mx-auto"
            >
              {/* Story page */}
              <div className="bg-white rounded-3xl shadow-2xl border-2 border-amber-200 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-r from-amber-300 to-amber-200" />
                
                {/* Illustration */}
                <IllustrationBlock page={cur} />
                
                {/* Text */}
                <div className="px-8 md:px-12 pb-8 md:pb-12 pt-2">
                  <p className="text-lg md:text-xl leading-relaxed text-amber-900 whitespace-pre-line" style={{ fontFamily: 'Georgia, serif' }}>
                    {cur.text}
                  </p>
                  
                  {/* Page number */}
                  <div className="flex items-center justify-center mt-8 gap-2">
                    <div className="w-8 h-px bg-amber-200" />
                    <span className="text-amber-400 text-xs font-medium">{cur.pageNumber}</span>
                    <div className="w-8 h-px bg-amber-200" />
                  </div>
                  
                  {/* The End */}
                  {pg === tot - 1 && (
                    <div className="text-center mt-10 pt-8 border-t border-amber-100">
                      <p className="text-4xl mb-3">✨</p>
                      <p className="text-2xl font-bold text-amber-900 mb-2" style={{ fontFamily: 'Georgia, serif' }}>The End</p>
                      <p className="text-amber-600/70 text-sm italic mb-6">A story for {story.childName}</p>
                      <div className="flex gap-3 justify-center">
                        <button onClick={(e) => { e.stopPropagation(); setPg(-1); }} className="px-5 py-2.5 text-sm rounded-full border-2 border-amber-200 text-amber-700 hover:bg-amber-50 transition font-medium">Read Again</button>
                        <button onClick={(e) => { e.stopPropagation(); router.push('/create'); }} className="px-5 py-2.5 text-sm rounded-full bg-amber-600 text-white hover:bg-amber-700 transition font-medium shadow-md">New Story</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="px-6 py-4 bg-white/50 backdrop-blur-sm border-t border-amber-200/50 flex items-center justify-between" onClick={e => e.stopPropagation()}>
        <button onClick={goPrev} disabled={pg <= -1} className="px-4 py-2 text-sm text-amber-600 hover:text-amber-800 disabled:opacity-20 font-medium transition">← Back</button>
        <div className="flex gap-1.5">
          {Array.from({ length: tot + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => { setDir(i - 1 > pg ? 1 : -1); setPg(i - 1); }}
              className={`w-2.5 h-2.5 rounded-full transition-all ${i - 1 === pg ? 'bg-amber-600 scale-125' : 'bg-amber-200 hover:bg-amber-300'}`}
            />
          ))}
        </div>
        <button onClick={goNext} disabled={pg >= tot - 1} className="px-4 py-2 text-sm text-amber-600 hover:text-amber-800 disabled:opacity-20 font-medium transition">Next →</button>
      </div>

      {/* COGS footer */}
      {(story as any).costs && (
        <div className="px-4 py-1.5 text-center bg-amber-50/50">
          <span className="text-[10px] text-amber-400/60">COGS: ~${(story as any).costs.total.toFixed(3)}</span>
        </div>
      )}
    </div>
  );
}
