import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RegistrationService } from '../../services/registration.service';
import { EventService } from '../../services/event.service';
import { Registration } from '../../models/registration.model';
import { Event } from '../../models/event.model';

@Component({
  selector: 'app-registration-list',
  templateUrl: './registration-list.component.html',
  styleUrls: ['./registration-list.component.css']
})
export class RegistrationListComponent implements OnInit {
  eventId: number | null = null;
  event: Event | null = null;
  registrations: Registration[] = [];
  loading = true;
  error = '';

  // 搜索和过滤
  searchTerm = '';
  filteredRegistrations: Registration[] = [];

  // 分页
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  constructor(
    private route: ActivatedRoute,
    private registrationService: RegistrationService,
    private eventService: EventService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe((params: any) => {
      this.eventId = +params['id'];
      this.loadEventAndRegistrations();
    });
  }

  loadEventAndRegistrations(): void {
    if (!this.eventId) return;

    this.loading = true;
    
    // 加载活动详情
    this.eventService.getEventById(this.eventId).subscribe({
      next: (eventResponse: any) => {
        if (eventResponse.success) {
          this.event = eventResponse.data;
          this.loadRegistrations();
        } else {
          this.error = 'Event not found';
          this.loading = false;
        }
      },
      error: (error: any) => {
        this.error = 'Failed to load event details';
        this.loading = false;
        console.error('Error loading event:', error);
      }
    });
  }

  loadRegistrations(): void {
    if (!this.eventId) return;

    this.registrationService.getEventRegistrations(this.eventId).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.registrations = response.data;
          this.applyFilters();
        } else {
          this.error = 'Failed to load registrations';
        }
        this.loading = false;
      },
      error: (error: any) => {
        this.error = 'Failed to load registrations';
        this.loading = false;
        console.error('Error loading registrations:', error);
      }
    });
  }

  applyFilters(): void {
    let filtered = this.registrations;

    // 应用搜索过滤
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(reg => 
        reg.full_name.toLowerCase().includes(term) ||
        reg.email.toLowerCase().includes(term) ||
        (reg.phone && reg.phone.includes(term))
      );
    }

    this.filteredRegistrations = filtered;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredRegistrations.length / this.pageSize);
    this.currentPage = Math.max(1, Math.min(this.currentPage, this.totalPages));
  }

  get paginatedRegistrations(): Registration[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredRegistrations.slice(startIndex, startIndex + this.pageSize);
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  getPages(): number[] {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
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

  exportToCSV(): void {
    if (this.registrations.length === 0) return;

    const headers = ['Name', 'Email', 'Phone', 'Tickets', 'Total Amount', 'Registration Date'];
    const csvData = this.registrations.map(reg => [
      reg.full_name,
      reg.email,
      reg.phone || 'N/A',
      reg.ticket_quantity.toString(),
      this.formatCurrency(reg.total_amount),
      this.formatDate(reg.registration_date)
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `registrations-${this.event?.name || 'event'}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  getTotalTickets(): number {
    return this.registrations.reduce((sum, reg) => sum + reg.ticket_quantity, 0);
  }

  getTotalRevenue(): number {
    return this.registrations.reduce((sum, reg) => sum + reg.total_amount, 0);
  }
}