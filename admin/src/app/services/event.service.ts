import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Event } from '../models/event.model';

// 修复 ApiResponse 接口，使 data 属性可选
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;  // 改为可选属性
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  // 模拟数据
  private mockEvents: Event[] = [
    {
      id: 1,
      name: 'Annual Charity Run 2025',
      short_description: 'Join our 5km charity run to support children education',
      full_description: 'This is our 10th annual charity run! All proceeds will directly support local school education programs.',
      date_time: '2025-10-15T08:00:00',
      location: 'City Central Park',
      address: '123 Park Avenue, City Central',
      category_id: 1,
      category_name: 'Fun Run',
      ticket_price: 25.00,
      ticket_type: 'paid',
      goal_amount: 10000.00,
      current_amount: 6500.00,
      is_active: true,
      max_attendees: 500,
      registration_count: 5,
      total_tickets: 8,
      created_at: '2025-10-03T17:45:13',
      updated_at: '2025-10-03T17:45:13'
    },
    {
      id: 2,
      name: 'Gala Dinner for Children Hospital',
      short_description: 'Elegant charity dinner supporting children hospital equipment',
      full_description: 'Join us for a special evening supporting our local children hospital.',
      date_time: '2025-11-20T19:00:00',
      location: 'Grand Hotel Ballroom',
      address: '456 Luxury Street, Uptown District',
      category_id: 2,
      category_name: 'Gala Dinner',
      ticket_price: 150.00,
      ticket_type: 'paid',
      goal_amount: 50000.00,
      current_amount: 32500.00,
      is_active: true,
      max_attendees: 200,
      registration_count: 3,
      total_tickets: 4,
      created_at: '2025-10-03T17:45:13',
      updated_at: '2025-10-03T17:45:13'
    },
    {
      id: 3,
      name: 'Art for Heart Silent Auction',
      short_description: 'Silent auction of artworks donated by local artists',
      full_description: 'Browse and bid on wonderful artworks donated by local established and emerging artists.',
      date_time: '2025-09-30T18:00:00',
      location: 'Community Art Center',
      address: '789 Art Lane, Cultural District',
      category_id: 3,
      category_name: 'Silent Auction',
      ticket_price: 0.00,
      ticket_type: 'free',
      goal_amount: 15000.00,
      current_amount: 8200.00,
      is_active: true,
      max_attendees: 150,
      registration_count: 2,
      total_tickets: 2,
      created_at: '2025-10-03T17:45:13',
      updated_at: '2025-10-03T17:45:13'
    }
  ];

  constructor() { }

  // 获取所有事件（模拟版本）
  getAllEvents(): Observable<ApiResponse<Event[]>> {
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({
          success: true,
          data: this.mockEvents
        });
        observer.complete();
      }, 500);
    });
  }

  // 获取事件分类
  getCategories(): Observable<ApiResponse<any[]>> {
    const categories = [
      { id: 1, name: 'Fun Run', description: 'Charity running events' },
      { id: 2, name: 'Gala Dinner', description: 'Formal charity dinners' },
      { id: 3, name: 'Silent Auction', description: 'Silent auction events' },
      { id: 4, name: 'Concert', description: 'Charity music performances' },
      { id: 5, name: 'Workshop', description: 'Educational workshops' },
      { id: 6, name: 'Sports Tournament', description: 'Sports competitions' }
    ];

    return new Observable(observer => {
      setTimeout(() => {
        observer.next({
          success: true,
          data: categories
        });
        observer.complete();
      }, 300);
    });
  }

  // 删除事件（模拟版本）- 修复返回类型
  deleteEvent(eventId: number): Observable<ApiResponse<void>> {
    return new Observable(observer => {
      setTimeout(() => {
        const eventIndex = this.mockEvents.findIndex(event => event.id === eventId);
        if (eventIndex > -1) {
          this.mockEvents.splice(eventIndex, 1);
          observer.next({
            success: true,
            message: 'Event deleted successfully'
          });
        } else {
          observer.next({
            success: false,
            message: 'Event not found'
          });
        }
        observer.complete();
      }, 500);
    });
  }
}