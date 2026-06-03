import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Save, RefreshCw, Eye } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PageLoader } from '../../components/ui/Spinner';
import {
  landingApi, DEFAULT_CONTENT,
  type LandingPageContent, type FeatureItem, type StatItem,
  type StepItem, type TestimonialItem,
} from '../../api/landing.api';

// ── Reusable field components ─────────────────────────────────────────────────
function Field({ label, value, onChange, multiline = false, placeholder = '' }: {
  label: string; value: string; onChange: (v: string) => void;
  multiline?: boolean; placeholder?: string;
}) {
  const cls = 'w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500';
  return (
    <div>
      <label className="text-xs font-medium text-slate-600 block mb-1">{label}</label>
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} placeholder={placeholder} className={`${cls} resize-none`} />
        : <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      }
    </div>
  );
}

const AVAILABLE_ICONS = [
  'MessageSquareQuote','ShoppingBag','Package','BarChart2','Send','Store',
  'Zap','Users','Shield','Star','MessageCircle','Bot',
];

// ── Section: Hero ─────────────────────────────────────────────────────────────
function HeroEditor({ data, onChange }: { data: LandingPageContent['hero']; onChange: (d: LandingPageContent['hero']) => void }) {
  const set = (k: keyof typeof data) => (v: string) => onChange({ ...data, [k]: v });
  return (
    <Card>
      <h2 className="font-bold text-slate-900 mb-4">Hero Section</h2>
      <div className="space-y-3">
        <Field label="Badge Text" value={data.badge} onChange={set('badge')} placeholder="🚀 Trusted by 500+ sellers" />
        <Field label="Headline" value={data.headline} onChange={set('headline')} placeholder="Turn WhatsApp Chats Into Orders" />
        <Field label="Sub-headline" value={data.subheadline} onChange={set('subheadline')} multiline placeholder="Short description..." />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Primary CTA" value={data.ctaPrimary} onChange={set('ctaPrimary')} placeholder="Start for Free" />
          <Field label="Secondary CTA" value={data.ctaSecondary} onChange={set('ctaSecondary')} placeholder="View Pricing" />
        </div>
      </div>
    </Card>
  );
}

// ── Section: Stats ────────────────────────────────────────────────────────────
function StatsEditor({ data, onChange }: { data: StatItem[]; onChange: (d: StatItem[]) => void }) {
  const update = (i: number, k: keyof StatItem, v: string) => {
    const next = [...data]; next[i] = { ...next[i], [k]: v }; onChange(next);
  };
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-slate-900">Stats Bar</h2>
        <Button size="sm" variant="outline" onClick={() => onChange([...data, { value: '', label: '' }])}>
          <Plus className="w-3.5 h-3.5 mr-1" /> Add Stat
        </Button>
      </div>
      <div className="space-y-2">
        {data.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <input value={s.value} onChange={e => update(i, 'value', e.target.value)}
              placeholder="500+" className="w-24 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold" />
            <input value={s.label} onChange={e => update(i, 'label', e.target.value)}
              placeholder="Active Sellers" className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            <button onClick={() => onChange(data.filter((_, j) => j !== i))} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Section: Features ─────────────────────────────────────────────────────────
function FeaturesEditor({ data, onChange }: { data: FeatureItem[]; onChange: (d: FeatureItem[]) => void }) {
  const update = (i: number, k: keyof FeatureItem, v: string) => {
    const next = [...data]; next[i] = { ...next[i], [k]: v }; onChange(next);
  };
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-slate-900">Features</h2>
        <Button size="sm" variant="outline" onClick={() => onChange([...data, { icon: 'Package', title: '', description: '' }])}>
          <Plus className="w-3.5 h-3.5 mr-1" /> Add Feature
        </Button>
      </div>
      <div className="space-y-4">
        {data.map((f, i) => (
          <div key={i} className="p-3 bg-slate-50 rounded-xl space-y-2">
            <div className="flex items-center gap-2">
              <select value={f.icon} onChange={e => update(i, 'icon', e.target.value)}
                className="border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-teal-500">
                {AVAILABLE_ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
              </select>
              <input value={f.title} onChange={e => update(i, 'title', e.target.value)}
                placeholder="Feature title" className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
              <button onClick={() => onChange(data.filter((_, j) => j !== i))} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <textarea value={f.description} onChange={e => update(i, 'description', e.target.value)}
              placeholder="Short description..." rows={2}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Section: How it works ─────────────────────────────────────────────────────
function StepsEditor({ data, onChange }: { data: StepItem[]; onChange: (d: StepItem[]) => void }) {
  const update = (i: number, k: keyof StepItem, v: string) => {
    const next = [...data]; next[i] = { ...next[i], [k]: v }; onChange(next);
  };
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-slate-900">How It Works</h2>
        <Button size="sm" variant="outline" onClick={() => onChange([...data, { step: String(data.length + 1), title: '', description: '' }])}>
          <Plus className="w-3.5 h-3.5 mr-1" /> Add Step
        </Button>
      </div>
      <div className="space-y-3">
        {data.map((s, i) => (
          <div key={i} className="p-3 bg-slate-50 rounded-xl space-y-2">
            <div className="flex items-center gap-2">
              <input value={s.step} onChange={e => update(i, 'step', e.target.value)}
                placeholder="#" className="w-12 text-center border border-slate-200 rounded-xl px-2 py-2 text-sm bg-white font-bold focus:outline-none" />
              <input value={s.title} onChange={e => update(i, 'title', e.target.value)}
                placeholder="Step title" className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
              <button onClick={() => onChange(data.filter((_, j) => j !== i))} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <textarea value={s.description} onChange={e => update(i, 'description', e.target.value)}
              placeholder="Step description..." rows={2}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Section: Testimonials ─────────────────────────────────────────────────────
function TestimonialsEditor({ data, onChange }: { data: TestimonialItem[]; onChange: (d: TestimonialItem[]) => void }) {
  const update = (i: number, k: keyof TestimonialItem, v: string) => {
    const next = [...data]; next[i] = { ...next[i], [k]: v }; onChange(next);
  };
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-slate-900">Testimonials</h2>
        <Button size="sm" variant="outline" onClick={() => onChange([...data, { name: '', business: '', quote: '', avatar: '' }])}>
          <Plus className="w-3.5 h-3.5 mr-1" /> Add Review
        </Button>
      </div>
      <div className="space-y-4">
        {data.map((t, i) => (
          <div key={i} className="p-3 bg-slate-50 rounded-xl space-y-2">
            <div className="flex items-center gap-2">
              <input value={t.avatar} onChange={e => update(i, 'avatar', e.target.value)}
                placeholder="A" maxLength={2} className="w-12 text-center border border-slate-200 rounded-xl px-2 py-2 text-sm bg-white font-bold focus:outline-none uppercase" />
              <input value={t.name} onChange={e => update(i, 'name', e.target.value)}
                placeholder="Full name" className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
              <button onClick={() => onChange(data.filter((_, j) => j !== i))} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <input value={t.business} onChange={e => update(i, 'business', e.target.value)}
              placeholder="Business name, City" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
            <textarea value={t.quote} onChange={e => update(i, 'quote', e.target.value)}
              placeholder="What they said about ReplyCart..." rows={2}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Section: CTA Banner ───────────────────────────────────────────────────────
function CtaBannerEditor({ data, onChange }: { data: LandingPageContent['ctaBanner']; onChange: (d: LandingPageContent['ctaBanner']) => void }) {
  const set = (k: keyof typeof data) => (v: string) => onChange({ ...data, [k]: v });
  return (
    <Card>
      <h2 className="font-bold text-slate-900 mb-4">CTA Banner</h2>
      <div className="space-y-3">
        <Field label="Headline" value={data.headline} onChange={set('headline')} placeholder="Ready to grow your business?" />
        <Field label="Sub-text" value={data.subtext} onChange={set('subtext')} multiline placeholder="Join 500+ sellers..." />
        <Field label="Button Text" value={data.ctaText} onChange={set('ctaText')} placeholder="Get Started Free" />
      </div>
    </Card>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function AdminLandingPage() {
  const qc = useQueryClient();
  const [content, setContent] = useState<LandingPageContent>(DEFAULT_CONTENT);
  const [saved, setSaved] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['landing-content'],
    queryFn: landingApi.getContent,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (data) setContent(data);
  }, [data]);

  const mutation = useMutation({
    mutationFn: () => landingApi.updateContent(content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['landing-content'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const resetToDefault = () => setContent(DEFAULT_CONTENT);

  const set = <K extends keyof LandingPageContent>(k: K) => (v: LandingPageContent[K]) =>
    setContent(c => ({ ...c, [k]: v }));

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Landing Page Editor</h1>
          <p className="text-slate-500 text-sm mt-0.5">Edit the public marketing page content. Changes are live immediately after saving.</p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/" target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-1.5" /> Preview
            </Button>
          </a>
          <Button variant="outline" size="sm" onClick={resetToDefault}>
            <RefreshCw className="w-4 h-4 mr-1.5" /> Reset defaults
          </Button>
          <Button onClick={() => mutation.mutate()} loading={mutation.isPending}>
            <Save className="w-4 h-4 mr-1.5" /> Save Changes
          </Button>
        </div>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-2.5 text-sm text-green-700 font-medium">
          ✓ Landing page updated successfully. Changes are live.
        </div>
      )}

      {/* Sections */}
      <HeroEditor         data={content.hero}         onChange={set('hero')} />
      <StatsEditor        data={content.stats}        onChange={set('stats')} />
      <FeaturesEditor     data={content.features}     onChange={set('features')} />
      <StepsEditor        data={content.howItWorks}   onChange={set('howItWorks')} />
      <TestimonialsEditor data={content.testimonials} onChange={set('testimonials')} />
      <CtaBannerEditor    data={content.ctaBanner}    onChange={set('ctaBanner')} />

      {/* Sticky save button */}
      <div className="flex items-center gap-3 pb-4">
        <Button onClick={() => mutation.mutate()} loading={mutation.isPending} size="sm">
          <Save className="w-4 h-4 mr-1.5" /> Save All Changes
        </Button>
        {saved && <span className="text-sm text-green-600 font-medium">Saved!</span>}
      </div>
    </div>
  );
}
