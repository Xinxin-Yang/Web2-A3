// Search page functionality
class SearchPage {
    constructor() {
        this.searchForm = document.getElementById('search-form');
        this.resultsContainer = document.getElementById('results-container');
        this.searchInfo = document.getElementById('search-info');
        this.resultsCount = document.getElementById('results-count');
        this.activeFilters = document.getElementById('active-filters');
        this.loadingMessage = document.getElementById('loading-message');
        this.initialMessage = document.getElementById('initial-message');
        this.errorMessage = document.getElementById('error-message');
        this.noResults = document.getElementById('no-results');
        this.categorySelect = document.getElementById('category');
        this.categoryIdSelect = document.getElementById('category-id');
        this.clearButton = document.getElementById('clear-filters');
        this.currentFilters = {};
        
        this.init();
    }

    async init() {
        await this.loadCategories();
        this.setupEventListeners();
        // No date restrictions - allow selecting any date
    }

    async loadCategories() {
        try {
            const data = await CharityEventsApp.apiRequest('/events/categories');
            this.populateCategorySelects(data.data);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    populateCategorySelects(categories) {
        if (!categories || !Array.isArray(categories)) {
            console.warn('No categories found or invalid categories data');
            return;
        }

        categories.forEach(category => {
            if (!category || !category.name) return;

            // For text-based category search
            const option1 = document.createElement('option');
            option1.value = category.name;
            option1.textContent = category.name;
            this.categorySelect.appendChild(option1);

            // For ID-based category search
            const option2 = document.createElement('option');
            option2.value = category.id;
            option2.textContent = category.name;
            this.categoryIdSelect.appendChild(option2);
        });
    }

    setupEventListeners() {
        if (this.searchForm) {
            this.searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.performSearch();
            });
        }

        if (this.clearButton) {
            this.clearButton.addEventListener('click', () => {
                this.clearFilters();
            });
        }
    }

    async performSearch() {
        try {
            this.showLoading();
            this.hideMessages();

            const formData = new FormData(this.searchForm);
            this.currentFilters = {
                date: formData.get('date'),
                location: formData.get('location'),
                category: formData.get('category'),
                category_id: formData.get('category_id')
            };

            // Build query string
            const queryParams = new URLSearchParams();
            Object.entries(this.currentFilters).forEach(([key, value]) => {
                if (value) {
                    queryParams.append(key, value);
                }
            });

            const data = await CharityEventsApp.apiRequest(`/events/search?${queryParams}`);
            this.displayResults(data.data, data.filters);
            
        } catch (error) {
            console.error('Error performing search:', error);
            this.showError('Failed to search events. Please try again later.');
        }
    }

    displayResults(events, filters) {
        this.updateSearchInfo(events.length, filters);
        
        if (!events || events.length === 0) {
            this.showNoResults();
            return;
        }

        const resultsHTML = events.map(event => this.createResultCard(event)).join('');
        if (this.resultsContainer) {
            this.resultsContainer.innerHTML = resultsHTML;
        }
        
        this.addResultEventListeners();
        this.hideLoading();
    }

    createResultCard(event) {
        if (!event) return '';

        const formattedDate = CharityEventsApp.formatDate(event.date_time);
        const formattedPrice = event.ticket_price > 0 ? 
            CharityEventsApp.formatCurrency(event.ticket_price) : 'Free';
        const progress = CharityEventsApp.calculateProgress(event.current_amount, event.goal_amount);
        const isPastEvent = !CharityEventsApp.isEventUpcoming(event.date_time);
        const statusBadge = isPastEvent ? 
            '<span class="event-status past">Completed</span>' : 
            '<span class="event-status upcoming">Active</span>';
        const emoji = this.getEventEmoji(event.category_name);

        return `
            <div class="result-card ${isPastEvent ? 'past-event' : ''}" data-event-id="${event.id}">
                <div class="result-image">
                    ${emoji}
                </div>
                <div class="result-content">
                    <div class="result-header">
                        <span class="result-category">${event.category_name || 'Uncategorized'}</span>
                        ${statusBadge}
                    </div>
                    <h3 class="result-title">${event.name || 'Untitled Event'}</h3>
                    <div class="result-date">
                        <span>📅</span>
                        ${formattedDate}
                        ${isPastEvent ? ' (Completed)' : ''}
                    </div>
                    <div class="result-location">
                        <span>📍</span>
                        ${event.location || 'Location TBD'}
                    </div>
                    <p class="result-description">${event.short_description || 'No description available'}</p>
                    
                    <div class="progress-section">
                        <div class="progress-info">
                            <span>Raised: ${CharityEventsApp.formatCurrency(event.current_amount || 0)}</span>
                            <span>${progress}%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                    </div>
                    
                    <div class="result-footer">
                        <span class="result-price ${event.ticket_price === 0 ? 'result-free' : ''}">
                            ${formattedPrice}
                        </span>
                        <div class="result-actions">
                            <button class="view-details-btn" onclick="SearchPage.viewEventDetails(${event.id})">
                                View Details
                            </button>
                            <button class="register-btn" onclick="SearchPage.showRegisterModal()">
                                Register
                            </button>
                        </div>
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

    updateSearchInfo(resultCount, filters) {
        if (!this.resultsCount || !this.activeFilters || !this.searchInfo) return;
        
        this.resultsCount.textContent = `Found ${resultCount} events`;
        
        // Show active filters
        this.activeFilters.innerHTML = '';
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value) {
                    const filterTag = document.createElement('div');
                    filterTag.className = 'filter-tag';
                    filterTag.innerHTML = `
                        ${this.getFilterDisplayName(key, value)}
                        <button onclick="SearchPage.removeFilter('${key}')">×</button>
                    `;
                    this.activeFilters.appendChild(filterTag);
                }
            });
        }

        this.searchInfo.classList.remove('hidden');
    }

    getFilterDisplayName(key, value) {
        if (!value) return '';
        
        const displayNames = {
            date: `Date: ${value}`,
            location: `Location: ${value}`,
            category: `Category: ${value}`
        };
        
        if (key === 'category_id') {
            try {
                const optionElement = document.querySelector(`#category-id option[value="${value}"]`);
                const categoryName = optionElement ? optionElement.textContent : value;
                return `Category: ${categoryName}`;
            } catch (error) {
                console.warn('Error getting category name:', error);
                return `Category: ${value}`;
            }
        }
        
        return displayNames[key] || `${key}: ${value}`;
    }

    addResultEventListeners() {
        document.querySelectorAll('.result-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('view-details-btn') && 
                    !e.target.classList.contains('register-btn')) {
                    const eventId = card.getAttribute('data-event-id');
                    SearchPage.viewEventDetails(eventId);
                }
            });
        });
    }

    static removeFilter(filterKey) {
        const searchPage = window.searchPageInstance;
        if (searchPage) {
            const input = document.querySelector(`[name="${filterKey}"]`);
            if (input) {
                input.value = '';
            }
            searchPage.performSearch();
        }
    }

    clearFilters() {
        if (this.searchForm) {
            this.searchForm.reset();
        }
        this.currentFilters = {};
        this.hideMessages();
        this.showInitialMessage();
        if (this.resultsContainer) {
            this.resultsContainer.innerHTML = '';
        }
        if (this.searchInfo) {
            this.searchInfo.classList.add('hidden');
        }
    }

    static viewEventDetails(eventId) {
        if (!eventId) return;
        window.location.href = `/event-details?id=${eventId}`;
    }

    static showRegisterModal() {
        const modal = document.getElementById('register-modal');
        if (modal) {
            modal.style.display = 'block';
        }
    }

    static closeModal() {
        const modal = document.getElementById('register-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    static retrySearch() {
        const searchPage = window.searchPageInstance;
        if (searchPage) {
            searchPage.performSearch();
        }
    }

    showLoading() {
        if (this.loadingMessage) this.loadingMessage.classList.remove('hidden');
        this.hideMessages();
    }

    hideLoading() {
        if (this.loadingMessage) this.loadingMessage.classList.add('hidden');
    }

    showInitialMessage() {
        if (this.initialMessage) this.initialMessage.classList.remove('hidden');
    }

    hideMessages() {
        if (this.initialMessage) this.initialMessage.classList.add('hidden');
        if (this.errorMessage) this.errorMessage.classList.add('hidden');
        if (this.noResults) this.noResults.classList.add('hidden');
    }

    showError(message) {
        if (this.errorMessage) {
            const errorText = this.errorMessage.querySelector('p');
            if (errorText) {
                errorText.textContent = message;
            }
            this.errorMessage.classList.remove('hidden');
        }
        this.hideLoading();
    }

    showNoResults() {
        if (this.noResults) this.noResults.classList.remove('hidden');
        if (this.resultsContainer) this.resultsContainer.innerHTML = '';
        this.hideLoading();
    }
}

// Initialize search page
document.addEventListener('DOMContentLoaded', () => {
    window.searchPageInstance = new SearchPage();
});

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    const modal = document.getElementById('register-modal');
    if (event.target === modal) {
        SearchPage.closeModal();
    }
});