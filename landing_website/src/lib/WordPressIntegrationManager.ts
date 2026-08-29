/**
 * ⚠️ DORMANT — not wired to any rendered component.
 *
 * This module was written against the Express proxy routes (/api/wordpress/*)
 * that were removed when the site became a fully static Azure deployment.
 * The proxy existed to avoid CORS when calling the WordPress REST API.
 *
 * Before re-enabling, choose one of:
 *   a) enable CORS on the WordPress host and call wp-json directly, or
 *   b) reintroduce a proxy (Azure Function, or the existing .NET backend).
 *
 * See context.md § WordPress integration.
 */
import { WpPostItem, FALLBACK_WP_POSTS, transformWpPost } from './wordpress';

export interface WordPressCategory {
  id: number;
  name: string;
  slug: string;
  count: number;
  description?: string;
}

export interface WordPressTag {
  id: number;
  name: string;
  slug: string;
  count: number;
}

export interface WordPressFetchOptions {
  baseUrl?: string;
  authToken?: string; // Optional JWT or Basic Auth token
  authType?: 'Bearer' | 'Basic';
  headers?: Record<string, string>;
  timeoutMs?: number;
}

export interface FetchPostsParams {
  page?: number;
  perPage?: number;
  category?: number | string;
  tag?: number | string;
  search?: string;
  slug?: string;
}

export interface FetchPostsResult {
  success: boolean;
  posts: WpPostItem[];
  totalPages: number;
  totalPosts: number;
  source: 'wordpress' | 'fallback';
  wpUrl?: string;
  message?: string;
}

export class WordPressIntegrationManager {
  private baseUrl: string;
  private authToken?: string;
  private authType: 'Bearer' | 'Basic';
  private defaultHeaders: Record<string, string>;
  private timeoutMs: number;

  constructor(options?: WordPressFetchOptions) {
    this.baseUrl = (options?.baseUrl || '').trim().replace(/\/$/, '');
    this.authToken = options?.authToken;
    this.authType = options?.authType || 'Bearer';
    this.defaultHeaders = options?.headers || {};
    this.timeoutMs = options?.timeoutMs || 10000;
  }

  public setBaseUrl(url: string): void {
    this.baseUrl = url.trim().replace(/\/$/, '');
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public setAuthToken(token?: string, type: 'Bearer' | 'Basic' = 'Bearer'): void {
    this.authToken = token;
    this.authType = type;
  }

  /**
   * Constructs standardized HTTP headers for requests, including authentication if configured.
   */
  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...this.defaultHeaders
    };

    if (this.authToken) {
      headers['Authorization'] = `${this.authType} ${this.authToken}`;
    }

    return headers;
  }

  /**
   * Helper method to perform fetch with optional timeout & standard error handling.
   */
  private async request<T>(endpoint: string, options?: RequestInit): Promise<{ data: T; headers: Headers }> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(endpoint, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options?.headers
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`WordPress REST API returned status HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { data, headers: response.headers };
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error(`WordPress API request timed out after ${this.timeoutMs}ms`);
      }
      throw err;
    }
  }

  /**
   * Test connection to a WordPress site.
   */
  public async testConnection(urlOverride?: string): Promise<{
    connected: boolean;
    wpUrl: string;
    postCount?: number;
    siteName?: string;
    message: string;
  }> {
    const targetUrl = (urlOverride || this.baseUrl).trim().replace(/\/$/, '');
    if (!targetUrl) {
      return {
        connected: false,
        wpUrl: '',
        message: 'No WordPress URL provided.'
      };
    }

    try {
      const endpoint = `${targetUrl}/wp-json/wp/v2/posts?per_page=1&_embed=true`;
      const { data, headers } = await this.request<any[]>(endpoint);
      const totalHeader = headers.get('X-WP-Total');
      const totalPosts = totalHeader ? parseInt(totalHeader, 10) : data.length;

      return {
        connected: true,
        wpUrl: targetUrl,
        postCount: totalPosts,
        message: `Successfully connected to WordPress REST API! Found ${totalPosts} post(s).`
      };
    } catch (directErr: any) {
      // Fallback via local Express proxy
      try {
        const proxyUrl = `/api/wordpress/test?wpUrl=${encodeURIComponent(targetUrl)}`;
        const res = await fetch(proxyUrl);
        const proxyData = await res.json();
        return {
          connected: !!proxyData.connected,
          wpUrl: targetUrl,
          message: proxyData.message || directErr.message
        };
      } catch (proxyErr: any) {
        return {
          connected: false,
          wpUrl: targetUrl,
          message: `Connection failed: ${directErr.message}`
        };
      }
    }
  }

  /**
   * Fetch posts with flexible filtering, pagination, and fallback handling.
   */
  public async getPosts(params?: FetchPostsParams, urlOverride?: string): Promise<FetchPostsResult> {
    const targetUrl = (urlOverride || this.baseUrl).trim().replace(/\/$/, '');

    if (!targetUrl) {
      return {
        success: true,
        posts: FALLBACK_WP_POSTS,
        totalPages: 1,
        totalPosts: FALLBACK_WP_POSTS.length,
        source: 'fallback',
        message: 'No WordPress URL configured. Showing built-in SilarAI Insights & Case Studies.'
      };
    }

    const page = params?.page || 1;
    const perPage = params?.perPage || 15;
    const queryParts: string[] = ['_embed=true', `page=${page}`, `per_page=${perPage}`];

    if (params?.category) {
      queryParts.push(`categories=${encodeURIComponent(params.category)}`);
    }
    if (params?.tag) {
      queryParts.push(`tags=${encodeURIComponent(params.tag)}`);
    }
    if (params?.search) {
      queryParts.push(`search=${encodeURIComponent(params.search)}`);
    }
    if (params?.slug) {
      queryParts.push(`slug=${encodeURIComponent(params.slug)}`);
    }

    const endpoint = `${targetUrl}/wp-json/wp/v2/posts?${queryParts.join('&')}`;

    try {
      const { data, headers } = await this.request<any[]>(endpoint);
      const totalHeader = headers.get('X-WP-Total');
      const totalPagesHeader = headers.get('X-WP-TotalPages');

      const totalPosts = totalHeader ? parseInt(totalHeader, 10) : data.length;
      const totalPages = totalPagesHeader ? parseInt(totalPagesHeader, 10) : 1;

      const posts = Array.isArray(data) ? data.map(transformWpPost) : [];

      if (posts.length === 0) {
        return {
          success: true,
          posts: FALLBACK_WP_POSTS,
          totalPages: 1,
          totalPosts: FALLBACK_WP_POSTS.length,
          source: 'fallback',
          wpUrl: targetUrl,
          message: 'WordPress REST API returned 0 posts matching criteria. Showing sample SilarAI content.'
        };
      }

      return {
        success: true,
        posts,
        totalPages,
        totalPosts,
        source: 'wordpress',
        wpUrl: targetUrl,
        message: `Successfully loaded ${posts.length} article(s) from WordPress.`
      };
    } catch (directErr: any) {
      // Proxy fallback for CORS / server side fetching
      try {
        const proxyUrl = `/api/wordpress/posts?wpUrl=${encodeURIComponent(targetUrl)}&page=${page}&per_page=${perPage}${params?.category ? `&category=${encodeURIComponent(params.category)}` : ''}`;
        const proxyRes = await fetch(proxyUrl);
        const proxyData = await proxyRes.json();

        if (proxyData.success && Array.isArray(proxyData.posts) && proxyData.posts.length > 0) {
          const posts = proxyData.posts.map(transformWpPost);
          return {
            success: true,
            posts,
            totalPages: 1,
            totalPosts: posts.length,
            source: 'wordpress',
            wpUrl: targetUrl,
            message: `Loaded ${posts.length} post(s) via SilarAI WordPress Proxy.`
          };
        }
      } catch (proxyErr) {
        // Fallback below
      }

      return {
        success: false,
        posts: FALLBACK_WP_POSTS,
        totalPages: 1,
        totalPosts: FALLBACK_WP_POSTS.length,
        source: 'fallback',
        wpUrl: targetUrl,
        message: `Could not reach WordPress REST API (${directErr.message}). Displaying fallback content.`
      };
    }
  }

  /**
   * Fetch WordPress categories.
   */
  public async getCategories(urlOverride?: string): Promise<WordPressCategory[]> {
    const targetUrl = (urlOverride || this.baseUrl).trim().replace(/\/$/, '');
    if (!targetUrl) return [];

    try {
      const endpoint = `${targetUrl}/wp-json/wp/v2/categories?per_page=100`;
      const { data } = await this.request<any[]>(endpoint);
      if (Array.isArray(data)) {
        return data.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          count: cat.count || 0,
          description: cat.description
        }));
      }
      return [];
    } catch (err) {
      console.warn('Failed to fetch WordPress categories:', err);
      return [];
    }
  }

  /**
   * Fetch WordPress tags.
   */
  public async getTags(urlOverride?: string): Promise<WordPressTag[]> {
    const targetUrl = (urlOverride || this.baseUrl).trim().replace(/\/$/, '');
    if (!targetUrl) return [];

    try {
      const endpoint = `${targetUrl}/wp-json/wp/v2/tags?per_page=100`;
      const { data } = await this.request<any[]>(endpoint);
      if (Array.isArray(data)) {
        return data.map((tag: any) => ({
          id: tag.id,
          name: tag.name,
          slug: tag.slug,
          count: tag.count || 0
        }));
      }
      return [];
    } catch (err) {
      console.warn('Failed to fetch WordPress tags:', err);
      return [];
    }
  }
}

// Singleton default instance
export const wpManager = new WordPressIntegrationManager();
