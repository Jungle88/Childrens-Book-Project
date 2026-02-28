import { NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { event, properties } = await request.json();
    if (!event) return NextResponse.json({ error: 'Missing event' }, { status: 400 });
    const db = getDb();
    await initDb();
    await db.execute({
      sql: 'INSERT INTO analytics_events (event, properties_json) VALUES (?, ?)',
      args: [event, JSON.stringify(properties || {})],
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Event error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
