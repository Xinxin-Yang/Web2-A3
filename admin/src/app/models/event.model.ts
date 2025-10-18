export interface Event {
  id: number;
  name: string;
  short_description: string;
  full_description: string;
  date_time: string;
  location: string;
  address?: string;
  category_id: number;
  category_name: string;
  ticket_price: number;
  ticket_type: 'free' | 'paid';
  goal_amount: number;
  current_amount: number;
  is_active: boolean;
  max_attendees?: number;
  registration_count: number;
  total_tickets: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}