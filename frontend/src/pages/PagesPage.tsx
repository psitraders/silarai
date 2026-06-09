import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileText, Plus, Trash2, Pencil, Eye, EyeOff, Globe, Navigation,
  LayoutTemplate, Sparkles, Layers, Code2, ChevronUp, ChevronDown,
  Image, AlignLeft, Grid3X3, Megaphone, HelpCircle, Phone, Type,
  Wand2, Loader2,
} from 'lucide-react';
import { pagesApi, type StorefrontPage, type UpsertPageRequest } from '../api/pages.api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageLoader } from '../components/ui/Spinner';

// ─── Block Types ──────────────────────────────────────────────────────────────
type BlockType = 'hero' | 'text' | 'image_text' | 'features' | 'cta' | 'faq' | 'contact';

interface Block {
  id: string;
  type: BlockType;
  data: Record<string, string>;
}

const BLOCK_DEFS: { type: BlockType; label: string; icon: React.ReactNode; fields: { key: string; label: string; multiline?: boolean }[] }[] = [
  {
    type: 'hero',
    label: 'Hero Banner',
    icon: <Image className="w-4 h-4" />,
    fields: [
      { key: 'title',    label: 'Heading' },
      { key: 'subtitle', label: 'Subheading', multiline: true },
      { key: 'cta',      label: 'Button Text' },
      { key: 'ctaLink',  label: 'Button Link (URL)' },
    ],
  },
  {
    type: 'text',
    label: 'Text Block',
    icon: <AlignLeft className="w-4 h-4" />,
    fields: [
      { key: 'heading', label: 'Heading (optional)' },
      { key: 'body',    label: 'Paragraph', multiline: true },
    ],
  },
  {
    type: 'image_text',
    label: 'Image + Text',
    icon: <Type className="w-4 h-4" />,
    fields: [
      { key: 'imageUrl', label: 'Image URL' },
      { key: 'heading',  label: 'Heading' },
      { key: 'body',     label: 'Text', multiline: true },
    ],
  },
  {
    type: 'features',
    label: 'Features Grid',
    icon: <Grid3X3 className="w-4 h-4" />,
    fields: [
      { key: 'heading',  label: 'Section Heading' },
      { key: 'feature1', label: 'Feature 1 (emoji + text, e.g. ✅ Fast delivery)' },
      { key: 'feature2', label: 'Feature 2' },
      { key: 'feature3', label: 'Feature 3' },
      { key: 'feature4', label: 'Feature 4 (optional)' },
    ],
  },
  {
    type: 'cta',
    label: 'CTA Banner',
    icon: <Megaphone className="w-4 h-4" />,
    fields: [
      { key: 'heading', label: 'Heading' },
      { key: 'body',    label: 'Supporting text', multiline: true },
      { key: 'cta',     label: 'Button Text' },
      { key: 'ctaLink', label: 'Button Link (URL)' },
    ],
  },
  {
    type: 'faq',
    label: 'FAQ',
    icon: <HelpCircle className="w-4 h-4" />,
    fields: [
      { key: 'heading', label: 'Section Heading' },
      { key: 'q1', label: 'Question 1' },
      { key: 'a1', label: 'Answer 1',  multiline: true },
      { key: 'q2', label: 'Question 2' },
      { key: 'a2', label: 'Answer 2',  multiline: true },
      { key: 'q3', label: 'Question 3 (optional)' },
      { key: 'a3', label: 'Answer 3 (optional)',  multiline: true },
    ],
  },
  {
    type: 'contact',
    label: 'Contact Info',
    icon: <Phone className="w-4 h-4" />,
    fields: [
      { key: 'heading',  label: 'Section Heading' },
      { key: 'phone',    label: 'Phone / WhatsApp' },
      { key: 'email',    label: 'Email' },
      { key: 'address',  label: 'Address', multiline: true },
      { key: 'hours',    label: 'Business Hours' },
    ],
  },
];

// ─── Block → HTML renderer ────────────────────────────────────────────────────
function blockToHtml(block: Block, themeColor = '#0F766E'): string {
  const d = block.data;
  switch (block.type) {
    case 'hero':
      return `<section style="background:${themeColor};padding:60px 20px;text-align:center;border-radius:12px;margin-bottom:24px;">
  <h1 style="font-size:2rem;font-weight:800;color:#fff;margin:0 0 12px;">${d.title || 'Welcome'}</h1>
  ${d.subtitle ? `<p style="font-size:1.1rem;color:rgba(255,255,255,0.9);margin:0 0 24px;max-width:560px;margin-left:auto;margin-right:auto;">${d.subtitle}</p>` : ''}
  ${d.cta ? `<a href="${d.ctaLink || '#'}" style="display:inline-block;background:#fff;color:${themeColor};font-weight:700;padding:12px 28px;border-radius:8px;text-decoration:none;">${d.cta}</a>` : ''}
</section>`;

    case 'text':
      return `<section style="padding:32px 20px;margin-bottom:16px;max-width:700px;margin-left:auto;margin-right:auto;">
  ${d.heading ? `<h2 style="font-size:1.4rem;font-weight:700;color:#111827;margin:0 0 12px;">${d.heading}</h2>` : ''}
  <p style="color:#374151;line-height:1.8;font-size:1rem;margin:0;">${(d.body || '').replace(/\n/g, '<br/>')}</p>
</section>`;

    case 'image_text':
      return `<section style="display:flex;flex-wrap:wrap;gap:24px;align-items:center;padding:32px 20px;margin-bottom:16px;max-width:700px;margin-left:auto;margin-right:auto;">
  ${d.imageUrl ? `<img src="${d.imageUrl}" style="width:280px;max-width:100%;border-radius:12px;object-fit:cover;" alt=""/>` : ''}
  <div style="flex:1;min-width:200px;">
    ${d.heading ? `<h2 style="font-size:1.3rem;font-weight:700;color:#111827;margin:0 0 10px;">${d.heading}</h2>` : ''}
    <p style="color:#374151;line-height:1.8;">${(d.body || '').replace(/\n/g, '<br/>')}</p>
  </div>
</section>`;

    case 'features': {
      const features = [d.feature1, d.feature2, d.feature3, d.feature4].filter(Boolean);
      return `<section style="padding:32px 20px;background:#f9fafb;border-radius:12px;margin-bottom:16px;">
  ${d.heading ? `<h2 style="font-size:1.4rem;font-weight:700;color:#111827;text-align:center;margin:0 0 20px;">${d.heading}</h2>` : ''}
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;max-width:700px;margin:0 auto;">
    ${features.map(f => `<div style="background:#fff;border-radius:10px;padding:16px;font-size:0.95rem;color:#374151;border:1px solid #e5e7eb;">${f}</div>`).join('\n    ')}
  </div>
</section>`;
    }

    case 'cta':
      return `<section style="background:${themeColor}18;border:2px solid ${themeColor}33;border-radius:12px;padding:40px 24px;text-align:center;margin-bottom:16px;max-width:700px;margin-left:auto;margin-right:auto;">
  ${d.heading ? `<h2 style="font-size:1.5rem;font-weight:700;color:#111827;margin:0 0 10px;">${d.heading}</h2>` : ''}
  ${d.body ? `<p style="color:#374151;margin:0 0 20px;">${d.body}</p>` : ''}
  ${d.cta ? `<a href="${d.ctaLink || '#'}" style="display:inline-block;background:${themeColor};color:#fff;font-weight:700;padding:12px 28px;border-radius:8px;text-decoration:none;">${d.cta}</a>` : ''}
</section>`;

    case 'faq': {
      const faqs = [
        [d.q1, d.a1], [d.q2, d.a2], [d.q3, d.a3],
      ].filter(([q]) => q);
      return `<section style="padding:32px 20px;max-width:700px;margin-left:auto;margin-right:auto;margin-bottom:16px;">
  ${d.heading ? `<h2 style="font-size:1.4rem;font-weight:700;color:#111827;margin:0 0 20px;">${d.heading}</h2>` : ''}
  <div style="display:flex;flex-direction:column;gap:12px;">
    ${faqs.map(([q, a]) => `<div style="background:#f9fafb;border-radius:10px;padding:16px 20px;">
      <p style="font-weight:600;color:#111827;margin:0 0 6px;">${q}</p>
      <p style="color:#4B5563;margin:0;line-height:1.6;">${(a || '').replace(/\n/g, '<br/>')}</p>
    </div>`).join('\n    ')}
  </div>
</section>`;
    }

    case 'contact':
      return `<section style="padding:32px 20px;max-width:700px;margin-left:auto;margin-right:auto;margin-bottom:16px;">
  ${d.heading ? `<h2 style="font-size:1.4rem;font-weight:700;color:#111827;margin:0 0 16px;">${d.heading}</h2>` : ''}
  <div style="display:flex;flex-direction:column;gap:10px;">
    ${d.phone   ? `<p style="color:#374151;margin:0;">📞 <strong>Phone:</strong> ${d.phone}</p>` : ''}
    ${d.email   ? `<p style="color:#374151;margin:0;">✉️ <strong>Email:</strong> ${d.email}</p>` : ''}
    ${d.address ? `<p style="color:#374151;margin:0;">📍 <strong>Address:</strong> ${d.address.replace(/\n/g, '<br/>')}</p>` : ''}
    ${d.hours   ? `<p style="color:#374151;margin:0;">🕐 <strong>Hours:</strong> ${d.hours}</p>` : ''}
  </div>
</section>`;

    default:
      return '';
  }
}

function blocksToHtml(blocks: Block[], themeColor?: string): string {
  return blocks.map(b => blockToHtml(b, themeColor)).join('\n');
}

// ─── Block Editor Panel ───────────────────────────────────────────────────────
function BlockEditor({ block, onChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast }: {
  block: Block;
  onChange: (b: Block) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [expanded, setExpanded] = useState(true);
  const def = BLOCK_DEFS.find(d => d.type === block.type)!;
  const inp = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500';

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      {/* Block header */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
        <span className="text-slate-500">{def.icon}</span>
        <span className="text-sm font-semibold text-slate-700">{def.label}</span>
        <div className="ml-auto flex items-center gap-1">
          <button onClick={onMoveUp} disabled={isFirst}
            className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button onClick={onMoveDown} disabled={isLast}
            className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setExpanded(e => !e)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors text-xs font-medium px-2">
            {expanded ? 'Collapse' : 'Expand'}
          </button>
          <button onClick={onDelete}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-4 grid grid-cols-1 gap-3">
          {def.fields.map(field => (
            <div key={field.key}>
              <label className="text-xs font-medium text-slate-600 mb-1 block">{field.label}</label>
              {field.multiline ? (
                <textarea rows={3} value={block.data[field.key] ?? ''}
                  onChange={e => onChange({ ...block, data: { ...block.data, [field.key]: e.target.value } })}
                  className={inp} />
              ) : (
                <input value={block.data[field.key] ?? ''}
                  onChange={e => onChange({ ...block, data: { ...block.data, [field.key]: e.target.value } })}
                  className={inp} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Add Block Palette ────────────────────────────────────────────────────────
function AddBlockPalette({ onAdd }: { onAdd: (type: BlockType) => void }) {
  return (
    <div className="border-2 border-dashed border-slate-200 rounded-xl p-4">
      <p className="text-xs font-semibold text-slate-500 mb-3 text-center uppercase tracking-wide">Add a Block</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {BLOCK_DEFS.map(def => (
          <button key={def.type} onClick={() => onAdd(def.type)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:border-teal-400 hover:text-teal-700 hover:bg-teal-50 transition-all">
            {def.icon} {def.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── AI Generate Tab ──────────────────────────────────────────────────────────
const PAGE_TYPES = [
  { value: 'About Us',         label: 'About Us' },
  { value: 'Contact Us',       label: 'Contact Us' },
  { value: 'Shipping Policy',  label: 'Shipping Policy' },
  { value: 'Return Policy',    label: 'Return Policy' },
  { value: 'FAQ',              label: 'FAQ' },
  { value: 'Privacy Policy',   label: 'Privacy Policy' },
  { value: 'Terms & Conditions', label: 'Terms & Conditions' },
  { value: 'Custom',           label: 'Custom Page' },
];

function AiGenerateTab({ onGenerated }: { onGenerated: (html: string) => void }) {
  const [pageType, setPageType]   = useState('About Us');
  const [prompt,   setPrompt]     = useState('');
  const [category, setCategory]   = useState('');
  const [preview,  setPreview]    = useState('');
  const [error,    setError]      = useState('');

  const generateMutation = useMutation({
    mutationFn: () => pagesApi.generate({
      pageType,
      userPrompt: prompt || undefined,
      storeCategory: category || undefined,
    }),
    onSuccess: (data) => {
      setPreview(data.html);
      setError('');
    },
    onError: () => setError('AI generation failed. Please try again.'),
  });

  const inp = 'w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500';

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-r from-violet-50 to-teal-50 border border-violet-100 rounded-xl p-4 flex gap-3">
        <Sparkles className="w-5 h-5 text-violet-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-slate-800">AI Page Generator</p>
          <p className="text-xs text-slate-500 mt-0.5">Describe your page and AI will generate complete HTML content. You can use it directly or switch to the Build tab to fine-tune it.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">Page Type</label>
          <select value={pageType} onChange={e => setPageType(e.target.value)} className={inp}>
            {PAGE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">Business Category <span className="text-slate-400 font-normal">(optional)</span></label>
          <input value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Fashion, Electronics, Food..." className={inp} />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700 mb-1 block">Additional Instructions <span className="text-slate-400 font-normal">(optional)</span></label>
        <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={3}
          placeholder="e.g. We are a family-run business in Mumbai, started in 2010. Focus on trust and quality. Include our WhatsApp number 9876543210."
          className={inp} />
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>}

      <button onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}
        className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60">
        {generateMutation.isPending
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
          : <><Wand2 className="w-4 h-4" /> Generate Page Content</>}
      </button>

      {preview && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">Preview</p>
            <button onClick={() => onGenerated(preview)}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors">
              Use This Content ✓
            </button>
          </div>
          <div className="border border-slate-200 rounded-xl p-5 bg-white min-h-40 text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: preview }} />
        </div>
      )}
    </div>
  );
}

// ─── Page Editor Modal ────────────────────────────────────────────────────────
function PageEditor({ page, onClose }: { page: StorefrontPage | null; onClose: () => void }) {
  const qc = useQueryClient();
  const isEdit = !!page;

  const [form, setForm] = useState<UpsertPageRequest>({
    title:        page?.title        ?? '',
    slug:         page?.slug         ?? '',
    content:      page?.content      ?? '',
    isPublished:  page?.isPublished  ?? true,
    showInNav:    page?.showInNav    ?? false,
    showInFooter: page?.showInFooter ?? false,
    sortOrder:    page?.sortOrder    ?? 0,
  });

  // Tab: 'build' | 'html' | 'ai'
  const [tab,     setTab]     = useState<'build' | 'html' | 'ai'>('build');
  const [blocks,  setBlocks]  = useState<Block[]>([]);
  const [preview, setPreview] = useState(false);

  const set = (k: keyof UpsertPageRequest, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const inp = 'w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500';

  // Sync blocks → HTML content when on 'build' tab before save
  const getContent = () => {
    if (tab === 'build') return blocksToHtml(blocks);
    return form.content ?? '';
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const req: UpsertPageRequest = { ...form, content: getContent() };
      return isEdit ? pagesApi.update(page!.id, req) : pagesApi.create(req);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pages'] }); onClose(); },
  });

  // Add a block
  const addBlock = (type: BlockType) => {
    setBlocks(b => [...b, { id: Math.random().toString(36).slice(2), type, data: {} }]);
  };

  const updateBlock = (id: string, updated: Block) =>
    setBlocks(bs => bs.map(b => b.id === id ? updated : b));

  const deleteBlock = (id: string) =>
    setBlocks(bs => bs.filter(b => b.id !== id));

  const moveBlock = (idx: number, dir: -1 | 1) => {
    setBlocks(bs => {
      const next = [...bs];
      const [removed] = next.splice(idx, 1);
      next.splice(idx + dir, 0, removed);
      return next;
    });
  };

  // When AI generates content, switch to HTML tab and set it
  const handleAiGenerated = (html: string) => {
    set('content', html);
    setTab('html');
  };

  const previewHtml = tab === 'build' ? blocksToHtml(blocks) : (form.content ?? '');

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center overflow-y-auto py-6 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-3 p-5 border-b border-slate-100">
          <FileText className="w-5 h-5 text-teal-600" />
          <h2 className="text-lg font-bold text-slate-900">{isEdit ? 'Edit Page' : 'Create New Page'}</h2>
          <div className="ml-auto flex gap-2">
            {tab !== 'ai' && (
              <button onClick={() => setPreview(p => !p)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-slate-200 rounded-xl hover:bg-slate-50">
                {preview ? <><EyeOff className="w-4 h-4" /> Edit</> : <><Eye className="w-4 h-4" /> Preview</>}
              </button>
            )}
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Title + Slug */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Page Title *</label>
              <input value={form.title} onChange={e => {
                set('title', e.target.value);
                if (!isEdit) set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
              }} placeholder="e.g. About Us" className={`mt-1 ${inp}`} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">URL Slug *</label>
              <div className="flex items-center mt-1 border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-teal-500">
                <span className="px-3 py-2.5 text-sm text-slate-400 bg-slate-50 border-r border-slate-200">/p/</span>
                <input value={form.slug} onChange={e => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="about-us" className="flex-1 px-3 py-2.5 text-sm focus:outline-none" />
              </div>
            </div>
          </div>

          {/* Editor Tabs */}
          <div>
            <div className="flex gap-0 border border-slate-200 rounded-xl overflow-hidden mb-4 text-sm">
              {([
                { key: 'build', label: 'Build',  icon: <Layers  className="w-3.5 h-3.5" /> },
                { key: 'html',  label: 'HTML',   icon: <Code2   className="w-3.5 h-3.5" /> },
                { key: 'ai',    label: 'AI Generate', icon: <Sparkles className="w-3.5 h-3.5" /> },
              ] as const).map(t => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 font-medium transition-colors
                    ${tab === t.key
                      ? t.key === 'ai'
                        ? 'bg-violet-600 text-white'
                        : 'bg-teal-600 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
                  {t.icon} {t.label}
                  {t.key === 'ai' && <span className="text-[10px] bg-white/20 rounded px-1 ml-0.5">NEW</span>}
                </button>
              ))}
            </div>

            {/* Preview overlay */}
            {preview && tab !== 'ai' ? (
              <div className="border border-slate-200 rounded-xl p-5 min-h-48 text-sm leading-relaxed [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-4 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-4 [&_h3]:font-semibold [&_h3]:mt-3 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1 [&_a]:text-teal-600 [&_a]:underline [&_hr]:border-slate-200 [&_hr]:my-4"
                dangerouslySetInnerHTML={{ __html: previewHtml || '<p style="color:#94a3b8">Nothing to preview yet...</p>' }} />
            ) : tab === 'build' ? (
              <div className="space-y-3">
                {blocks.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    <Layers className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    Add blocks below to build your page visually
                  </div>
                )}
                {blocks.map((block, idx) => (
                  <BlockEditor key={block.id} block={block}
                    onChange={updated => updateBlock(block.id, updated)}
                    onDelete={() => deleteBlock(block.id)}
                    onMoveUp={() => moveBlock(idx, -1)}
                    onMoveDown={() => moveBlock(idx, 1)}
                    isFirst={idx === 0}
                    isLast={idx === blocks.length - 1}
                  />
                ))}
                <AddBlockPalette onAdd={addBlock} />
              </div>
            ) : tab === 'html' ? (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="flex gap-1 px-3 py-2 bg-slate-50 border-b border-slate-200 flex-wrap">
                  {[
                    ['Bold', '<b>', '</b>'],
                    ['Italic', '<i>', '</i>'],
                    ['H2', '<h2>', '</h2>'],
                    ['H3', '<h3>', '</h3>'],
                  ].map(([label, open, close]) => (
                    <button key={label} type="button"
                      onClick={() => {
                        const ta = document.getElementById('rc-page-editor') as HTMLTextAreaElement;
                        const s = ta.selectionStart, e = ta.selectionEnd;
                        const selected = (form.content ?? '').slice(s, e);
                        const newVal = (form.content ?? '').slice(0, s) + open + selected + close + (form.content ?? '').slice(e);
                        set('content', newVal);
                      }}
                      className="px-2.5 py-1 text-xs rounded-lg bg-white border border-slate-200 hover:bg-slate-100">
                      {label}
                    </button>
                  ))}
                  <button type="button"
                    onClick={() => set('content', (form.content ?? '') + '\n<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n</ul>')}
                    className="px-2.5 py-1 text-xs rounded-lg bg-white border border-slate-200 hover:bg-slate-100">
                    List
                  </button>
                  <span className="ml-auto text-xs text-slate-400 self-center">HTML supported</span>
                </div>
                <textarea
                  id="rc-page-editor"
                  value={form.content ?? ''}
                  onChange={e => set('content', e.target.value)}
                  rows={16}
                  placeholder="Paste or write HTML here. You can generate content with AI Generate tab."
                  className="w-full px-4 py-3 text-sm font-mono focus:outline-none resize-y"
                />
              </div>
            ) : (
              <AiGenerateTab onGenerated={handleAiGenerated} />
            )}
          </div>

          {/* Visibility toggles */}
          <div className="grid grid-cols-3 gap-3">
            <Toggle label="Published" icon={<Globe className="w-4 h-4" />}
              description="Visible on storefront"
              checked={form.isPublished ?? true} onChange={v => set('isPublished', v)} />
            <Toggle label="Show in Navigation" icon={<Navigation className="w-4 h-4" />}
              description="Appears in top nav bar"
              checked={form.showInNav ?? false} onChange={v => set('showInNav', v)} />
            <Toggle label="Show in Footer" icon={<LayoutTemplate className="w-4 h-4" />}
              description="Appears in site footer"
              checked={form.showInFooter ?? false} onChange={v => set('showInFooter', v)} />
          </div>

          <div className="w-32">
            <label className="text-sm font-medium text-slate-700">Sort Order</label>
            <input type="number" value={form.sortOrder ?? 0}
              onChange={e => set('sortOrder', parseInt(e.target.value) || 0)}
              className={`mt-1 ${inp}`} />
            <p className="text-xs text-slate-400 mt-1">Lower = appears first</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-100">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50">
            Cancel
          </button>
          <Button type="button" loading={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
            {isEdit ? 'Save Changes' : 'Create Page'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Toggle Component ─────────────────────────────────────────────────────────
function Toggle({ label, icon, description, checked, onChange }: {
  label: string; icon: React.ReactNode; description: string;
  checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div onClick={() => onChange(!checked)}
      className={`flex flex-col gap-1.5 p-3 rounded-xl border-2 cursor-pointer transition-all select-none
        ${checked ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-slate-300'}`}>
      <div className={`flex items-center gap-2 font-semibold text-sm ${checked ? 'text-teal-700' : 'text-slate-600'}`}>
        {icon} {label}
      </div>
      <p className="text-xs text-slate-500">{description}</p>
      <div className={`self-end w-9 h-5 rounded-full transition-colors ${checked ? 'bg-teal-500' : 'bg-slate-200'} relative`}>
        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PagesPage() {
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  const { data: pages = [], isLoading } = useQuery({
    queryKey: ['pages'],
    queryFn: pagesApi.getAll,
  });

  const { data: fullPage } = useQuery({
    queryKey: ['pages', editingId],
    queryFn: () => pagesApi.getById(editingId!),
    enabled: !!editingId,
  });

  const deleteMutation = useMutation({
    mutationFn: pagesApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pages'] }),
  });

  const openNew  = () => { setEditingId(null); setShowEditor(true); };
  const openEdit = (p: StorefrontPage) => { setEditingId(p.id); setShowEditor(true); };
  const closeEditor = () => { setShowEditor(false); setEditingId(null); };

  if (isLoading) return <PageLoader />;

  const navPages    = pages.filter(p => p.showInNav);
  const footerPages = pages.filter(p => p.showInFooter);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-teal-600" /> Custom Pages
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Build pages with drag-and-drop blocks or use AI to generate content instantly.
          </p>
        </div>
        <Button type="button" onClick={openNew}>
          <Plus className="w-4 h-4 mr-1.5" /> New Page
        </Button>
      </div>

      {/* Nav / Footer preview */}
      {(navPages.length > 0 || footerPages.length > 0) && (
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5" /> Navigation Bar
            </p>
            {navPages.length === 0
              ? <p className="text-xs text-slate-400">No pages added to nav</p>
              : <div className="flex gap-2 flex-wrap">{navPages.map(p => (
                  <span key={p.id} className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-1 rounded-full font-medium">{p.title}</span>
                ))}</div>}
          </Card>
          <Card>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <LayoutTemplate className="w-3.5 h-3.5" /> Footer
            </p>
            {footerPages.length === 0
              ? <p className="text-xs text-slate-400">No pages added to footer</p>
              : <div className="flex gap-2 flex-wrap">{footerPages.map(p => (
                  <span key={p.id} className="text-xs bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-full font-medium">{p.title}</span>
                ))}</div>}
          </Card>
        </div>
      )}

      {/* Pages list */}
      {pages.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 py-16 text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-semibold text-slate-500">No pages yet</p>
          <p className="text-sm text-slate-400 mt-1 mb-4">Create your first custom page — About Us, Contact, Policies etc.</p>
          <Button type="button" onClick={openNew}><Plus className="w-4 h-4 mr-1.5" /> Create First Page</Button>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Page</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">URL</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600">Nav</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600">Footer</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pages.map(page => (
                <tr key={page.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-slate-800">{page.title}</td>
                  <td className="px-4 py-3.5 text-slate-500 font-mono text-xs">/p/{page.slug}</td>
                  <td className="px-4 py-3.5 text-center">
                    {page.showInNav
                      ? <span className="text-teal-600 text-xs font-semibold bg-teal-50 px-2 py-0.5 rounded-full">✓ Nav</span>
                      : <span className="text-slate-300 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    {page.showInFooter
                      ? <span className="text-slate-600 text-xs font-semibold bg-slate-100 px-2 py-0.5 rounded-full">✓ Footer</span>
                      : <span className="text-slate-300 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${page.isPublished ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {page.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(page)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => confirm(`Delete "${page.title}"?`) && deleteMutation.mutate(page.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showEditor && (
        <PageEditor
          page={editingId ? (fullPage ?? null) : null}
          onClose={closeEditor}
        />
      )}
    </div>
  );
}
