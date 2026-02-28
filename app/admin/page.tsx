'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Stats {
  totalStories: number; totalViews: number; totalShares: number;
  topInterests: [string, number][]; topGoals: [string, number][]; topSettings: [string, number][];
  recentStories: { id: string; title: string; child_name: string; child_age: number; created_at: string; views: number; shares: number }[];
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  useEffect(() => { fetch('/api/stats').then(r => r.json()).then(setStats).catch(() => {}); }, []);

  if (!stats) return <div className="min-h-screen bg-cream flex items-center justify-center text-brown-light">Loading...</div>;

  return (
    <div className="min-h-screen bg-cream">
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <Link href="/" className="text-2xl font-bold text-brown">✨ Storybook</Link>
        <span className="text-brown-light text-sm">Admin</span>
      </nav>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-brown mb-8">📊 Dashboard</h1>
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[{ l: 'Stories', v: stats.totalStories, i: '📖' }, { l: 'Views', v: stats.totalViews, i: '👀' }, { l: 'Shares', v: stats.totalShares, i: '🔗' }].map(k =>
            <div key={k.l} className="bg-cream border border-border rounded-xl p-6 text-center">
              <div className="text-3xl mb-2">{k.i}</div><div className="text-3xl font-bold text-brown">{k.v}</div><div className="text-sm text-brown-light">{k.l}</div>
            </div>
          )}
        </div>
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {[{ t: 'Top Interests', d: stats.topInterests }, { t: 'Top Goals', d: stats.topGoals }, { t: 'Top Settings', d: stats.topSettings }].map(s =>
            <div key={s.t} className="bg-cream border border-border rounded-xl p-6">
              <h3 className="font-bold text-brown mb-4">{s.t}</h3>
              {!s.d.length ? <p className="text-brown-light text-sm">No data yet</p> :
                <ul className="space-y-2">{s.d.map(([n, c]) => <li key={n} className="flex justify-between text-sm"><span className="text-brown">{n}</span><span className="text-brown-light">{c}</span></li>)}</ul>}
            </div>
          )}
        </div>
        <div className="bg-cream border border-border rounded-xl p-6">
          <h3 className="font-bold text-brown mb-4">Recent Stories</h3>
          {!stats.recentStories.length ? <p className="text-brown-light text-sm">No stories yet</p> :
            <div className="overflow-x-auto"><table className="w-full text-sm">
              <thead><tr className="border-b border-border"><th className="text-left py-2 text-brown-light">Title</th><th className="text-left py-2 text-brown-light">Child</th><th className="text-left py-2 text-brown-light">Age</th><th className="text-left py-2 text-brown-light">Views</th><th className="text-left py-2 text-brown-light">Created</th></tr></thead>
              <tbody>{stats.recentStories.map(s => <tr key={s.id} className="border-b border-border-light"><td className="py-2"><Link href={`/read/${s.id}`} className="text-purple-600 hover:underline">{s.title}</Link></td><td className="py-2 text-brown">{s.child_name}</td><td className="py-2 text-brown-light">{s.child_age}</td><td className="py-2 text-brown-light">{s.views}</td><td className="py-2 text-brown-light">{new Date(s.created_at).toLocaleDateString()}</td></tr>)}</tbody>
            </table></div>}
        </div>
      </div>
    </div>
  );
}
