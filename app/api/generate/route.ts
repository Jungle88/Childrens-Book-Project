import { NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';
import { generateStory } from '@/lib/story-templates';
import { generateStoryWithAI } from '@/lib/ai-generate';
import { GenerateRequest } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const body: GenerateRequest = await request.json();
    const { childName, childAge, interests, mentalModels, characterTraits, friendNames, setting } = body;
    if (!childName || !childAge || !interests?.length || !setting) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let title: string, subtitle: string, dedication: string, pages: any[];
    let source = 'template';

    if (process.env.OPENROUTER_API_KEY) {
      try {
        const generated = await generateStoryWithAI(body);
        title = generated.title;
        subtitle = generated.subtitle;
        dedication = generated.dedication;
        pages = generated.pages;
        source = 'ai';
      } catch (aiErr) {
        console.error('AI generation error, falling back to templates:', aiErr);
        const tmpl = generateStory(body);
        title = tmpl.title;
        subtitle = tmpl.subtitle;
        dedication = tmpl.dedication;
        pages = tmpl.pages;
      }
    } else {
      const tmpl = generateStory(body);
      title = tmpl.title;
      subtitle = tmpl.subtitle;
      dedication = tmpl.dedication;
      pages = tmpl.pages;
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    // Save to database
    try {
      const db = getDb();
      await initDb();
      await db.execute({
        sql: 'INSERT INTO stories (id, title, child_name, child_age, input_json, pages_json, created_at, views, shares) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0)',
        args: [id, title, childName, childAge,
          JSON.stringify({ interests, mentalModels, characterTraits, friendNames, setting, subtitle, dedication }),
          JSON.stringify(pages), now],
      });
      await db.execute({
        sql: 'INSERT INTO analytics_events (event, properties_json) VALUES (?, ?)',
        args: ['story_created', JSON.stringify({ storyId: id, childAge, interests, setting, source })],
      });
    } catch (dbErr) {
      console.error('DB save error (non-fatal):', dbErr);
    }

    return NextResponse.json({ id, title, subtitle, dedication, pages, source });
  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json({ error: 'Failed to generate story' }, { status: 500 });
  }
}
