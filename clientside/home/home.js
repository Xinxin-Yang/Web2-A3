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
                    <p><small>Debug: events array is empty</small></p>
                </div>
            `;
            return;
        }

        console.log(`🖼️ Preparing to display ${events.length} events`);
        const eventsHTML = events.map(event => {
            console.log('Event data:', event);
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
        const progress = CharityEventsApp.calculateProgress(event.current_amount, event.goal_amount);
        
        // Check if event is past
        const isPastEvent = !CharityEventsApp.isEventUpcoming(event.date_time);
        const statusBadge = isPastEvent ? 
            '<span class="event-status past">Completed</span>' : 
            '<span class="event-status upcoming">Active</span>';
        
        // Get appropriate emoji for event type
        const emoji = this.getEventEmoji(event.category_name);

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
                    <p class="event-description">${event.short_description}</p>
                    
                    <div class="progress-section">
                        <div class="progress-info">
                            <span>Raised: ${CharityEventsApp.formatCurrency(event.current_amount)} of ${CharityEventsApp.formatCurrency(event.goal_amount)}</span>
                            <span>${progress}%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                    </div>
                    
                    <div class="event-footer">
                        <span class="ticket-price ${event.ticket_price === 0 ? 'free-ticket' : ''}">
                            ${formattedPrice}
                        </span>
                        <button class="view-details" onclick="HomePage.viewEventDetails(${event.id})">
                            View Details
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

// Additional CSS for progress bars and event status
const progressStyles = `
    .progress-section {
        margin: 1rem 0;
    }
    
    .progress-info {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
        color: #666;
    }
    
    .progress-bar {
        height: 8px;
        background: #e9ecef;
        border-radius: 4px;
        overflow: hidden;
    }
    
    .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #28a745, #20c997);
        transition: width 0.3s ease;
    }
    
    .no-events {
        text-align: center;
        padding: 3rem;
        grid-column: 1 / -1;
        color: #666;
    }
    
    .event-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
    }
    
    .event-status {
        padding: 0.25rem 0.5rem;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: bold;
    }
    
    .event-status.upcoming {
        background: #e7f5ff;
        color: #1971c2;
    }
    
    .event-status.past {
        background: #f8f9fa;
        color: #868e96;
    }
    
    .past-event {
        opacity: 0.7;
    }
    
    .past-event .event-title {
        color: #868e96;
    }
`;

// Add progress styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = progressStyles;
document.head.appendChild(styleSheet);

// Initialize home page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new HomePage();
});