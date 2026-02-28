import { Metadata } from 'next';
import SharedClient from './client';

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  try {
    const res = await fetch(`${baseUrl}/api/stories/${id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error();
    const story = await res.json();
    return { title: `${story.title} — Storybook`, description: story.subtitle || 'A personalized story',
      openGraph: { title: story.title, description: story.subtitle || 'A magical adventure', type: 'article' } };
  } catch { return { title: 'Story — Storybook' }; }
}

export default async function SharedPage({ params }: Props) {
  const { id } = await params;
  return <SharedClient id={id} />;
}
