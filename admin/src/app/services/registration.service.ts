import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Registration, RegistrationStats } from '../models/registration.model';

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {
  constructor(private api: ApiService) { }

  createRegistration(registrationData: any): Observable<any> {
    return this.api.post<{ id: number }>('/admin/registrations', registrationData);
  }

  getAllRegistrations(): Observable<any> {
    return this.api.get<Registration[]>('/admin/registrations');
  }

  getRegistrationStats(): Observable<any> {
    return this.api.get<RegistrationStats>('/admin/registrations/stats');
  }
}