// Main Application Controller
class WeatherApp {
    constructor() {
        this.weatherAPI = new WeatherAPI();
        this.mapManager = new MapManager();
        this.uiManager = new UIManager();
        this.currentWeatherData = null;
        this.currentCoordinates = null;
        this.refreshInterval = null;
        
        this.init();
    }

    // Initialize the application
    async init() {
        try {
            // Show loading
            this.uiManager.showLoading('Initializing weather dashboard...');

            // Initialize map
            const mapInitialized = this.mapManager.initMap();
            if (!mapInitialized) {
                throw new Error('Failed to initialize map');
            }

            // Add map controls
            this.mapManager.addScaleControl();
            this.mapManager.addZoomControl();
            this.mapManager.addFullscreenControl();

            // Set up event handlers
            this.setupEventHandlers();

            // Try to get user's location, but don't wait if it fails
            try {
                await this.getUserLocation();
            } catch (geoError) {
                console.log('Geolocation failed, using default location:', geoError.message);
                await this.loadDefaultLocation();
            }

            // Set up auto-refresh
            this.setupAutoRefresh();

            // Update date/time every minute
            this.setupDateTimeUpdate();

            // Hide loading
            this.uiManager.hideLoading();

            console.log('Weather Dashboard initialized successfully');
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.uiManager.hideLoading();
            this.uiManager.showError(error.message);
            
            // Fallback to default location
            await this.loadDefaultLocation();
        }
    }

    // Setup event handlers
    setupEventHandlers() {
        // Search button click
        this.uiManager.elements.searchBtn.addEventListener('click', () => {
            const query = this.uiManager.getSearchQuery();
            if (query) {
                this.searchLocation(query);
            }
        });

        // Search input enter key
        this.uiManager.elements.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = this.uiManager.getSearchQuery();
                if (query) {
                    this.searchLocation(query);
                }
            }
        });

        // Geolocation button click
        this.uiManager.elements.locationBtn.addEventListener('click', () => {
            this.getUserLocation().catch(error => {
                console.error('Geolocation failed:', error);
                this.uiManager.showError('Geolocation failed. Please search manually.');
            });
        });

        // Features button click
        const featuresBtn = document.getElementById('features-btn');
        if (featuresBtn) {
            featuresBtn.addEventListener('click', () => {
                this.showFeaturesPanel();
            });
        }
    }

    // Get user's geolocation
    async getUserLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    await this.updateWeatherByCoordinates(latitude, longitude);
                    resolve();
                },
                (error) => {
                    // Reject silently and fall back to default location
                    reject(error);
                },
                {
                    timeout: CONFIG.APP.GEOLOCATION_TIMEOUT,
                    enableHighAccuracy: true
                }
            );
        });
    }

    // Load default location
    async loadDefaultLocation() {
        try {
            const defaultLat = CONFIG.MAP.DEFAULT_CENTER[0];
            const defaultLon = CONFIG.MAP.DEFAULT_CENTER[1];
            await this.updateWeatherByCoordinates(defaultLat, defaultLon);
        } catch (error) {
            console.error('Failed to load default location:', error);
            this.uiManager.showError('Failed to load weather data. Please try searching for a location.');
        }
    }

    // Update weather by coordinates
    async updateWeatherByCoordinates(lat, lon) {
        try {
            this.uiManager.showLoading('Loading weather data...');

            // Store current coordinates
            this.currentCoordinates = { lat, lon };

            // Fetch weather data in parallel
            const [currentWeather, forecast] = await Promise.all([
                this.weatherAPI.getWeatherByCoords(lat, lon),
                this.weatherAPI.getForecastByCoords(lat, lon)
            ]);

            // Store current weather data
            this.currentWeatherData = {
                location: {
                    name: currentWeather.city,
                    lat: lat,
                    lon: lon
                },
                current: currentWeather
            };

            // Update UI components
            this.uiManager.updateCurrentWeather(currentWeather);
            this.uiManager.updateForecast(forecast);
            this.uiManager.updateHourlyForecast(forecast.list || []);
            this.uiManager.updateAIInsights(currentWeather);

            // Update weather animations
            if (window.weatherAnimations) {
                window.weatherAnimations.updateWeather(currentWeather);
            }

            // Update weather sounds
            if (window.weatherSounds) {
                window.weatherSounds.updateWeatherSounds(currentWeather);
            }

            // Update 3D globe
            if (window.weatherGlobe) {
                window.weatherGlobe.clearMarkers();
                window.weatherGlobe.addWeatherMarker(lat, lon, currentWeather);
                window.weatherGlobe.show(); // Make sure globe is visible
            }

            // Update real-time displays
            this.updateRealTimeDisplays(currentWeather, forecast);

            // Update map
            this.mapManager.setView(lat, lon);
            this.mapManager.updateWeatherMarker(lat, lon, this.currentWeatherData);

            // Update search input with location name
            this.uiManager.setSearchValue(currentWeather.city);

            this.uiManager.hideLoading();
        } catch (error) {
            console.error('Failed to update weather:', error);
            this.uiManager.hideLoading();
            this.uiManager.showError(error.message);
        }
    }

    // Search for location by name
    async searchLocation(locationName) {
        try {
            this.uiManager.showLoading(`Searching for ${locationName}...`);

            // Get coordinates for the location
            const coordinates = await this.weatherAPI.searchCities(locationName);
            if (coordinates.length === 0) {
                throw new Error('Location not found');
            }

            // Update weather for the found coordinates
            await this.updateWeatherByCoordinates(coordinates[0].lat, coordinates[0].lon);
            

            this.uiManager.hideLoading();
        } catch (error) {
            console.error('Search failed:', error);
            this.uiManager.hideLoading();
            this.uiManager.showError(error.message);
        }
    }

    // Setup auto-refresh
    setupAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }

        this.refreshInterval = setInterval(async () => {
            if (this.currentCoordinates) {
                try {
                    // Silent refresh without showing loading
                    await this.updateWeatherByCoordinates(
                        this.currentCoordinates.lat,
                        this.currentCoordinates.lon
                    );
                } catch (error) {
                    console.error('Auto-refresh failed:', error);
                }
            }
        }, CONFIG.APP.REFRESH_INTERVAL);
    }

    // Setup date/time update
    setupDateTimeUpdate() {
        // Update immediately
        this.uiManager.updateDateTime();

        // Update every minute
        setInterval(() => {
            this.uiManager.updateDateTime();
        }, 60000);
    }

    // Handle keyboard shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K for search focus
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.uiManager.elements.searchInput.focus();
            }

            // Escape to clear search
            if (e.key === 'Escape') {
                this.uiManager.clearSearch();
                this.uiManager.elements.searchInput.blur();
            }

            // Enter to search when search is focused
            if (e.key === 'Enter' && document.activeElement === this.uiManager.elements.searchInput) {
                this.searchLocation(this.uiManager.getSearchQuery());
            }
        });
    }

    // Handle online/offline status
    setupNetworkStatus() {
        window.addEventListener('online', () => {
            this.uiManager.hideError();
            if (this.currentCoordinates) {
                this.updateWeatherByCoordinates(
                    this.currentCoordinates.lat,
                    this.currentCoordinates.lon
                );
            }
        });

        window.addEventListener('offline', () => {
            this.uiManager.showError('You are offline. Weather data may not be current.');
        });
    }

    // Handle visibility change (pause refresh when tab is not visible)
    setupVisibilityChange() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Pause auto-refresh when tab is hidden
                if (this.refreshInterval) {
                    clearInterval(this.refreshInterval);
                    this.refreshInterval = null;
                }
            } else {
                // Resume auto-refresh when tab is visible
                this.setupAutoRefresh();
            }
        });
    }

    // Export weather data
    exportWeatherData() {
        if (!this.currentWeatherData) {
            this.uiManager.showError('No weather data available to export');
            return;
        }

        const exportData = {
            location: this.currentWeatherData.location,
            current: this.currentWeatherData.current,
            timestamp: new Date().toISOString(),
            exportedBy: 'Weather Dashboard'
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `weather-${this.currentWeatherData.location.name}-${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    // Share weather data
    shareWeatherData() {
        if (!this.currentWeatherData) {
            this.uiManager.showError('No weather data available to share');
            return;
        }

        const { location, current } = this.currentWeatherData;
        const shareText = `Weather in ${location.name}: ${current.temperature}°C, ${current.description}. Feels like ${current.feelsLike}°C.`;

        if (navigator.share) {
            navigator.share({
                title: 'Weather Dashboard',
                text: shareText,
                url: window.location.href
            }).catch(error => {
                console.log('Share cancelled or failed:', error);
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(shareText).then(() => {
                this.uiManager.showError('Weather info copied to clipboard!');
            }).catch(() => {
                this.uiManager.showError('Failed to copy weather info');
            });
        }
    }

    // Get weather statistics
    getWeatherStatistics() {
        if (!this.currentWeatherData) {
            return null;
        }

        const { current } = this.currentWeatherData;
        
        return {
            temperature: current.temperature,
            feelsLike: current.feelsLike,
            humidity: current.humidity,
            windSpeed: current.windSpeed,
            pressure: current.pressure,
            visibility: current.visibility,
            uvIndex: current.uvIndex,
            description: current.description,
            location: this.currentWeatherData.location.name
        };
    }

    // Cleanup resources
    cleanup() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        
        if (this.mapManager) {
            this.mapManager.destroy();
        }
        
        if (this.weatherAPI) {
            this.weatherAPI.clearCache();
        }

        // Cleanup other features
        if (window.weatherAnimations) {
            window.weatherAnimations.stopAnimation();
        }
        
        if (window.weatherSounds) {
            window.weatherSounds.cleanup();
        }
        
        if (window.smartNotifications) {
            window.smartNotifications.cleanup();
        }
    }

    // Show features panel
    showFeaturesPanel() {
        if (window.weatherWidgets) {
            window.weatherWidgets.showWidgetPanel();
        }
    }

    // Test features
    testNotifications() {
        if (window.smartNotifications) {
            window.smartNotifications.testNotification();
        }
    }

    testSounds() {
        if (window.weatherSounds) {
            window.weatherSounds.testSound('rain');
        }
    }

    toggleGlobe() {
        if (window.weatherGlobe) {
            window.weatherGlobe.toggle();
        }
    }

    // Update real-time displays for all weather components
    updateRealTimeDisplays(currentWeather, forecast) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        });
        const dateString = now.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        // Update current weather time
        this.updateCurrentWeatherTime(currentWeather, timeString, dateString);
        
        // Update forecast times
        this.updateForecastTimes(forecast, now);
        
        // Update hourly forecast times
        this.updateHourlyForecastTimes(forecast.list || [], now);
        
        // Update widgets with real-time data
        this.updateWidgetsRealTime(currentWeather, timeString);
    }

    updateCurrentWeatherTime(currentWeather, timeString, dateString) {
        // Add time display to current weather section
        const timeElement = document.getElementById('current-time');
        const dateElement = document.getElementById('current-date');
        
        if (timeElement) {
            timeElement.textContent = timeString;
        } else {
            // Create time element if it doesn't exist
            const locationInfo = document.querySelector('.location-info');
            if (locationInfo) {
                const timeDiv = document.createElement('div');
                timeDiv.id = 'current-time';
                timeDiv.className = 'current-time';
                timeDiv.innerHTML = `<strong>Local Time:</strong> ${timeString}`;
                locationInfo.appendChild(timeDiv);
            }
        }
        
        if (dateElement) {
            dateElement.textContent = dateString;
        } else {
            // Create date element if it doesn't exist
            const locationInfo = document.querySelector('.location-info');
            if (locationInfo) {
                const dateDiv = document.createElement('div');
                dateDiv.id = 'current-date';
                dateDiv.className = 'current-date';
                dateDiv.innerHTML = `<strong>Date:</strong> ${dateString}`;
                locationInfo.appendChild(dateDiv);
            }
        }
    }

    updateForecastTimes(forecast, now) {
        // Update 7-day forecast with day names and times
        const forecastCards = document.querySelectorAll('.forecast-card');
        forecastCards.forEach((card, index) => {
            if (forecast[index]) {
                const forecastDate = new Date(forecast[index].date);
                const dayName = forecastDate.toLocaleDateString('en-US', { weekday: 'long' });
                const dateNum = forecastDate.toLocaleDateString('en-US', { day: 'numeric' });
                const month = forecastDate.toLocaleDateString('en-US', { month: 'short' });
                
                // Update date in card
                const dateElement = card.querySelector('.forecast-date');
                if (dateElement) {
                    dateElement.innerHTML = `${dayName}<br>${month} ${dateNum}`;
                }
            }
        });
    }

    updateHourlyForecastTimes(forecastList, now) {
        // Update hourly forecast with relative times
        const hourlyItems = document.querySelectorAll('.hourly-item');
        hourlyItems.forEach((item, index) => {
            if (forecastList[index]) {
                const forecastTime = new Date(forecastList[index].dt * 1000);
                const timeString = forecastTime.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });
                
                // Update time in hourly item
                const timeElement = item.querySelector('.hourly-time');
                if (timeElement) {
                    timeElement.textContent = timeString;
                }
            }
        });
    }

    updateWidgetsRealTime(currentWeather, timeString) {
        // Update all widgets with current time
        if (window.weatherWidgets) {
            const currentWidgets = window.weatherWidgets.widgets.filter(w => w.type === 'current');
            currentWidgets.forEach(widget => {
                const timeElement = widget.element.querySelector('.widget-time');
                if (timeElement) {
                    timeElement.textContent = timeString;
                } else {
                    // Add time to widget
                    const content = widget.element.querySelector('.widget-content');
                    if (content) {
                        const timeDiv = document.createElement('div');
                        timeDiv.className = 'widget-time';
                        timeDiv.innerHTML = `<small>Updated: ${timeString}</small>`;
                        content.appendChild(timeDiv);
                    }
                }
            });
        }
    }

    // Get app version info
    getVersion() {
        return {
            version: '1.0.0',
            name: 'Weather Dashboard',
            description: 'Real-time weather tracking application',
            api: 'OpenWeatherMap',
            features: [
                'Current weather',
                '7-day forecast',
                'Hourly forecast',
                'Interactive maps',
                'Weather alerts',
                'Geolocation',
                'Location search'
            ]
        };
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Make app globally accessible
    window.app = new WeatherApp();
    
    // Setup additional features
    window.app.setupKeyboardShortcuts();
    window.app.setupNetworkStatus();
    window.app.setupVisibilityChange();
    
    // Add global functions for debugging
    window.weatherDebug = {
        exportData: () => window.app.exportWeatherData(),
        shareData: () => window.app.shareWeatherData(),
        getStats: () => window.app.getWeatherStatistics(),
        getVersion: () => window.app.getVersion(),
        clearCache: () => window.app.weatherAPI.clearCache(),
        refresh: () => {
            if (window.app.currentCoordinates) {
                window.app.updateWeatherByCoordinates(
                    window.app.currentCoordinates.lat,
                    window.app.currentCoordinates.lon
                );
            }
        }
    };
    
    console.log('Weather Dashboard loaded. Type weatherDebug in console for debug options.');
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.app) {
        window.app.cleanup();
    }
});
