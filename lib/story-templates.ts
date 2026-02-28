import { GenerateRequest, StoryPage } from './types';

const MOOD_COLORS: Record<string, string[]> = {
  'Enchanted Forest': ['#4A7C59', '#6B8E5B', '#8FBC8F', '#3D6B4F', '#5B8C5A', '#7CAA7C', '#4E8B57', '#6DAF6D'],
  'Outer Space': ['#1E3A5F', '#2C5282', '#4A90D9', '#1A365D', '#2B4C7E', '#3B6FA0', '#1E4D8C', '#5B8DB8'],
  'Underwater Kingdom': ['#0E7490', '#0891B2', '#22D3EE', '#0C6478', '#1098AD', '#38BDF8', '#0D9488', '#2DD4BF'],
  'Magical School': ['#7C3AED', '#8B5CF6', '#A78BFA', '#6D28D9', '#9333EA', '#C084FC', '#7E22CE', '#B57EDC'],
  'Neighborhood Adventure': ['#D97706', '#F59E0B', '#FBBF24', '#B45309', '#D4A754', '#EAB308', '#CA8A04', '#F5C842'],
  'Dinosaur World': ['#065F46', '#047857', '#10B981', '#064E3B', '#059669', '#34D399', '#0D7B5F', '#6EE7B7'],
  'Pirate Ship': ['#92400E', '#B45309', '#D97706', '#78350F', '#A16207', '#CA8A04', '#8B5E14', '#D4A754'],
};

function young(age: number): boolean { return age <= 4; }
function hasTrait(t: string[], k: string): boolean { return t.some(x => x.toLowerCase().includes(k.toLowerCase())); }
function hasModel(m: string[], k: string): boolean { return m.some(x => x.toLowerCase().includes(k.toLowerCase())); }

function questAdventure(r: GenerateRequest): { title: string; subtitle: string; dedication: string; pages: StoryPage[] } {
  const { childName: n, childAge: a, interests: ints, mentalModels: mm, characterTraits: ct, friendNames: fn, setting: s } = r;
  const y = young(a);
  const f = fn[0] || '';
  const hf = !!f;
  const i1 = ints[0] || 'adventure';
  const i2 = ints[1] || ints[0] || 'exploring';
  const c = MOOD_COLORS[s] || MOOD_COLORS['Enchanted Forest'];
  const gm = hasModel(mm, 'growth') || hasTrait(ct, 'resilience');
  const emp = hasModel(mm, 'empathy') || hasTrait(ct, 'kindness');
  const tw = hasTrait(ct, 'teamwork') || hasTrait(ct, 'sharing');
  const cur = hasModel(mm, 'curiosity') || hasTrait(ct, 'creativity');

  const sd: Record<string, string> = {
    'Enchanted Forest': 'a magical forest where the trees whispered secrets',
    'Outer Space': 'a sparkling galaxy full of colorful planets',
    'Underwater Kingdom': 'a shimmering kingdom beneath the waves',
    'Magical School': 'a wonderful school where anything was possible',
    'Neighborhood Adventure': 'their very own neighborhood, which held more magic than anyone knew',
    'Dinosaur World': 'a land where friendly dinosaurs still roamed',
    'Pirate Ship': 'the deck of the most magnificent pirate ship ever built',
  };
  const place = sd[s] || sd['Enchanted Forest'];

  const pages: StoryPage[] = [
    { pageNumber: 1, moodColor: c[0], illustrationDescription: `${n} discovering a glowing golden map`,
      text: y ? `Once upon a time, there was a wonderful child named ${n}. ${n} loved ${i1} more than anything! One sunny morning, ${n} woke up to find a glowing golden map on the pillow. It showed the way to ${place}!`
        : `${n} had always been fascinated by ${i1}. So when a mysterious golden map appeared on the doorstep one morning, with a trail leading to ${place}, ${n} knew this was the beginning of something extraordinary.` },
    { pageNumber: 2, moodColor: c[1], illustrationDescription: `${n}${hf ? ` and ${f}` : ''} following a sparkly golden path`,
      text: hf
        ? (y ? `"Let's go on an adventure!" said ${n}. ${f} came along too! Together, they followed the sparkly path. ${cur ? `${n} stopped to look at every interesting thing. "I wonder what that is?" ${n} kept asking.` : 'They skipped and laughed the whole way.'}`
          : `${n} grabbed the map and called ${f}. "You have to see this," ${n} said. ${f} grinned. "Let's go!" ${cur ? `Along the way, ${n} couldn't help asking questions about everything. "Why does that flower glow?"` : 'Together, they set off into the unknown.'}`)
        : (y ? `"I can do this!" said ${n} bravely. ${n} packed a little bag and followed the sparkly path. ${cur ? `"I wonder what I'll find?" ${n} whispered with a big smile.` : 'Every step was a new surprise!'}`
          : `${n} took a deep breath and packed a small bag. The path ahead was full of mystery and wonder.`) },
    { pageNumber: 3, moodColor: c[2], illustrationDescription: `${s} with a darkened crystal`,
      text: y ? `They arrived at ${place}! It was even more amazing than ${n} had imagined. Everything was connected to ${i1}! But oh no — there was a big problem. The magical ${i2} treasure was locked away, and nobody could figure out how to open it.`
        : `When they finally arrived at ${place}, ${n} gasped. It was breathtaking — and everything seemed connected to ${i1}. But something was wrong. The Great ${i2.charAt(0).toUpperCase() + i2.slice(1)} Crystal, which kept the magic alive, had gone dark. Without it, the whole place was fading.` },
    { pageNumber: 4, moodColor: c[3], illustrationDescription: `${n} thinking hard, looking determined`,
      text: gm
        ? (y ? `${n} tried to open the treasure. Push! Pull! Nothing worked. "I can't do it," ${n} said sadly. But then ${n} had a thought: "Wait — I can't do it YET. Let me try a different way!" And ${n} started to think really hard.`
          : `${n}'s first attempt to restore the crystal failed. And the second. ${n} felt frustrated. "Maybe I'm not smart enough for this," ${n} muttered. But then something clicked: "No — I just haven't figured it out YET. Every mistake is teaching me something." ${n} studied the problem with fresh eyes.`)
        : (y ? `${n} looked at the locked treasure. It was a tricky puzzle! ${n} sat down and thought very carefully. "If I break this big problem into tiny pieces, maybe I can solve it!"`
          : `The challenge seemed impossible at first. But ${n} sat down and studied the problem carefully. "What if I break this into smaller pieces?" ${n} thought. "One step at a time."`) },
    { pageNumber: 5, moodColor: c[4], illustrationDescription: `${n} showing kindness to a magical creature`,
      text: emp
        ? (y ? `A little creature appeared, looking sad. "What's wrong?" asked ${n} gently. "Everyone forgot about me," it sniffled. ${n} sat down next to it. "I know how that feels. You matter, and I'm here now." The creature smiled, and something magical started to glow.`
          : `A small, shy creature emerged from the shadows, trembling. Others walked past, too busy. But ${n} knelt down. "Hey, are you okay?" The creature explained it had been left out, forgotten. ${n} listened — really listened — and said, "I understand. Come with ${hf ? 'us' : 'me'}." As kindness flowed, a piece of the crystal began to glow.`)
        : (y ? `${n} found a clue! A friendly creature showed ${n} a hidden path. "Thank you!" said ${n}. "Being kind is the real magic," the creature replied with a wink.`
          : `Exploring further, ${n} discovered a hidden passage. Inside was a riddle: "The strongest force isn't strength — it's understanding." ${n} smiled. "I think I know what to do."`) },
    { pageNumber: 6, moodColor: c[5], illustrationDescription: `${n}${hf ? `, ${f},` : ''} and creatures working together`,
      text: tw
        ? (y ? `${n} realized something important: "I don't have to do everything alone!" ${n} asked everyone to help. Each person was good at something different. ${hf ? `${f} was super clever. ` : ''}Together, they were unstoppable!`
          : `${n} realized: this wasn't a one-person job. "Everyone has different strengths," ${n} said. "If we work together, we can do what none of us could do alone." ${hf ? `${f} nodded eagerly. ` : ''}One by one, everyone contributed. The crystal glowed brighter with each act of teamwork.`)
        : (y ? `Step by step, ${n} worked on the puzzle. First this piece, then that piece. "I'm getting closer!" ${n} cheered. The magic started coming back!`
          : `${n} worked methodically, applying each lesson learned. The crystal responded to genuine effort — not perfection, but persistence.`) },
    { pageNumber: 7, moodColor: c[6], illustrationDescription: `${s} restored to full glory, celebration`,
      text: y ? `The treasure opened with a beautiful WHOOSH! Light and sparkles filled everywhere! ${n} had done it! All of ${place} came back to life. "You did it, ${n}!" everyone cheered. ${n} felt so proud and happy.`
        : `With one final effort, the crystal blazed back to life. Light cascaded through ${place}, restoring every color, every sound. ${n} stood at the center, heart full. ${hf ? `${f} threw an arm around ${n}. "We couldn't have done it without you."` : 'The creatures gathered, grateful and amazed.'} It wasn't about being strongest or smartest. It was about never giving up, being kind, and believing in yourself.` },
    { pageNumber: 8, moodColor: c[7], illustrationDescription: `${n} back home, looking at stars`,
      text: y ? `${n} went home with the biggest smile ever. ${hf ? `${f} said, "That was the best adventure EVER!" ` : ''}${n} learned that being brave, being kind, and never giving up are the most powerful magic of all. The golden map was still there, ready for the next adventure. The End. 🌟`
        : `As ${n} made it home, the golden map still tucked safely away, ${n} was different. Braver. Kinder. More curious. ${hf ? `${f} texted: "Same time tomorrow?" ` : ''}${n} smiled at the stars. Tomorrow held new adventures. The End. 🌟` },
  ];

  const tm: Record<string, string> = { 'Pirate Ship': 'Lost Treasure', 'Outer Space': 'Starlight Crystal', 'Underwater Kingdom': 'Ocean Crystal', 'Dinosaur World': 'Ancient Crystal' };
  return { title: `${n} and the ${tm[s] || 'Enchanted Crystal'}`, subtitle: `A ${i1} adventure in ${s}`, dedication: `For ${n}${hf ? ` and ${f}` : ''} — may you always stay curious, kind, and brave.`, pages };
}

function discoveryStory(r: GenerateRequest): { title: string; subtitle: string; dedication: string; pages: StoryPage[] } {
  const { childName: n, childAge: a, interests: ints, mentalModels: mm, characterTraits: ct, friendNames: fn, setting: s } = r;
  const y = young(a);
  const f = fn[0] || '';
  const hf = !!f;
  const i1 = ints[0] || 'adventure';
  const c = MOOD_COLORS[s] || MOOD_COLORS['Enchanted Forest'];
  const fp = hasModel(mm, 'first principles');
  const pat = hasTrait(ct, 'patience');
  const cou = hasTrait(ct, 'courage');
  const gra = hasTrait(ct, 'gratitude');
  const gro = hasModel(mm, 'growth') || hasTrait(ct, 'resilience');

  const sn: Record<string, string> = { 'Enchanted Forest': 'the Whispering Woods', 'Outer Space': 'the Cosmic Academy', 'Underwater Kingdom': 'Coral City', 'Magical School': 'Starlight Academy', 'Neighborhood Adventure': 'the Secret Garden next door', 'Dinosaur World': 'the Valley of Giants', 'Pirate Ship': 'the ship Stardancer' };
  const place = sn[s] || 'a magical place';

  const pages: StoryPage[] = [
    { pageNumber: 1, moodColor: c[0], illustrationDescription: `${n} discovering a tiny door behind a bookshelf`,
      text: y ? `${n} was a very special child who loved ${i1}. One day, ${n} found a tiny door behind the bookshelf! "Ooh! Where does it go?" ${n} whispered.`
        : `Everyone knew ${n} loved ${i1}. But what nobody knew was that ${n} had a secret — a tiny door behind the old bookshelf. Today, ${n} finally opened it.` },
    { pageNumber: 2, moodColor: c[1], illustrationDescription: `A breathtaking reveal of ${s}`,
      text: y ? `The door led to ${place}! ${n} couldn't believe it! ${hf ? `"${f}! Come see this!" ${n} called.` : `${n} took a deep breath and stepped inside.`}`
        : `Through the door lay ${place}. ${n} stepped through and felt the air change — warmer, alive with possibility. ${hf ? `${f} squeezed through right behind. "This is incredible," ${f} breathed.` : 'The door clicked shut, but this felt right.'}` },
    { pageNumber: 3, moodColor: c[2], illustrationDescription: `A wise keeper speaking to ${n}`,
      text: y ? `But the colors were fading! A wise old owl said, "${n}, the Imagination Engine is broken. Without it, all the stories disappear. Only someone who truly loves ${i1} can fix it."`
        : `${n} noticed parts of ${place} were flickering. A wise keeper approached. "The Imagination Engine is failing. It runs on genuine wonder — but everyone's forgotten how to dream. We need someone who still sees magic in ${i1}."` },
    { pageNumber: 4, moodColor: c[3], illustrationDescription: `${n} examining the Imagination Engine`,
      text: fp
        ? (y ? `${n} went to see the Engine. It was very big! "This is too hard," ${n} thought. But then: "What if I look at just one part at a time?" ${n} found the first broken piece!`
          : `The Engine was massive. But instead of panicking, ${n} thought: "Let me strip this to basics. What does this actually need?" By breaking the problem into tiny questions, ${n} found the first broken gear.`)
        : pat
        ? (y ? `${n} started working on the Engine. It was slow. "I want it fixed NOW," ${n} sighed. But the owl said, "Good things take time." So ${n} took a deep breath and kept going patiently.`
          : `Fixing the Engine wasn't quick. ${n} wanted instant results, but the keeper smiled. "The best things come to those who persist with patience." ${n} slowed down and found details rushing would have missed.`)
        : (y ? `${n} started fixing the Engine. It took lots of tries! "I won't give up!" said ${n} with a determined smile.`
          : `${n} began working, trying one approach after another. Each failure taught something new.`) },
    { pageNumber: 5, moodColor: c[4], illustrationDescription: `${n} bravely crossing a bridge or solving a puzzle`,
      text: cou
        ? (y ? `To get the last part, ${n} had to cross the Wobbly Bridge. It was very scary! "I'm scared," ${n} whispered. "But brave people feel scared too — they just keep going anyway." Step by step, ${n} crossed!`
          : `The final piece was across the Trembling Bridge. ${n}'s heart hammered. "I don't think I can do this." But courage isn't the absence of fear. It's taking the next step even when your voice shakes. One step. Then another.`)
        : (y ? `${n} needed one more piece! It was hidden in a tricky spot. "What would happen if I tried THIS?" And it worked!`
          : `The final component was behind a logic puzzle. ${n} stopped forcing it and asked, "What is this really asking?" The answer was simpler than expected.`) },
    { pageNumber: 6, moodColor: c[5], illustrationDescription: `Explosion of color as the Engine roars back`,
      text: y ? `${n} put the last piece in. WHOOOOSH! Colors exploded everywhere! ${hf ? `${f} clapped and jumped!` : 'All the creatures cheered!'} ${place} came back to life!`
        : `${n} slid the final piece in. A hum, a glow, and an explosion of color swept through ${place}. ${hf ? `${f} grabbed ${n}'s hand, both laughing.` : `${n} laughed out loud, pure joy.`} The stories were coming back.` },
    { pageNumber: 7, moodColor: c[6], illustrationDescription: `Celebration in ${s}`,
      text: gra
        ? (y ? `"Thank you, ${n}!" everyone said. "Thank YOU," said ${n}. "I'm so grateful for this adventure and for all of you!"`
          : `The inhabitants gathered to thank ${n}. But instead of just accepting praise, ${n} said, "I'm the grateful one. None of this would have happened without all of you."`)
        : gro
        ? (y ? `"You did it!" everyone cheered. ${n} smiled. "I made lots of mistakes, but each one helped me learn!"`
          : `${n} reflected: the mistakes weren't obstacles — they were the path. "Every time I got it wrong, I got closer to right. That's the real secret."`)
        : (y ? `Everyone celebrated! Music and dancing and the biggest party ever! ${n} was the hero!`
          : `${place} erupted in celebration. ${n} stood in the middle — not because of talent, but because of heart.`) },
    { pageNumber: 8, moodColor: c[7], illustrationDescription: `${n} back home, touching the bookshelf door`,
      text: y ? `${n} went back through the tiny door. ${hf ? `${f} knew too! ` : ''}Now ${n} knew: the best adventures come from being curious, kind, and never giving up. The End. ✨`
        : `${n} stepped back through the door. Everything looked the same — but ${n} was different. Braver. Kinder. More curious. ${hf ? `${f} texted: "Same time tomorrow?" ` : ''}${n} whispered to the door, "See you soon." The best stories never really end. The End. ✨` },
  ];

  return { title: `${n} and the Imagination Engine`, subtitle: `A story about wonder, ${i1}, and never giving up`, dedication: `For ${n} — whose imagination makes the world more magical every day.`, pages };
}

function kindnessRipple(r: GenerateRequest): { title: string; subtitle: string; dedication: string; pages: StoryPage[] } {
  const { childName: n, childAge: a, interests: ints, mentalModels: mm, characterTraits: ct, friendNames: fn, setting: s } = r;
  const y = young(a);
  const f = fn[0] || '';
  const hf = !!f;
  const i1 = ints[0] || 'adventure';
  const i2 = ints[1] || ints[0] || 'exploring';
  const c = MOOD_COLORS[s] || MOOD_COLORS['Enchanted Forest'];
  const ce = hasModel(mm, 'cause');
  const so = hasModel(mm, 'second-order');
  const sh = hasTrait(ct, 'sharing') || hasTrait(ct, 'generosity');
  const ho = hasTrait(ct, 'honesty');
  const re = hasTrait(ct, 'responsibility');

  const pages: StoryPage[] = [
    { pageNumber: 1, moodColor: c[0], illustrationDescription: `${n} with a tiny golden seed`,
      text: y ? `${n} was having a normal day. ${n} was playing with ${i1} when something strange happened — a little golden seed fell from the sky, right into ${n}'s hand!`
        : `It started as an ordinary day. ${n} was enjoying ${i1} when a tiny golden seed, no bigger than a marble, tumbled from the sky into ${n}'s palm. It pulsed with warm light.` },
    { pageNumber: 2, moodColor: c[1], illustrationDescription: `${n} holding the glowing seed`,
      text: y ? `A tiny voice came from the seed! "I'm a Kindness Seed! Every time you do something kind, I grow. When I'm big enough, something wonderful happens!" ${n}'s eyes went wide. ${hf ? `${f} ran over. "Can I help too?"` : ''}`
        : `The seed hummed: "I grow with every act of genuine kindness. Not for reward. Real kindness — the kind that costs you something." ${hf ? `${f} appeared. "What have you got there?"` : ''}` },
    { pageNumber: 3, moodColor: c[2], illustrationDescription: `${n} sharing/helping, seed sprouting`,
      text: sh
        ? (y ? `${n} saw a little creature sitting alone with no lunch. Without thinking, ${n} shared half of everything. "Sharing makes everything better!" The golden seed grew a tiny sprout!`
          : `A shy creature sat alone at lunch, pretending not to be hungry. ${n} just sat down beside them and split lunch in half. "Food tastes better with company." The seed sprouted its first leaf.`)
        : (y ? `${n} noticed someone looking sad. "What's wrong?" The creature was lost! ${n} helped show the way home. The seed grew a sprout!`
          : `${n} noticed a creature struggling to find its way. Without being asked, ${n} stopped and helped. The seed sprouted its first leaf.`) },
    { pageNumber: 4, moodColor: c[3], illustrationDescription: `Ripple effect of kindness spreading`,
      text: ce
        ? (y ? `Something amazing happened! The creature ${n} helped went and helped someone ELSE! And THAT person helped another! "My one kind thing made THREE kind things happen!" The seed grew bigger!`
          : `Something unexpected: the creature ${n} helped turned and helped another. Who helped another. A chain of kindness, like ripples in a pond. "One action can cause so many effects," ${n} realized. "Everything is connected." The seed was now a small plant.`)
        : (y ? `${n} helped another creature with ${i2}. "I know about ${i2}!" Together they figured it out. The seed grew even bigger!`
          : `Next, ${n} helped someone struggling with ${i2}. Instead of doing it for them, ${n} taught them how. "Now you can help others too." The seed grew warm and strong.`) },
    { pageNumber: 5, moodColor: c[4], illustrationDescription: `${n} being honest/responsible, seed growing`,
      text: ho
        ? (y ? `Then ${n} accidentally broke something! It was scary, but ${n} told the truth. "I did it. I'm sorry." Everyone was so proud of ${n}! "Being honest is the bravest kind thing," said the elder. The seed grew VERY big!`
          : `Then the hard part. ${n} accidentally broke something valuable. Nobody saw. It would be easy to stay quiet. But ${n} spoke up: "I did this. I'm sorry." The elder smiled. "Honesty when it's difficult is the truest kindness." The seed doubled in size.`)
        : re
        ? (y ? `${n} saw a big mess. Instead of walking away, ${n} started cleaning up. "If I can help fix it, I should!" The seed grew really big!`
          : `There was a mess — ${n} hadn't caused all of it but played a part. Instead of walking away, ${n} got to work. "Responsibility isn't about blame. It's about doing what needs to be done." The seed was nearly a sapling.`)
        : (y ? `${n} kept finding ways to be kind all day. A smile here, a helping hand there. Each kindness made the seed grow bigger!`
          : `${n} continued finding small ways to make things better. A word of encouragement. A moment of patience. None grand — but each one mattered. The seed was now a sapling.`) },
    { pageNumber: 6, moodColor: c[5], illustrationDescription: `A magnificent golden tree`,
      text: so
        ? (y ? `The seed was now a beautiful golden tree! ${n} thought: "When I'm kind, people feel happy. And they're kind to others. My little seed changed EVERYTHING!"`
          : `The sapling was now a magnificent golden tree. ${n} thought deeply. "It's not just about what happens first — it's what happens BECAUSE of what happens. My kindness didn't just help one person — it changed how people treat each other."`)
        : (y ? `The seed grew into a beautiful golden tree! Golden leaves floated down like blessings. Everyone gathered around. "${n} grew this!" they whispered.`
          : `The seed was now a magnificent tree, golden branches stretching wide. Warm light filtered through its leaves, touching every corner. Creatures gathered, drawn by its warmth.`) },
    { pageNumber: 7, moodColor: c[6], illustrationDescription: `Hundreds of golden seeds floating through the air`,
      text: y ? `The golden tree started dropping seeds — hundreds floating to everyone! Now EVERYONE could grow their own kindness! "You started all of this, ${n}," smiled the elder.`
        : `Golden seeds fell from the tree like snow, drifting into outstretched hands. Each person now had their own kindness seed. "You showed everyone that kindness is a choice available to all of us, every moment," the elder said.` },
    { pageNumber: 8, moodColor: c[7], illustrationDescription: `${n} walking home at sunset with a new seed`,
      text: y ? `${n} went home holding a tiny new golden seed. ${hf ? `${f} had one too! ` : ''}Every tomorrow was a chance to be kind, brave, and to make the world better. That was the most magical thing of all. The End. 💛`
        : `${n} walked home at sunset, a new seed warm in one pocket and a heart full of knowing that one person can change everything. Not with superpowers, but with simple kindness. ${hf ? `${f} walked alongside, seed glowing. ` : ''}${n} smiled at the stars. Tomorrow was going to be a very good day. The End. 💛` },
  ];

  return { title: `${n} and the Golden Seed`, subtitle: 'A story about how one small act of kindness can change everything', dedication: `For ${n} — whose kindness makes the world bloom.${hf ? ` And for ${f}, who makes every adventure better.` : ''}`, pages };
}

export function generateStory(req: GenerateRequest): { title: string; subtitle: string; dedication: string; pages: StoryPage[] } {
  const hk = hasTrait(req.characterTraits, 'kindness') || hasTrait(req.characterTraits, 'sharing') || hasModel(req.mentalModels, 'cause') || hasModel(req.mentalModels, 'systems');
  const hc = hasModel(req.mentalModels, 'curiosity') || hasTrait(req.characterTraits, 'creativity') || hasModel(req.mentalModels, 'first');
  const hash = req.childName.length + req.interests.length + req.childAge;
  if (hk && hash % 3 !== 0) return kindnessRipple(req);
  if (hc || hash % 2 === 0) return discoveryStory(req);
  return questAdventure(req);
}
