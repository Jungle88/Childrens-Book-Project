import { NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    await initDb();
    const totalStoriesRes = await db.execute('SELECT COUNT(*) as count FROM stories');
    const totalStories = totalStoriesRes.rows[0].count as number;
    const totalViewsRes = await db.execute('SELECT COALESCE(SUM(views), 0) as total FROM stories');
    const totalViews = totalViewsRes.rows[0].total as number;
    const totalSharesRes = await db.execute('SELECT COALESCE(SUM(shares), 0) as total FROM stories');
    const totalShares = totalSharesRes.rows[0].total as number;
    const recentRes = await db.execute('SELECT id, title, child_name, child_age, created_at, views, shares FROM stories ORDER BY created_at DESC LIMIT 20');
    const recentStories = recentRes.rows;
    const allInputsRes = await db.execute('SELECT input_json FROM stories');
    const ic: Record<string, number> = {}, gc: Record<string, number> = {}, sc: Record<string, number> = {};
    for (const row of allInputsRes.rows) {
      const inp = JSON.parse(row.input_json as string);
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
