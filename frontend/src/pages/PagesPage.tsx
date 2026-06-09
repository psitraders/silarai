import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileText, Plus, Trash2, Pencil, Globe, Navigation,
  LayoutTemplate, Sparkles, Layers, Code2, ChevronUp, ChevronDown,
  Wand2, Loader2, Eye, GripVertical,
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

interface BlockDef {
  type: BlockType;
  label: string;
  color: string;        // tailwind bg class for the badge
  emoji: string;
  fields: { key: string; label: string; multiline?: boolean; placeholder?: string }[];
}

const BLOCK_DEFS: BlockDef[] = [
  {
    type: 'hero', label: 'Hero Banner', color: 'bg-teal-500', emoji: '🖼️',
    fields: [
      { key: 'title',    label: 'Heading',      placeholder: 'Welcome to our store' },
      { key: 'subtitle', label: 'Subheading',   placeholder: 'Quality products, fast delivery', multiline: true },
      { key: 'cta',      label: 'Button Text',  placeholder: 'Shop Now' },
      { key: 'ctaLink',  label: 'Button URL',   placeholder: '#' },
    ],
  },
  {
    type: 'text', label: 'Text Block', color: 'bg-blue-500', emoji: '📝',
    fields: [
      { key: 'heading', label: 'Heading (optional)', placeholder: 'Our Story' },
      { key: 'body',    label: 'Paragraph', multiline: true, placeholder: 'Write your content here...' },
    ],
  },
  {
    type: 'image_text', label: 'Image + Text', color: 'bg-violet-500', emoji: '🖼',
    fields: [
      { key: 'imageUrl', label: 'Image URL', placeholder: 'https://...' },
      { key: 'heading',  label: 'Heading',   placeholder: 'Why choose us' },
      { key: 'body',     label: 'Text',      multiline: true, placeholder: 'Description...' },
    ],
  },
  {
    type: 'features', label: 'Features Grid', color: 'bg-amber-500', emoji: '✅',
    fields: [
      { key: 'heading',  label: 'Section Heading',  placeholder: 'Why Shop With Us' },
      { key: 'feature1', label: 'Feature 1',        placeholder: '✅ Fast delivery across India' },
      { key: 'feature2', label: 'Feature 2',        placeholder: '✅ 100% genuine products' },
      { key: 'feature3', label: 'Feature 3',        placeholder: '✅ Easy returns & refunds' },
      { key: 'feature4', label: 'Feature 4 (optional)', placeholder: '✅ WhatsApp support' },
    ],
  },
  {
    type: 'cta', label: 'CTA Banner', color: 'bg-rose-500', emoji: '📣',
    fields: [
      { key: 'heading', label: 'Heading',        placeholder: 'Ready to order?' },
      { key: 'body',    label: 'Supporting text', multiline: true, placeholder: 'Get in touch and we\'ll help you find the perfect product.' },
      { key: 'cta',     label: 'Button Text',    placeholder: 'Chat on WhatsApp' },
      { key: 'ctaLink', label: 'Button URL',     placeholder: 'https://wa.me/...' },
    ],
  },
  {
    type: 'faq', label: 'FAQ', color: 'bg-cyan-500', emoji: '❓',
    fields: [
      { key: 'heading', label: 'Section Heading', placeholder: 'Frequently Asked Questions' },
      { key: 'q1', label: 'Question 1', placeholder: 'How long does delivery take?' },
      { key: 'a1', label: 'Answer 1',   placeholder: 'We deliver within 3–5 business days...', multiline: true },
      { key: 'q2', label: 'Question 2', placeholder: 'What is your return policy?' },
      { key: 'a2', label: 'Answer 2',   placeholder: 'We accept returns within 7 days...', multiline: true },
      { key: 'q3', label: 'Question 3 (optional)', placeholder: '' },
      { key: 'a3', label: 'Answer 3 (optional)',   placeholder: '', multiline: true },
    ],
  },
  {
    type: 'contact', label: 'Contact Info', color: 'bg-green-500', emoji: '📞',
    fields: [
      { key: 'heading', label: 'Section Heading', placeholder: 'Get In Touch' },
      { key: 'phone',   label: 'Phone / WhatsApp', placeholder: '+91 98765 43210' },
      { key: 'email',   label: 'Email',            placeholder: 'hello@yourstore.com' },
      { key: 'address', label: 'Address',          placeholder: '123 Street, City, State', multiline: true },
      { key: 'hours',   label: 'Business Hours',   placeholder: 'Mon–Sat 10am–7pm' },
    ],
  },
];

// ─── Block → HTML ─────────────────────────────────────────────────────────────
function blockToHtml(block: Block, themeColor = '#0F766E'): string {
  const d = block.data;
  switch (block.type) {
    case 'hero':
      return `<section style="background:${themeColor};padding:56px 24px;text-align:center;border-radius:16px;margin-bottom:28px;">
  <h1 style="font-size:2.2rem;font-weight:800;color:#fff;margin:0 0 14px;line-height:1.2;">${d.title || 'Welcome'}</h1>
  ${d.subtitle ? `<p style="font-size:1.1rem;color:rgba(255,255,255,0.88);margin:0 0 28px;max-width:560px;margin-left:auto;margin-right:auto;line-height:1.6;">${d.subtitle.replace(/\n/g, '<br/>')}</p>` : ''}
  ${d.cta ? `<a href="${d.ctaLink || '#'}" style="display:inline-block;background:#fff;color:${themeColor};font-weight:700;padding:13px 32px;border-radius:10px;text-decoration:none;font-size:1rem;">${d.cta}</a>` : ''}
</section>`;

    case 'text':
      return `<section style="padding:32px 24px;margin-bottom:20px;max-width:680px;margin-left:auto;margin-right:auto;">
  ${d.heading ? `<h2 style="font-size:1.5rem;font-weight:700;color:#111827;margin:0 0 14px;">${d.heading}</h2>` : ''}
  <p style="color:#374151;line-height:1.85;font-size:1rem;margin:0;">${(d.body || '').replace(/\n/g, '<br/>')}</p>
</section>`;

    case 'image_text':
      return `<section style="display:flex;flex-wrap:wrap;gap:28px;align-items:center;padding:32px 24px;margin-bottom:20px;max-width:680px;margin-left:auto;margin-right:auto;">
  ${d.imageUrl ? `<img src="${d.imageUrl}" style="width:260px;max-width:100%;border-radius:14px;object-fit:cover;flex-shrink:0;" alt=""/>` : ''}
  <div style="flex:1;min-width:200px;">
    ${d.heading ? `<h2 style="font-size:1.4rem;font-weight:700;color:#111827;margin:0 0 12px;">${d.heading}</h2>` : ''}
    <p style="color:#374151;line-height:1.8;margin:0;">${(d.body || '').replace(/\n/g, '<br/>')}</p>
  </div>
</section>`;

    case 'features': {
      const features = [d.feature1, d.feature2, d.feature3, d.feature4].filter(Boolean);
      return `<section style="padding:36px 24px;background:#f8fafc;border-radius:16px;margin-bottom:20px;">
  ${d.heading ? `<h2 style="font-size:1.5rem;font-weight:700;color:#111827;text-align:center;margin:0 0 24px;">${d.heading}</h2>` : ''}
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;max-width:680px;margin:0 auto;">
    ${features.map(f => `<div style="background:#fff;border-radius:12px;padding:18px 20px;font-size:0.95rem;color:#374151;border:1px solid #e2e8f0;line-height:1.5;">${f}</div>`).join('\n    ')}
  </div>
</section>`;
    }

    case 'cta':
      return `<section style="background:${themeColor}15;border:2px solid ${themeColor}40;border-radius:16px;padding:44px 28px;text-align:center;margin-bottom:20px;max-width:680px;margin-left:auto;margin-right:auto;">
  ${d.heading ? `<h2 style="font-size:1.6rem;font-weight:700;color:#111827;margin:0 0 12px;">${d.heading}</h2>` : ''}
  ${d.body ? `<p style="color:#4B5563;margin:0 0 24px;line-height:1.7;">${d.body.replace(/\n/g, '<br/>')}</p>` : ''}
  ${d.cta ? `<a href="${d.ctaLink || '#'}" style="display:inline-block;background:${themeColor};color:#fff;font-weight:700;padding:13px 32px;border-radius:10px;text-decoration:none;font-size:1rem;">${d.cta}</a>` : ''}
</section>`;

    case 'faq': {
      const faqs = [[d.q1, d.a1], [d.q2, d.a2], [d.q3, d.a3]].filter(([q]) => q);
      return `<section style="padding:32px 24px;max-width:680px;margin-left:auto;margin-right:auto;margin-bottom:20px;">
  ${d.heading ? `<h2 style="font-size:1.5rem;font-weight:700;color:#111827;margin:0 0 22px;">${d.heading}</h2>` : ''}
  <div style="display:flex;flex-direction:column;gap:14px;">
    ${faqs.map(([q, a]) => `<div style="background:#f8fafc;border-radius:12px;padding:18px 22px;border:1px solid #e2e8f0;">
      <p style="font-weight:600;color:#111827;margin:0 0 8px;font-size:1rem;">${q}</p>
      <p style="color:#4B5563;margin:0;line-height:1.7;">${(a || '').replace(/\n/g, '<br/>')}</p>
    </div>`).join('\n    ')}
  </div>
</section>`;
    }

    case 'contact':
      return `<section style="padding:32px 24px;max-width:680px;margin-left:auto;margin-right:auto;margin-bottom:20px;">
  ${d.heading ? `<h2 style="font-size:1.5rem;font-weight:700;color:#111827;margin:0 0 18px;">${d.heading}</h2>` : ''}
  <div style="display:flex;flex-direction:column;gap:12px;background:#f8fafc;border-radius:14px;padding:24px;border:1px solid #e2e8f0;">
    ${d.phone   ? `<p style="color:#374151;margin:0;font-size:0.95rem;">📞 <strong>Phone / WhatsApp:</strong> ${d.phone}</p>` : ''}
    ${d.email   ? `<p style="color:#374151;margin:0;font-size:0.95rem;">✉️ <strong>Email:</strong> ${d.email}</p>` : ''}
    ${d.address ? `<p style="color:#374151;margin:0;font-size:0.95rem;">📍 <strong>Address:</strong> ${d.address.replace(/\n/g, '<br/>')}</p>` : ''}
    ${d.hours   ? `<p style="color:#374151;margin:0;font-size:0.95rem;">🕐 <strong>Hours:</strong> ${d.hours}</p>` : ''}
  </div>
</section>`;

    default: return '';
  }
}

function blocksToHtml(blocks: Block[], themeColor?: string): string {
  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:720px;margin:0 auto;padding:16px;">\n${blocks.map(b => blockToHtml(b, themeColor)).join('\n')}\n</div>`;
}

// ─── Block Editor Card ────────────────────────────────────────────────────────
const BLOCK_COLORS: Record<BlockType, string> = {
  hero: 'border-l-teal-500',
  text: 'border-l-blue-500',
  image_text: 'border-l-violet-500',
  features: 'border-l-amber-500',
  cta: 'border-l-rose-500',
  faq: 'border-l-cyan-500',
  contact: 'border-l-green-500',
};

function BlockCard({ block, onChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast }: {
  block: Block;
  onChange: (b: Block) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [open, setOpen] = useState(true);
  const def = BLOCK_DEFS.find(d => d.type === block.type)!;
  const inp = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white';

  return (
    <div className={`border border-slate-200 border-l-4 ${BLOCK_COLORS[block.type]} rounded-xl overflow-hidden bg-white shadow-sm`}>
      <div className="flex items-center gap-2 px-4 py-3 bg-white cursor-pointer select-none" onClick={() => setOpen(o => !o)}>
        <GripVertical className="w-4 h-4 text-slate-300 shrink-0" />
        <span className="text-base">{def.emoji}</span>
        <span className="text-sm font-semibold text-slate-800">{def.label}</span>
        {!open && (
          <span className="text-xs text-slate-400 truncate max-w-[180px]">
            {block.data.title || block.data.heading || block.data.body || ''}
          </span>
        )}
        <div className="ml-auto flex items-center gap-0.5" onClick={e => e.stopPropagation()}>
          <button onClick={onMoveUp} disabled={isFirst}
            className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 disabled:opacity-20 transition-colors" title="Move up">
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button onClick={onMoveDown} disabled={isLast}
            className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 disabled:opacity-20 transition-colors" title="Move down">
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button onClick={onDelete}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors ml-1" title="Remove block">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {open && (
        <div className="px-4 pb-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-3 bg-slate-50/40">
          {def.fields.map(field => (
            <div key={field.key}>
              <label className="text-xs font-medium text-slate-500 mb-1 block">{field.label}</label>
              {field.multiline ? (
                <textarea rows={3} value={block.data[field.key] ?? ''} placeholder={field.placeholder}
                  onChange={e => onChange({ ...block, data: { ...block.data, [field.key]: e.target.value } })}
                  className={inp} />
              ) : (
                <input value={block.data[field.key] ?? ''} placeholder={field.placeholder}
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
    <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50/50">
      <p className="text-xs font-semibold text-slate-400 mb-3 text-center uppercase tracking-wider">+ Add a Block</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {BLOCK_DEFS.map(def => (
          <button key={def.type} onClick={() => onAdd(def.type)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:border-teal-400 hover:text-teal-700 hover:bg-teal-50 transition-all shadow-sm">
            <span>{def.emoji}</span> {def.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── AI Generate Panel ────────────────────────────────────────────────────────
const PAGE_TYPE_OPTIONS = [
  'About Us', 'Contact Us', 'Shipping Policy', 'Return Policy',
  'FAQ', 'Privacy Policy', 'Terms & Conditions', 'Custom Page',
];

function AiPanel({ onApply }: { onApply: (html: string) => void }) {
  const [pageType, setPageType] = useState('About Us');
  const [prompt,   setPrompt]   = useState('');
  const [category, setCategory] = useState('');
  const [preview,  setPreview]  = useState('');
  const [error,    setError]    = useState('');

  const gen = useMutation({
    mutationFn: () => pagesApi.generate({ pageType, userPrompt: prompt || undefined, storeCategory: category || undefined }),
    onSuccess: d => { setPreview(d.html); setError(''); },
    onError:   () => setError('Generation failed — please try again.'),
  });

  const inp = 'w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white';

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100 rounded-xl p-4">
        <Sparkles className="w-5 h-5 text-violet-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-bold text-slate-800">AI Page Generator</p>
          <p className="text-xs text-slate-500 mt-0.5">Describe what you want — AI will write the complete page for you using your store details.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1 block">Page Type</label>
          <select value={pageType} onChange={e => setPageType(e.target.value)} className={inp}>
            {PAGE_TYPE_OPTIONS.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1 block">Business Category <span className="font-normal text-slate-400">(optional)</span></label>
          <input value={category} onChange={e => setCategory(e.target.value)}
            placeholder="e.g. Fashion, Electronics, Food" className={inp} />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-600 mb-1 block">Extra Instructions <span className="font-normal text-slate-400">(optional)</span></label>
        <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={3} className={inp}
          placeholder="e.g. Family business in Mumbai since 2010. Include WhatsApp number 9876543210. Warm and trustworthy tone." />
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 border border-red-100">{error}</p>}

      <button onClick={() => gen.mutate()} disabled={gen.isPending}
        className="w-full flex items-center justify-center gap-2 py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-colors">
        {gen.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating your page...</> : <><Wand2 className="w-4 h-4" /> Generate Page Content</>}
      </button>

      {preview && (
        <div className="space-y-3 border border-slate-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
            <p className="text-sm font-semibold text-slate-700 flex items-center gap-1.5"><Eye className="w-4 h-4" /> Preview</p>
            <button onClick={() => onApply(preview)}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-lg transition-colors">
              ✓ Use This Content
            </button>
          </div>
          <div className="px-4 pb-4 text-sm leading-relaxed max-h-64 overflow-y-auto"
            dangerouslySetInnerHTML={{ __html: preview }} />
        </div>
      )}
    </div>
  );
}

// ─── Live Preview Panel ───────────────────────────────────────────────────────
function LivePreview({ html }: { html: string }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-200 shrink-0">
        <Eye className="w-4 h-4 text-slate-400" />
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Live Preview</span>
        <div className="ml-auto flex gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto bg-white p-2">
        {html ? (
          <div className="text-sm leading-relaxed
            [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-2
            [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-3
            [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-2
            [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1
            [&_a]:text-teal-600 [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-12 text-slate-300">
            <Eye className="w-12 h-12 mb-3 opacity-40" />
            <p className="text-sm font-medium">Preview will appear here</p>
            <p className="text-xs mt-1">Add blocks or generate content with AI</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page Editor Modal ────────────────────────────────────────────────────────
function PageEditor({ page, onClose }: { page: StorefrontPage | null; onClose: () => void }) {
  const qc     = useQueryClient();
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

  // 'build' | 'html' | 'ai'
  const [tab,    setTab]    = useState<'build' | 'html' | 'ai'>('build');
  const [blocks, setBlocks] = useState<Block[]>([]);

  const set = (k: keyof UpsertPageRequest, v: unknown) =>
    setForm(f => ({ ...f, [k]: v }));

  // KEY FIX: whenever blocks change (on Build tab), sync → form.content
  const syncBlocksToContent = useCallback((bs: Block[]) => {
    const html = bs.length > 0 ? blocksToHtml(bs) : '';
    setForm(f => ({ ...f, content: html }));
  }, []);

  const handleBlocksChange = (updated: Block[]) => {
    setBlocks(updated);
    syncBlocksToContent(updated);
  };

  // When switching tabs, keep content consistent
  const switchTab = (next: 'build' | 'html' | 'ai') => {
    // build → html: content already synced via handleBlocksChange
    // html → build: HTML can't be parsed back to blocks; keep existing blocks
    setTab(next);
  };

  const addBlock = (type: BlockType) => {
    const updated = [...blocks, { id: Math.random().toString(36).slice(2), type, data: {} }];
    handleBlocksChange(updated);
  };

  const updateBlock = (id: string, updated: Block) => {
    const next = blocks.map(b => b.id === id ? updated : b);
    handleBlocksChange(next);
  };

  const deleteBlock = (id: string) => {
    const next = blocks.filter(b => b.id !== id);
    handleBlocksChange(next);
  };

  const moveBlock = (idx: number, dir: -1 | 1) => {
    const next = [...blocks];
    const [removed] = next.splice(idx, 1);
    next.splice(idx + dir, 0, removed);
    handleBlocksChange(next);
  };

  // AI generated → go to HTML tab, set content
  const handleAiApply = (html: string) => {
    set('content', html);
    setTab('html');
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      // form.content is always up to date (synced from blocks or edited directly in html tab)
      if (isEdit) {
        await pagesApi.update(page!.id, form);
      } else {
        await pagesApi.create(form);
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pages'] }); onClose(); },
  });

  const inp = 'w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500';

  // preview for the right panel
  const previewHtml = form.content ?? '';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto py-4 px-3">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl min-h-[90vh] flex flex-col">

        {/* ── Header ── */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 shrink-0">
          <FileText className="w-5 h-5 text-teal-600" />
          <h2 className="text-lg font-bold text-slate-900">{isEdit ? 'Edit Page' : 'Create New Page'}</h2>
          <div className="ml-auto flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50">
              Cancel
            </button>
            <Button type="button" loading={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
              {isEdit ? 'Save Changes' : 'Create Page'}
            </Button>
          </div>
        </div>

        {/* ── Meta row ── */}
        <div className="px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Page Title *</label>
              <input value={form.title} onChange={e => {
                set('title', e.target.value);
                if (!isEdit) set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
              }} placeholder="e.g. About Us" className={inp} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">URL Slug *</label>
              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-teal-500">
                <span className="px-3 py-2.5 text-sm text-slate-400 bg-slate-50 border-r border-slate-200 shrink-0">/p/</span>
                <input value={form.slug} onChange={e => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="about-us" className="flex-1 px-3 py-2.5 text-sm focus:outline-none" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Editor + Preview split ── */}
        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* Left: editor */}
          <div className="flex-1 flex flex-col min-w-0 border-r border-slate-100">

            {/* Tab bar */}
            <div className="flex shrink-0 border-b border-slate-100">
              {([
                { key: 'build' as const, label: 'Build',        icon: <Layers   className="w-3.5 h-3.5" /> },
                { key: 'html'  as const, label: 'HTML Editor',  icon: <Code2    className="w-3.5 h-3.5" /> },
                { key: 'ai'    as const, label: 'AI Generate',  icon: <Sparkles className="w-3.5 h-3.5" /> },
              ]).map(t => (
                <button key={t.key} onClick={() => switchTab(t.key)}
                  className={`flex items-center gap-1.5 px-5 py-3 text-sm font-semibold border-b-2 transition-colors
                    ${tab === t.key
                      ? t.key === 'ai'
                        ? 'border-violet-500 text-violet-700 bg-violet-50/50'
                        : 'border-teal-500 text-teal-700 bg-teal-50/50'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
                  {t.icon} {t.label}
                  {t.key === 'ai' && <span className="text-[9px] bg-violet-100 text-violet-600 rounded px-1 font-bold tracking-wide">AI</span>}
                </button>
              ))}
            </div>

            {/* Editor content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {tab === 'build' && (
                <>
                  {blocks.length === 0 && (
                    <div className="text-center py-10 text-slate-400">
                      <Layers className="w-10 h-10 mx-auto mb-2 opacity-20" />
                      <p className="text-sm font-medium">No blocks yet</p>
                      <p className="text-xs mt-1">Pick a block type below to start building</p>
                    </div>
                  )}
                  {blocks.map((block, idx) => (
                    <BlockCard key={block.id} block={block}
                      onChange={updated => updateBlock(block.id, updated)}
                      onDelete={() => deleteBlock(block.id)}
                      onMoveUp={() => moveBlock(idx, -1)}
                      onMoveDown={() => moveBlock(idx, 1)}
                      isFirst={idx === 0}
                      isLast={idx === blocks.length - 1}
                    />
                  ))}
                  <AddBlockPalette onAdd={addBlock} />
                </>
              )}

              {tab === 'html' && (
                <div className="space-y-2">
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="flex gap-1.5 px-3 py-2 bg-slate-50 border-b border-slate-200 flex-wrap">
                      {[['B', '<b>', '</b>'], ['I', '<i>', '</i>'], ['H2', '<h2>', '</h2>'], ['H3', '<h3>', '</h3>']].map(([label, open, close]) => (
                        <button key={label} type="button"
                          onClick={() => {
                            const ta = document.getElementById('rc-html-editor') as HTMLTextAreaElement;
                            const s = ta.selectionStart, e = ta.selectionEnd;
                            const sel = (form.content ?? '').slice(s, e);
                            set('content', (form.content ?? '').slice(0, s) + open + sel + close + (form.content ?? '').slice(e));
                          }}
                          className="px-2.5 py-1 text-xs rounded-lg bg-white border border-slate-200 hover:bg-slate-100 font-medium">
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
                    <textarea id="rc-html-editor"
                      value={form.content ?? ''}
                      onChange={e => set('content', e.target.value)}
                      rows={18}
                      placeholder="Paste or write HTML here. Use AI Generate to auto-create content."
                      className="w-full px-4 py-3 text-sm font-mono focus:outline-none resize-y"
                    />
                  </div>
                  <p className="text-xs text-slate-400">
                    💡 Tip: Use the <strong>Build</strong> tab to add blocks visually, then switch here to fine-tune the HTML.
                  </p>
                </div>
              )}

              {tab === 'ai' && <AiPanel onApply={handleAiApply} />}
            </div>
          </div>

          {/* Right: live preview */}
          <div className="w-80 shrink-0 flex flex-col border-l border-slate-100 bg-slate-50">
            <LivePreview html={previewHtml} />
          </div>
        </div>

        {/* ── Visibility + Sort ── */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide mr-1">Visibility</span>
            {([
              { key: 'isPublished' as const,  label: 'Published',    icon: <Globe className="w-3.5 h-3.5" /> },
              { key: 'showInNav' as const,    label: 'Show in Nav',  icon: <Navigation className="w-3.5 h-3.5" /> },
              { key: 'showInFooter' as const, label: 'Show in Footer', icon: <LayoutTemplate className="w-3.5 h-3.5" /> },
            ] as const).map(item => {
              const checked = !!(form[item.key]);
              return (
                <button key={item.key} onClick={() => set(item.key, !checked)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all
                    ${checked
                      ? 'bg-teal-500 text-white border-teal-500'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-teal-300'}`}>
                  {item.icon} {item.label}
                  {checked && <span className="text-white opacity-80">✓</span>}
                </button>
              );
            })}
            <div className="ml-auto flex items-center gap-2">
              <label className="text-xs text-slate-500 font-medium">Sort Order</label>
              <input type="number" value={form.sortOrder ?? 0}
                onChange={e => set('sortOrder', parseInt(e.target.value) || 0)}
                className="w-20 border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-center" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PagesPage() {
  const qc = useQueryClient();
  const [editingId,  setEditingId]  = useState<string | null>(null);
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

  const openNew     = () => { setEditingId(null); setShowEditor(true); };
  const openEdit    = (p: StorefrontPage) => { setEditingId(p.id); setShowEditor(true); };
  const closeEditor = () => { setShowEditor(false); setEditingId(null); };

  if (isLoading) return <PageLoader />;

  const navPages    = pages.filter(p => p.showInNav);
  const footerPages = pages.filter(p => p.showInFooter);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-teal-600" /> Custom Pages
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Build pages visually with blocks, edit raw HTML, or let AI write the whole page for you.
          </p>
        </div>
        <Button type="button" onClick={openNew}>
          <Plus className="w-4 h-4 mr-1.5" /> New Page
        </Button>
      </div>

      {/* Nav / Footer strip */}
      {(navPages.length > 0 || footerPages.length > 0) && (
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5" /> Navigation Bar
            </p>
            <div className="flex gap-2 flex-wrap">
              {navPages.length === 0
                ? <p className="text-xs text-slate-400">No pages added to nav</p>
                : navPages.map(p => (
                  <span key={p.id} className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-1 rounded-full font-medium">{p.title}</span>
                ))}
            </div>
          </Card>
          <Card>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <LayoutTemplate className="w-3.5 h-3.5" /> Footer
            </p>
            <div className="flex gap-2 flex-wrap">
              {footerPages.length === 0
                ? <p className="text-xs text-slate-400">No pages added to footer</p>
                : footerPages.map(p => (
                  <span key={p.id} className="text-xs bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-full font-medium">{p.title}</span>
                ))}
            </div>
          </Card>
        </div>
      )}

      {/* Pages table */}
      {pages.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 py-16 text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-semibold text-slate-500">No pages yet</p>
          <p className="text-sm text-slate-400 mt-1 mb-5">Create your first custom page — About Us, Contact, Policies etc.</p>
          <Button type="button" onClick={openNew}><Plus className="w-4 h-4 mr-1.5" /> Create First Page</Button>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
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
                <tr key={page.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-slate-800">{page.title}</td>
                  <td className="px-4 py-3.5 text-slate-400 font-mono text-xs">/p/{page.slug}</td>
                  <td className="px-4 py-3.5 text-center">
                    {page.showInNav
                      ? <span className="text-teal-700 text-xs font-bold bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">Nav</span>
                      : <span className="text-slate-300 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    {page.showInFooter
                      ? <span className="text-slate-600 text-xs font-bold bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">Footer</span>
                      : <span className="text-slate-300 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${page.isPublished ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-slate-100 text-slate-500'}`}>
                      {page.isPublished ? '● Published' : '○ Draft'}
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
