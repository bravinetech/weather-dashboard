// Multiple Locations Manager
class MultiLocationManager {
    constructor() {
        this.locations = [];
        this.currentLocationIndex = 0;
        this.maxLocations = 5;
        this.storageKey = 'weather-locations';
        
        this.init();
    }

    init() {
        this.loadSavedLocations();
        this.createLocationInterface();
        this.setupEventListeners();
    }

    loadSavedLocations() {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
            this.locations = JSON.parse(saved);
        }
    }

    saveLocations() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.locations));
    }

    createLocationInterface() {
        // Create multi-location section
        const locationSection = document.createElement('section');
        locationSection.className = 'multi-location';
        locationSection.innerHTML = `
            <div class="location-header">
                <h2>📍 Multiple Locations</h2>
                <div class="location-controls">
                    <button class="location-btn" id="add-location">+ Add Location</button>
                    <button class="location-btn" id="compare-mode">📊 Compare</button>
                </div>
            </div>
            <div class="location-grid" id="location-grid">
                <!-- Location cards will be inserted here -->
            </div>
            <div class="location-comparison" id="location-comparison" style="display: none;">
                <h3>📊 Location Comparison</h3>
                <div class="comparison-grid" id="comparison-grid">
                    <!-- Comparison data will be inserted here -->
                </div>
            </div>
        `;

        // Insert after current weather section
        const currentWeather = document.querySelector('.current-weather');
        if (currentWeather) {
            currentWeather.parentNode.insertBefore(locationSection, currentWeather.nextSibling);
        } else {
            document.querySelector('.main .container').appendChild(locationSection);
        }

        this.locationGrid = document.getElementById('location-grid');
        this.comparisonSection = document.getElementById('location-comparison');
        this.comparisonGrid = document.getElementById('comparison-grid');
        
        this.renderLocationCards();
    }

    setupEventListeners() {
        // Add location button
        document.getElementById('add-location').addEventListener('click', () => {
            this.showAddLocationDialog();
        });

        // Compare mode button
        document.getElementById('compare-mode').addEventListener('click', () => {
            this.toggleComparisonMode();
        });
    }

    addLocation(cityName, coordinates, weatherData) {
        if (this.locations.length >= this.maxLocations) {
            this.showNotification('Maximum locations reached', `You can only track ${this.maxLocations} locations at once.`);
            return false;
        }

        const location = {
            id: Date.now(),
            name: cityName,
            coordinates: coordinates,
            weatherData: weatherData,
            lastUpdated: new Date().toISOString()
        };

        this.locations.push(location);
        this.saveLocations();
        this.renderLocationCards();
        this.showNotification('Location added', `${cityName} added to your locations.`);
        return true;
    }

    removeLocation(locationId) {
        this.locations = this.locations.filter(loc => loc.id !== locationId);
        this.saveLocations();
        this.renderLocationCards();
    }

    updateLocationWeather(locationId, weatherData, forecast) {
        const location = this.locations.find(loc => loc.id === locationId);
        if (location) {
            location.weatherData = weatherData;
            location.lastUpdated = new Date().toISOString();
            this.saveLocations();
            this.updateLocationCard(locationId);
        }
    }

    renderLocationCards() {
        if (!this.locationGrid) return;

        this.locationGrid.innerHTML = '';

        this.locations.forEach((location, index) => {
            const card = this.createLocationCard(location, index);
            this.locationGrid.appendChild(card);
        });
    }

    createLocationCard(location, index) {
        const card = document.createElement('div');
        card.className = 'location-card';
        card.dataset.locationId = location.id;
        
        const isActive = index === this.currentLocationIndex;
        const weather = location.weatherData;
        
        card.innerHTML = `
            <div class="location-card-header ${isActive ? 'active' : ''}">
                <h3>${location.name}</h3>
                <div class="location-actions">
                    <button class="mini-btn" onclick="window.multiLocationManager.switchToLocation(${index})">View</button>
                    <button class="mini-btn danger" onclick="window.multiLocationManager.removeLocation(${location.id})">×</button>
                </div>
            </div>
            <div class="location-weather">
                ${weather ? this.createWeatherHTML(weather) : '<div class="loading">Loading...</div>'}
            </div>
            <div class="location-footer">
                <small>Updated: ${this.formatTime(location.lastUpdated)}</small>
            </div>
        `;

        return card;
    }

    createWeatherHTML(weather) {
        return `
            <div class="mini-weather">
                <div class="mini-temp">${weather.temperature || weather.temp}°C</div>
                <div class="mini-desc">${weather.description || weather.weather?.[0]?.description || 'Unknown'}</div>
                <div class="mini-details">
                    <span>💧 ${weather.humidity || 0}%</span>
                    <span>💨 ${weather.windSpeed || 0} m/s</span>
                </div>
            </div>
        `;
    }

    updateLocationCard(locationId) {
        const card = document.querySelector(`[data-location-id="${locationId}"]`);
        if (card) {
            const location = this.locations.find(loc => loc.id === locationId);
            const weatherDiv = card.querySelector('.location-weather');
            if (weatherDiv && location.weatherData) {
                weatherDiv.innerHTML = this.createWeatherHTML(location.weatherData);
            }
            
            const footer = card.querySelector('.location-footer small');
            if (footer) {
                footer.textContent = `Updated: ${this.formatTime(location.lastUpdated)}`;
            }
        }
    }

    switchToLocation(index) {
        if (index >= 0 && index < this.locations.length) {
            this.currentLocationIndex = index;
            const location = this.locations[index];
            
            // Update main app with this location's weather
            if (window.app && location.coordinates) {
                window.app.updateWeatherByCoordinates(
                    location.coordinates.lat,
                    location.coordinates.lon
                );
            }
            
            this.renderLocationCards();
            this.showNotification('Location switched', `Now viewing ${location.name}`);
        }
    }

    toggleComparisonMode() {
        const isComparing = this.comparisonSection.style.display !== 'none';
        
        if (isComparing) {
            this.comparisonSection.style.display = 'none';
        } else {
            this.showComparisonMode();
        }
    }

    showComparisonMode() {
        this.comparisonSection.style.display = 'block';
        this.renderComparisonGrid();
    }

    renderComparisonGrid() {
        if (!this.comparisonGrid) return;

        this.comparisonGrid.innerHTML = '';

        const locationsWithData = this.locations.filter(loc => loc.weatherData);
        
        if (locationsWithData.length < 2) {
            this.comparisonGrid.innerHTML = '<p>Add at least 2 locations to compare</p>';
            return;
        }

        // Create comparison table
        const comparisonHTML = `
            <div class="comparison-table">
                <div class="comparison-row header">
                    <div>Location</div>
                    <div>Temperature</div>
                    <div>Humidity</div>
                    <div>Wind Speed</div>
                    <div>Conditions</div>
                </div>
                ${locationsWithData.map(location => `
                    <div class="comparison-row">
                        <div class="location-name">${location.name}</div>
                        <div>${location.weatherData.temperature || location.weatherData.temp}°C</div>
                        <div>${location.weatherData.humidity || 0}%</div>
                        <div>${location.weatherData.windSpeed || 0} m/s</div>
                        <div>${location.weatherData.description || location.weatherData.weather?.[0]?.description || 'Unknown'}</div>
                    </div>
                `).join('')}
            </div>
        `;

        this.comparisonGrid.innerHTML = comparisonHTML;
    }

    showAddLocationDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'location-dialog';
        dialog.innerHTML = `
            <div class="dialog-content">
                <h3>Add New Location</h3>
                <div class="form-group">
                    <label>City Name:</label>
                    <input type="text" id="new-city-name" placeholder="e.g., London, Tokyo, New York">
                </div>
                <div class="form-actions">
                    <button class="btn primary" id="confirm-add-location">Add Location</button>
                    <button class="btn secondary" id="cancel-add-location">Cancel</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        // Setup dialog events
        document.getElementById('confirm-add-location').addEventListener('click', () => {
            const cityName = document.getElementById('new-city-name').value.trim();
            if (cityName) {
                this.searchAndAddLocation(cityName);
            }
        });

        document.getElementById('cancel-add-location').addEventListener('click', () => {
            dialog.remove();
        });

        // Close on outside click
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                dialog.remove();
            }
        });
    }

    async searchAndAddLocation(cityName) {
        try {
            if (window.app && window.app.weatherAPI) {
                const coordinates = await window.app.weatherAPI.searchCities(cityName);
                if (coordinates.length > 0) {
                    const coord = coordinates[0];
                    const weatherData = await window.app.weatherAPI.getWeatherByCoords(coord.lat, coord.lon);
                    const forecastData = await window.app.weatherAPI.getForecastByCoords(coord.lat, coord.lon);
                    
                    this.addLocation(cityName, coord, weatherData);
                    
                    // Update the new location with full data
                    setTimeout(() => {
                        this.updateLocationWeather(
                            this.locations[this.locations.length - 1].id,
                            weatherData,
                            forecastData
                        );
                    }, 100);
                } else {
                    this.showNotification('Location not found', `Could not find "${cityName}"`);
                }
            }
        } catch (error) {
            console.error('Error adding location:', error);
            this.showNotification('Error', 'Failed to add location');
        }
    }

    showNotification(title, message) {
        if (window.smartNotifications) {
            window.smartNotifications.showNotification(title, message, 'location');
        }
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            month: 'short',
            day: 'numeric'
        });
    }

    // Public methods
    getCurrentLocation() {
        return this.locations[this.currentLocationIndex] || null;
    }

    getAllLocations() {
        return this.locations;
    }

    refreshAllLocations() {
        this.locations.forEach(async (location) => {
            try {
                if (location.coordinates && window.app && window.app.weatherAPI) {
                    const weatherData = await window.app.weatherAPI.getWeatherByCoords(
                        location.coordinates.lat,
                        location.coordinates.lon
                    );
                    const forecastData = await window.app.weatherAPI.getForecastByCoords(
                        location.coordinates.lat,
                        location.coordinates.lon
                    );
                    
                    this.updateLocationWeather(location.id, weatherData, forecastData);
                }
            } catch (error) {
                console.error(`Error refreshing ${location.name}:`, error);
            }
        });
    }
}

// Initialize multi-location manager
let multiLocationManager;

document.addEventListener('DOMContentLoaded', () => {
    multiLocationManager = new MultiLocationManager();
    window.multiLocationManager = multiLocationManager;
});
