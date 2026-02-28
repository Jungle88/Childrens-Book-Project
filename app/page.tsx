'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const features = [
  { icon: '👑', title: 'Your Child is the Hero', desc: 'Their name, their interests, their adventure. Every story is uniquely theirs.' },
  { icon: '🧠', title: 'Hidden Life Lessons', desc: 'Mental models and character traits woven naturally into the narrative.' },
  { icon: '📱', title: 'Mobile-Friendly', desc: 'Beautiful reading experience on any device. Read together anywhere.' },
  { icon: '🔗', title: 'Shareable', desc: 'Send stories to grandparents, friends, and family with a single link.' },
  { icon: '📄', title: 'PDF Download', desc: 'Download and print beautiful storybooks to keep forever.' },
  { icon: '🎯', title: 'Age-Appropriate', desc: 'Language and complexity adapted for ages 2-10.' },
];

const testimonials = [
  { name: 'Sarah M.', text: 'My daughter asks for a new story every night! She loves being the hero.', role: 'Mom of a 5-year-old' },
  { name: 'James K.', text: 'The hidden lessons are genius. My son learned about growth mindset without even realizing it.', role: 'Dad of a 7-year-old' },
  { name: 'Priya R.', text: 'We sent a story to grandma and she cried happy tears. This is so special.', role: 'Mom of a 3-year-old' },
];

const faqs = [
  { q: 'How does it work?', a: 'Choose your child\'s interests and the life lessons you want to teach. We generate a personalized 8-page storybook where your child is the hero, with those lessons woven naturally into the adventure.' },
  { q: 'What age range is this for?', a: 'Stories are tailored for children aged 2-10. The language complexity, themes, and story length automatically adjust based on the age you select.' },
  { q: 'Can I share stories with family?', a: 'Absolutely! Every story gets a unique link you can share with grandparents, family, and friends. You can also download a PDF to print.' },
  { q: 'What are "hidden life lessons"?', a: 'We weave mental models (like growth mindset, cause & effect) and character traits (like kindness, courage) into the story naturally. Children learn through the adventure without it feeling preachy.' },
  { q: 'Is it free?', a: 'Yes! You can create stories for free. A Pro tier with additional features is coming soon.' },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-screen bg-cream">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="text-2xl font-bold text-brown">✨ Storybook</div>
        <div className="flex gap-4 items-center">
          <Link href="/library" className="text-brown-light hover:text-brown transition">Library</Link>
          <Link href="/create" className="bg-purple-600 text-white px-5 py-2 rounded-full hover:bg-purple-700 transition font-medium">
            Create a Story
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-6 py-20 max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-6xl font-bold text-brown leading-tight mb-6"
        >
          Create a magical story,<br />
          <span className="text-purple-600">just for your child</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-brown-light mb-10 max-w-2xl mx-auto"
        >
          Personalized stories where your child is the hero. Hidden life lessons. Beautiful design. Ready in seconds.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Link href="/create" className="inline-block bg-gold-500 text-brown px-8 py-4 rounded-full text-lg font-bold hover:bg-gold-600 transition shadow-lg hover:shadow-xl">
            ✨ Create Your Story — It&apos;s Free
          </Link>
        </motion.div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-6 bg-cream-dark">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-brown mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', icon: '🎨', title: 'Choose Interests', desc: 'Pick what your child loves — dinosaurs, space, princesses, and more.' },
              { step: '2', icon: '🧠', title: 'Select Lessons', desc: 'Choose the mental models and character traits you want woven in.' },
              { step: '3', icon: '📖', title: 'Read Together', desc: 'Get a beautiful story where your child is the hero. Share and keep forever.' },
            ].map((item) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-cream p-8 rounded-2xl border border-border"
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <div className="text-sm text-gold-500 font-bold mb-2">STEP {item.step}</div>
                <h3 className="text-xl font-bold text-brown mb-2">{item.title}</h3>
                <p className="text-brown-light">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-brown mb-12">Why Parents Love Storybook</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-6 rounded-xl border border-border bg-cream hover:shadow-lg transition"
              >
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="text-lg font-bold text-brown mb-2">{f.title}</h3>
                <p className="text-brown-light text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-cream-dark">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-brown mb-12">What Parents Say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-cream p-6 rounded-xl border border-border">
                <p className="text-brown-light italic mb-4">&ldquo;{t.text}&rdquo;</p>
                <p className="font-bold text-brown">{t.name}</p>
                <p className="text-sm text-gold-500">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-brown mb-12">Simple Pricing</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div className="p-8 rounded-2xl border-2 border-gold-500 bg-cream">
              <h3 className="text-xl font-bold text-brown mb-2">Free</h3>
              <div className="text-4xl font-bold text-brown mb-4">$0</div>
              <ul className="text-left text-brown-light space-y-2 mb-6">
                <li>✅ Unlimited stories</li>
                <li>✅ All interests & lessons</li>
                <li>✅ Share via link</li>
                <li>✅ PDF download</li>
                <li>✅ Story library</li>
              </ul>
              <Link href="/create" className="block bg-gold-500 text-brown px-6 py-3 rounded-full font-bold hover:bg-gold-600 transition">
                Get Started Free
              </Link>
            </div>
            <div className="p-8 rounded-2xl border border-border bg-cream opacity-75">
              <h3 className="text-xl font-bold text-brown mb-2">Pro</h3>
              <div className="text-4xl font-bold text-brown mb-4">Coming Soon</div>
              <ul className="text-left text-brown-light space-y-2 mb-6">
                <li>🔮 AI illustrations per page</li>
                <li>🔮 Audio narration</li>
                <li>🔮 Premium templates</li>
                <li>🔮 Print-to-order</li>
                <li>🔮 Multiple languages</li>
              </ul>
              <button disabled className="block w-full bg-border text-brown-light px-6 py-3 rounded-full font-bold cursor-not-allowed">
                Notify Me
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 bg-cream-dark">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-brown mb-12 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-border rounded-xl bg-cream overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-6 py-4 font-bold text-brown flex justify-between items-center"
                >
                  {faq.q}
                  <span className="text-gold-500">{openFaq === i ? '−' : '+'}</span>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-4 text-brown-light">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Email Capture */}
      <section className="py-20 px-6">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-brown mb-4">Stay in the Loop</h2>
          <p className="text-brown-light mb-8">Get notified when Pro launches and receive free story tips.</p>
          <form onSubmit={(e) => { e.preventDefault(); setEmail(''); alert('Thanks! We\'ll be in touch.'); }} className="flex gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 rounded-full border border-border bg-cream text-brown focus:outline-none focus:ring-2 focus:ring-gold-500"
              required
            />
            <button type="submit" className="bg-purple-600 text-white px-6 py-3 rounded-full font-bold hover:bg-purple-700 transition">
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border text-center text-brown-light text-sm">
        <p>✨ Storybook — Made with love for parents and kids everywhere.</p>
      </footer>
    </div>
  );
}
