import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface StorefrontCustomer {
  customerId: string;
  name: string;
  email: string;
  isB2BCustomer: boolean;
  isB2BApproved: boolean;
  loyaltyPoints: number;
  accessToken: string;
}

interface StorefrontAuthCtx {
  customer: StorefrontCustomer | null;
  login: (slug: string, email: string, password: string) => Promise<void>;
  register: (slug: string, payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  isB2BCustomer?: boolean;
  companyName?: string;
  gstNumber?: string;
}

// ── Context ───────────────────────────────────────────────────────────────────

const StorefrontAuthContext = createContext<StorefrontAuthCtx | null>(null);

const STORAGE_KEY = 'sf_customer';

function loadFromStorage(): StorefrontCustomer | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function StorefrontAuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<StorefrontCustomer | null>(loadFromStorage);

  const persist = (c: StorefrontCustomer | null) => {
    setCustomer(c);
    if (c) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(c));
    else sessionStorage.removeItem(STORAGE_KEY);
  };

  const login = useCallback(async (slug: string, email: string, password: string) => {
    const { data } = await axios.post(`${BASE_URL}/public/${slug}/customer/login`, { email, password });
    persist({
      customerId:    data.customerId,
      name:          data.name,
      email:         data.email,
      isB2BCustomer: data.isB2BCustomer,
      isB2BApproved: data.isB2BApproved,
      loyaltyPoints: data.loyaltyPoints,
      accessToken:   data.accessToken,
    });
  }, []);

  const register = useCallback(async (slug: string, payload: RegisterPayload) => {
    const { data } = await axios.post(`${BASE_URL}/public/${slug}/customer/register`, payload);
    persist({
      customerId:    data.customerId,
      name:          data.name,
      email:         data.email,
      isB2BCustomer: data.isB2BCustomer,
      isB2BApproved: data.isB2BApproved,
      loyaltyPoints: data.loyaltyPoints,
      accessToken:   data.accessToken,
    });
  }, []);

  const logout = useCallback(() => persist(null), []);

  return (
    <StorefrontAuthContext.Provider value={{
      customer,
      login,
      register,
      logout,
      isAuthenticated: !!customer,
    }}>
      {children}
    </StorefrontAuthContext.Provider>
  );
}

export function useStorefrontAuth() {
  const ctx = useContext(StorefrontAuthContext);
  if (!ctx) throw new Error('useStorefrontAuth must be used inside StorefrontAuthProvider');
  return ctx;
}

// ── Authenticated API helper ──────────────────────────────────────────────────

export function useCustomerApi(slug: string) {
  const { customer } = useStorefrontAuth();

  const authHeaders = customer
    ? { Authorization: `Bearer ${customer.accessToken}` }
    : {};

  return {
    getOrders: () =>
      axios.get(`${BASE_URL}/public/${slug}/customer/orders`, { headers: authHeaders })
        .then(r => r.data as any[]),

    getWishlist: () =>
      axios.get(`${BASE_URL}/public/${slug}/customer/wishlist`, { headers: authHeaders })
        .then(r => r.data as any[]),

    toggleWishlist: (productId: string) =>
      axios.post(`${BASE_URL}/public/${slug}/customer/wishlist/${productId}`, {}, { headers: authHeaders })
        .then(r => r.data as { isNowWishlisted: boolean; totalWishlistCount: number }),

    getWholesaleTiers: (productId: string) =>
      axios.get(`${BASE_URL}/public/${slug}/products/${productId}/wholesale-tiers`)
        .then(r => r.data as any[]),

    submitQuote: (payload: any) =>
      axios.post(`${BASE_URL}/public/${slug}/quotes`, payload, { headers: authHeaders })
        .then(r => r.data),
  };
}
