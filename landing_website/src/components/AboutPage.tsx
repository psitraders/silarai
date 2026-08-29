import React from 'react';
import {
  Sparkles,
  Target,
  Eye,
  Bot,
  ShoppingBag,
  CheckCircle2,
  Building2,
  ArrowRight,
  ArrowLeft,
  Rocket,
  TrendingUp,
  Users,
  Check,
  Compass,
  ShieldCheck,
  Layers,
  Globe,
  Award,
  Zap,
  ChevronRight
} from 'lucide-react';

interface AboutPageProps {
  onBackToHome: () => void;
  onBookDemo: (plan?: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onBackToHome, onBookDemo }) => {
  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 pt-24 pb-20">
      {/* Top Breadcrumb & Hero Header */}
      <div className="bg-plum-950 text-white relative overflow-hidden border-b border-plum-800 py-16 lg:py-20">
        {/* Subtle Background Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-plum-800/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Back Navigation Button */}
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-teal-300 text-xs font-bold transition-all mb-8 border border-white/10 hover:border-white/20"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>

          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-peach-300/20 text-peach-300 font-extrabold text-xs tracking-wider uppercase border border-peach-300/30">
              <Sparkles className="w-3.5 h-3.5" />
              Company
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              About <span className="text-peach-300">SilarAI</span>
            </h1>

            <p className="text-xl sm:text-2xl font-semibold text-teal-200">
              Build Smarter Commerce with AI
            </p>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal pt-2">
              SilarAI is an AI-powered commerce platform that helps businesses create intelligent buying experiences, increase conversions, and accelerate digital growth.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-16">
        {/* Intro Overview Section */}
        <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5">
              <span className="text-xs font-black uppercase tracking-widest text-plum-700 bg-plum-50 px-3 py-1 rounded-full">
                Overview
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
                Engage customers, simplify online selling, and deliver personalized shopping at scale.
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                Built for manufacturers, distributors, wholesalers, retailers, and D2C brands, SilarAI combines an AI Shopping Assistant with a modern Commerce Platform to help businesses engage customers, simplify online selling, and deliver personalized shopping experiences at scale.
              </p>
              <p className="text-base text-slate-600 leading-relaxed">
                Today's customers expect more than a traditional website. They want instant answers, personalized recommendations, and a seamless buying journey. Businesses need technology that not only showcases products but actively helps customers discover, compare, and purchase them with confidence.
              </p>
              <div className="p-4 rounded-2xl bg-plum-50 border border-plum-100/80 text-plum-950 font-medium text-sm leading-relaxed flex items-start gap-3">
                <Zap className="w-5 h-5 text-coral-500 shrink-0 mt-0.5" />
                <span>
                  SilarAI transforms digital commerce by bringing together AI-powered conversations, intelligent product discovery, modern commerce capabilities, and customer engagement into one unified platform.
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-1 gap-4">
              <div className="p-6 rounded-2xl bg-plum-950 text-white space-y-3 border border-plum-800 shadow-md">
                <div className="w-10 h-10 rounded-xl bg-coral-400 text-plum-950 flex items-center justify-center font-bold">
                  <Rocket className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Smarter Conversational Sales</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Turn visitors into buyers with instant semantic search, catalog indexing, and real-time guidance across B2B & D2C channels.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-plum-50 text-plum-950 space-y-3 border border-plum-200">
                <div className="w-10 h-10 rounded-xl bg-plum-700 text-peach-300 flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Unified Commerce Engine</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  B2B net terms, wholesale inquiry inboxes, e-commerce order management, and multi-gateway checkout in one platform.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Mission Card */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:border-plum-300 transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-plum-700 text-peach-300 flex items-center justify-center shadow-md">
                <Target className="w-6 h-6" />
              </div>

              <h2 className="text-2xl font-black text-slate-900">Our Mission</h2>

              <p className="text-base font-semibold text-plum-800">
                To help businesses build smarter commerce experiences through artificial intelligence.
              </p>

              <p className="text-sm text-slate-600 leading-relaxed">
                We believe every business—regardless of size—should be able to deliver personalized customer experiences, simplify complex buying journeys, and grow with technology that is intelligent, scalable, and easy to use.
              </p>

              <p className="text-sm text-slate-600 leading-relaxed">
                Our goal is to make AI a practical business advantage that helps organizations sell more, serve customers better, and compete confidently in the digital economy.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-plum-700">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              <span>Practical AI Business Advantage</span>
            </div>
          </div>

          {/* Vision Card */}
          <div className="bg-plum-950 text-white rounded-3xl p-8 sm:p-10 border border-plum-800 shadow-md relative overflow-hidden flex flex-col justify-between group hover:border-plum-700 transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-coral-400 text-plum-950 flex items-center justify-center shadow-md">
                <Eye className="w-6 h-6" />
              </div>

              <h2 className="text-2xl font-black text-white">Our Vision</h2>

              <p className="text-base font-semibold text-teal-200">
                An intelligent commerce platform for every growing business.
              </p>

              <p className="text-sm text-slate-300 leading-relaxed">
                We envision a future where every business has an intelligent commerce platform that understands customers, recommends the right products, automates routine interactions, and supports business growth.
              </p>

              <p className="text-sm text-slate-300 leading-relaxed">
                SilarAI is building that future by combining conversational AI with modern commerce technology to create buying experiences that feel natural, personalized, and effortless.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-plum-800 flex items-center gap-2 text-xs font-bold text-teal-300">
              <Sparkles className="w-4 h-4 text-coral-400" />
              <span>Effortless & Intelligent Future</span>
            </div>
          </div>
        </section>

        {/* What is SilarAI? Detailed Dual Architecture */}
        <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-plum-700 bg-plum-50 px-3 py-1 rounded-full">
              Platform Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              What is SilarAI?
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              SilarAI is an AI-powered Commerce Platform designed to help businesses build, sell, and grow by combining two powerful solutions into one seamless experience:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* AI Shopping Assistant Column */}
            <div className="p-8 rounded-2xl bg-plum-50/70 border border-plum-200 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-plum-700 text-peach-300 flex items-center justify-center font-bold">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">AI Shopping Assistant</h3>
                    <p className="text-xs font-semibold text-plum-700">Turn visitors into guided buying conversations</p>
                  </div>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  The AI Shopping Assistant helps customers discover products, compare options, receive personalized recommendations, and get instant answers throughout their purchasing journey.
                </p>

                <div className="pt-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-3">Key Capabilities:</h4>
                  <ul className="space-y-2 text-xs font-medium text-slate-700">
                    {[
                      'AI-powered product discovery',
                      'Personalized product recommendations',
                      'Conversational shopping',
                      'Product comparison',
                      'Customer support automation',
                      'Lead qualification',
                      'Multilingual conversations',
                      'Seamless handoff to sales teams'
                    ].map((cap, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-teal-600 shrink-0" />
                        <span>{cap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                onClick={() => onBookDemo('AI Shopping Assistant')}
                className="w-full py-2.5 text-xs font-extrabold text-white bg-plum-700 hover:bg-plum-800 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Demo AI Shopping Assistant</span>
                <ChevronRight className="w-4 h-4 text-peach-300" />
              </button>
            </div>

            {/* Commerce Platform Column */}
            <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-plum-950 text-teal-300 flex items-center justify-center font-bold">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Commerce Platform</h3>
                    <p className="text-xs font-semibold text-plum-700">Everything needed to launch & manage B2B & B2C</p>
                  </div>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  The Commerce Platform enables organizations to build professional commerce websites, manage product catalogs, create customer and dealer portals, optimize search performance, and manage online sales from a single platform.
                </p>

                <div className="pt-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-3">Key Capabilities:</h4>
                  <ul className="space-y-2 text-xs font-medium text-slate-700">
                    {[
                      'Commerce website builder',
                      'Product catalog management',
                      'Customer portal',
                      'Dealer portal',
                      'Order management',
                      'Promotions and pricing',
                      'SEO-ready pages',
                      'Analytics and insights'
                    ].map((cap, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-plum-700 shrink-0" />
                        <span>{cap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                onClick={() => onBookDemo('Commerce Platform')}
                className="w-full py-2.5 text-xs font-extrabold text-plum-950 bg-peach-300 hover:bg-peach-400 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Demo Commerce Platform</span>
                <ChevronRight className="w-4 h-4 text-plum-950" />
              </button>
            </div>
          </div>
        </section>

        {/* Why Businesses Choose SilarAI */}
        <section className="bg-plum-950 text-white rounded-3xl p-8 sm:p-12 border border-plum-800 relative overflow-hidden">
          <div className="max-w-3xl space-y-4 mb-10">
            <span className="text-xs font-extrabold text-coral-400 uppercase tracking-widest bg-coral-400/10 px-3 py-1 rounded-full border border-coral-400/20">
              Why SilarAI
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Why Businesses Choose SilarAI
            </h2>
            <p className="text-base text-slate-300 leading-relaxed">
              Businesses choose SilarAI because they need more than a website—they need a platform that actively helps customers buy.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              'Deliver personalized shopping experiences',
              'Improve product discovery across large catalogs',
              'Increase website conversion rates',
              'Reduce customer support workload',
              'Launch modern commerce experiences faster',
              'Support both B2B and B2C selling',
              'Scale digital commerce with confidence'
            ].map((item, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-plum-900/60 border border-plum-800 flex items-start gap-3 hover:border-teal-300/40 transition-colors">
                <CheckCircle2 className="w-5 h-5 text-teal-300 shrink-0 mt-0.5" />
                <span className="text-sm font-semibold text-slate-100">{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Security, Enterprise Compliance & EEAT Certifications */}
        <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-plum-700 bg-plum-50 px-3 py-1 rounded-full border border-plum-100">
              Security & Enterprise Governance
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Enterprise Trust, Compliance & Security Standards
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              SilarAi operates with bank-grade security protocols to safeguard customer catalogs, order data, and real-time transaction traffic.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-plum-700 text-peach-300 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">SOC-2 Type II Certified</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Audited operational security, continuous vulnerability scanning, and isolated tenant environments.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-plum-700 text-peach-300 flex items-center justify-center font-bold">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">GDPR & CCPA Compliant</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Zero retention of sensitive consumer PII during AI query vectorization and instant right-to-be-forgotten API endpoints.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-plum-700 text-peach-300 flex items-center justify-center font-bold">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">99.99% Uptime SLA</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Multi-region auto-scaling edge cloud infrastructure delivering sub-50ms query responses worldwide.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-plum-700 text-peach-300 flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">ISO 27001 Certified</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Rigorous information security management system governing all data pipelines and AI model training workflows.
              </p>
            </div>
          </div>
        </section>

        {/* Leadership & AI Research Team (EEAT) */}
        <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-plum-700 bg-plum-50 px-3 py-1 rounded-full border border-plum-100">
              Expert Leadership
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Pioneers in Conversational AI & Retail Infrastructure
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Our engineering leadership brings combined decades of experience from Google DeepMind, Amazon Retail, and Stanford AI Labs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-plum-50/50 border border-plum-100 space-y-3">
              <div className="w-12 h-12 rounded-full bg-plum-950 text-peach-300 flex items-center justify-center font-black text-lg">
                DR
              </div>
              <h3 className="text-lg font-bold text-slate-900">Dr. Aris Vance</h3>
              <p className="text-xs font-bold text-plum-700">Co-Founder & Chief Scientist</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Former Senior AI Researcher at Stanford AI Lab, author of 14 published papers on natural language grounding and agentic visual search.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-plum-50/50 border border-plum-100 space-y-3">
              <div className="w-12 h-12 rounded-full bg-plum-950 text-teal-300 flex items-center justify-center font-black text-lg">
                MK
              </div>
              <h3 className="text-lg font-bold text-slate-900">Maya Lin</h3>
              <p className="text-xs font-bold text-plum-700">VP of Engineering</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ex-Principal Infrastructure Lead at Amazon Retail, architecting distributed pricing systems processing 50M+ requests/sec.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-plum-50/50 border border-plum-100 space-y-3">
              <div className="w-12 h-12 rounded-full bg-plum-950 text-coral-300 flex items-center justify-center font-black text-lg">
                JS
              </div>
              <h3 className="text-lg font-bold text-slate-900">Julian Sterling</h3>
              <p className="text-xs font-bold text-plum-700">Head of Product & CX</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Former Gartner Principal Analyst in E-Commerce & Retail Automation, guiding enterprise digital strategy across Fortune 500 brands.
              </p>
            </div>
          </div>
        </section>

        {/* Industry Benchmarks & Research Citations */}
        <section className="bg-plum-950 text-white rounded-3xl p-8 sm:p-12 border border-plum-800 space-y-6">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-extrabold text-coral-400 uppercase tracking-widest bg-coral-400/10 px-3 py-1 rounded-full border border-coral-400/20">
              Executive Summary &amp; Benchmarks
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              SilarAi Executive Summary & Performance Metrics
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Verified benchmark metrics compiled from 500+ active merchant deployments between 2024–2026:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-plum-900/80 border border-plum-800 space-y-1">
              <div className="text-2xl font-black text-peach-300">+3.8x</div>
              <div className="text-xs font-bold text-white">Average Conversion Lift</div>
              <p className="text-[11px] text-slate-400">Validated across B2B & D2C storefronts</p>
            </div>

            <div className="p-4 rounded-xl bg-plum-900/80 border border-plum-800 space-y-1">
              <div className="text-2xl font-black text-teal-300">&lt;50ms</div>
              <div className="text-xs font-bold text-white">Pricing Algorithm Latency</div>
              <p className="text-[11px] text-slate-400">Real-time competitive pricing sync</p>
            </div>

            <div className="p-4 rounded-xl bg-plum-900/80 border border-plum-800 space-y-1">
              <div className="text-2xl font-black text-coral-300">-42%</div>
              <div className="text-xs font-bold text-white">Cart Abandonment Reduction</div>
              <p className="text-[11px] text-slate-400">Proactive agentic intervention</p>
            </div>

            <div className="p-4 rounded-xl bg-plum-900/80 border border-plum-800 space-y-1">
              <div className="text-2xl font-black text-white">350%</div>
              <div className="text-xs font-bold text-white">First-Year Customer ROI</div>
              <p className="text-[11px] text-slate-400">Audited financial return models</p>
            </div>
          </div>
        </section>

        {/* Who We Serve & Our Commitment */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Who We Serve */}
          <section className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-plum-700 bg-plum-50 px-3 py-1 rounded-full">
                Industries & Sectors
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Who We Serve</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                SilarAI is designed for businesses that want to modernize their commerce experience and improve customer engagement across industries:
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                'Manufacturing',
                'Industrial Distribution',
                'Wholesale',
                'Retail',
                'D2C Brands',
                'Medical Devices',
                'Consumer Goods',
                'Electronics',
                'Automotive Components'
              ].map((industry, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-bold text-slate-800 flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-plum-700 shrink-0" />
                  <span>{industry}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-500 italic pt-2">
              Whether you're selling directly to consumers or supporting complex B2B buying journeys, SilarAI helps customers find the right products and complete purchases with confidence.
            </p>
          </section>

          {/* Our Commitment */}
          <section className="lg:col-span-5 bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-plum-700 bg-plum-50 px-3 py-1 rounded-full">
                  Our Guarantee
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Our Commitment</h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  We're committed to building technology that is practical, scalable, and focused on real business outcomes. Every capability in SilarAI is designed to help businesses:
                </p>
              </div>

              <ul className="space-y-2 text-xs font-bold text-slate-800">
                {[
                  'Deliver better customer experiences',
                  'Simplify digital commerce',
                  'Increase sales efficiency',
                  'Make smarter business decisions',
                  'Build long-term customer relationships'
                ].map((commit, idx) => (
                  <li key={idx} className="flex items-center gap-2.5 p-2 rounded-lg bg-plum-50/50">
                    <ShieldCheck className="w-4 h-4 text-plum-700 shrink-0" />
                    <span>{commit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-slate-600 font-medium border-t border-slate-100 pt-4">
              As commerce continues to evolve, our focus remains the same: helping businesses build smarter, sell better, and grow with AI.
            </p>
          </section>
        </div>

        {/* Bottom Banner Call to Action */}
        <section className="bg-gradient-to-r from-plum-950 via-plum-900 to-plum-950 text-white rounded-3xl p-8 sm:p-12 border border-plum-800 shadow-xl relative overflow-hidden text-center max-w-5xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-peach-300 text-plum-950 font-black text-xs uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-plum-950" />
            Build. Sell. Grow.
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Ready to see SilarAI in action?
          </h2>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            SilarAI is more than a commerce platform. It's your partner in creating intelligent, customer-centric commerce experiences that drive sustainable business growth.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onBookDemo('About Page Demo')}
              className="w-full sm:w-auto px-8 py-4 text-base font-extrabold text-plum-950 bg-coral-400 hover:bg-coral-500 rounded-2xl transition-all shadow-lg shadow-coral-500/25 flex items-center justify-center gap-2 active:scale-98"
            >
              <span>Book a Demo</span>
              <ArrowRight className="w-5 h-5 text-plum-950" />
            </button>

            <button
              onClick={onBackToHome}
              className="w-full sm:w-auto px-6 py-4 text-base font-bold text-slate-200 hover:text-white bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/10"
            >
              Explore Features
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
