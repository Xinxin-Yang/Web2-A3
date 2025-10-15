// Home page functionality
class HomePage {
    constructor() {
        this.eventsContainer = document.getElementById('events-container');
        this.loadingMessage = document.getElementById('loading-message');
        this.errorMessage = document.getElementById('error-message');
        this.init();
    }

    init() {
        this.loadEvents();
    }

    async loadEvents() {
        try {
            this.showLoading();
            console.log('🔄 Loading events data...');
            
            const data = await CharityEventsApp.apiRequest('/events');
            console.log('✅ API response data:', data);
            
            if (data && data.data) {
                console.log(`📊 Retrieved ${data.data.length} events`);
                this.displayEvents(data.data);
            } else {
                console.error('❌ API returned invalid data format:', data);
                this.showError('Invalid data format. Unable to load events.');
            }
            
        } catch (error) {
            console.error('Error loading events:', error);
            this.showError('Failed to load events. Please try again later.');
        }
    }

    displayEvents(events) {
        console.log('🎨 Displaying events:', events);
        
        if (!events || events.length === 0) {
            console.log('📭 No events to display');
            this.eventsContainer.innerHTML = `
                <div class="no-events">
                    <h3>No events found</h3>
                    <p>Check back later for new charity events!</p>
                </div>
            `;
            return;
        }

        console.log(`🖼️ Preparing to display ${events.length} events`);
        const eventsHTML = events.map(event => {
            console.log('🏠 Home page event data:', {
                id: event.id,
                name: event.name,
                current_amount: event.current_amount,
                goal_amount: event.goal_amount
            });
            return this.createEventCard(event);
        }).join('');
        
        this.eventsContainer.innerHTML = eventsHTML;
        
        this.addEventListeners();
        this.hideLoading();
    }

    createEventCard(event) {
        const formattedDate = CharityEventsApp.formatDate(event.date_time);
        const formattedPrice = event.ticket_price > 0 ? 
            CharityEventsApp.formatCurrency(event.ticket_price) : 'Free';
        
        // 使用数据库中的 current_amount 来计算筹款进度
        const currentAmount = parseFloat(event.current_amount) || 0;
        const goalAmount = parseFloat(event.goal_amount) || 0;
        const progress = goalAmount > 0 ? Math.min(Math.round((currentAmount / goalAmount) * 100), 100) : 0;
        
        // Check if event is past
        const isPastEvent = event.is_past_event || !CharityEventsApp.isEventUpcoming(event.date_time);
        const statusBadge = isPastEvent ? 
            '<span class="event-status past">Completed</span>' : 
            '<span class="event-status upcoming">Active</span>';
        
        // Get appropriate emoji for event type
        const emoji = this.getEventEmoji(event.category_name);

        // 票数信息显示
        let ticketInfo = '';
        if (event.max_attendees) {
            const availableTickets = event.available_tickets;
            if (availableTickets <= 0) {
                ticketInfo = `<div class="registration-info">
                    <span>🎫 Fully Booked</span>
                </div>`;
            } else if (event.is_almost_full) {
                ticketInfo = `<div class="registration-info">
                    <span>🎫 Only ${availableTickets} tickets left!</span>
                </div>`;
            } else {
                ticketInfo = `<div class="registration-info">
                    <span>🎫 ${availableTickets} tickets available</span>
                </div>`;
            }
        } else {
            ticketInfo = `<div class="registration-info">
                <span>🎫 Unlimited tickets</span>
            </div>`;
        }

        // 注册人数信息
        const registrationInfo = event.registered_tickets > 0 ? 
            `<div class="registration-info">
                <span>👥 ${event.registered_tickets} people registered</span>
            </div>` : '';

        // 筹款进度信息 - 使用数据库中的筹款金额
        const fundraisingInfo = event.goal_amount > 0 ? 
            `<div class="progress-section">
                <div class="progress-info">
                    <span>Raised: ${CharityEventsApp.formatCurrency(currentAmount)} of ${CharityEventsApp.formatCurrency(goalAmount)}</span>
                    <span>${progress}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
            </div>` : '';

        return `
            <div class="event-card ${isPastEvent ? 'past-event' : ''}" data-event-id="${event.id}">
                <div class="event-image">
                    ${emoji}
                </div>
                <div class="event-content">
                    <div class="event-header">
                        <span class="event-category">${event.category_name}</span>
                        ${statusBadge}
                    </div>
                    <h3 class="event-title">${event.name}</h3>
                    <div class="event-date">
                        <span>📅</span>
                        ${formattedDate}
                        ${isPastEvent ? ' (Completed)' : ''}
                    </div>
                    <div class="event-location">
                        <span>📍</span>
                        ${event.location}
                    </div>
                    ${registrationInfo}
                    ${ticketInfo}
                    <p class="event-description">${event.short_description}</p>
                    
                    ${fundraisingInfo}
                    
                    <div class="event-footer">
                        <span class="ticket-price ${event.ticket_price === 0 ? 'free-ticket' : ''}">
                            ${formattedPrice}
                        </span>
                        <button class="view-details" onclick="HomePage.viewEventDetails(${event.id})">
                            View Details & Register
                        </button>
                    </div>
                </div>
            </div>
        `;
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

    addEventListeners() {
        // Add click listeners to entire event cards
        document.querySelectorAll('.event-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't trigger if clicking the view details button
                if (!e.target.classList.contains('view-details')) {
                    const eventId = card.getAttribute('data-event-id');
                    HomePage.viewEventDetails(eventId);
                }
            });
        });
    }

    static viewEventDetails(eventId) {
        // Navigate to event details page with event ID
        window.location.href = `/event-details?id=${eventId}`;
    }

    showLoading() {
        this.loadingMessage.classList.remove('hidden');
        this.errorMessage.classList.add('hidden');
        this.eventsContainer.innerHTML = '';
    }

    hideLoading() {
        this.loadingMessage.classList.add('hidden');
    }

    showError(message) {
        this.errorMessage.querySelector('p').textContent = message;
        this.errorMessage.classList.remove('hidden');
        this.loadingMessage.classList.add('hidden');
        this.eventsContainer.innerHTML = '';
    }
}

// Initialize home page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new HomePage();
});