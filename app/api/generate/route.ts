import { NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';
import { generateStoryWithAI, generateIllustration } from '@/lib/ai-generate';
import { GenerateRequest, StoryCosts } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

// Vercel function config — allow up to 60s (Hobby max)
export const maxDuration = 60;

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
    let textCost = 0;

    if (process.env.OPENROUTER_API_KEY) {
      try {
        const generated = await generateStoryWithAI(body);
        title = generated.title;
        subtitle = generated.subtitle;
        dedication = generated.dedication;
        pages = generated.pages;
        source = 'ai';

        // Calculate text generation cost from token usage
        if (generated.textTokens) {
          textCost = (generated.textTokens.input / 1_000_000) * PRICING['gemini-2.0-flash'].input
            + (generated.textTokens.output / 1_000_000) * PRICING['gemini-2.0-flash'].output;
        }
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

    // Generate illustrations sequentially to stay within Vercel timeout
    let illustrationCost = 0;
    if (process.env.OPENROUTER_API_KEY) {
      for (const page of pages) {
        try {
          const result = await generateIllustration(page.illustrationDescription);
          if (result.url) page.illustrationUrl = result.url;
          if (result.tokens) {
            illustrationCost += (result.tokens.input / 1_000_000) * PRICING['gemini-3-pro-image'].input
              + (result.tokens.output / 1_000_000) * PRICING['gemini-3-pro-image'].output;
          }
        } catch (e) {
          console.error('Illustration generation failed for page', page.pageNumber, e);
        }
      }
    }

    const costs: StoryCosts = {
      textGeneration: +textCost.toFixed(4),
      illustrations: +illustrationCost.toFixed(4),
      total: +(textCost + illustrationCost).toFixed(4),
    };

    const id = uuidv4();
    const now = new Date().toISOString();

    // Save to database
    try {
      const db = getDb();
      await initDb();
      await db.execute({
        sql: 'INSERT INTO stories (id, title, child_name, child_age, input_json, pages_json, created_at, views, shares) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0)',
        args: [id, title, childName, childAge,
          JSON.stringify({ interests, lessons, characters, format, subtitle, dedication, costs }),
          JSON.stringify(pages), now],
      });
      await db.execute({
        sql: 'INSERT INTO analytics_events (event, properties_json) VALUES (?, ?)',
        args: ['story_created', JSON.stringify({ storyId: id, childAge, interests, format, source, costs })],
      });
    } catch (dbErr) {
      console.error('DB save error (non-fatal):', dbErr);
    }

    return NextResponse.json({
      id, title, subtitle, dedication, pages, source, format, costs,
      childName, childAge, interests, lessons, characters,
      createdAt: now, views: 0, shares: 0,
    });
  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json({ error: 'Failed to generate story' }, { status: 500 });
  }
}
