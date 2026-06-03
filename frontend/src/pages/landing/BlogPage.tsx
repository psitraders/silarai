import { LandingLayout } from '../../components/landing/LandingLayout';
import { Link } from 'react-router-dom';
import { ArrowRight, Rss } from 'lucide-react';

const comingSoonTopics = [
  { emoji: '🛍️', title: 'How to set up your first online store in 15 minutes' },
  { emoji: '🤖', title: 'How AI chat increases your conversion rate' },
  { emoji: '📦', title: 'Managing orders efficiently as your business grows' },
  { emoji: '📸', title: 'Product photography tips for WhatsApp & Instagram sellers' },
  { emoji: '💬', title: 'Building customer loyalty through personalised follow-ups' },
  { emoji: '📊', title: 'Understanding your sales analytics to grow faster' },
];

export function BlogPage() {
  return (
    <LandingLayout>
      {/* Hero */}
      <section className="bg-white py-20 border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-teal-50 rounded-2xl mb-6">
            <Rss className="w-6 h-6 text-teal-600" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-5">
            The ReplyCart Blog
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            Tips, guides, and stories to help sellers worldwide grow their business online.
          </p>
        </div>
      </section>

      {/* Coming soon */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="inline-block bg-amber-50 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-amber-100 mb-4">
              Coming soon
            </span>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-3">
              Our first posts are on the way
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              We're putting together practical guides for sellers just like you. Here's a preview of what's coming:
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-12">
            {comingSoonTopics.map((t) => (
              <div key={t.title} className="bg-white rounded-xl border border-gray-100 p-5 flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{t.emoji}</span>
                <p className="text-sm font-medium text-gray-700 leading-snug">{t.title}</p>
              </div>
            ))}
          </div>

          {/* Email signup nudge */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center max-w-lg mx-auto">
            <h3 className="font-bold text-gray-900 mb-2">Get notified when we publish</h3>
            <p className="text-sm text-gray-500 mb-5">
              Drop us your email and we'll let you know when our first articles go live.
            </p>
            <a
              href="mailto:support@replycart.app?subject=Notify me when the blog is live"
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              Notify me <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-16 border-t border-gray-100">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="text-gray-500 mb-4">In the meantime, why not get your store live?</p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Start for free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </LandingLayout>
  );
}
