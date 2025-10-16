import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

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

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {
  
  // 模拟注册数据
  private mockRegistrations: Registration[] = [
    {
      id: 1,
      event_id: 1,
      event_name: 'Annual Charity Run 2025',
      full_name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '0412345678',
      ticket_quantity: 2,
      total_amount: 50.00,
      registration_date: '2025-10-10T09:30:00',
      created_at: '2025-10-10T09:30:00',
      updated_at: '2025-10-10T09:30:00'
    },
    {
      id: 2,
      event_id: 1,
      event_name: 'Annual Charity Run 2025',
      full_name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '0423456789',
      ticket_quantity: 1,
      total_amount: 25.00,
      registration_date: '2025-10-11T14:20:00',
      created_at: '2025-10-11T14:20:00',
      updated_at: '2025-10-11T14:20:00'
    },
    {
      id: 3,
      event_id: 2,
      event_name: 'Gala Dinner for Children Hospital',
      full_name: 'Michael Brown',
      email: 'm.brown@email.com',
      phone: '0434567890',
      ticket_quantity: 4,
      total_amount: 600.00,
      registration_date: '2025-10-12T11:15:00',
      created_at: '2025-10-12T11:15:00',
      updated_at: '2025-10-12T11:15:00'
    },
    {
      id: 4,
      event_id: 3,
      event_name: 'Art for Heart Silent Auction',
      full_name: 'Emily Davis',
      email: 'emily.davis@email.com',
      ticket_quantity: 1,
      total_amount: 0.00,
      registration_date: '2025-10-13T16:45:00',
      created_at: '2025-10-13T16:45:00',
      updated_at: '2025-10-13T16:45:00'
    },
    {
      id: 5,
      event_id: 1,
      event_name: 'Annual Charity Run 2025',
      full_name: 'David Wilson',
      email: 'd.wilson@email.com',
      phone: '0456789012',
      ticket_quantity: 2,
      total_amount: 50.00,
      registration_date: '2025-10-14T10:00:00',
      created_at: '2025-10-14T10:00:00',
      updated_at: '2025-10-14T10:00:00'
    }
  ];

  constructor() { }

  // 获取特定活动的注册列表
  getEventRegistrations(eventId: number): Observable<any> {
    return new Observable(observer => {
      setTimeout(() => {
        const eventRegistrations = this.mockRegistrations.filter(reg => reg.event_id === eventId);
        observer.next({
          success: true,
          data: eventRegistrations
        });
        observer.complete();
      }, 500);
    });
  }

  // 获取所有注册
  getAllRegistrations(): Observable<any> {
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({
          success: true,
          data: this.mockRegistrations
        });
        observer.complete();
      }, 500);
    });
  }

  // 获取注册统计
  getRegistrationStats(): Observable<any> {
    return new Observable(observer => {
      setTimeout(() => {
        const totalRegistrations = this.mockRegistrations.length;
        const totalTickets = this.mockRegistrations.reduce((sum, reg) => sum + reg.ticket_quantity, 0);
        const totalRevenue = this.mockRegistrations.reduce((sum, reg) => sum + reg.total_amount, 0);
        
        observer.next({
          success: true,
          data: {
            total_registrations: totalRegistrations,
            total_tickets: totalTickets,
            total_revenue: totalRevenue,
            recent_registrations: this.mockRegistrations.slice(0, 5)
          }
        });
        observer.complete();
      }, 300);
    });
  }
}