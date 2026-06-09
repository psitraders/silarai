import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Plus, Pencil, Trash2, GripVertical, Tag, ImagePlus, X,
  ChevronRight, Star, FolderTree, Layers,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { PageLoader } from '../../components/ui/Spinner';
import apiClient from '../../api/client';

// ── Types ─────────────────────────────────────────────────────────────────────

interface SubCategoryDto {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  sortOrder: number;
  isActive: boolean;
  productCount?: number;
}

interface CategoryDto {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  sortOrder: number;
  isActive: boolean;
  productCount?: number;
  isFeatured: boolean;
  parentCategoryId?: string | null;
  subCategories: SubCategoryDto[];
}

// ── API ───────────────────────────────────────────────────────────────────────

const categoriesApi = {
  getAll: () => apiClient.get<CategoryDto[]>('/categories').then(r => r.data),
  create: (data: {
    name: string; description?: string; imageUrl?: string;
    parentCategoryId?: string | null; isFeatured?: boolean;
  }) => apiClient.post('/categories', data),
  update: (id: string, data: {
    name: string; description?: string; imageUrl?: string;
    isActive: boolean; sortOrder: number;
    isFeatured?: boolean; parentCategoryId?: string | null;
  }) => apiClient.put(`/categories/${id}`, data),
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

// ── Form types ────────────────────────────────────────────────────────────────

type FormValues = {
  name: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  isFeatured: boolean;
};

// ── Component ─────────────────────────────────────────────────────────────────

export function CategoriesPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryDto | SubCategoryDto | null>(null);
  const [parentForNew, setParentForNew] = useState<CategoryDto | null>(null); // null = creating root
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Image state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });

  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: { isActive: true, sortOrder: 0, isFeatured: false },
  });

  const isEditingSubcategory = editing != null && 'parentCategoryId' in editing && editing.parentCategoryId != null;
  const isCreatingSubcategory = parentForNew != null;
  const isSubcategoryMode = isEditingSubcategory || isCreatingSubcategory;

  // ── Open helpers ──────────────────────────────────────────────────────────

  const openCreate = (parent: CategoryDto | null = null) => {
    setEditing(null);
    setParentForNew(parent);
    setImagePreview(null);
    setPendingImageFile(null);
    const nextOrder = parent
      ? (parent.subCategories.length ?? 0) + 1
      : (categories?.length ?? 0) + 1;
    reset({ name: '', description: '', isActive: true, sortOrder: nextOrder, isFeatured: false });
    setModalOpen(true);
  };

  const openEdit = (cat: CategoryDto | SubCategoryDto) => {
    setEditing(cat);
    setParentForNew(null);
    setImagePreview(cat.imageUrl ?? null);
    setPendingImageFile(null);
    const isFeat = 'isFeatured' in cat ? cat.isFeatured : false;
    reset({
      name: cat.name, description: cat.description,
      isActive: cat.isActive, sortOrder: cat.sortOrder,
      isFeatured: isFeat,
    });
    setModalOpen(true);
  };

  const toggleExpanded = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // ── Save mutation ─────────────────────────────────────────────────────────

  const saveMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (editing) {
        // Update existing category / subcategory
        let imageUrl: string | undefined = (editing as CategoryDto).imageUrl;
        if (pendingImageFile) {
          imageUrl = await categoriesApi.uploadImage(editing.id, pendingImageFile);
        }
        const parentId = 'parentCategoryId' in editing ? editing.parentCategoryId : null;
        await categoriesApi.update(editing.id, {
          ...values,
          imageUrl,
          isFeatured: values.isFeatured,
          parentCategoryId: parentId ?? null,
        });
      } else {
        // Create new
        const res = await categoriesApi.create({
          name: values.name,
          description: values.description,
          parentCategoryId: parentForNew?.id ?? null,
          isFeatured: !parentForNew && values.isFeatured,
        });
        const newId = (res.data as any).id as string;
        if (newId) {
          let imageUrl: string | undefined;
          if (pendingImageFile) {
            imageUrl = await categoriesApi.uploadImage(newId, pendingImageFile);
          }
          await categoriesApi.update(newId, {
            name: values.name, description: values.description,
            imageUrl, isActive: values.isActive, sortOrder: values.sortOrder,
            isFeatured: !parentForNew && values.isFeatured,
            parentCategoryId: parentForNew?.id ?? null,
          });
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

  const totalSubcats = categories?.reduce((n, c) => n + (c.subCategories?.length ?? 0), 0) ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Organise products with categories and optional subcategories.
          </p>
        </div>
        <Button onClick={() => openCreate(null)}>
          <Plus className="w-4 h-4 mr-2" /> New Category
        </Button>
      </div>

      {/* Stats */}
      {(categories?.length ?? 0) > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border border-slate-100 rounded-xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center">
              <Layers className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{categories?.length ?? 0}</p>
              <p className="text-xs text-slate-500">Categories</p>
            </div>
          </div>
          <div className="bg-white border border-slate-100 rounded-xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center">
              <FolderTree className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{totalSubcats}</p>
              <p className="text-xs text-slate-500">Subcategories</p>
            </div>
          </div>
          <div className="bg-white border border-slate-100 rounded-xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
              <Star className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">
                {categories?.filter(c => c.isFeatured).length ?? 0}
              </p>
              <p className="text-xs text-slate-500">Featured in Nav</p>
            </div>
          </div>
        </div>
      )}

      {/* Category tree */}
      <Card>
        {!categories?.length ? (
          <div className="text-center py-16">
            <Tag className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No categories yet</p>
            <p className="text-slate-400 text-sm mb-4">Create your first category to organise products.</p>
            <Button onClick={() => openCreate(null)}><Plus className="w-4 h-4 mr-2" />Add Category</Button>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {categories.map(cat => {
              const hasChildren = cat.subCategories?.length > 0;
              const isOpen = expanded.has(cat.id);

              return (
                <div key={cat.id}>
                  {/* Parent category row */}
                  <div className="flex items-center gap-3 py-3 px-1 group">
                    {/* Expand toggle */}
                    <button
                      type="button"
                      onClick={() => hasChildren && toggleExpanded(cat.id)}
                      className={`w-5 h-5 flex items-center justify-center text-slate-300 transition-transform ${
                        hasChildren ? 'hover:text-slate-600 cursor-pointer' : 'invisible'
                      } ${isOpen ? 'rotate-90' : ''}`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    <GripVertical className="w-4 h-4 text-slate-200 cursor-grab flex-shrink-0" />

                    {/* Image */}
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
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-slate-900 text-sm">{cat.name}</p>
                        {cat.isFeatured && (
                          <span className="inline-flex items-center gap-0.5 text-xs bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded-full">
                            <Star className="w-3 h-3" /> Featured
                          </span>
                        )}
                        {!cat.isActive && (
                          <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">Inactive</span>
                        )}
                        {hasChildren && (
                          <span className="text-xs bg-violet-50 text-violet-600 px-1.5 py-0.5 rounded-full">
                            {cat.subCategories.length} sub
                          </span>
                        )}
                      </div>
                      {cat.description && (
                        <p className="text-xs text-slate-400 truncate">{cat.description}</p>
                      )}
                      <p className="text-xs text-slate-300 mt-0.5">{cat.productCount ?? 0} products</p>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        title="Add subcategory"
                        onClick={() => {
                          openCreate(cat);
                          if (!isOpen) setExpanded(p => new Set([...p, cat.id]));
                        }}
                        className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                      >
                        <FolderTree className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEdit(cat)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(cat.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Subcategories (collapsible) */}
                  {isOpen && hasChildren && (
                    <div className="ml-10 border-l-2 border-slate-100">
                      {cat.subCategories.map(sub => (
                        <div key={sub.id} className="flex items-center gap-3 py-2.5 px-3 group hover:bg-slate-50/60 rounded-r-lg">
                          <GripVertical className="w-3 h-3 text-slate-200 cursor-grab flex-shrink-0" />

                          <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                            {sub.imageUrl ? (
                              <img src={sub.imageUrl} alt={sub.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                <Tag className="w-3 h-3 text-slate-400" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-slate-700 font-medium">{sub.name}</p>
                              {!sub.isActive && (
                                <span className="text-xs bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-full">Inactive</span>
                              )}
                            </div>
                            <p className="text-xs text-slate-300">{sub.productCount ?? 0} products</p>
                          </div>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEdit({ ...sub, parentCategoryId: cat.id })}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(sub.id)}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Add subcategory inline button */}
                      <button
                        onClick={() => openCreate(cat)}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-slate-400 hover:text-violet-600 transition-colors w-full"
                      >
                        <Plus className="w-3 h-3" /> Add subcategory
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Tip */}
      {(categories?.length ?? 0) > 0 && (
        <p className="text-xs text-slate-400 flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 text-amber-400" />
          <span>Mark categories as <strong>Featured</strong> to show them in the storefront top navigation with subcategory dropdowns.</span>
        </p>
      )}

      {/* ── Create / Edit Modal ──────────────────────────────────────────────── */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          editing
            ? isEditingSubcategory ? 'Edit Subcategory' : 'Edit Category'
            : isCreatingSubcategory
            ? `Add Subcategory under "${parentForNew?.name}"`
            : 'New Category'
        }
      >
        <form onSubmit={handleSubmit(v => saveMutation.mutate(v))} className="space-y-4">
          <Input
            label="Name"
            placeholder={isSubcategoryMode ? 'e.g. Silk Sarees' : 'e.g. Sarees'}
            required
            {...register('name', { required: true })}
          />
          <Input
            label="Description (optional)"
            placeholder="Short description"
            {...register('description')}
          />

          {/* Image upload */}
          <div>
            <p className="text-sm font-medium text-slate-700 mb-1.5">Image</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleFileChange}
            />
            {imagePreview ? (
              <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 group">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setPendingImageFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 text-slate-400 hover:border-teal-400 hover:text-teal-500 transition-colors"
              >
                <ImagePlus className="w-4 h-4" />
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

          <div className="flex items-center gap-3 flex-wrap">
            <Input
              label="Sort Order"
              type="number"
              className="w-28"
              {...register('sortOrder', { valueAsNumber: true })}
            />
            <label className="flex items-center gap-2 mt-5 cursor-pointer">
              <input type="checkbox" {...register('isActive')} className="rounded" />
              <span className="text-sm text-slate-700">Active</span>
            </label>
            {/* Featured — only for root categories */}
            {!isSubcategoryMode && (
              <label className="flex items-center gap-2 mt-5 cursor-pointer">
                <input type="checkbox" {...register('isFeatured')} className="rounded" />
                <span className="text-sm text-slate-700 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400" /> Featured in nav
                </span>
              </label>
            )}
          </div>

          {saveMutation.isError && (
            <p className="text-xs text-red-500">
              {(saveMutation.error as any)?.response?.data?.message ?? 'Failed to save category.'}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={saveMutation.isPending} className="flex-1">
              {editing ? 'Save Changes' : isCreatingSubcategory ? 'Add Subcategory' : 'Create Category'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <Modal open={Boolean(deleteConfirm)} onClose={() => setDeleteConfirm(null)} title="Delete Category?">
        <p className="text-slate-600 text-sm mb-5">
          This will remove the category. Products in this category won't be deleted.
          {categories?.find(c => c.id === deleteConfirm)?.subCategories?.length
            ? ' Subcategories will also be deleted.'
            : ''}
        </p>
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
