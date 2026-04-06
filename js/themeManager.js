// Theme Manager for Dark/Light Mode Toggle
class ThemeManager {
    constructor() {
        this.currentTheme = 'dark';
        this.themeToggleBtn = document.getElementById('theme-toggle-btn');
        this.themeIcon = document.querySelector('.theme-icon');
        
        this.init();
    }

    init() {
        // Load saved theme preference
        this.loadSavedTheme();
        
        // Set up event listener
        if (this.themeToggleBtn) {
            this.themeToggleBtn.addEventListener('click', () => this.toggleTheme());
        }
        
        // Auto theme based on time (optional)
        this.setupAutoTheme();
    }

    loadSavedTheme() {
        const savedTheme = localStorage.getItem('weather-dashboard-theme');
        if (savedTheme) {
            this.currentTheme = savedTheme;
            this.applyTheme();
        } else {
            // Default to dark mode
            this.applyTheme();
        }
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme();
        this.saveTheme();
        
        // Add animation class
        document.body.classList.add('theme-transitioning');
        setTimeout(() => {
            document.body.classList.remove('theme-transitioning');
        }, 300);
    }

    applyTheme() {
        const body = document.body;
        
        if (this.currentTheme === 'light') {
            body.classList.add('light-mode');
            body.classList.remove('dark-mode');
            if (this.themeIcon) {
                this.themeIcon.textContent = '☀️';
            }
        } else {
            body.classList.add('dark-mode');
            body.classList.remove('light-mode');
            if (this.themeIcon) {
                this.themeIcon.textContent = '🌙';
            }
        }
        
        // Update weather animations for theme
        this.updateWeatherAnimations();
    }

    saveTheme() {
        localStorage.setItem('weather-dashboard-theme', this.currentTheme);
    }

    setupAutoTheme() {
        // Optional: Auto-switch based on time of day
        const hour = new Date().getHours();
        const autoTheme = localStorage.getItem('weather-dashboard-auto-theme');
        
        if (autoTheme === 'true') {
            if (hour >= 6 && hour < 18) {
                this.currentTheme = 'light';
            } else {
                this.currentTheme = 'dark';
            }
            this.applyTheme();
        }
    }

    updateWeatherAnimations() {
        // Update weather animation colors based on theme
        if (window.weatherAnimations) {
            const canvas = document.getElementById('weatherCanvas');
            if (canvas) {
                if (this.currentTheme === 'light') {
                    canvas.style.opacity = '0.5';
                } else {
                    canvas.style.opacity = '0.7';
                }
            }
        }
    }

    // Public method to get current theme
    getCurrentTheme() {
        return this.currentTheme;
    }

    // Public method to set theme programmatically
    setTheme(theme) {
        if (theme === 'dark' || theme === 'light') {
            this.currentTheme = theme;
            this.applyTheme();
            this.saveTheme();
        }
    }

    // Enable/disable auto theme
    setAutoTheme(enabled) {
        localStorage.setItem('weather-dashboard-auto-theme', enabled.toString());
        if (enabled) {
            this.setupAutoTheme();
        }
    }
}

// Initialize theme manager
let themeManager;

document.addEventListener('DOMContentLoaded', () => {
    themeManager = new ThemeManager();
    
    // Make it globally accessible
    window.themeManager = themeManager;
});

// Add CSS transition for theme switching
const style = document.createElement('style');
style.textContent = `
    body.theme-transitioning * {
        transition: background 0.3s ease, color 0.3s ease, border-color 0.3s ease !important;
    }
`;
document.head.appendChild(style);
