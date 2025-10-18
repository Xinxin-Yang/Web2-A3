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
  getEventById(eventId: number): Observable<any> {
    return this.api.get<Event>(`/events/${eventId}`);
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
}