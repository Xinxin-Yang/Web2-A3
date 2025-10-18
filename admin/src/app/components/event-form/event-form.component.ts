import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// 移除有问题的导入，使用相对路径
import { EventService } from '../../services/event.service';
import { RegistrationService } from '../../services/registration.service';

// 简化模型定义，避免导入问题
interface Registration {
  id: number;
  event_id: number;
  event_name: string;
  full_name: string;
  email: string;
  phone?: string;
  ticket_quantity: number;
  total_amount: number;
  registration_date: string;
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-event-form',
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.css']
})
export class EventFormComponent implements OnInit {
  eventForm: FormGroup;
  isEditMode = false;
  eventId: number | null = null;
  event: any = null; // 添加 event 属性
  loading = true;
  submitting = false;
  categories: any[] = [];
  
  // 注册数据
  registrations: Registration[] = [];
  registrationsLoading = false;
  
  // 表单模式
  formTitle = 'Create New Event';
  submitButtonText = 'Create Event';

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private registrationService: RegistrationService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.eventForm = this.createForm();
  }

  // 在 ngOnInit 中添加复选框状态监听
  ngOnInit(): void {
    this.loadCategories();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.eventId = +params['id'];
        this.formTitle = 'Edit Event';
        this.submitButtonText = 'Update Event';
        this.loadEventData();
        this.loadEventRegistrations();
      } else {
        this.loading = false;
        // 创建模式：设置默认值
        this.eventForm.patchValue({
          is_active: true // 确保创建时默认是 true
        });
      }
    });

    this.eventForm.get('ticket_type')?.valueChanges.subscribe(value => {
      this.onTicketTypeChange(value);
    });

    // 监听复选框变化
    this.eventForm.get('is_active')?.valueChanges.subscribe(value => {
      console.log('🔘 is_active 复选框值变化:', value);
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      short_description: ['', [Validators.required, Validators.maxLength(500)]],
      full_description: [''],
      date_time: ['', [Validators.required]],
      location: ['', [Validators.required, Validators.maxLength(255)]],
      address: [''],
      category_id: ['', [Validators.required]],
      ticket_price: [{ value: 0, disabled: false }, [Validators.min(0)]],
      ticket_type: ['free'],
      goal_amount: [0, [Validators.min(0)]],
      current_amount: [0, [Validators.min(0)]],
      max_attendees: [null, [Validators.min(1)]],
      is_active: [true] // 默认值为 true，确保创建时是 Active 状态
    });
  }

  loadCategories(): void {
    this.eventService.getCategories().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.categories = response.data;
        }
      },
      error: (error: any) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  loadEventData(): void {
    if (this.isEditMode && this.eventId) {
      this.loading = true;
      console.log('🔄 加载事件数据，ID:', this.eventId);
      
      // 使用管理端 API 加载事件数据（包含 Inactive 事件）
      this.eventService.getEventByIdForAdmin(this.eventId).subscribe({
        next: (response: any) => {
          console.log('✅ 事件数据加载成功:', response);
          this.loading = false;
          if (response.success) {
            this.event = response.data;
            this.eventForm.patchValue(response.data);
            this.onTicketTypeChange(response.data.ticket_type);
          } else {
            alert('Failed to load event data: ' + (response.message || 'Unknown error'));
          }
        },
        error: (error: any) => {
          console.error('❌ 事件数据加载失败:', error);
          this.loading = false;
          alert('Error loading event data: ' + error.message);
        }
      });
    } else {
      this.loading = false;
    }
  }

  loadEventRegistrations(): void {
    if (!this.eventId) return;
    
    this.registrationsLoading = true;
    this.registrationService.getEventRegistrations(this.eventId).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.registrations = response.data;
        }
        this.registrationsLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading registrations:', error);
        this.registrationsLoading = false;
      }
    });
  }

  onTicketTypeChange(ticketType: string): void {
    const ticketPriceControl = this.eventForm.get('ticket_price');
    if (ticketType === 'free') {
      ticketPriceControl?.setValue(0);
      ticketPriceControl?.disable();
    } else {
      ticketPriceControl?.enable();
    }
  }

  onSubmit(): void {
    if (this.eventForm.valid) {
      const formValue = this.eventForm.getRawValue();
      this.submitting = true;
      
      // 转换日期时间格式
      let formattedDateTime = formValue.date_time;
      if (formValue.date_time) {
        formattedDateTime = this.formatDateTimeForDatabase(formValue.date_time);
      }
      
      // 创建精确的数据对象，避免多余字段
      const eventData = {
        name: formValue.name,
        short_description: formValue.short_description,
        full_description: formValue.full_description || '',
        date_time: formattedDateTime,
        location: formValue.location,
        address: formValue.address || '',
        category_id: Number(formValue.category_id),
        ticket_price: formValue.ticket_type === 'free' ? 0 : Number(formValue.ticket_price),
        ticket_type: formValue.ticket_type,
        goal_amount: Number(formValue.goal_amount),
        current_amount: Number(formValue.current_amount), // 确保是数字
        max_attendees: formValue.max_attendees ? Number(formValue.max_attendees) : null,
        is_active: formValue.is_active ? 1 : 0 // 使用 1/0 而不是布尔值
      };

      console.log('🎯 最终提交数据:', JSON.stringify(eventData, null, 2));

      if (this.isEditMode && this.eventId) {
        this.eventService.updateEvent(this.eventId, eventData).subscribe({
          next: (response: any) => {
            console.log('✅ 后端响应:', response);
            this.submitting = false;
            if (response.success) {
              alert('Event updated successfully!');
              this.router.navigate(['/events']);
            } else {
              alert('Failed to update event: ' + (response.message || 'Unknown error'));
            }
          },
          error: (error: any) => {
            console.error('❌ 事件更新失败:', error);
            this.submitting = false;
            alert('Error updating event: ' + error.message);
          }
        });
      } else {
        this.eventService.createEvent(eventData).subscribe({
          next: (response: any) => {
            console.log('✅ 后端响应:', response);
            this.submitting = false;
            if (response.success) {
              alert('Event created successfully!');
              this.router.navigate(['/events']);
            } else {
              alert('Failed to create event: ' + (response.message || 'Unknown error'));
            }
          },
          error: (error: any) => {
            console.error('❌ 事件创建失败:', error);
            this.submitting = false;
            alert('Error creating event: ' + error.message);
          }
        });
      }
    } else {
      this.markFormGroupTouched();
      alert('Please fill in all required fields correctly.');
    }
  }

  // 新增方法：将日期时间转换为数据库兼容的格式
  formatDateTimeForDatabase(dateTimeString: string): string {
    if (!dateTimeString) return '';
    
    const date = new Date(dateTimeString);
    
    // 格式化为: YYYY-MM-DD HH:MM:SS
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  markFormGroupTouched(): void {
    Object.keys(this.eventForm.controls).forEach(key => {
      const control = this.eventForm.get(key);
      control?.markAsTouched();
    });
  }

  onCancel(): void {
    if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      this.router.navigate(['/events']);
    }
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // 确保票数计算也正确处理数据
  getTotalTickets(): number {
    if (!this.registrations || this.registrations.length === 0) {
      return 0;
    }
    
    return this.registrations.reduce((sum, reg) => {
      return sum + this.ensureValidNumber(reg.ticket_quantity);
    }, 0);
  }

  // 模板辅助方法
  isFieldInvalid(fieldName: string): boolean {
    const field = this.eventForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.eventForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'This field is required';
      if (field.errors['minlength']) return `Minimum length is ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['maxlength']) return `Maximum length is ${field.errors['maxlength'].requiredLength} characters`;
      if (field.errors['min']) return `Value must be at least ${field.errors['min'].min}`;
    }
    return '';
  }

  // 在 event-form.component.ts 中添加/修改这些方法

  // 修改 ensureValidNumber 方法，确保正确处理金额
  ensureValidNumber(value: any): number {
    if (value === null || value === undefined || value === '') {
      return 0;
    }
    
    // 处理字符串情况
    if (typeof value === 'string') {
      // 移除所有非数字字符（除了小数点和负号）
      const cleaned = value.replace(/[^\d.-]/g, '');
      
      // 如果是空字符串，返回 0
      if (cleaned === '' || cleaned === '-') {
        return 0;
      }
      
      const num = parseFloat(cleaned);
      return isNaN(num) ? 0 : num;
    }
    
    // 处理数字情况
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  }

  // 计算总金额：活动金额 + 注册金额
  getTotalRevenue(): number {
    // 从表单或 event 对象获取活动金额
    let eventAmount = 0;
    
    if (this.event) {
      // 使用已加载的 event 数据
      eventAmount = this.ensureValidNumber(this.event.current_amount);
    } else {
      // 使用表单中的值（创建模式）
      eventAmount = this.ensureValidNumber(this.eventForm.get('current_amount')?.value);
    }
    
    // 所有注册的总金额
    const registrationsTotal = this.getRegistrationsRevenue();
    
    const total = eventAmount + registrationsTotal;
    
    console.log('🔢 编辑页面金额计算:', {
      '活动金额': eventAmount,
      '注册总金额': registrationsTotal,
      '合计金额': total
    });
    
    return total;
  }

  // 计算注册总金额
  getRegistrationsRevenue(): number {
    if (!this.registrations || this.registrations.length === 0) {
      return 0;
    }
    
    return this.registrations.reduce((sum, reg) => {
      return sum + this.ensureValidNumber(reg.total_amount);
    }, 0);
  }

  // 获取活动原始金额
  getEventCurrentAmount(): number {
    if (this.event) {
      return this.ensureValidNumber(this.event.current_amount);
    } else {
      return this.ensureValidNumber(this.eventForm.get('current_amount')?.value);
    }
  }

  // 获取注册总金额（单独显示）
  getRegistrationsTotal(): number {
    return this.getRegistrationsRevenue();
  }
}