import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Registration } from '../models/registration.model';

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {

  constructor(private api: ApiService) { }

  // 获取特定活动的注册列表 - 使用管理端 API
  getEventRegistrations(eventId: number): Observable<any> {
    return this.api.get<Registration[]>(`/admin/events/${eventId}/registrations`);
  }

  // 获取所有注册 - 使用管理端 API
  getAllRegistrations(): Observable<any> {
    return this.api.get<Registration[]>('/admin/registrations');
  }

  // 获取注册统计 - 使用管理端 API
  getRegistrationStats(): Observable<any> {
    return this.api.get<any>('/admin/registrations/stats');
  }

  // 创建注册 - 使用管理端 API
  createRegistration(registrationData: any): Observable<any> {
    return this.api.post<{ id: number }>('/admin/registrations', registrationData);
  }
}