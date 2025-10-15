export interface Registration {
  id: number;
  event_id: number;
  event_name: string;
  full_name: string;
  email: string;
  phone?: string;
  ticket_quantity: number;
  total_amount: number;
  registration_date: string;
  created_at: string;
  updated_at: string;
}

export interface RegistrationStats {
  total_registrations: number;
  total_tickets: number;
  total_revenue: number;
  recent_registrations: Registration[];
}