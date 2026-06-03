import { apiClient } from './client';

export interface ImportedProductDto {
  externalId: string;
  title: string;
  description?: string;
  basePrice: number;
  discountedPrice?: number;
  imageUrl?: string;
  additionalImages: string[];
  category?: string;
  sku?: string;
  stockQuantity?: number;
  selected: boolean;
}

export interface ImportPreviewRequest {
  source: 'shopify' | 'woocommerce' | 'scraper';
  // Shopify
  shopUrl?: string;
  accessToken?: string;
  // WooCommerce + Scraper
  siteUrl?: string;
  consumerKey?: string;
  consumerSecret?: string;
}

export interface ImportPreviewResponse {
  products: ImportedProductDto[];
  totalFound: number;
  categories: string[];
  errors: string[];
}

export interface ImportConfirmRequest {
  products: ImportedProductDto[];
  createCategories: boolean;
}

export interface ImportConfirmResponse {
  imported: number;
  failed: number;
  errors: string[];
}

export const importApi = {
  preview: (data: ImportPreviewRequest) =>
    apiClient.post<ImportPreviewResponse>('/import/preview', data).then(r => r.data),

  confirm: (data: ImportConfirmRequest) =>
    apiClient.post<ImportConfirmResponse>('/import/confirm', data).then(r => r.data),
};
