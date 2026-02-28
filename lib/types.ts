export interface StoryPage {
  pageNumber: number;
  text: string;
  illustrationDescription: string;
  moodColor: string;
}

export interface Story {
  id: string;
  title: string;
  subtitle: string;
  dedication: string;
  childName: string;
  childAge: number;
  interests: string[];
  mentalModels: string[];
  characterTraits: string[];
  friendNames: string[];
  setting: string;
  pages: StoryPage[];
  createdAt: string;
  views: number;
  shares: number;
}

export interface GenerateRequest {
  childName: string;
  childAge: number;
  interests: string[];
  mentalModels: string[];
  characterTraits: string[];
  friendNames: string[];
  setting: string;
}
