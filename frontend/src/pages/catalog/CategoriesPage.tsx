import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, GripVertical, Tag } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { PageLoader } from '../../components/ui/Spinner';
import apiClient from '../../api/client';

interface CategoryDto {
  id: string;
  name: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  productCount?: number;
}

const categoriesApi = {
  getAll: () => apiClient.get<CategoryDto[]>('/categories').then(r => r.data),
  create: (data: { name: string; description?: string }) =>
    apiClient.post('/categories', data),
  update: (id: string, data: { name: string; description?: string; isActive: boolean; sortOrder: number }) =>
    apiClient.put(`/categories/${id}`, data),
  delete: (id: string) => apiClient.delete(`/categories/${id}`),
};

type FormValues = { name: string; description?: string; isActive: boolean; sortOrder: number };

export function CategoriesPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryDto | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });

  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: { isActive: true, sortOrder: 0 },
  });

  const openCreate = () => {
    setEditing(null);
    reset({ name: '', description: '', isActive: true, sortOrder: (categories?.length ?? 0) + 1 });
    setModalOpen(true);
  };

  const openEdit = (cat: CategoryDto) => {
    setEditing(cat);
    reset({ name: cat.name, description: cat.description, isActive: cat.isActive, sortOrder: cat.sortOrder });
    setModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: (values: FormValues) =>
      editing
        ? categoriesApi.update(editing.id, values)
        : categoriesApi.create(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      setModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      setDeleteConfirm(null);
    },
  });

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
          <p className="text-slate-500 text-sm mt-0.5">Organise your products into categories.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" /> New Category
        </Button>
      </div>

      <Card>
        {!categories?.length ? (
          <div className="text-center py-16">
            <Tag className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No categories yet</p>
            <p className="text-slate-400 text-sm mb-4">Create your first category to organise products.</p>
            <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Add Category</Button>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center gap-4 py-3 px-1">
                <GripVertical className="w-4 h-4 text-slate-300 cursor-grab" />
                <div className="w-9 h-9 rounded-xl theme-bg flex items-center justify-center">
                  <Tag className="w-4 h-4 theme-text" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-900 text-sm">{cat.name}</p>
                    {!cat.isActive && (
                      <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">Inactive</span>
                    )}
                  </div>
                  {cat.description && (
                    <p className="text-xs text-slate-400 truncate">{cat.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEdit(cat)}
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(cat.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Create / Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Category' : 'New Category'}>
        <form onSubmit={handleSubmit(v => saveMutation.mutate(v))} className="space-y-4">
          <Input label="Name" placeholder="e.g. Sarees" required {...register('name', { required: true })} />
          <Input label="Description (optional)" placeholder="Short description" {...register('description')} />
          <div className="flex items-center gap-3">
            <Input label="Sort Order" type="number" className="w-28" {...register('sortOrder', { valueAsNumber: true })} />
            <label className="flex items-center gap-2 mt-5 cursor-pointer">
              <input type="checkbox" {...register('isActive')} className="rounded" />
              <span className="text-sm text-slate-700">Active</span>
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={saveMutation.isPending} className="flex-1">
              {editing ? 'Save Changes' : 'Create Category'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <Modal open={Boolean(deleteConfirm)} onClose={() => setDeleteConfirm(null)} title="Delete Category?">
        <p className="text-slate-600 text-sm mb-5">This will remove the category. Products in this category won't be deleted.</p>
        <div className="flex gap-3">
          <Button
            variant="danger"
            loading={deleteMutation.isPending}
            onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm)}
            className="flex-1"
          >
            Delete
          </Button>
          <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
        </div>
      </Modal>
    </div>
  );
}
