// Event Details page functionality
class EventDetailsPage {
    constructor() {
        this.eventId = this.getEventIdFromURL();
        this.loadingMessage = document.getElementById('loading-message');
        this.errorMessage = document.getElementById('error-message');
        this.eventContent = document.getElementById('event-content');
        this.eventData = null;
        
        if (this.eventId) {
            this.loadEventDetails();
        } else {
            this.showError('No event ID specified.');
        }
    }

    getEventIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    async loadEventDetails() {
        try {
            this.showLoading();
            
            const data = await CharityEventsApp.apiRequest(`/events/${this.eventId}`);
            this.eventData = data.data;
            
            // 添加调试信息
            console.log('🎯 Event data received from API:', {
                id: this.eventData.id,
                name: this.eventData.name,
                current_amount: this.eventData.current_amount,
                goal_amount: this.eventData.goal_amount,
                progress_percentage: this.eventData.progress_percentage
            });
            
            this.displayEventDetails(this.eventData);
            
        } catch (error) {
            console.error('Error loading event details:', error);
            this.showError('Failed to load event details. The event may not exist or has been removed.');
        }
    }

    displayEventDetails(event) {
        this.populateEventHeader(event);
        this.populateEventContent(event);
        this.populateSidebar(event);
        this.displayRegistrations(event.registrations);
        this.setEventImage(event.category_name);
        
        this.hideLoading();
        this.eventContent.classList.remove('hidden');
    }

    populateEventHeader(event) {
        document.getElementById('event-category').textContent = event.category_name;
        document.getElementById('event-title').textContent = event.name;
        
        // Format and display meta information
        const formattedDate = CharityEventsApp.formatDate(event.date_time);
        const formattedPrice = event.ticket_price > 0 ? 
            CharityEventsApp.formatCurrency(event.ticket_price) : 'Free';
        
        document.getElementById('event-date').textContent = formattedDate;
        document.getElementById('event-location').textContent = event.location;
        document.getElementById('event-price').textContent = formattedPrice;
        document.getElementById('registration-count').textContent = 
            `${event.registered_tickets || 0} Tickets Registered`;
    }

    populateEventContent(event) {
        // Display full description
        const descriptionElement = document.getElementById('event-description');
        if (event.full_description) {
            descriptionElement.innerHTML = this.formatDescription(event.full_description);
        } else {
            descriptionElement.innerHTML = `<p>${event.short_description || 'No detailed description available.'}</p>`;
        }

        // Display address if available
        const addressSection = document.getElementById('address-section');
        const addressElement = document.getElementById('event-address');
        
        if (event.address) {
            addressElement.textContent = event.address;
            addressSection.classList.remove('hidden');
        } else {
            addressSection.classList.add('hidden');
        }
    }

    displayRegistrations(registrations) {
        const registrationsList = document.getElementById('registrations-list');
        const noRegistrations = document.getElementById('no-registrations');
        
        if (!registrations || registrations.length === 0) {
            registrationsList.innerHTML = '';
            noRegistrations.classList.remove('hidden');
            return;
        }
        
        noRegistrations.classList.add('hidden');
        
        const registrationsHTML = registrations.map(registration => 
            this.createRegistrationItem(registration)
        ).join('');
        
        registrationsList.innerHTML = registrationsHTML;
    }

    createRegistrationItem(registration) {
        const formattedDate = CharityEventsApp.formatDate(registration.registration_date || registration.formatted_date);
        const formattedAmount = registration.total_amount > 0 ? 
            CharityEventsApp.formatCurrency(registration.total_amount) : 'Free';
        
        return `
            <div class="registration-item">
                <div class="registration-info">
                    <div class="registration-name">${registration.full_name}</div>
                    <div class="registration-details">
                        <div class="registration-detail">
                            <span>📧</span>
                            <span>${registration.email}</span>
                        </div>
                        <div class="registration-detail">
                            <span>🎫</span>
                            <span>${registration.ticket_quantity} ticket(s)</span>
                        </div>
                        <div class="registration-detail">
                            <span>💰</span>
                            <span>${registration.payment_status || 'pending'}</span>
                        </div>
                    </div>
                    <div class="registration-date">
                        Registered on ${formattedDate}
                    </div>
                </div>
                <div class="registration-amount">
                    ${formattedAmount}
                </div>
            </div>
        `;
    }

    populateSidebar(event) {
        console.log('🔄 Populating sidebar with event data:', {
            current_amount: event.current_amount,
            goal_amount: event.goal_amount
        });

        // 确保使用数据库中的金额
        const currentAmount = parseFloat(event.current_amount) || 0;
        const goalAmount = parseFloat(event.goal_amount) || 0;
        const progress = goalAmount > 0 ? Math.min(Math.round((currentAmount / goalAmount) * 100), 100) : 0;
        
        console.log('📈 Progress calculation:', {
            currentAmount,
            goalAmount,
            progress
        });

        // 更新显示
        document.getElementById('current-amount').textContent = CharityEventsApp.formatCurrency(currentAmount);
        document.getElementById('goal-amount').textContent = CharityEventsApp.formatCurrency(goalAmount);
        document.getElementById('progress-percent').textContent = `${progress}%`;
        
        // 更新进度条
        const progressFill = document.getElementById('progress-fill');
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
            progressFill.classList.add('animate');
        }

        // Registration information
        document.getElementById('ticket-type').textContent = event.ticket_type === 'paid' ? 'Paid Event' : 'Free Event';
        document.getElementById('ticket-price-display').textContent = 
            event.ticket_price > 0 ? CharityEventsApp.formatCurrency(event.ticket_price) : 'Free';
        
        document.getElementById('max-attendees').textContent = 
            event.max_attendees ? event.max_attendees : 'Unlimited';
            
        // 显示可用票数
        const availableTickets = event.available_tickets;
        document.getElementById('available-tickets').textContent = 
            availableTickets !== null ? availableTickets : 'Unlimited';
        
        const statusElement = document.getElementById('event-status');
        if (event.is_past_event) {
            statusElement.textContent = 'Event Ended';
            statusElement.className = 'info-value status-inactive';
        } else if (event.is_full) {
            statusElement.textContent = 'Fully Booked';
            statusElement.className = 'info-value status-inactive';
        } else if (!event.is_active) {
            statusElement.textContent = 'Inactive';
            statusElement.className = 'info-value status-inactive';
        } else {
            statusElement.textContent = 'Active';
            statusElement.className = 'info-value status-active';
        }

        // 更新注册按钮状态
        this.updateRegisterButton(event);
    }

    updateRegisterButton(event) {
        const registerButton = document.querySelector('.register-button');
        if (!registerButton) return;

        if (event.is_past_event) {
            registerButton.textContent = 'Event Ended';
            registerButton.disabled = true;
            registerButton.style.background = '#6c757d';
            registerButton.style.cursor = 'not-allowed';
            // 移除点击事件
            registerButton.onclick = null;
        } else if (event.is_full) {
            registerButton.textContent = 'Fully Booked';
            registerButton.disabled = true;
            registerButton.style.background = '#6c757d';
            registerButton.style.cursor = 'not-allowed';
            registerButton.onclick = null;
        } else if (!event.is_active) {
            registerButton.textContent = 'Event Inactive';
            registerButton.disabled = true;
            registerButton.style.background = '#6c757d';
            registerButton.style.cursor = 'not-allowed';
            registerButton.onclick = null;
        } else {
            registerButton.textContent = 'Register Now';
            registerButton.disabled = false;
            registerButton.style.background = '';
            registerButton.style.cursor = 'pointer';
            registerButton.onclick = EventDetailsPage.registerForEvent;
        }
    }

    setEventImage(category) {
        const emojiMap = {
            'Fun Run': '🏃‍♂️',
            'Gala Dinner': '🍽️',
            'Silent Auction': '🔨',
            'Concert': '🎵',
            'Workshop': '🔧',
            'Sports Tournament': '⚽'
        };
        
        const eventImage = document.getElementById('event-image');
        eventImage.innerHTML = emojiMap[category] || '🎉';
    }

    formatDescription(description) {
        // Convert line breaks to paragraphs and add basic formatting
        return description
            .split('\n')
            .filter(paragraph => paragraph.trim())
            .map(paragraph => `<p>${paragraph.trim()}</p>`)
            .join('');
    }

    static registerForEvent() {
        if (!window.eventDetailsPageInstance || !window.eventDetailsPageInstance.eventId) {
            console.error('No event ID available');
            return;
        }
        
        const event = window.eventDetailsPageInstance.eventData;
        
        // 检查活动是否已过期
        if (event.is_past_event) {
            CharityEventsApp.showNotification('This event has already ended. Registration is no longer available.', 'error');
            return;
        }
        
        // 检查活动是否已满
        if (event.is_full) {
            CharityEventsApp.showNotification('Sorry, this event is fully booked!', 'error');
            return;
        }
        
        // 检查活动是否活跃
        if (!event.is_active) {
            CharityEventsApp.showNotification('This event is not currently active.', 'error');
            return;
        }
        
        // Navigate to registration page with event ID
        window.location.href = `/registration/form?id=${window.eventDetailsPageInstance.eventId}`;
    }

    static goBack() {
        // Try to go back to previous page, or default to home
        if (document.referrer && document.referrer.includes(window.location.hostname)) {
            window.history.back();
        } else {
            window.location.href = '/';
        }
    }

    static openMaps() {
        const address = document.getElementById('event-address')?.textContent;
        const location = document.getElementById('event-location')?.textContent;
        
        const searchQuery = encodeURIComponent(address || location);
        window.open(`https://www.google.com/maps/search/?api=1&query=${searchQuery}`, '_blank');
    }

    static retryLoad() {
        window.location.reload();
    }

    // Utility methods
    showLoading() {
        this.loadingMessage.classList.remove('hidden');
        this.errorMessage.classList.add('hidden');
        this.eventContent.classList.add('hidden');
    }

    hideLoading() {
        this.loadingMessage.classList.add('hidden');
    }

    showError(message) {
        this.errorMessage.querySelector('p').textContent = message;
        this.errorMessage.classList.remove('hidden');
        this.loadingMessage.classList.add('hidden');
        this.eventContent.classList.add('hidden');
    }
}

// Initialize event details page
document.addEventListener('DOMContentLoaded', () => {
    window.eventDetailsPageInstance = new EventDetailsPage();
});