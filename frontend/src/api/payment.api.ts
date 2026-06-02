import apiClient from './client';

export interface CartItem {
  productId: string;
  productTitle: string;
  variantInfo?: string;
  quantity: number;
  unitPrice: number;
}

export interface CreatePaymentOrderResponse {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
  businessName: string;
}

export interface VerifyPaymentRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  deliveryAddress?: string;
  items: CartItem[];
}

export const paymentApi = {
  createOrder: (slug: string, amount: number, customerName?: string, customerPhone?: string) =>
    apiClient
      .post<CreatePaymentOrderResponse>(`/public/${slug}/payment/create-order`, {
        amount,
        customerName,
        customerPhone,
      })
      .then(r => r.data),

  verifyPayment: (slug: string, payload: VerifyPaymentRequest) =>
    apiClient
      .post<{ success: boolean; orderNumber: string; orderId: string; message: string }>(
        `/public/${slug}/payment/verify`,
        payload
      )
      .then(r => r.data),
};
