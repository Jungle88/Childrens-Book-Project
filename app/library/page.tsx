'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface LibItem { id: string; title: string; childName: string; createdAt: string; }

export default function LibraryPage() {
  const [stories, setStories] = useState<LibItem[]>([]);
  useEffect(() => { setStories(JSON.parse(localStorage.getItem('storybook_library') || '[]')); }, []);

  const del = (id: string) => {
    const u = stories.filter(s => s.id !== id);
    setStories(u); localStorage.setItem('storybook_library', JSON.stringify(u));
  };

  return (
    <div className="min-h-screen bg-cream">
      <nav className="flex items-center justify-between px-6 py-4 max-w-4xl mx-auto">
        <Link href="/" className="text-2xl font-bold text-brown">✨ Storybook</Link>
        <Link href="/create" className="bg-purple-600 text-white px-5 py-2 rounded-full hover:bg-purple-700 transition font-medium">Create New</Link>
      </nav>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-brown mb-8">📚 My Library</h1>
        {!stories.length ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📖</div>
            <p className="text-brown-light mb-6">No stories yet.</p>
            <Link href="/create" className="inline-block bg-gold-500 text-brown px-6 py-3 rounded-full font-bold hover:bg-gold-600 transition">✨ Create a Story</Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {stories.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center justify-between p-4 bg-cream border border-border rounded-xl hover:shadow-md transition">
                <Link href={`/read/${s.id}`} className="flex-1">
                  <h3 className="font-bold text-brown">{s.title}</h3>
                  <p className="text-sm text-brown-light">For {s.childName} · {new Date(s.createdAt).toLocaleDateString()}</p>
                </Link>
                <button onClick={() => del(s.id)} className="ml-4 text-brown-light hover:text-red-500 transition text-sm">Delete</button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
