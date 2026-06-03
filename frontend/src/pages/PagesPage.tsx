import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Plus, Trash2, Pencil, Eye, EyeOff, Globe, Navigation, LayoutTemplate } from 'lucide-react';
import { pagesApi, type StorefrontPage, type UpsertPageRequest } from '../api/pages.api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageLoader } from '../components/ui/Spinner';

// ── Simple rich text area (contenteditable) ───────────────────────────────────
function RichEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex gap-1 px-3 py-2 bg-slate-50 border-b border-slate-200 flex-wrap">
        {[
          ['Bold', '<b>', '</b>', 'font-bold'],
          ['Italic', '<i>', '</i>', 'italic'],
          ['H2', '<h2>', '</h2>', 'font-semibold'],
          ['H3', '<h3>', '</h3>', ''],
        ].map(([label, open, close, cls]) => (
          <button key={label} type="button"
            onClick={() => {
              const ta = document.getElementById('rc-page-editor') as HTMLTextAreaElement;
              const s = ta.selectionStart, e = ta.selectionEnd;
              const selected = value.slice(s, e);
              const newVal = value.slice(0, s) + open + selected + close + value.slice(e);
              onChange(newVal);
              setTimeout(() => { ta.focus(); ta.setSelectionRange(s + (open as string).length, s + (open as string).length + selected.length); }, 0);
            }}
            className={`px-2.5 py-1 text-xs rounded-lg bg-white border border-slate-200 hover:bg-slate-100 ${cls}`}>
            {label}
          </button>
        ))}
        <button type="button"
          onClick={() => onChange(value + '\n<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n</ul>')}
          className="px-2.5 py-1 text-xs rounded-lg bg-white border border-slate-200 hover:bg-slate-100">
          List
        </button>
        <button type="button"
          onClick={() => onChange(value + '\n<hr/>')}
          className="px-2.5 py-1 text-xs rounded-lg bg-white border border-slate-200 hover:bg-slate-100">
          Divider
        </button>
        <span className="ml-auto text-xs text-slate-400 self-center">HTML supported</span>
      </div>
      <textarea
        id="rc-page-editor"
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={16}
        placeholder="Write your page content here. You can use HTML tags for formatting."
        className="w-full px-4 py-3 text-sm font-mono focus:outline-none resize-y"
      />
    </div>
  );
}

// ── Page Editor Modal ─────────────────────────────────────────────────────────
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
  const [preview, setPreview] = useState(false);
  const set = (k: keyof UpsertPageRequest, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const saveMutation = useMutation({
    mutationFn: async () => isEdit ? pagesApi.update(page!.id, form) : pagesApi.create(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pages'] }); onClose(); },
  });

  const inp = 'w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500';

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center overflow-y-auto py-6 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-3 p-6 border-b border-slate-100">
          <FileText className="w-5 h-5 text-teal-600" />
          <h2 className="text-lg font-bold text-slate-900">{isEdit ? 'Edit Page' : 'Create New Page'}</h2>
          <div className="ml-auto flex gap-2">
            <button onClick={() => setPreview(p => !p)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-slate-200 rounded-xl hover:bg-slate-50">
              {preview ? <><EyeOff className="w-4 h-4" /> Edit</> : <><Eye className="w-4 h-4" /> Preview</>}
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
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

          {/* Content */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Content</label>
            {preview ? (
              <div className="border border-slate-200 rounded-xl p-5 min-h-48 text-sm text-slate-700 leading-relaxed [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-4 [&_h3]:font-semibold [&_h3]:mt-3 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1 [&_a]:text-teal-600 [&_a]:underline [&_hr]:border-slate-200 [&_hr]:my-4"
                dangerouslySetInnerHTML={{ __html: form.content || '<p style="color:#94a3b8">Nothing to preview yet...</p>' }} />
            ) : (
              <RichEditor value={form.content ?? ''} onChange={v => set('content', v)} />
            )}
          </div>

          {/* Visibility toggles */}
          <div className="grid grid-cols-3 gap-3">
            <Toggle
              label="Published" icon={<Globe className="w-4 h-4" />}
              description="Visible on storefront"
              checked={form.isPublished ?? true}
              onChange={v => set('isPublished', v)} />
            <Toggle
              label="Show in Navigation" icon={<Navigation className="w-4 h-4" />}
              description="Appears in top nav bar"
              checked={form.showInNav ?? false}
              onChange={v => set('showInNav', v)} />
            <Toggle
              label="Show in Footer" icon={<LayoutTemplate className="w-4 h-4" />}
              description="Appears in site footer"
              checked={form.showInFooter ?? false}
              onChange={v => set('showInFooter', v)} />
          </div>

          <div className="w-32">
            <label className="text-sm font-medium text-slate-700">Sort Order</label>
            <input type="number" value={form.sortOrder ?? 0} onChange={e => set('sortOrder', parseInt(e.target.value) || 0)}
              className={`mt-1 ${inp}`} />
            <p className="text-xs text-slate-400 mt-1">Lower = appears first</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100">
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

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function PagesPage() {
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null); // null = new, string = edit existing
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

  const openNew = () => { setEditingId(null); setShowEditor(true); };
  const openEdit = (p: StorefrontPage) => { setEditingId(p.id); setShowEditor(true); };
  const closeEditor = () => { setShowEditor(false); setEditingId(null); };

  if (isLoading) return <PageLoader />;

  const navPages = pages.filter(p => p.showInNav);
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
            Create pages like About Us, Contact, Shipping Policy — and place them in your storefront nav or footer.
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
