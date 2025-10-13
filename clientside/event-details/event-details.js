// Event Details page functionality
class EventDetailsPage {
    constructor() {
        this.eventId = this.getEventIdFromURL();
        this.loadingMessage = document.getElementById('loading-message');
        this.errorMessage = document.getElementById('error-message');
        this.eventContent = document.getElementById('event-content');
        
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
            this.displayEventDetails(data.data);
            
        } catch (error) {
            console.error('Error loading event details:', error);
            this.showError('Failed to load event details. The event may not exist or has been removed.');
        }
    }

    displayEventDetails(event) {
        this.populateEventHeader(event);
        this.populateEventContent(event);
        this.populateSidebar(event);
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

    populateSidebar(event) {
        // Progress information
        const progress = CharityEventsApp.calculateProgress(event.current_amount, event.goal_amount);
        
        document.getElementById('current-amount').textContent = CharityEventsApp.formatCurrency(event.current_amount);
        document.getElementById('goal-amount').textContent = CharityEventsApp.formatCurrency(event.goal_amount);
        document.getElementById('progress-percent').textContent = `${progress}%`;
        
        // Animate progress bar
        const progressFill = document.getElementById('progress-fill');
        progressFill.style.width = `${progress}%`;
        progressFill.classList.add('animate');

        // Registration information
        document.getElementById('ticket-type').textContent = event.ticket_type;
        document.getElementById('ticket-price-display').textContent = 
            event.ticket_price > 0 ? CharityEventsApp.formatCurrency(event.ticket_price) : 'Free';
        
        document.getElementById('max-attendees').textContent = 
            event.max_attendees ? event.max_attendees : 'Unlimited';
        
        const statusElement = document.getElementById('event-status');
        statusElement.textContent = event.is_active ? 'Active' : 'Inactive';
        statusElement.className = `info-value ${event.is_active ? 'status-active' : 'status-inactive'}`;
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

    static showRegisterModal() {
        const modal = document.getElementById('register-modal');
        modal.style.display = 'block';
    }

    static closeModal() {
        const modal = document.getElementById('register-modal');
        modal.style.display = 'none';
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
    new EventDetailsPage();
});

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    const modal = document.getElementById('register-modal');
    if (event.target === modal) {
        EventDetailsPage.closeModal();
    }
});

// Handle browser back/forward buttons
window.addEventListener('popstate', () => {
    window.location.reload();
});