import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EventService } from '../../services/event.service';
import { Event, EventFormData, Category } from '../../models/event.model';

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
  categories: Category[] = [];
  
  // Form modes
  formTitle = 'Create New Event';
  submitButtonText = 'Create Event';

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.eventForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadCategories();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.eventId = +params['id'];
        this.formTitle = 'Edit Event';
        this.submitButtonText = 'Update Event';
        this.loadEventData();
      }
    });

    // Watch for ticket type changes
    this.eventForm.get('ticket_type')?.valueChanges.subscribe(value => {
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
      next: (response) => {
        if (response.success) {
          this.categories = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  loadEventData(): void {
    if (!this.eventId) return;
    
    this.loading = true;
    this.eventService.getEventById(this.eventId).subscribe({
      next: (response) => {
        if (response.success) {
          const event = response.data;
          this.populateForm(event);
        } else {
          alert('Event not found');
          this.router.navigate(['/events']);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading event:', error);
        alert('Failed to load event data');
        this.loading = false;
        this.router.navigate(['/events']);
      }
    });
  }

  populateForm(event: Event): void {
    this.eventForm.patchValue({
      name: event.name,
      short_description: event.short_description,
      full_description: event.full_description,
      date_time: this.formatDateForInput(event.date_time),
      location: event.location,
      address: event.address || '',
      category_id: event.category_id,
      ticket_price: event.ticket_price,
      ticket_type: event.ticket_type,
      goal_amount: event.goal_amount,
      current_amount: event.current_amount,
      max_attendees: event.max_attendees,
      is_active: event.is_active
    });

    this.onTicketTypeChange(event.ticket_type);
  }

  formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
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
      
      const formValue = this.eventForm.getRawValue(); // Get disabled control values too
      const eventData: EventFormData = {
        ...formValue,
        ticket_price: formValue.ticket_type === 'free' ? 0 : formValue.ticket_price,
        max_attendees: formValue.max_attendees || null
      };

      const operation = this.isEditMode 
        ? this.eventService.updateEvent(this.eventId!, eventData)
        : this.eventService.createEvent(eventData);

      operation.subscribe({
        next: (response) => {
          this.submitting = false;
          if (response.success) {
            const message = this.isEditMode ? 'Event updated successfully!' : 'Event created successfully!';
            alert(message);
            this.router.navigate(['/events']);
          } else {
            alert(response.message || 'Operation failed');
          }
        },
        error: (error) => {
          this.submitting = false;
          console.error('Error saving event:', error);
          alert('Error saving event: ' + (error.message || 'Unknown error'));
        }
      });
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

  // Helper methods for template
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