// Registration page functionality
class RegistrationPage {
    constructor() {
        this.eventId = this.getEventIdFromURL();
        this.loadingMessage = document.getElementById('loading-message');
        this.errorMessage = document.getElementById('error-message');
        this.registrationContent = document.getElementById('registration-content');
        this.successMessage = document.getElementById('success-message');
        this.registrationForm = document.getElementById('registration-form');
        this.eventData = null;
        
        if (this.eventId) {
            this.loadEventData();
            this.setupEventListeners();
        } else {
            this.showError('No event ID specified. Please select an event to register.');
        }
    }

    getEventIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    async loadEventData() {
        try {
            this.showLoading();
            
            const data = await CharityEventsApp.apiRequest(`/events/${this.eventId}`);
            this.eventData = data.data;
            
            // 检查活动是否已过期
            if (this.eventData.is_past_event) {
                this.showError('This event has already ended. Registration is no longer available.');
                return;
            }
            
            this.displayEventInfo(this.eventData);
            this.setupPriceCalculation();
            
            this.hideLoading();
            this.registrationContent.classList.remove('hidden');
            
        } catch (error) {
            console.error('Error loading event data:', error);
            this.showError('Failed to load event information. Please try again.');
        }
    }

    displayEventInfo(event) {
        const eventInfoCard = document.getElementById('event-info');
        const formattedDate = CharityEventsApp.formatDate(event.date_time);
        const formattedPrice = event.ticket_price > 0 ? 
            CharityEventsApp.formatCurrency(event.ticket_price) : 'Free';
        
        // 票数信息
        let ticketInfo = '';
        if (event.max_attendees) {
            const availableTickets = event.available_tickets;
            if (availableTickets <= 0) {
                ticketInfo = '<div class="event-info-detail"><span>🎫</span><span style="color: #dc3545;">Fully Booked</span></div>';
            } else if (event.is_almost_full) {
                ticketInfo = `<div class="event-info-detail"><span>🎫</span><span style="color: #ffc107;">Only ${availableTickets} tickets left!</span></div>`;
            } else {
                ticketInfo = `<div class="event-info-detail"><span>🎫</span><span>${availableTickets} tickets available</span></div>`;
            }
        } else {
            ticketInfo = '<div class="event-info-detail"><span>🎫</span><span>Unlimited tickets</span></div>';
        }
        
        // 筹款进度信息
        const progress = event.progress_percentage || CharityEventsApp.calculateProgress(event.current_amount, event.goal_amount);
        const fundraisingInfo = event.goal_amount > 0 ? 
            `<div class="event-info-detail">
                <span>💰</span>
                <span>Fundraising: ${progress}% (${CharityEventsApp.formatCurrency(event.current_amount)} of ${CharityEventsApp.formatCurrency(event.goal_amount)})</span>
            </div>` : '';
        
        eventInfoCard.innerHTML = `
            <div class="event-info-title">${event.name}</div>
            <div class="event-info-details">
                <div class="event-info-detail">
                    <span>📅</span>
                    <span>${formattedDate}</span>
                </div>
                <div class="event-info-detail">
                    <span>📍</span>
                    <span>${event.location}</span>
                </div>
                <div class="event-info-detail">
                    <span>💰</span>
                    <span>${formattedPrice}</span>
                </div>
                <div class="event-info-detail">
                    <span>📋</span>
                    <span>${event.category_name}</span>
                </div>
                ${ticketInfo}
                ${fundraisingInfo}
            </div>
        `;
    }

    setupPriceCalculation() {
        const ticketQuantityInput = document.getElementById('ticket-quantity');
        const priceCalculation = document.getElementById('price-calculation');
        
        const updatePrice = () => {
            const quantity = parseInt(ticketQuantityInput.value) || 1;
            const ticketPrice = this.eventData.ticket_price;
            
            if (ticketPrice > 0) {
                const totalAmount = ticketPrice * quantity;
                priceCalculation.innerHTML = `
                    <div class="price-breakdown">
                        <span>${quantity} ticket(s) × ${CharityEventsApp.formatCurrency(ticketPrice)}</span>
                        <span>${CharityEventsApp.formatCurrency(totalAmount)}</span>
                    </div>
                    <div class="price-total">
                        <span>Total Amount:</span>
                        <span>${CharityEventsApp.formatCurrency(totalAmount)}</span>
                    </div>
                `;
            } else {
                priceCalculation.innerHTML = `
                    <div class="free-event-notice">
                        🎉 This is a free event! No payment required.
                    </div>
                `;
            }
        };
        
        ticketQuantityInput.addEventListener('input', updatePrice);
        updatePrice(); // Initial calculation
    }

    setupEventListeners() {
        this.registrationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmission();
        });

        // Real-time validation
        this.setupRealTimeValidation();
    }

    setupRealTimeValidation() {
        const emailInput = document.getElementById('email');
        const fullNameInput = document.getElementById('full-name');
        const ticketQuantityInput = document.getElementById('ticket-quantity');

        emailInput.addEventListener('blur', () => this.validateEmail(emailInput.value));
        fullNameInput.addEventListener('blur', () => this.validateFullName(fullNameInput.value));
        ticketQuantityInput.addEventListener('blur', () => this.validateTicketQuantity(ticketQuantityInput.value));
    }

    validateEmail(email) {
        const errorElement = document.getElementById('email-error');
        
        if (!email) {
            this.showErrorOnField('email-error', 'Email address is required');
            return false;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showErrorOnField('email-error', 'Please enter a valid email address');
            return false;
        }
        
        this.hideErrorOnField('email-error');
        return true;
    }

    validateFullName(fullName) {
        const errorElement = document.getElementById('full-name-error');
        
        if (!fullName.trim()) {
            this.showErrorOnField('full-name-error', 'Full name is required');
            return false;
        }
        
        if (fullName.trim().length < 2) {
            this.showErrorOnField('full-name-error', 'Full name must be at least 2 characters long');
            return false;
        }
        
        this.hideErrorOnField('full-name-error');
        return true;
    }

    validateTicketQuantity(quantity) {
        const errorElement = document.getElementById('ticket-quantity-error');
        const numQuantity = parseInt(quantity);
        
        if (!quantity || isNaN(numQuantity) || numQuantity < 1) {
            this.showErrorOnField('ticket-quantity-error', 'Please enter a valid number of tickets (minimum 1)');
            return false;
        }
        
        if (numQuantity > 10) {
            this.showErrorOnField('ticket-quantity-error', 'Maximum 10 tickets per registration');
            return false;
        }
        
        // 检查活动票数限制
        if (this.eventData && this.eventData.max_attendees) {
            const availableTickets = this.eventData.available_tickets;
            if (availableTickets < numQuantity) {
                if (availableTickets <= 0) {
                    this.showErrorOnField('ticket-quantity-error', 'Sorry, this event is fully booked');
                } else {
                    this.showErrorOnField('ticket-quantity-error', `Only ${availableTickets} tickets available`);
                }
                return false;
            }
        }
        
        this.hideErrorOnField('ticket-quantity-error');
        return true;
    }

    showErrorOnField(fieldId, message) {
        const errorElement = document.getElementById(fieldId);
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }

    hideErrorOnField(fieldId) {
        const errorElement = document.getElementById(fieldId);
        errorElement.classList.remove('show');
    }

    async handleFormSubmission() {
        // 检查活动是否已过期
        if (this.eventData && this.eventData.is_past_event) {
            CharityEventsApp.showNotification('This event has already ended. Registration is no longer available.', 'error');
            return;
        }

        // Validate all fields
        const formData = new FormData(this.registrationForm);
        const fullName = formData.get('full_name');
        const email = formData.get('email');
        const ticketQuantity = formData.get('ticket_quantity');

        const isEmailValid = this.validateEmail(email);
        const isFullNameValid = this.validateFullName(fullName);
        const isTicketQuantityValid = this.validateTicketQuantity(ticketQuantity);

        if (!isEmailValid || !isFullNameValid || !isTicketQuantityValid) {
            CharityEventsApp.showNotification('Please fix the errors in the form before submitting.', 'error');
            return;
        }

        try {
            this.setSubmitButtonLoading(true);
            
            const registrationData = {
                event_id: this.eventId,
                full_name: fullName,
                email: email,
                phone: formData.get('phone'),
                emergency_contact_name: formData.get('emergency_contact_name'),
                emergency_contact_phone: formData.get('emergency_contact_phone'),
                address: formData.get('address'),
                ticket_quantity: parseInt(ticketQuantity),
                special_requirements: formData.get('special_requirements')
            };

            const response = await CharityEventsApp.apiRequest('/registrations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(registrationData)
            });

            this.showSuccessMessage(response.data, registrationData);
            
        } catch (error) {
            console.error('Error submitting registration:', error);
            let errorMessage = error.message || 'Failed to submit registration. Please try again.';
            
            // 提供更友好的错误信息
            if (error.message.includes('tickets available') || error.message.includes('fully booked')) {
                errorMessage = error.message;
            } else if (error.message.includes('already been used')) {
                errorMessage = 'This email has already been used to register for this event.';
            } else if (error.message.includes('already ended')) {
                errorMessage = 'This event has already ended. Registration is no longer available.';
            }
            
            CharityEventsApp.showNotification(errorMessage, 'error');
            this.setSubmitButtonLoading(false);
        }
    }

    showSuccessMessage(responseData, registrationData) {
        this.registrationContent.classList.add('hidden');
        this.successMessage.classList.remove('hidden');

        const registrationDetails = document.getElementById('registration-details');
        const totalAmount = this.eventData.ticket_price * registrationData.ticket_quantity;
        
        registrationDetails.innerHTML = `
            <div class="registration-detail-item">
                <span class="registration-detail-label">Event:</span>
                <span class="registration-detail-value">${this.eventData.name}</span>
            </div>
            <div class="registration-detail-item">
                <span class="registration-detail-label">Name:</span>
                <span class="registration-detail-value">${registrationData.full_name}</span>
            </div>
            <div class="registration-detail-item">
                <span class="registration-detail-label">Email:</span>
                <span class="registration-detail-value">${registrationData.email}</span>
            </div>
            <div class="registration-detail-item">
                <span class="registration-detail-label">Tickets:</span>
                <span class="registration-detail-value">${registrationData.ticket_quantity}</span>
            </div>
            <div class="registration-detail-item">
                <span class="registration-detail-label">Total Amount:</span>
                <span class="registration-detail-value">${CharityEventsApp.formatCurrency(totalAmount)}</span>
            </div>
            <div class="registration-detail-item">
                <span class="registration-detail-label">Registration ID:</span>
                <span class="registration-detail-value">#${responseData.id}</span>
            </div>
        `;

        CharityEventsApp.showNotification('Registration completed successfully!', 'success');
    }

    setSubmitButtonLoading(isLoading) {
        const submitButton = document.getElementById('submit-button');
        if (isLoading) {
            submitButton.disabled = true;
            submitButton.innerHTML = '<div class="button-spinner"></div> Processing...';
        } else {
            submitButton.disabled = false;
            submitButton.textContent = 'Complete Registration';
        }
    }

    static goBack() {
        window.history.back();
    }

    static viewEvent() {
        const eventId = window.registrationPageInstance?.eventId;
        if (eventId) {
            window.location.href = `/event-details?id=${eventId}`;
        } else {
            window.location.href = '/';
        }
    }

    static goHome() {
        window.location.href = '/';
    }

    static retryLoad() {
        window.location.reload();
    }

    // Utility methods
    showLoading() {
        this.loadingMessage.classList.remove('hidden');
        this.errorMessage.classList.add('hidden');
        this.registrationContent.classList.add('hidden');
        this.successMessage.classList.add('hidden');
    }

    hideLoading() {
        this.loadingMessage.classList.add('hidden');
    }

    showError(message) {
        const errorText = document.getElementById('error-text');
        errorText.textContent = message;
        this.errorMessage.classList.remove('hidden');
        this.loadingMessage.classList.add('hidden');
        this.registrationContent.classList.add('hidden');
    }
}

// Initialize registration page
document.addEventListener('DOMContentLoaded', () => {
    window.registrationPageInstance = new RegistrationPage();
});