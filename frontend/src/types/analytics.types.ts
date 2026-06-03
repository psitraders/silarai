export interface DashboardKpis {
  newInquiries: number;
  newInquiriesChange: number;
  pendingFollowUps: number;
  pendingFollowUpsChange: number;
  ordersThisWeek: number;
  ordersThisWeekChange: number;
  conversionRate: number;
  conversionRateChange: number;
  totalRevenue: number;
  topProducts: TopProduct[];
  recentLeads: RecentLead[];
  orderPipeline: OrderPipeline;
  salesChart: SalesDataPoint[];
  lowStockProducts: LowStockProduct[];
  repeatCustomerRate: number;
  totalCustomers: number;
  repeatCustomers: number;
}

export interface LowStockProduct {
  id: string;
  title: string;
  stockQuantity: number;
  imageUrl?: string;
}

export interface TopProduct {
  id: string;
  title: string;
  orderCount: number;
  imageUrl?: string;
}

export interface RecentLead {
  id: string;
  customerName: string;
  channel?: string;
  productTitle?: string;
  status: string;
  createdAt: string;
}

export interface OrderPipeline {
  new: number;
  confirmed: number;
  paymentPending: number;
  paid: number;
  delivered: number;
}

export interface SalesDataPoint {
  label: string;
  amount: number;
  orderCount: number;
}
