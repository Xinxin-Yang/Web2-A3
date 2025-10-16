import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// 使用正确的相对路径
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-event-form',
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.css']
})
export class EventFormComponent implements OnInit {
  eventForm: FormGroup;
  isEditMode = false;
  eventId: number | null = null;
  loading = false;
  submitting = false;
  categories: any[] = [];
  
  formTitle = 'Create New Event';
  submitButtonText = 'Create Event';

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,  // 确保构造函数参数正确
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.eventForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadCategories();
    
    this.route.params.subscribe((params: any) => {
      if (params['id']) {
        this.isEditMode = true;
        this.eventId = +params['id'];
        this.formTitle = 'Edit Event';
        this.submitButtonText = 'Update Event';
        this.loadEventData();
      }
    });

    this.eventForm.get('ticket_type')?.valueChanges.subscribe((value: string) => {
      this.onTicketTypeChange(value);
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
      is_active: [true]
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
      // 模拟数据
      setTimeout(() => {
        const mockEvent = {
          name: 'Sample Event',
          short_description: 'This is a sample event description',
          full_description: 'Full description of the sample event',
          date_time: '2025-12-01T18:00',
          location: 'Sample Location',
          address: '123 Sample Street',
          category_id: 1,
          ticket_price: 25.00,
          ticket_type: 'paid',
          goal_amount: 5000.00,
          current_amount: 1200.00,
          max_attendees: 100,
          is_active: true
        };
        
        this.eventForm.patchValue(mockEvent);
        this.onTicketTypeChange(mockEvent.ticket_type);
        this.loading = false;
      }, 1000);
    }
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
      this.submitting = true;
      
      const formValue = this.eventForm.getRawValue();
      const eventData = {
        ...formValue,
        ticket_price: formValue.ticket_type === 'free' ? 0 : formValue.ticket_price,
        max_attendees: formValue.max_attendees || null
      };

      // 模拟保存
      setTimeout(() => {
        this.submitting = false;
        const message = this.isEditMode ? 'Event updated successfully!' : 'Event created successfully!';
        alert(message);
        this.router.navigate(['/events']);
      }, 1000);
      
    } else {
      this.markFormGroupTouched();
      alert('Please fill in all required fields correctly.');
    }
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
}