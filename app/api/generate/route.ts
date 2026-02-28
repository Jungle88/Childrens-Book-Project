import { NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';
import { generateStoryWithAI, generateIllustration } from '@/lib/ai-generate';
import { GenerateRequest, StoryCosts } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

// OpenRouter pricing per 1M tokens
const PRICING = {
  'gemini-2.0-flash': { input: 0.10, output: 0.40 },
  'gemini-3-pro-image': { input: 1.25, output: 5.00 },
};

export async function POST(request: Request) {
  try {
    const body: GenerateRequest = await request.json();
    const { childName, childAge, interests, lessons, characters, format } = body;
    if (!childName || !childAge || !interests?.length || !lessons?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let title: string, subtitle: string, dedication: string;
    let pages: any[];
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
        const { generateStory } = await import('@/lib/story-templates');
        const tmpl = generateStory(body);
        title = tmpl.title;
        subtitle = tmpl.subtitle;
        dedication = tmpl.dedication;
        pages = tmpl.pages;
      }
    } else {
      const { generateStory } = await import('@/lib/story-templates');
      const tmpl = generateStory(body);
      title = tmpl.title;
      subtitle = tmpl.subtitle;
      dedication = tmpl.dedication;
      pages = tmpl.pages;
    }

    // Try to generate illustrations for each page
    let illustrationCount = 0;
    if (process.env.OPENROUTER_API_KEY) {
      const illustrationPromises = pages.map(async (page) => {
        try {
          const url = await generateIllustration(page.illustrationDescription);
          if (url) { page.illustrationUrl = url; illustrationCount++; }
        } catch (e) {
          console.error('Illustration generation failed for page', page.pageNumber, e);
        }
      });
      await Promise.allSettled(illustrationPromises);
    }

    // COGS estimate
    const costs = {
      textGeneration: 0.003, // ~1K input + 2K output tokens on gemini-2.0-flash
      illustrations: illustrationCount * 0.02, // ~$0.02 per image on gemini-3-pro-image
      total: 0,
    };
    costs.total = +(costs.textGeneration + costs.illustrations).toFixed(4);

    const id = uuidv4();
    const now = new Date().toISOString();

    // Save to database
    try {
      const db = getDb();
      await initDb();
      await db.execute({
        sql: 'INSERT INTO stories (id, title, child_name, child_age, input_json, pages_json, created_at, views, shares) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0)',
        args: [id, title, childName, childAge,
          JSON.stringify({ interests, lessons, characters, format, subtitle, dedication }),
          JSON.stringify(pages), now],
      });
      await db.execute({
        sql: 'INSERT INTO analytics_events (event, properties_json) VALUES (?, ?)',
        args: ['story_created', JSON.stringify({ storyId: id, childAge, interests, format, source })],
      });
    } catch (dbErr) {
      console.error('DB save error (non-fatal):', dbErr);
    }

    return NextResponse.json({
      id, title, subtitle, dedication, pages, source, format,
      childName, childAge, interests, lessons, characters,
      createdAt: now, views: 0, shares: 0, costs,
    });
  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json({ error: 'Failed to generate story' }, { status: 500 });
  }
}
