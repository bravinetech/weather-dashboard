// Smart Weather Notifications System
class SmartNotifications {
    constructor() {
        this.notifications = [];
        this.permission = 'default';
        this.checkInterval = null;
        this.lastWeatherData = null;
        
        this.init();
    }

    async init() {
        // Request notification permission
        await this.requestPermission();
        
        // Set up periodic weather checks
        this.startWeatherChecks();
        
        // Set up geolocation monitoring
        this.setupGeolocationMonitoring();
    }

    async requestPermission() {
        if ('Notification' in window) {
            this.permission = await Notification.requestPermission();
            console.log('Notification permission:', this.permission);
        }
    }

    startWeatherChecks() {
        // Check weather every 30 minutes
        this.checkInterval = setInterval(() => {
            this.checkWeatherAlerts();
        }, 30 * 60 * 1000);
    }

    setupGeolocationMonitoring() {
        // Monitor location changes
        if ('geolocation' in navigator) {
            navigator.geolocation.watchPosition(
                (position) => {
                    this.checkLocationChange(position);
                },
                (error) => {
                    console.log('Geolocation error:', error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 300000 // 5 minutes
                }
            );
        }
    }

    checkLocationChange(position) {
        // Check if user moved significantly
        if (this.lastPosition) {
            const distance = this.calculateDistance(
                this.lastPosition.coords.latitude,
                this.lastPosition.coords.longitude,
                position.coords.latitude,
                position.coords.longitude
            );
            
            if (distance > 10) { // Moved more than 10km
                this.showNotification(
                    'Location Changed',
                    'Weather data updated for your new location',
                    'location'
                );
            }
        }
        
        this.lastPosition = position;
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    async checkWeatherAlerts() {
        if (!window.app || !window.app.currentWeatherData) return;
        
        const currentWeather = window.app.currentWeatherData.current;
        const previousWeather = this.lastWeatherData;
        
        // Check for rain alerts
        this.checkRainAlert(currentWeather, previousWeather);
        
        // Check for temperature alerts
        this.checkTemperatureAlert(currentWeather, previousWeather);
        
        // Check for severe weather
        this.checkSevereWeather(currentWeather);
        
        this.lastWeatherData = { ...currentWeather };
    }

    checkRainAlert(current, previous) {
        const currentDesc = current.description.toLowerCase();
        const willRain = currentDesc.includes('rain') || currentDesc.includes('drizzle') || currentDesc.includes('shower');
        
        if (willRain && (!previous || !this.wasRaining(previous))) {
            this.showNotification(
                'Rain Alert! ☔',
                'Rain expected in the next few hours. Don\'t forget your umbrella!',
                'rain',
                { icon: '☔', urgency: 'normal' }
            );
        }
    }

    wasRaining(weather) {
        const desc = weather.description.toLowerCase();
        return desc.includes('rain') || desc.includes('drizzle');
    }

    checkTemperatureAlert(current, previous) {
        const temp = current.temperature;
        const feelsLike = current.feelsLike;
        
        // Extreme heat alert
        if (temp > 35) {
            this.showNotification(
                'Extreme Heat Warning! 🌡️',
                `Temperature is ${temp}°C. Stay hydrated and avoid prolonged sun exposure.`,
                'heat',
                { icon: '🌡️', urgency: 'high' }
            );
        }
        
        // Extreme cold alert
        if (temp < -10) {
            this.showNotification(
                'Extreme Cold Warning! ❄️',
                `Temperature is ${temp}°C. Dress warmly and be cautious of frostbite.`,
                'cold',
                { icon: '❄️', urgency: 'high' }
            );
        }
        
        // Feels like difference
        if (Math.abs(temp - feelsLike) > 5) {
            const direction = feelsLike > temp ? 'warmer' : 'colder';
            this.showNotification(
                'Temperature Note',
                `Feels ${direction} than actual (${feelsLike}°C vs ${temp}°C)`,
                'temperature'
            );
        }
    }

    checkSevereWeather(current) {
        const desc = current.description.toLowerCase();
        const windSpeed = current.windSpeed;
        
        // High wind alert
        if (windSpeed > 10) {
            this.showNotification(
                'High Wind Warning! 💨',
                `Wind speed is ${windSpeed} m/s. Secure loose objects outdoors.`,
                'wind',
                { icon: '💨', urgency: 'normal' }
            );
        }
        
        // Thunderstorm alert
        if (desc.includes('thunder') || desc.includes('storm')) {
            this.showNotification(
                'Thunderstorm Warning! ⛈️',
                'Thunderstorms expected. Seek shelter and avoid outdoor activities.',
                'storm',
                { icon: '⛈️', urgency: 'high' }
            );
        }
        
        // Snow alert
        if (desc.includes('snow')) {
            this.showNotification(
                'Snow Alert! ❄️',
                'Snow expected. Drive carefully and dress warmly.',
                'snow',
                { icon: '❄️', urgency: 'normal' }
            );
        }
    }

    showNotification(title, body, type, options = {}) {
        if (this.permission !== 'granted') return;
        
        const notificationOptions = {
            body: body,
            icon: this.getNotificationIcon(type),
            badge: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
            tag: type,
            requireInteraction: options.urgency === 'high',
            ...options
        };
        
        const notification = new Notification(title, notificationOptions);
        
        // Auto-close after 5 seconds unless urgent
        if (options.urgency !== 'high') {
            setTimeout(() => {
                notification.close();
            }, 5000);
        }
        
        // Handle click
        notification.onclick = () => {
            window.focus();
            notification.close();
        };
        
        // Store notification
        this.notifications.push({
            title,
            body,
            type,
            timestamp: Date.now()
        });
    }

    getNotificationIcon(type) {
        const icons = {
            'rain': 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234FC3F7"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2s2-.9 2-2v-2.18c.57.11 1.16.18 1.79.18.63 0 1.22-.07 1.79-.18V16c0 1.1.9 2 2 2s2-.9 2-2v-1l2.79-4.79c.13.58.21 1.17.21 1.79 0 4.08-3.06 7.44-7 7.93z"/></svg>',
            'temperature': 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23FF8A65"><path d="M15 13V5c0-1.66-1.34-3-3-3S9 3.34 9 5v8c-1.21.91-2 2.37-2 4 0 2.76 2.24 5 5 5s5-2.24 5-5c0-1.63-.79-3.09-2-4zm-4-8c0-.55.45-1 1-1s1 .45 1 1h-1v1h1v2h-1v1h1v2h-1v1h1v1h-2V5z"/></svg>',
            'heat': 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23E57373"><path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h2v-6h2v6h2V9zM7 9H1v13h2v-6h2v6h2V9z"/></svg>',
            'cold': 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234FC3F7"><path d="M22 11h-4.17l3.24-3.24-1.41-1.42L15 11h-2V9l4.66-4.66-1.42-1.41L13 6.17V2h-2v4.17L7.76 2.93 6.34 4.34 11 9v2H9l-4.66-4.66-1.41 1.41L6.17 11H2v2h4.17l-3.24 3.24 1.41 1.42L9 13v2H5v2h4v4h2v-4h4v-2h-4v-2l4.66-4.66 1.42 1.41L19.83 13H22v-2z"/></svg>',
            'wind': 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2381C784"><path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4c-.47 0-.91.1-1.33.25-.31-.62-.74-1.15-1.29-1.53C12.44 2.27 11.24 2 10 2c-2.21 0-4 1.79-4 4s1.79 4 4 4h5zm-8.5 8c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h11c1.38 0 2.5-1.12 2.5-2.5s-1.12-2.5-2.5-2.5h-11z"/></svg>',
            'storm': 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23FFD54F"><path d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>',
            'snow': 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23E1F5FE"><path d="M22 11h-4.17l3.24-3.24-1.41-1.42L15 11h-2V9l4.66-4.66-1.42-1.41L13 6.17V2h-2v4.17L7.76 2.93 6.34 4.34 11 9v2H9l-4.66-4.66-1.41 1.41L6.17 11H2v2h4.17l-3.24 3.24 1.41 1.42L9 13v2H5v2h4v4h2v-4h4v-2h-4v-2l4.66-4.66 1.42 1.41L19.83 13H22v-2z"/></svg>',
            'location': 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234CAF50"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>'
        };
        
        return icons[type] || icons['temperature'];
    }

    getNotificationHistory() {
        return this.notifications;
    }

    clearHistory() {
        this.notifications = [];
    }

    // Custom notification for specific events
    scheduleNotification(title, body, delay, type) {
        setTimeout(() => {
            this.showNotification(title, body, type);
        }, delay);
    }

    // Test notification
    testNotification() {
        this.showNotification(
            'Test Notification',
            'Smart notifications are working!',
            'test',
            { icon: '✅' }
        );
    }

    cleanup() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
    }
}

// Initialize smart notifications
let smartNotifications;

document.addEventListener('DOMContentLoaded', () => {
    smartNotifications = new SmartNotifications();
    window.smartNotifications = smartNotifications;
});
