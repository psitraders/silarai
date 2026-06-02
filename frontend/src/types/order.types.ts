export type OrderStatus =
  | 'New'
  | 'Confirmed'
  | 'PaymentPending'
  | 'Paid'
  | 'Packed'
  | 'Delivered'
  | 'Cancelled';

export type PaymentStatus = 'Pending' | 'Partial' | 'Paid' | 'Refunded';

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  sourceChannel: string;
  createdAt: string;
}

export interface OrderDetail extends Order {
  deliveryAddress?: string;
  notes?: string;
  items: OrderItem[];
  payments: Payment[];
  statusHistory: OrderStatusHistory[];
}

export interface OrderItem {
  id: string;
  productTitle: string;
  variantInfo?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Payment {
  id: string;
  amount: number;
  method: string;
  referenceNumber?: string;
  paidAt: string;
}

export interface OrderStatusHistory {
  id: string;
  fromStatus: OrderStatus;
  toStatus: OrderStatus;
  note?: string;
  createdAt: string;
}
