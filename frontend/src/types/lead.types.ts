export type LeadStatus =
  | 'NewInquiry'
  | 'PriceShared'
  | 'Interested'
  | 'FollowUpPending'
  | 'OrderConfirmed'
  | 'Lost'
  | 'RepeatOpportunity';

export type SocialPlatform = 'WhatsApp' | 'Instagram' | 'Facebook' | 'Direct' | 'Other';

export interface Lead {
  id: string;
  customerName: string;
  customerPhone?: string;
  sourceChannel: SocialPlatform;
  interestedProductTitle?: string;
  status: LeadStatus;
  priority: number;
  followUpDate?: string;
  lastActivityDate?: string;
  createdAt: string;
}

export interface LeadDetail extends Lead {
  customerEmail?: string;
  interestedProductId?: string;
  inquiryNote?: string;
  assignedUserId?: string;
  tags?: string;
  notes: LeadNote[];
  activities: LeadActivity[];
}

export interface LeadNote {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
}

export interface LeadActivity {
  id: string;
  activityType: string;
  description: string;
  createdAt: string;
}
