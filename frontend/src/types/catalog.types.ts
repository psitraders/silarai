export type ProductStatus = 'Draft' | 'Active' | 'Archived' | 'OutOfStock';

export interface Product {
  id: string;
  title: string;
  description?: string;
  basePrice: number;
  discountedPrice?: number;
  status: ProductStatus;
  isFeatured: boolean;
  stockQuantity?: number;
  categoryName?: string;
  primaryImageUrl?: string;
  tags: string[];
  createdAt: string;
}

export interface ProductDetail extends Product {
  sku?: string;
  categoryId?: string;
  images: ProductImageDto[];
  variants: ProductVariant[];
  attributes?: string;
}

// Matches backend ProductImageDto — includes id so we can delete/set-primary
export interface ProductImageDto {
  id: string;
  url: string;
  altText?: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface ProductVariant {
  id: string;
  name: string;
  value: string;
  priceAdjustment?: number;
  stockQuantity?: number;
  isAvailable: boolean;
}

/** Shape sent to the API when saving variants (no id — server owns it) */
export interface SaveVariantDto {
  name: string;
  value: string;
  priceAdjustment?: number;
  stockQuantity?: number;
  isAvailable: boolean;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface PagedList<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
