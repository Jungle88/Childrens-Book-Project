import { GenerateRequest, StoryPage } from './types';
import { generateStory } from './story-templates';

interface AIStoryResponse {
  title: string;
  subtitle: string;
  dedication: string;
  pages: StoryPage[];
}

function buildSystemPrompt(request: GenerateRequest): string {
  const ageGroup = request.childAge <= 4 ? '2-4' : request.childAge <= 7 ? '5-7' : '8-10';

  const ageGuidance: Record<string, string> = {
    '2-4': `Age 2-4: Very simple words, short sentences (max 15 words). Lots of repetition and rhythm. Sensory language. Simple cause and effect. Gentle emotions. No scary moments.`,
    '5-7': `Age 5-7: Adventure and wonder! Some new vocabulary with context clues. Clear cause and effect. Dialogue. Light humor. The hero solves problems with creativity and kindness.`,
    '8-10': `Age 8-10: More complex plots. Nuanced lessons. Rich character development. Longer dialogue. The hero faces real dilemmas and grows.`,
  };

  const hasLearningToRead = request.lessons.some(l => l.toLowerCase().includes('learning to read'));
  const hasLearningToWrite = request.lessons.some(l => l.toLowerCase().includes('learning to write'));

  let specialInstructions = '';
  if (hasLearningToRead) {
    specialInstructions += `\n\nSPECIAL: This story is for "Learning to Read". Use BIG, simple words. Short phonics-friendly sentences. Repetitive patterns. Each page should have only 1-3 simple sentences with common sight words.`;
  }
  if (hasLearningToWrite) {
    specialInstructions += `\n\nSPECIAL: This story is for "Learning to Write". Include letter tracing prompts. Each page should feature a key letter or word that the child can practice writing. Use phrases like "Can you trace the letter ___?" or "Try writing ___ with your finger!"`;
  }

  const charactersDesc = request.characters.length > 0
    ? `Include these characters in the story:\n${request.characters.map(c => `- ${c.name} (${c.relationship})`).join('\n')}`
    : '';

  return `You are a world-class children's story author. Generate a personalized 4-page children's story as structured JSON.

STORY REQUIREMENTS:
- The child (${request.childName}, age ${request.childAge}) is the HERO
- Weave in their interests naturally: ${request.interests.join(', ')}
- Lessons to teach (SHOW don't tell): ${request.lessons.join(', ')}
${charactersDesc}
- ${ageGuidance[ageGroup]}
- YOU decide the best setting/world for this story based on the child's interests and lessons
- Create a satisfying story arc: setup → challenge → growth → resolution
- Each page should be a distinct scene/moment
${specialInstructions}

OUTPUT FORMAT (JSON only, no markdown):
{
  "title": "Story Title",
  "subtitle": "A short tagline",
  "dedication": "For ${request.childName}, who...",
  "pages": [
    {
      "pageNumber": 1,
      "text": "The story text for this page (2-4 paragraphs)",
      "illustrationDescription": "Detailed scene description for an illustrator: characters, setting, action, mood, colors. Be specific about the art style: warm watercolor children's book illustration.",
      "moodColor": "#hex color that matches the emotional tone"
    }
  ]
}

Generate EXACTLY 4 pages. Return ONLY valid JSON, no other text.`;
}

export async function generateStoryWithAI(request: GenerateRequest): Promise<AIStoryResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    console.log('No OPENROUTER_API_KEY set, falling back to mock templates');
    return generateStory(request);
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://storybook.app',
        'X-Title': 'Storybook',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001',
        messages: [
          { role: 'system', content: buildSystemPrompt(request) },
          { role: 'user', content: `Create a 4-page story for ${request.childName} (age ${request.childAge}) who loves ${request.interests.join(' and ')}. The story should teach: ${request.lessons.join(', ')}.` },
        ],
        temperature: 0.8,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenRouter API error:', response.status, errText);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in OpenRouter response');
    }

    let jsonStr = content.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    const story: AIStoryResponse = JSON.parse(jsonStr);

    if (!story.title || !story.pages || !Array.isArray(story.pages) || story.pages.length < 4) {
      throw new Error('Invalid story structure from AI');
    }

    // Ensure exactly 4 pages
    story.pages = story.pages.slice(0, 4);

    console.log(`AI generated story: "${story.title}" with ${story.pages.length} pages`);
    return story;
  } catch (error) {
    console.error('AI story generation failed, falling back to mock:', error);
    return generateStory(request);
  }
}

export async function generateIllustration(description: string): Promise<string | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://storybook.app',
        'X-Title': 'Storybook',
      },
      body: JSON.stringify({
        model: 'openai/dall-e-3',
        prompt: `Children's book illustration, warm watercolor style, gentle and whimsical: ${description}`,
        n: 1,
        size: '1024x1024',
      }),
    });

    if (!response.ok) {
      console.error('Image generation failed:', response.status);
      return null;
    }

    const data = await response.json();
    return data.data?.[0]?.url || null;
  } catch (error) {
    console.error('Image generation error:', error);
    return null;
  }
}
