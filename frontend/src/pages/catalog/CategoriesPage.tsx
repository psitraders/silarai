import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, GripVertical, Tag, ImagePlus, X } from 'lucide-react';
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
  imageUrl?: string;
  sortOrder: number;
  isActive: boolean;
  productCount?: number;
}

const categoriesApi = {
  getAll: () => apiClient.get<CategoryDto[]>('/categories').then(r => r.data),
  create: (data: { name: string; description?: string; imageUrl?: string }) =>
    apiClient.post('/categories', data),
  update: (id: string, data: { name: string; description?: string; imageUrl?: string; isActive: boolean; sortOrder: number }) =>
    apiClient.put(`/categories/${id}`, data),
  delete: (id: string) => apiClient.delete(`/categories/${id}`),
  uploadImage: (id: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return apiClient
      .post<{ url: string }>(`/categories/${id}/image`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(r => r.data.url);
  },
};

type FormValues = { name: string; description?: string; isActive: boolean; sortOrder: number };

export function CategoriesPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryDto | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Image preview state (local only — uploaded after save or immediately on select for existing)
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });

  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: { isActive: true, sortOrder: 0 },
  });

  const openCreate = () => {
    setEditing(null);
    setImagePreview(null);
    setPendingImageFile(null);
    reset({ name: '', description: '', isActive: true, sortOrder: (categories?.length ?? 0) + 1 });
    setModalOpen(true);
  };

  const openEdit = (cat: CategoryDto) => {
    setEditing(cat);
    setImagePreview(cat.imageUrl ?? null);
    setPendingImageFile(null);
    reset({ name: cat.name, description: cat.description, isActive: cat.isActive, sortOrder: cat.sortOrder });
    setModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const saveMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (editing) {
        // Upload image first if a new file was selected
        let imageUrl: string | undefined = editing.imageUrl;
        if (pendingImageFile) {
          imageUrl = await categoriesApi.uploadImage(editing.id, pendingImageFile);
        }
        await categoriesApi.update(editing.id, { ...values, imageUrl });
      } else {
        // Create first, then upload image if provided
        const res = await categoriesApi.create({ name: values.name, description: values.description });
        const newId = (res.data as any).id as string;
        if (pendingImageFile && newId) {
          const imageUrl = await categoriesApi.uploadImage(newId, pendingImageFile);
          await categoriesApi.update(newId, {
            name: values.name,
            description: values.description,
            imageUrl,
            isActive: values.isActive,
            sortOrder: values.sortOrder,
          });
        } else if (newId) {
          await categoriesApi.update(newId, { ...values, imageUrl: undefined });
        }
      }
    },
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

                {/* Category image or fallback */}
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                  {cat.imageUrl ? (
                    <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full theme-bg flex items-center justify-center">
                      <Tag className="w-4 h-4 theme-text" />
                    </div>
                  )}
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
                  <p className="text-xs text-slate-300 mt-0.5">{cat.productCount ?? 0} products</p>
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

          {/* Image upload */}
          <div>
            <p className="text-sm font-medium text-slate-700 mb-1.5">Category Image</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleFileChange}
            />
            {imagePreview ? (
              <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200 group">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => { setImagePreview(null); setPendingImageFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 text-slate-400 hover:border-teal-400 hover:text-teal-500 transition-colors"
              >
                <ImagePlus className="w-5 h-5" />
                <span className="text-xs">Upload</span>
              </button>
            )}
            {imagePreview && !pendingImageFile && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-1.5 text-xs text-teal-600 hover:underline"
              >
                Change image
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Input label="Sort Order" type="number" className="w-28" {...register('sortOrder', { valueAsNumber: true })} />
            <label className="flex items-center gap-2 mt-5 cursor-pointer">
              <input type="checkbox" {...register('isActive')} className="rounded" />
              <span className="text-sm text-slate-700">Active</span>
            </label>
          </div>

          {saveMutation.isError && (
            <p className="text-xs text-red-500">
              {(saveMutation.error as any)?.response?.data?.message ?? 'Failed to save category.'}
            </p>
          )}

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
