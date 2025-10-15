// components/event-list/event-list.component.ts
import { Component, OnInit } from '@angular/core';
import { EventService } from '../../services/event.service';
import { Event } from '../../models/event.model';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.css']
})
export class EventListComponent implements OnInit {
  events: Event[] = [];
  loading = true;
  error = '';

  constructor(private eventService: EventService) { }

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.loading = true;
    this.eventService.getAllEvents().subscribe({
      next: (response) => {
        this.events = response.data;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load events';
        this.loading = false;
        console.error('Error loading events:', error);
      }
    });
  }

  deleteEvent(eventId: number): void {
    if (confirm('Are you sure you want to delete this event?')) {
      this.eventService.deleteEvent(eventId).subscribe({
        next: (response) => {
          if (response.success) {
            this.events = this.events.filter(event => event.id !== eventId);
          } else {
            alert(response.message || 'Failed to delete event');
          }
        },
        error: (error) => {
          alert('Error deleting event: ' + error.error?.message || 'Unknown error');
        }
      });
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-AU');
  }
}