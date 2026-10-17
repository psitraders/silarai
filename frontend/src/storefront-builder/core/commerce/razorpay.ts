/** Loads Razorpay Checkout once, on demand (no third-party script until a shopper pays). */
export interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

let loading: Promise<boolean> | null = null;

export function loadRazorpay(): Promise<boolean> {
  if ((window as unknown as { Razorpay?: unknown }).Razorpay) return Promise.resolve(true);
  loading ??= new Promise<boolean>(resolve => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => { loading = null; resolve(false); };
    document.body.appendChild(script);
  });
  return loading;
}
