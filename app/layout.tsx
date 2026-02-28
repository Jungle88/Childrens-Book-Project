import type { Metadata } from 'next';
import './globals.css';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';

export const metadata: Metadata = {
  title: "Storybook — Personalized AI Children\u0027s Books",
  description: "Create magical, personalized stories where your child is the hero.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}