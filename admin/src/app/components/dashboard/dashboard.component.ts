import { Component, OnInit } from '@angular/core';
import { EventService } from '../../services/event.service';
import { RegistrationService } from '../../services/registration.service';
import { Event } from '../../models/event.model';
import { Registration } from '../../models/registration.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  // 统计数据
  stats = {
    totalEvents: 0,
    activeEvents: 0,
    totalRegistrations: 0,
    totalTickets: 0,
    totalRevenue: 0,
    upcomingEvents: 0
  };

  // 数据列表
  recentEvents: Event[] = [];
  recentRegistrations: Registration[] = [];
  upcomingEvents: Event[] = [];
  
  // 加载状态
  loading = true;

  constructor(
    private eventService: EventService,
    private registrationService: RegistrationService
  ) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;

    // 并行加载所有数据
    this.eventService.getAllEvents().subscribe({
      next: (eventResponse: any) => {
        if (eventResponse.success) {
          const events = eventResponse.data;
          this.processEventsData(events);
          this.loadRegistrationData();
        }
      },
      error: (error: any) => {
        console.error('Error loading events:', error);
        this.loading = false;
      }
    });
  }

  processEventsData(events: Event[]): void {
    this.recentEvents = events.slice(0, 5); // 最近5个事件
    
    // 计算统计数据
    this.stats.totalEvents = events.length;
    this.stats.activeEvents = events.filter(event => event.is_active).length;
    
    // 计算即将开始的事件（未来7天内）
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    this.upcomingEvents = events.filter(event => {
      const eventDate = new Date(event.date_time);
      return eventDate > now && eventDate <= nextWeek && event.is_active;
    });
    this.stats.upcomingEvents = this.upcomingEvents.length;
  }

  loadRegistrationData(): void {
    this.registrationService.getAllRegistrations().subscribe({
      next: (regResponse: any) => {
        if (regResponse.success) {
          const registrations = regResponse.data;
          this.processRegistrationData(registrations);
        }
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading registrations:', error);
        this.loading = false;
      }
    });
  }

  processRegistrationData(registrations: Registration[]): void {
    this.recentRegistrations = registrations.slice(0, 5); // 最近5个注册
    
    // 计算注册统计数据
    this.stats.totalRegistrations = registrations.length;
    this.stats.totalTickets = registrations.reduce((sum, reg) => sum + reg.ticket_quantity, 0);
    this.stats.totalRevenue = registrations.reduce((sum, reg) => sum + reg.total_amount, 0);
  }

  // 工具方法
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
      day: 'numeric'
    });
  }

  formatDateTime(dateString: string): string {
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

  getDaysUntilEvent(dateString: string): number {
    const eventDate = new Date(dateString);
    const now = new Date();
    const diffTime = eventDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  isEventToday(dateString: string): boolean {
    const eventDate = new Date(dateString);
    const today = new Date();
    return eventDate.toDateString() === today.toDateString();
  }

  // 添加到 DashboardComponent 类中
  getEventEmoji(category: string): string {
    const emojiMap: { [key: string]: string } = {
      'Fun Run': '🏃‍♂️',
      'Gala Dinner': '🍽️',
      'Silent Auction': '🔨',
      'Concert': '🎵',
      'Workshop': '🔧',
      'Sports Tournament': '⚽'
    };
    return emojiMap[category] || '🎉';
  }
}