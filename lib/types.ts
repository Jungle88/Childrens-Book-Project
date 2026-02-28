export interface StoryPage {
  pageNumber: number;
  text: string;
  illustrationDescription: string;
  illustrationUrl?: string;
  moodColor: string;
}

export interface Character {
  name: string;
  relationship: 'friend' | 'sibling' | 'pet';
}

export interface Story {
  id: string;
  title: string;
  subtitle: string;
  dedication: string;
  childName: string;
  childAge: number;
  interests: string[];
  lessons: string[];
  characters: Character[];
  format: 'a4-book' | 'comic' | 'digital';
  pages: StoryPage[];
  createdAt: string;
  views: number;
  shares: number;
}

export interface GenerateRequest {
  childName: string;
  childAge: number;
  interests: string[];
  lessons: string[];
  characters: Character[];
  format: 'a4-book' | 'comic' | 'digital';
}
