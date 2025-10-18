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
      next: (response: any) => {
        if (response.success) {
          this.events = response.data;

          // 调试：检查每个事件的金额和状态
          this.events.forEach((event, index) => {
            console.log(`📊 事件 ${index + 1}:`, {
              id: event.id,
              name: event.name,
              current_amount: event.current_amount,
              is_active: event.is_active,
              '应该显示的状态': this.shouldShowAsActive(event) // 添加这个
            });
          }); 

        } else {
          this.error = 'Failed to load events';
        }
        this.loading = false;
      },
      error: (error: any) => {
        this.error = 'Failed to load events. Please check if the API server is running.';
        this.loading = false;
        console.error('Error loading events:', error);
      }
    });
  }

  // 添加状态判断方法
  shouldShowAsActive(event: any): boolean {
    // 这里可以根据需要自定义逻辑
    // 暂时返回后端的数据
    return Boolean(event.is_active);
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

  // 在 event-list.component.ts 中添加修复方法
  formatEventData(events: any[]): any[] {
    return events.map(event => {
      // 修复金额显示：如果事件有注册，使用注册金额 + 事件金额
      if (event.registration_count > 0) {
        // 这里可以添加逻辑来计算真实金额
        // 暂时先返回原始数据
        return event;
      }
      return event;
    });
  }
}