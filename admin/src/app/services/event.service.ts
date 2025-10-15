import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Event, EventFormData, Category } from '../models/event.model';
import { Registration } from '../models/registration.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  constructor(private api: ApiService) { }

  getAllEvents(): Observable<any> {
    return this.api.get<Event[]>('/admin/events');
  }

  getEventById(eventId: number): Observable<any> {
    return this.api.get<Event>(`/events/${eventId}`);
  }

  getEventRegistrations(eventId: number): Observable<any> {
    return this.api.get<Registration[]>(`/admin/events/${eventId}/registrations`);
  }

  createEvent(eventData: EventFormData): Observable<any> {
    return this.api.post<{ id: number }>('/admin/events', eventData);
  }

  updateEvent(eventId: number, eventData: EventFormData): Observable<any> {
    return this.api.put<any>(`/admin/events/${eventId}`, eventData);
  }

  deleteEvent(eventId: number): Observable<any> {
    return this.api.delete<any>(`/admin/events/${eventId}`);
  }

  getCategories(): Observable<any> {
    return this.api.get<Category[]>('/events/categories');
  }
}