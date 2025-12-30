export interface Job {
  job_id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  deadline: string;
  location: string;
  status: string;
  image_url: string;
  user: User;
  requiredSkills: string;
  latitude?: number;
  longitude?: number;
}

export interface Client {
  user_id: number;
  name: string;
  email: string;
  bio: string;
  location: string;
  image_url: string;
  jobs: Job[];
}

export interface ApplicationRequest {
  id: string;
  job_id: string;
  user_id: number;
  status: string;
  created_at: string;
  cover_letter: string;
}

export interface User {
  user_id: number;
  name: string;
  email: string;
  bio: string;
  location: string;
  image_url: string;
  jobs: Job[];
  userSkills: Skill[];
}

export interface Skill {
  skill_id: number;
  name: string;
}

export interface Application {
  application_id: number;
  job_id: number;
  user_id: number;
  status: string;
  created_at: string;
  cover_letter: string;
  job: Job;
  user: User;
}

// ==================== PAYMENT TYPES ====================

export type PaymentStatusType = 'pending' | 'paid' | 'released' | 'refunded' | 'failed';

export interface Payment {
  payment_id: number;
  application_id: number;
  amount: number;
  platform_fee: number;
  freelancer_amount: number;
  currency: string;
  status: PaymentStatusType;
  description?: string;
  paid_at?: string;
  released_at?: string;
  refunded_at?: string;
  created_at: string;
  job?: {
    job_id: number;
    title: string;
    status: string;
    image_url?: string;
    category?: string;
  };
  client?: {
    user_id: number;
    name: string;
    email?: string;
    image_url?: string;
  };
  freelancer?: {
    user_id: number;
    name: string;
    email?: string;
    image_url?: string;
  };
  application_status?: string;
  is_client?: boolean;
  is_freelancer?: boolean;
}

export interface PaymentTotals {
  total_earned: number;
  total_pending: number;
  total_held: number;
  total_paid: number;
}

export interface StripeAccountStatus {
  connected: boolean;
  accountId?: string;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  onboardingComplete?: boolean;
  accountStatus?: string;
  onboardingUrl?: string;
  message?: string;
}

export interface CreatePaymentResponse {
  success: boolean;
  payment: {
    payment_id: number;
    amount: number;
    platform_fee: number;
    freelancer_amount: number;
    status: string;
  };
  clientSecret: string;
  publishableKey: string;
}

export interface PaymentActionResponse {
  success: boolean;
  payment: {
    payment_id: number;
    status: string;
    paid_at?: string;
    released_at?: string;
    refunded_at?: string;
    amount?: number;
    freelancer_amount?: number;
    transfer_id?: string;
  };
  message: string;
}