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
        if (response.success && response.data) {
          this.events = response.data;  // 添加 data 存在性检查
        } else {
          this.error = response.message || 'Failed to load events';
          this.events = [];  // 确保 events 总是数组
        }
        this.loading = false;
      },
      error: (error: any) => {
        this.error = 'Failed to load events. Please try again later.';
        this.events = [];  // 确保 events 总是数组
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
            // 从本地列表中移除已删除的事件
            this.events = this.events.filter(event => event.id !== eventId);
          } else {
            alert(response.message || 'Failed to delete event');
          }
        },
        error: (error: any) => {
          alert('Error deleting event: ' + error.message);
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
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getProgressPercentage(event: Event): number {
    if (event.goal_amount === 0) return 0;
    return Math.min(Math.round((event.current_amount / event.goal_amount) * 100), 100);
  }
}