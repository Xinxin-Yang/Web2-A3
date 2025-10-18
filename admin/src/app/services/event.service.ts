import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Event } from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  constructor(private api: ApiService) { }

  // 获取所有事件
  getAllEvents(): Observable<any> {
    return this.api.get<Event[]>('/admin/events');
  }

  // 获取特定事件
  // 修改 event.service.ts 中的 getEventById 方法
  getEventById(eventId: number): Observable<any> {
    return new Observable(observer => {
      // 首先尝试公共 API
      this.api.get<Event>(`/events/${eventId}`).subscribe({
        next: (response: any) => {
          observer.next(response);
          observer.complete();
        },
        error: (error: any) => {
          // 如果公共 API 失败（比如事件是 Inactive），尝试从所有事件中查找
          console.log('公共 API 失败，尝试从管理端数据中查找...');
          this.getAllEvents().subscribe({
            next: (allEventsResponse: any) => {
              if (allEventsResponse.success) {
                const event = allEventsResponse.data.find((e: any) => e.id === eventId);
                if (event) {
                  observer.next({
                    success: true,
                    data: event
                  });
                } else {
                  observer.next({
                    success: false,
                    message: 'Event not found'
                  });
                }
              } else {
                observer.next(allEventsResponse);
              }
              observer.complete();
            },
            error: (fallbackError: any) => {
              observer.error(fallbackError);
            }
          });
        }
      });
    });
  }

  // 获取事件注册列表
  getEventRegistrations(eventId: number): Observable<any> {
    return this.api.get<any[]>(`/admin/events/${eventId}/registrations`);
  }

  // 创建事件
  createEvent(eventData: any): Observable<any> {
    return this.api.post<{ id: number }>('/admin/events', eventData);
  }

  // 更新事件
  updateEvent(eventId: number, eventData: any): Observable<any> {
    return this.api.put<any>(`/admin/events/${eventId}`, eventData);
  }

  // 删除事件
  deleteEvent(eventId: number): Observable<any> {
    return this.api.delete<any>(`/admin/events/${eventId}`);
  }

  // 获取分类
  getCategories(): Observable<any> {
    return this.api.get<any[]>('/events/categories');
  }

  // 新增方法：通过 getAllEvents 过滤获取单个事件
  getEventByIdForAdmin(eventId: number): Observable<any> {
    return new Observable(observer => {
      this.getAllEvents().subscribe({
        next: (response: any) => {
          if (response.success) {
            // 从所有事件中查找特定 ID 的事件
            const event = response.data.find((e: any) => e.id === eventId);
            if (event) {
              observer.next({
                success: true,
                data: event
              });
            } else {
              observer.next({
                success: false,
                message: 'Event not found'
              });
            }
          } else {
            observer.next(response);
          }
          observer.complete();
        },
        error: (error: any) => {
          observer.error(error);
        }
      });
    });
  }
}