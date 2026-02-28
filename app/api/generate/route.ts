import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { generateStory } from '@/lib/story-templates';
import { GenerateRequest } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const body: GenerateRequest = await request.json();
    const { childName, childAge, interests, mentalModels, characterTraits, friendNames, setting } = body;
    if (!childName || !childAge || !interests?.length || !setting) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const story = generateStory(body);
    const id = uuidv4();
    const now = new Date().toISOString();
    const db = getDb();
    db.prepare('INSERT INTO stories (id, title, child_name, child_age, input_json, pages_json, created_at, views, shares) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0)')
      .run(id, story.title, childName, childAge,
        JSON.stringify({ interests, mentalModels, characterTraits, friendNames, setting, subtitle: story.subtitle, dedication: story.dedication }),
        JSON.stringify(story.pages), now);
    db.prepare('INSERT INTO analytics_events (event, properties_json) VALUES (?, ?)').run('story_created', JSON.stringify({ storyId: id, childAge, interests, setting }));
    return NextResponse.json({ id, title: story.title, subtitle: story.subtitle, dedication: story.dedication, pages: story.pages });
  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json({ error: 'Failed to generate story' }, { status: 500 });
  }
}