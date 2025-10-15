// Registration selection page functionality
class RegistrationSelectionPage {
    constructor() {
        this.eventsContainer = document.getElementById('events-container');
        this.loadingMessage = document.getElementById('loading-message');
        this.errorMessage = document.getElementById('error-message');
        this.noEventsMessage = document.getElementById('no-events-message');
        this.errorText = document.getElementById('error-text');
        this.init();
    }

    init() {
        this.loadEvents();
    }

    async loadEvents() {
        try {
            this.showLoading();
            console.log('🔄 Loading events for registration...');
            
            const data = await CharityEventsApp.apiRequest('/events');
            console.log('✅ Events loaded:', data);
            
            if (data && data.data && data.data.length > 0) {
                this.displayEvents(data.data);
            } else {
                this.showNoEvents();
            }
            
        } catch (error) {
            console.error('❌ Error loading events:', error);
            this.showError('Failed to load events. Please check if the API server is running on port 4000.');
        }
    }

    displayEvents(events) {
        // Filter only upcoming and active events
        const availableEvents = events.filter(event => 
            CharityEventsApp.isEventUpcoming(event.date_time) && event.is_active
        );

        console.log(`📊 Found ${availableEvents.length} available events`);

        if (availableEvents.length === 0) {
            this.showNoEvents();
            return;
        }

        const eventsHTML = availableEvents.map(event => this.createEventCard(event)).join('');
        this.eventsContainer.innerHTML = eventsHTML;
        
        this.hideLoading();
        this.eventsContainer.classList.remove('hidden');
        
        // Add click listeners to event cards
        this.addEventCardListeners();
    }

    createEventCard(event) {
        const formattedDate = CharityEventsApp.formatDate(event.date_time);
        const formattedPrice = event.ticket_price > 0 ? 
            CharityEventsApp.formatCurrency(event.ticket_price) : 'Free';
        const emoji = this.getEventEmoji(event.category_name);
        const progress = CharityEventsApp.calculateProgress(event.current_amount, event.goal_amount);

        // Calculate available spots
        const registeredTickets = event.registration_count || 0;
        const availableSpots = event.max_attendees ? 
            Math.max(0, event.max_attendees - registeredTickets) : 'Unlimited';

        const isAlmostFull = event.max_attendees && availableSpots <= 5 && availableSpots > 0;
        const isFull = event.max_attendees && availableSpots === 0;

        let availabilityBadge = '';
        if (isFull) {
            availabilityBadge = '<span class="availability-badge full">Fully Booked</span>';
        } else if (isAlmostFull) {
            availabilityBadge = `<span class="availability-badge limited">Only ${availableSpots} left!</span>`;
        }

        return `
            <div class="event-selection-card" data-event-id="${event.id}">
                <div class="event-selection-image">
                    ${emoji}
                </div>
                <div class="event-selection-content">
                    <div class="event-selection-header">
                        <span class="event-category">${event.category_name}</span>
                        ${availabilityBadge}
                    </div>
                    <h3 class="event-selection-title">${event.name}</h3>
                    
                    <div class="event-selection-details">
                        <div class="event-detail">
                            <span class="detail-icon">📅</span>
                            <span class="detail-text">${formattedDate}</span>
                        </div>
                        <div class="event-detail">
                            <span class="detail-icon">📍</span>
                            <span class="detail-text">${event.location}</span>
                        </div>
                        <div class="event-detail">
                            <span class="detail-icon">💰</span>
                            <span class="detail-text">${formattedPrice}</span>
                        </div>
                        <div class="event-detail">
                            <span class="detail-icon">👥</span>
                            <span class="detail-text">${availableSpots} ${typeof availableSpots === 'number' ? 'spots' : ''} available</span>
                        </div>
                    </div>
                    
                    <p class="event-selection-description">${event.short_description}</p>
                    
                    <div class="progress-section">
                        <div class="progress-info">
                            <span>Raised: ${CharityEventsApp.formatCurrency(event.current_amount)}</span>
                            <span>${progress}%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                    </div>
                    
                    <button class="select-event-btn" onclick="RegistrationSelectionPage.selectEvent(${event.id})" 
                            ${isFull ? 'disabled' : ''}>
                        ${isFull ? 'Fully Booked' : 'Register for this Event'}
                    </button>
                </div>
            </div>
        `;
    }

    addEventCardListeners() {
        document.querySelectorAll('.event-selection-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't trigger if clicking the register button
                if (!e.target.classList.contains('select-event-btn')) {
                    const eventId = card.getAttribute('data-event-id');
                    const button = card.querySelector('.select-event-btn');
                    if (!button.disabled) {
                        RegistrationSelectionPage.viewEventDetails(eventId);
                    }
                }
            });
        });
    }

    getEventEmoji(category) {
        const emojiMap = {
            'Fun Run': '🏃‍♂️',
            'Gala Dinner': '🍽️',
            'Silent Auction': '🔨',
            'Concert': '🎵',
            'Workshop': '🔧',
            'Sports Tournament': '⚽'
        };
        return emojiMap[category] || '🎉';
    }

    static selectEvent(eventId) {
        console.log(`🎯 Selecting event ${eventId} for registration`);
        window.location.href = `/registration/form?id=${eventId}`;
    }

    static viewEventDetails(eventId) {
        window.location.href = `/event-details?id=${eventId}`;
    }

    static retryLoad() {
        window.location.reload();
    }

    showLoading() {
        this.loadingMessage.classList.remove('hidden');
        this.errorMessage.classList.add('hidden');
        this.noEventsMessage.classList.add('hidden');
        this.eventsContainer.classList.add('hidden');
    }

    hideLoading() {
        this.loadingMessage.classList.add('hidden');
    }

    showNoEvents() {
        this.hideLoading();
        this.noEventsMessage.classList.remove('hidden');
        console.log('📭 No events available for registration');
    }

    showError(message) {
        if (this.errorText) {
            this.errorText.textContent = message;
        }
        this.errorMessage.classList.remove('hidden');
        this.hideLoading();
        console.error('❌ Registration selection error:', message);
    }
}

// Initialize registration selection page
document.addEventListener('DOMContentLoaded', () => {
    window.registrationSelectionPage = new RegistrationSelectionPage();
});