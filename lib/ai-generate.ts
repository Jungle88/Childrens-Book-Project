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
    '2-4': `Age 2-4: Use very simple words and short sentences (max 15 words). Lots of repetition and rhythm. Sensory language (colors, sounds, textures). Simple cause and effect. Gentle emotions. No scary moments.`,
    '5-7': `Age 5-7: Adventure and wonder! Introduce some new vocabulary with context clues. Clear cause and effect. Some dialogue. Light humor. The hero solves problems with creativity and kindness.`,
    '8-10': `Age 8-10: More complex plots with twists. Nuanced lessons and moral grey areas. Rich character development. Longer dialogue exchanges. The hero faces real dilemmas and grows.`,
  };

  return `You are a world-class children's story author. Generate a personalized children's story as structured JSON.

STORY REQUIREMENTS:
- The child (${request.childName}, age ${request.childAge}) is the HERO of the story
- Setting: ${request.setting}
- Weave in their interests naturally: ${request.interests.join(', ')}
- Mental models to teach (SHOW don't tell): ${request.mentalModels.join(', ')}
- Character traits to celebrate: ${request.characterTraits.join(', ')}
${request.friendNames.length > 0 ? `- Include their friends as characters: ${request.friendNames.join(', ')}` : ''}
- ${ageGuidance[ageGroup]}
- Create a satisfying story arc: setup → challenge → growth → resolution
- Include dialogue that feels natural for the age group
- Each page should be a distinct scene/moment

OUTPUT FORMAT (JSON only, no markdown):
{
  "title": "Story Title",
  "subtitle": "A short tagline",
  "dedication": "For ${request.childName}, who...",
  "pages": [
    {
      "pageNumber": 1,
      "text": "The story text for this page (2-4 paragraphs)",
      "illustrationDescription": "Detailed scene description for an illustrator: characters, setting, action, mood, colors",
      "moodColor": "#hex color that matches the emotional tone of this page"
    }
  ]
}

Generate exactly 8-10 pages. Return ONLY valid JSON, no other text.`;
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
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: buildSystemPrompt(request) },
          { role: 'user', content: `Create a story for ${request.childName} (age ${request.childAge}) set in "${request.setting}" featuring their love of ${request.interests.join(' and ')}.` },
        ],
        temperature: 0.8,
        max_tokens: 4000,
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

    // Parse JSON - handle potential markdown code blocks
    let jsonStr = content.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }
    
    const story: AIStoryResponse = JSON.parse(jsonStr);
    
    // Validate structure
    if (!story.title || !story.pages || !Array.isArray(story.pages) || story.pages.length < 6) {
      throw new Error('Invalid story structure from AI');
    }

    console.log(`AI generated story: "${story.title}" with ${story.pages.length} pages`);
    return story;
  } catch (error) {
    console.error('AI story generation failed, falling back to mock:', error);
    return generateStory(request);
  }
}
