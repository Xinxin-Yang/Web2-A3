// Global configuration
const API_BASE_URL = 'http://localhost:4000/api';

// Common utility functions
class CharityEventsApp {
    // API request helper with better error handling
    static async apiRequest(endpoint) {
        try {
            console.log(`🔄 Making API request to: ${API_BASE_URL}${endpoint}`);
            
            const response = await fetch(`${API_BASE_URL}${endpoint}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.success && data.success !== undefined) {
                throw new Error(data.message || 'API request failed');
            }
            
            console.log(`✅ API request successful: ${endpoint}`);
            return data;
            
        } catch (error) {
            console.error(`❌ API request failed: ${endpoint}`, error);
            
            // Provide more user-friendly error messages
            if (error.message.includes('Failed to fetch')) {
                throw new Error('无法连接到服务器。请检查：\n1. API服务器是否运行在端口4000\n2. 网络连接是否正常');
            }
            
            throw error;
        }
    }

    // Format date for display
    static formatDate(dateString) {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return '日期未设置';
            }
            return date.toLocaleDateString('en-AU', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Date formatting error:', error);
            return '无效日期';
        }
    }

    // Format currency
    static formatCurrency(amount) {
        try {
            return new Intl.NumberFormat('en-AU', {
                style: 'currency',
                currency: 'AUD'
            }).format(amount);
        } catch (error) {
            console.error('Currency formatting error:', error);
            return `$${amount}`;
        }
    }

    // Calculate progress percentage
    static calculateProgress(current, goal) {
        if (!goal || goal === 0) return 0;
        const progress = Math.min(Math.round((current / goal) * 100), 100);
        return isNaN(progress) ? 0 : progress;
    }

    // Show loading spinner
    static showLoading(element) {
        if (!element) return;
        
        element.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>加载活动中...</p>
            </div>
        `;
    }

    // Show error message
    static showError(element, message) {
        if (!element) return;
        
        element.innerHTML = `
            <div class="error-message">
                <h3>⚠️ 错误</h3>
                <p>${message}</p>
                <button onclick="location.reload()" class="retry-button">重试</button>
            </div>
        `;
    }

    // Get event emoji based on category
    static getEventEmoji(category) {
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

    // Validate if element exists before manipulation
    static safeElementQuery(selector) {
        const element = document.querySelector(selector);
        if (!element) {
            console.warn(`Element not found: ${selector}`);
        }
        return element;
    }

    // Create progress bar HTML
    static createProgressBar(current, goal, showLabels = true) {
        const progress = this.calculateProgress(current, goal);
        
        return `
            <div class="progress-section">
                ${showLabels ? `
                <div class="progress-info">
                    <span>已筹集: ${this.formatCurrency(current)} / ${this.formatCurrency(goal)}</span>
                    <span>${progress}%</span>
                </div>
                ` : ''}
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
            </div>
        `;
    }

    // Debounce function for search inputs
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Format description text (handle line breaks)
    static formatDescription(text) {
        if (!text) return '<p>暂无详细描述</p>';
        
        return text
            .split('\n')
            .filter(paragraph => paragraph.trim())
            .map(paragraph => `<p>${paragraph.trim()}</p>`)
            .join('');
    }

    // Check if event is upcoming
    static isEventUpcoming(dateTime) {
        try {
            const eventDate = new Date(dateTime);
            const now = new Date();
            return eventDate > now;
        } catch (error) {
            console.error('Date comparison error:', error);
            return true;
        }
    }

    // Get ticket type display text
    static getTicketTypeDisplay(ticketType, ticketPrice) {
        if (ticketType === 'free') {
            return '免费';
        } else if (ticketPrice > 0) {
            return this.formatCurrency(ticketPrice);
        } else {
            return '免费';
        }
    }

    // Sanitize HTML (basic protection)
    static sanitizeHTML(str) {
        if (!str) return '';
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    }

    // Get URL parameters
    static getUrlParam(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    // Set URL parameter
    static setUrlParam(name, value) {
        const url = new URL(window.location);
        url.searchParams.set(name, value);
        window.history.pushState({}, '', url);
    }

    // Remove URL parameter
    static removeUrlParam(name) {
        const url = new URL(window.location);
        url.searchParams.delete(name);
        window.history.pushState({}, '', url);
    }

    // Show notification (toast)
    static showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;
        
        // Add styles if not already added
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 20px;
                    border-radius: 8px;
                    color: white;
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    max-width: 400px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    animation: slideIn 0.3s ease-out;
                }
                .notification-info { background: #667eea; }
                .notification-success { background: #28a745; }
                .notification-warning { background: #ffc107; color: #333; }
                .notification-error { background: #dc3545; }
                .notification button {
                    background: none;
                    border: none;
                    color: inherit;
                    font-size: 18px;
                    cursor: pointer;
                    padding: 0;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    // Validate email format
    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Format file size
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Copy text to clipboard
    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showNotification('已复制到剪贴板', 'success');
            return true;
        } catch (err) {
            console.error('Failed to copy text: ', err);
            this.showNotification('复制失败', 'error');
            return false;
        }
    }

    // Get current year for copyright
    static getCurrentYear() {
        return new Date().getFullYear();
    }

    // Check if mobile device
    static isMobile() {
        return window.innerWidth <= 768;
    }

    // Add loading state to button
    static setButtonLoading(button, isLoading) {
        if (!button) return;
        
        if (isLoading) {
            button.disabled = true;
            button.dataset.originalText = button.textContent;
            button.innerHTML = '<div class="button-spinner"></div> 加载中...';
        } else {
            button.disabled = false;
            button.textContent = button.dataset.originalText || button.textContent;
        }
    }
}

// Navigation functionality
class Navigation {
    static init() {
        try {
            const currentPage = window.location.pathname.split('/').pop() || 'home.html';
            const navLinks = document.querySelectorAll('nav a');
            
            navLinks.forEach(link => {
                const linkPage = link.getAttribute('href').split('/').pop();
                if (linkPage === currentPage || (currentPage === '' && linkPage === 'home.html')) {
                    link.classList.add('active');
                }
            });
        } catch (error) {
            console.error('Navigation initialization error:', error);
        }
    }

    // Update active navigation link
    static updateActiveNav(activePage) {
        const navLinks = document.querySelectorAll('nav a');
        navLinks.forEach(link => {
            link.classList.remove('active');
            const linkPage = link.getAttribute('href').split('/').pop();
            if (linkPage === activePage) {
                link.classList.add('active');
            }
        });
    }

    // Smooth scroll to element
    static scrollToElement(elementId, offset = 80) {
        const element = document.getElementById(elementId);
        if (element) {
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }

    // Add scroll to top button
    static addScrollToTopButton() {
        const scrollButton = document.createElement('button');
        scrollButton.id = 'scroll-to-top';
        scrollButton.innerHTML = '↑';
        scrollButton.title = '回到顶部';
        
        // Add styles
        const styles = document.createElement('style');
        styles.textContent = `
            #scroll-to-top {
                position: fixed;
                bottom: 30px;
                right: 30px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: #667eea;
                color: white;
                border: none;
                cursor: pointer;
                font-size: 20px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                transition: all 0.3s ease;
                z-index: 1000;
                display: none;
            }
            #scroll-to-top:hover {
                background: #5a6fd8;
                transform: translateY(-2px);
            }
            #scroll-to-top.show {
                display: block;
            }
        `;
        document.head.appendChild(styles);
        
        document.body.appendChild(scrollButton);

        // Show/hide button based on scroll position
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollButton.classList.add('show');
            } else {
                scrollButton.classList.remove('show');
            }
        });

        // Scroll to top when clicked
        scrollButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Global event handlers
class GlobalHandlers {
    static init() {
        // Handle external links
        this.handleExternalLinks();
        
        // Add global error handler
        this.addGlobalErrorHandler();
        
        // Handle page visibility changes
        this.handlePageVisibility();
    }

    static handleExternalLinks() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href && link.hostname !== window.location.hostname) {
                e.preventDefault();
                window.open(link.href, '_blank');
            }
        });
    }

    static addGlobalErrorHandler() {
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
        });
    }

    static handlePageVisibility() {
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                // Page became visible again
                document.title = document.title.replace('⏸️ ', '');
            } else {
                // Page became hidden
                document.title = '⏸️ ' + document.title;
            }
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    Navigation.init();
    GlobalHandlers.init();
    
    // Add scroll to top button to all pages except event details
    if (!window.location.pathname.includes('event-details')) {
        Navigation.addScrollToTopButton();
    }
    
    console.log('🚀 Charity Events App initialized');
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CharityEventsApp, Navigation, GlobalHandlers };
}