export function generateWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = phone.replace(/[\s\-\+\(\)]/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

export function generateProductInquiryMessage(
  productName: string,
  storeName: string,
  variantInfo?: string
): string {
  const variant = variantInfo ? ` - ${variantInfo}` : '';
  return `Hi! I'm interested in ${productName}${variant} from ${storeName}. Could you please share more details?`;
}

export function generateOrderConfirmationMessage(
  orderNumber: string,
  amount: number,
  currency = 'INR'
): string {
  const formatted = new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
  return `Your order #${orderNumber} has been confirmed. Total: ${formatted}. Thank you for shopping with us!`;
}
