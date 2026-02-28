import { GenerateRequest, StoryPage } from './types';

const MOOD_PALETTES = [
  ['#4A7C59', '#6B8E5B', '#8FBC8F', '#3D6B4F'],
  ['#1E3A5F', '#2C5282', '#4A90D9', '#1A365D'],
  ['#0E7490', '#0891B2', '#22D3EE', '#0C6478'],
  ['#7C3AED', '#8B5CF6', '#A78BFA', '#6D28D9'],
  ['#D97706', '#F59E0B', '#FBBF24', '#B45309'],
];

export function generateStory(req: GenerateRequest): { title: string; subtitle: string; dedication: string; pages: StoryPage[] } {
  const { childName: n, childAge: a, interests: ints, lessons, characters } = req;
  const y = a <= 4;
  const i1 = ints[0] || 'adventure';
  const i2 = ints[1] || ints[0] || 'exploring';
  const l1 = lessons[0] || 'being brave';
  const charName = characters[0]?.name || '';
  const hasChar = !!charName;
  const hash = n.length + ints.length + a;
  const c = MOOD_PALETTES[hash % MOOD_PALETTES.length];

  const pages: StoryPage[] = [
    {
      pageNumber: 1,
      moodColor: c[0],
      illustrationDescription: `${n} discovering something magical related to ${i1}, warm watercolor style`,
      text: y
        ? `Once upon a time, there was a wonderful child named ${n}. ${n} loved ${i1} more than anything! One sunny morning, ${n} found a glowing golden map. "Where does it go?" ${n} whispered excitedly.${hasChar ? ` ${charName} was right there too!` : ''}`
        : `${n} had always been fascinated by ${i1}. So when a mysterious golden map appeared one morning, ${n} knew this was the beginning of something extraordinary.${hasChar ? ` "${charName}, you have to see this!" ${n} called.` : ''}`,
    },
    {
      pageNumber: 2,
      moodColor: c[1],
      illustrationDescription: `${n}${hasChar ? ` and ${charName}` : ''} arriving at a magical place full of ${i2}, watercolor children's book style`,
      text: y
        ? `The map led to an amazing magical place! Everything was connected to ${i1} and ${i2}! But oh no — there was a big problem. Something important was broken, and nobody knew how to fix it. "We need help!" everyone cried.`
        : `The map led to an incredible world where ${i1} and ${i2} came to life. But something was wrong — the heart of this place was fading. The creatures looked worried. "Can you help us?" they asked.`,
    },
    {
      pageNumber: 3,
      moodColor: c[2],
      illustrationDescription: `${n} bravely solving a problem, showing ${l1}, warm illustrated style`,
      text: y
        ? `${n} thought really hard. It was tricky! ${n} tried once — it didn't work. Tried again — still tricky! But ${n} didn't give up. "I can learn from my mistakes!" And then — ${n} figured it out! ${l1} was the key all along!`
        : `The challenge seemed impossible at first. ${n}'s first attempt failed. And the second. But instead of giving up, ${n} thought: "Every mistake teaches me something." Through ${l1}, ${n} found the answer nobody else could see.`,
    },
    {
      pageNumber: 4,
      moodColor: c[3],
      illustrationDescription: `Celebration scene with ${n}${hasChar ? ` and ${charName}` : ''}, magical light, warm watercolor`,
      text: y
        ? `Everything came back to life with a beautiful WHOOSH! "${n} saved us!" everyone cheered. ${hasChar ? `${charName} gave ${n} the biggest hug. ` : ''}${n} learned that ${l1} is the most powerful magic of all. The End! 🌟`
        : `Light cascaded through the world, restoring everything. ${n} stood at the center, heart full.${hasChar ? ` ${charName} smiled. "We couldn't have done it without you."` : ''} The real magic wasn't a spell — it was ${l1}. And ${n} carried it home, ready for the next adventure. The End. 🌟`,
    },
  ];

  return {
    title: `${n} and the Magical ${i1.charAt(0).toUpperCase() + i1.slice(1)} Quest`,
    subtitle: `A story about ${l1} and ${i1}`,
    dedication: `For ${n}${hasChar ? ` and ${charName}` : ''} — may you always stay curious, kind, and brave.`,
    pages,
  };
}
