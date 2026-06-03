import { LandingLayout } from '../../components/landing/LandingLayout';
import { Link } from 'react-router-dom';
import { ArrowRight, Target, Heart, Zap, Users } from 'lucide-react';

const values = [
  {
    icon: Target,
    color: 'bg-teal-50 text-teal-600',
    title: 'Built for everyone',
    desc: "We build for small businesses everywhere — not Silicon Valley startups. Every feature is designed around how real sellers actually work.",
  },
  {
    icon: Zap,
    color: 'bg-amber-50 text-amber-600',
    title: 'Simple by design',
    desc: 'If your grandmother can use WhatsApp, she should be able to use ReplyCart. We obsess over simplicity so you can focus on selling.',
  },
  {
    icon: Heart,
    color: 'bg-rose-50 text-rose-500',
    title: 'Customer-first always',
    desc: 'Your success is our success. We measure ourselves by how much your sales grow, not by how many features we ship.',
  },
  {
    icon: Users,
    color: 'bg-violet-50 text-violet-600',
    title: 'Sellers community',
    desc: 'We\'re building more than software — a community of ambitious entrepreneurs helping each other grow.',
  },
];

export function AboutPage() {
  return (
    <LandingLayout>
      {/* Hero */}
      <section className="bg-white py-20 border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-block bg-teal-50 text-teal-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-5 border border-teal-100">
            Our story
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
            We're on a mission to put every seller online
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            ReplyCart was born from a simple frustration: millions of talented
            makers, bakers, jewellers, and boutique owners worldwide struggle to go online —
            it's too complicated, too expensive, or too foreign. We're changing that.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-5">
                The problem we're solving
              </h2>
              <p className="text-gray-500 leading-relaxed mb-4">
                Millions of small sellers take orders on WhatsApp — juggling messages, manually
                checking stock, copying addresses into notebooks. It works, but it doesn't scale.
                When orders grow, the chaos grows too.
              </p>
              <p className="text-gray-500 leading-relaxed mb-4">
                Existing e-commerce platforms are built for large retailers with warehouses and
                dedicated tech teams. They're expensive, complex, and not built for the
                relationship-first way people like to shop.
              </p>
              <p className="text-gray-500 leading-relaxed">
                ReplyCart is the platform we wish existed — a beautiful storefront, an AI chat
                that knows your catalogue, and a simple order dashboard. All in one. All built
                for how the world actually sells.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '500+', label: 'Sellers on platform' },
                { value: '$2M+', label: 'Orders processed' },
                { value: '15 min', label: 'To go live' },
                { value: '4.8 ★', label: 'Seller rating' },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
                  <p className="text-2xl font-extrabold text-teal-600 mb-1">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">What we stand for</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {values.map((v) => (
              <div key={v.title} className="flex gap-4 p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${v.color}`}>
                  <v.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{v.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-gray-50 py-20 border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-5">
            Small team, big mission
          </h2>
          <p className="text-gray-500 leading-relaxed mb-8">
            We're a small, passionate team. We've all been close to small
            businesses — through family, friends, or our own side projects — and we know
            firsthand how hard it is to compete without the right tools. That's why we
            show up every day to build ReplyCart.
          </p>
          <p className="text-gray-500 leading-relaxed mb-10">
            We're not backed by big VCs with pressure to extract value. We're focused
            on building something sellers genuinely love and use every day.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Start selling for free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 border border-gray-200 hover:border-teal-300 text-gray-700 font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Get in touch
            </Link>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}
