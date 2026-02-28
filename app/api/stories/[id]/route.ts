import { NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = getDb();
    await initDb();
    const result = await db.execute({ sql: 'SELECT * FROM stories WHERE id = ?', args: [id] });
    const row = result.rows[0];
    if (!row) return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    await db.execute({ sql: 'UPDATE stories SET views = views + 1 WHERE id = ?', args: [id] });
    const input = JSON.parse(row.input_json as string);
    const pages = JSON.parse(row.pages_json as string);
    return NextResponse.json({
      id: row.id, title: row.title, subtitle: input.subtitle, dedication: input.dedication,
      childName: row.child_name, childAge: row.child_age,
      interests: input.interests, mentalModels: input.mentalModels, characterTraits: input.characterTraits,
      friendNames: input.friendNames, setting: input.setting, pages,
      createdAt: row.created_at, views: (row.views as number) + 1, shares: row.shares,
    });
  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
