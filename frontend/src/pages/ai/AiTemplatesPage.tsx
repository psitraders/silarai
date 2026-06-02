import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Copy, CheckCircle2, BookOpen } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { PageLoader } from '../../components/ui/Spinner';
import { aiApi, type AiTemplateDto } from '../../api/ai.api';

const TONE_MODES = ['Friendly', 'Premium', 'Short', 'Persuasive', 'Formal'];
const CATEGORIES = ['Greeting', 'Price Inquiry', 'Order Update', 'Follow Up', 'Closing', 'Other'];

type FormValues = { name: string; content: string; category: string; toneMode: string; isActive: boolean };

export function AiTemplatesPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AiTemplateDto | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState('');

  const { data: templates, isLoading } = useQuery({
    queryKey: ['ai-templates', filterCategory],
    queryFn: () => aiApi.getTemplates(filterCategory || undefined),
  });

  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: { toneMode: 'Friendly', category: 'Greeting', isActive: true },
  });

  const openCreate = () => {
    setEditing(null);
    reset({ name: '', content: '', category: 'Greeting', toneMode: 'Friendly', isActive: true });
    setModalOpen(true);
  };

  const openEdit = (t: AiTemplateDto) => {
    setEditing(t);
    reset({ name: t.name, content: t.content, category: t.category, toneMode: t.toneMode, isActive: t.isActive });
    setModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: (values: FormValues): Promise<unknown> =>
      editing
        ? aiApi.updateTemplate(editing.id, values)
        : aiApi.createTemplate(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ai-templates'] });
      setModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => aiApi.deleteTemplate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ai-templates'] });
      setDeleteConfirm(null);
    },
  });

  const copyTemplate = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reply Templates</h1>
          <p className="text-slate-500 text-sm mt-0.5">Save and reuse your best replies for quick customer responses.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" /> New Template
        </Button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterCategory('')}
          className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
            !filterCategory ? 'theme-btn' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
              filterCategory === cat ? 'theme-btn' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {!templates?.length ? (
        <Card>
          <div className="text-center py-16">
            <BookOpen className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No templates yet</p>
            <p className="text-slate-400 text-sm mb-4">Create reusable reply templates for common customer questions.</p>
            <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Create First Template</Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map(template => (
            <Card key={template.id} className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-sm">{template.name}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-xs theme-badge px-2 py-0.5 rounded-full">{template.category}</span>
                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{template.toneMode}</span>
                    {!template.isActive && (
                      <span className="text-xs bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full">Inactive</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => copyTemplate(template.content, template.id)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Copy to clipboard"
                  >
                    {copied === template.id
                      ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                      : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => openEdit(template)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(template.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-3 line-clamp-4 whitespace-pre-wrap">
                {template.content}
              </p>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Template' : 'New Template'}>
        <form onSubmit={handleSubmit(v => saveMutation.mutate(v))} className="space-y-4">
          <Input label="Template Name" placeholder="e.g. Price Inquiry Response" required {...register('name', { required: true })} />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select
                {...register('category')}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tone</label>
              <select
                {...register('toneMode')}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {TONE_MODES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
            <textarea
              {...register('content', { required: true })}
              rows={6}
              placeholder="Hi {name}! Thanks for your inquiry about {product}..."
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
            <p className="text-xs text-slate-400 mt-1">Use {'{ '}name{'}'}, {'{ '}product{'}'}, {'{ '}price{'}'} as placeholders.</p>
          </div>

          {editing && (
            <label className="flex items-center gap-2">
              <input type="checkbox" {...register('isActive')} className="rounded" />
              <span className="text-sm text-slate-700">Active</span>
            </label>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={saveMutation.isPending} className="flex-1">
              {editing ? 'Save Changes' : 'Create Template'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <Modal open={Boolean(deleteConfirm)} onClose={() => setDeleteConfirm(null)} title="Delete Template?">
        <p className="text-slate-600 text-sm mb-5">This template will be permanently removed.</p>
        <div className="flex gap-3">
          <Button
            variant="danger"
            loading={deleteMutation.isPending}
            onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm)}
            className="flex-1"
          >Delete</Button>
          <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
        </div>
      </Modal>
    </div>
  );
}
