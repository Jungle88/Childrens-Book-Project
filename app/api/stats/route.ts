import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const totalStories = (db.prepare('SELECT COUNT(*) as count FROM stories').get() as { count: number }).count;
    const totalViews = (db.prepare('SELECT COALESCE(SUM(views), 0) as total FROM stories').get() as { total: number }).total;
    const totalShares = (db.prepare('SELECT COALESCE(SUM(shares), 0) as total FROM stories').get() as { total: number }).total;
    const recentStories = db.prepare('SELECT id, title, child_name, child_age, created_at, views, shares FROM stories ORDER BY created_at DESC LIMIT 20').all();
    const allInputs = db.prepare('SELECT input_json FROM stories').all() as { input_json: string }[];
    const ic: Record<string, number> = {}, gc: Record<string, number> = {}, sc: Record<string, number> = {};
    for (const row of allInputs) {
      const inp = JSON.parse(row.input_json);
      for (const i of inp.interests || []) ic[i] = (ic[i] || 0) + 1;
      for (const m of inp.mentalModels || []) gc[m] = (gc[m] || 0) + 1;
      for (const t of inp.characterTraits || []) gc[t] = (gc[t] || 0) + 1;
      if (inp.setting) sc[inp.setting] = (sc[inp.setting] || 0) + 1;
    }
    return NextResponse.json({
      totalStories, totalViews, totalShares,
      topInterests: Object.entries(ic).sort((a, b) => b[1] - a[1]).slice(0, 10),
      topGoals: Object.entries(gc).sort((a, b) => b[1] - a[1]).slice(0, 10),
      topSettings: Object.entries(sc).sort((a, b) => b[1] - a[1]).slice(0, 10),
      recentStories,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
