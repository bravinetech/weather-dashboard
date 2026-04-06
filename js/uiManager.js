// UI Management module
class UIManager {
    constructor() {
        this.elements = this.initializeElements();
        this.weatherAPI = null;
    }

    initializeElements() {
        return {
            // Current weather elements
            cityName: document.getElementById('city-name'),
            temperature: document.getElementById('temperature'),
            feelsLike: document.getElementById('feels-like'),
            weatherDesc: document.getElementById('weather-desc'),
            weatherIcon: document.getElementById('weather-icon'),
            humidity: document.getElementById('humidity'),
            windSpeed: document.getElementById('wind-speed'),
            pressure: document.getElementById('pressure'),
            visibility: document.getElementById('visibility'),
            clouds: document.getElementById('clouds'),
            
            // Forecast elements
            forecastContainer: document.getElementById('forecast-container'),
            
            // Search elements
            searchInput: document.getElementById('search-input'),
            searchBtn: document.getElementById('search-btn'),
            locationBtn: document.getElementById('location-btn'),
            
            // Loading and error
            loadingOverlay: document.getElementById('loadingOverlay'),
            errorMessage: document.getElementById('errorMessage'),
            
            // Last updated
            lastUpdated: document.getElementById('last-updated'),
            
            // AI Insights elements
            insightIcon: document.getElementById('insight-icon'),
            insightTitle: document.getElementById('insight-title'),
            insightDescription: document.getElementById('insight-description'),
            scoreFill: document.getElementById('score-fill'),
            scoreValue: document.getElementById('score-value'),
            insightRecommendations: document.getElementById('insight-recommendations')
        };
    }

    updateHourlyForecast(forecasts) {
        const hourlyContainer = document.getElementById('hourly-forecast');
        if (!hourlyContainer || !forecasts) return;
        
        hourlyContainer.innerHTML = '';
        
        // Handle different data structures
        let hourlyData = [];
        if (forecasts.list && Array.isArray(forecasts.list)) {
            hourlyData = forecasts.list.slice(0, 24);
        } else if (Array.isArray(forecasts)) {
            hourlyData = forecasts.slice(0, 24);
        }
        
        hourlyData.forEach(hour => {
            const hourCard = document.createElement('div');
            hourCard.className = 'hourly-card';
            
            const time = new Date(hour.dt * 1000);
            const timeStr = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            const icon = CONFIG.WEATHER_ICONS[hour.weather[0].icon] || '🌡️';
            
            hourCard.innerHTML = `
                <div class="hourly-time">${timeStr}</div>
                <div class="hourly-icon">${icon}</div>
                <div class="hourly-temp">${Math.round(hour.main.temp)}°</div>
            `;
            
            hourlyContainer.appendChild(hourCard);
        });
    }

    updateAlerts(alerts) {
        const alertsSection = document.getElementById('alertsSection');
        const alertsList = document.getElementById('alertsList');
        
        if (!alertsSection || !alertsList) return;
        
        if (!alerts || alerts.length === 0) {
            alertsSection.style.display = 'none';
            return;
        }
        
        alertsList.innerHTML = '';
        alertsSection.style.display = 'block';
        
        alerts.forEach(alert => {
            const alertDiv = document.createElement('div');
            alertDiv.className = `alert alert-${CONFIG.ALERT_TYPES[alert.event] || 'info'}`;
            
            alertDiv.innerHTML = `
                <div class="alert-title">${alert.event}</div>
                <div class="alert-description">${alert.description}</div>
                <div class="alert-time">${new Date(alert.start * 1000).toLocaleString()} - ${new Date(alert.end * 1000).toLocaleString()}</div>
            `;
            
            alertsList.appendChild(alertDiv);
        });
    }

    updateDateTime() {
        const dateTimeElement = document.getElementById('currentDateTime');
        if (dateTimeElement) {
            const now = new Date();
            dateTimeElement.textContent = now.toLocaleString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        }
    }

    setSearchValue(value) {
        if (this.elements.searchInput) {
            this.elements.searchInput.value = value;
        }
    }

    showLoading(message = 'Loading...') {
        if (this.elements.loadingOverlay) {
            this.elements.loadingOverlay.classList.remove('hidden');
        }
    }

    hideLoading() {
        if (this.elements.loadingOverlay) {
            this.elements.loadingOverlay.classList.add('hidden');
        }
    }

    showError(message) {
        if (this.elements.errorMessage) {
            this.elements.errorMessage.textContent = message;
            this.elements.errorMessage.classList.remove('hidden');
            
            // Auto hide after 5 seconds
            setTimeout(() => {
                this.hideError();
            }, 5000);
        }
    }

    hideError() {
        if (this.elements.errorMessage) {
            this.elements.errorMessage.classList.add('hidden');
        }
    }

    updateCurrentWeather(data) {
        if (this.elements.cityName) {
            this.elements.cityName.textContent = `${data.city}, ${data.country}`;
        }
        
        if (this.elements.temperature) {
            this.elements.temperature.textContent = `${data.temperature}°C`;
        }
        
        if (this.elements.feelsLike) {
            this.elements.feelsLike.textContent = `Feels like: ${data.feelsLike}°C`;
        }
        
        if (this.elements.weatherDesc) {
            this.elements.weatherDesc.textContent = data.description;
        }
        
        if (this.elements.weatherIcon) {
            const icon = CONFIG.WEATHER_ICONS[data.icon] || '🌡️';
            this.elements.weatherIcon.textContent = icon;
        }
        
        if (this.elements.humidity) {
            this.elements.humidity.textContent = `${data.humidity}%`;
        }
        
        if (this.elements.windSpeed) {
            this.elements.windSpeed.textContent = `${data.windSpeed} m/s`;
        }
        
        if (this.elements.pressure) {
            this.elements.pressure.textContent = `${data.pressure} hPa`;
        }
        
        if (this.elements.visibility) {
            this.elements.visibility.textContent = `${data.visibility} km`;
        }
        
        if (this.elements.clouds) {
            this.elements.clouds.textContent = `${data.clouds}%`;
        }
        
        // Update dynamic background based on weather
        this.updateWeatherBackground(data);
        
        this.updateLastUpdated();
    }

    updateWeatherBackground(data) {
        const body = document.body;
        const icon = data.icon;
        const description = data.description.toLowerCase();
        const isNight = icon.includes('n');
        
        // Remove all weather classes
        body.classList.remove('sunny', 'cloudy', 'rainy', 'snowy', 'night');
        
        // Add appropriate class based on weather conditions
        if (isNight) {
            body.classList.add('night');
        } else if (description.includes('rain') || description.includes('drizzle')) {
            body.classList.add('rainy');
        } else if (description.includes('snow')) {
            body.classList.add('snowy');
        } else if (description.includes('cloud')) {
            body.classList.add('cloudy');
        } else if (icon.includes('01d') || description.includes('clear')) {
            body.classList.add('sunny');
        } else {
            body.classList.add('cloudy'); // Default fallback
        }
    }

    updateForecast(forecasts) {
        if (!this.elements.forecastContainer) return;
        
        this.elements.forecastContainer.innerHTML = '';
        
        forecasts.forEach(forecast => {
            const forecastCard = this.createForecastCard(forecast);
            this.elements.forecastContainer.appendChild(forecastCard);
        });
    }

    createForecastCard(forecast) {
        const card = document.createElement('div');
        card.className = 'forecast-card';
        
        const date = forecast.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        const icon = CONFIG.WEATHER_ICONS[forecast.weather.icon] || '🌡️';
        
        card.innerHTML = `
            <div class="forecast-date">${date}</div>
            <div class="forecast-icon">${icon}</div>
            <div class="forecast-temp">
                <span class="forecast-max">${forecast.maxTemp}°</span>
                <span class="forecast-min">${forecast.minTemp}°</span>
            </div>
            <div class="forecast-desc">${forecast.weather.description}</div>
        `;
        
        return card;
    }

    updateLastUpdated() {
        if (this.elements.lastUpdated) {
            const now = new Date();
            this.elements.lastUpdated.textContent = `Last updated: ${now.toLocaleTimeString()}`;
        }
    }

    updateAirQuality(data) {
        const airQualityElement = document.getElementById('air-quality');
        if (airQualityElement && data) {
            airQualityElement.innerHTML = `
                <div class="aqi-value ${this.getAqiClass(data.aqi)}">AQI: ${data.aqi} - ${data.aqiText}</div>
                <div class="aqi-details">
                    <span>PM2.5: ${data.components.pm2_5.toFixed(1)}</span>
                    <span>PM10: ${data.components.pm10.toFixed(1)}</span>
                </div>
            `;
        }
    }

    getAqiClass(aqi) {
        const classes = {
            1: 'aqi-good',
            2: 'aqi-fair',
            3: 'aqi-moderate',
            4: 'aqi-poor',
            5: 'aqi-very-poor'
        };
        return classes[aqi] || '';
    }

    getSearchQuery() {
        return this.elements.searchInput ? this.elements.searchInput.value.trim() : '';
    }

    clearSearch() {
        if (this.elements.searchInput) {
            this.elements.searchInput.value = '';
        }
    }

    bindSearch(callback) {
        if (this.elements.searchBtn) {
            this.elements.searchBtn.addEventListener('click', callback);
        }
        
        if (this.elements.searchInput) {
            this.elements.searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    callback();
                }
            });
        }
    }

    updateAIInsights(weatherData) {
        if (!weatherData) return;
        
        const insights = this.generateAIInsights(weatherData);
        
        // Update main insight
        if (this.elements.insightIcon) {
            this.elements.insightIcon.textContent = insights.icon;
        }
        if (this.elements.insightTitle) {
            this.elements.insightTitle.textContent = insights.title;
        }
        if (this.elements.insightDescription) {
            this.elements.insightDescription.textContent = insights.description;
        }
        
        // Update score
        if (this.elements.scoreFill) {
            this.elements.scoreFill.style.width = `${insights.score}%`;
        }
        if (this.elements.scoreValue) {
            this.elements.scoreValue.textContent = `${insights.score}%`;
        }
        
        // Update recommendations
        if (this.elements.insightRecommendations) {
            this.elements.insightRecommendations.innerHTML = '';
            insights.recommendations.forEach(rec => {
                const recItem = document.createElement('div');
                recItem.className = 'recommendation-item';
                recItem.innerHTML = `
                    <span class="rec-icon">${rec.icon}</span>
                    <span class="rec-text">${rec.text}</span>
                `;
                this.elements.insightRecommendations.appendChild(recItem);
            });
        }
    }

    generateAIInsights(weatherData) {
        const temp = weatherData.temperature;
        const humidity = weatherData.humidity;
        const windSpeed = weatherData.windSpeed;
        const description = weatherData.description.toLowerCase();
        const icon = weatherData.icon;
        
        let insights = {
            icon: '🌤️',
            title: 'Moderate Weather',
            description: 'The weather conditions are quite pleasant for most activities.',
            score: 70,
            recommendations: [
                { icon: '👕', text: 'Comfortable clothing' },
                { icon: '🚶', text: 'Good for walking' },
                { icon: '☕', text: 'Nice for outdoor cafes' }
            ]
        };
        
        // Hot weather
        if (temp >= 25) {
            insights = {
                icon: '☀️',
                title: 'Perfect day for outdoor activities!',
                description: 'Great temperature with plenty of sunshine. Ideal for sports and outdoor fun!',
                score: 90,
                recommendations: [
                    { icon: '🏃', text: 'Perfect for running' },
                    { icon: '🧴', text: 'Don\'t forget sunscreen' },
                    { icon: '💧', text: 'Stay hydrated' },
                    { icon: '🕶️', text: 'Bring sunglasses' }
                ]
            };
        }
        // Cold weather
        else if (temp <= 10) {
            insights = {
                icon: '🧥',
                title: 'Cozy weather for indoor activities',
                description: 'Quite chilly outside. Perfect time for warm indoor activities.',
                score: 60,
                recommendations: [
                    { icon: '🧣', text: 'Wear warm clothes' },
                    { icon: '☕', text: 'Hot coffee weather' },
                    { icon: '📚', text: 'Great for reading indoors' },
                    { icon: '🏠', text: 'Stay cozy inside' }
                ]
            };
        }
        // Rainy weather
        else if (description.includes('rain') || description.includes('drizzle')) {
            insights = {
                icon: '🌧️',
                title: 'Rainy day vibes',
                description: 'Perfect weather for staying in and enjoying some cozy indoor time.',
                score: 50,
                recommendations: [
                    { icon: '☔', text: 'Bring an umbrella' },
                    { icon: '🎬', text: 'Movie marathon weather' },
                    { icon: '🍲', text: 'Perfect for soup' },
                    { icon: '📖', text: 'Good reading weather' }
                ]
            };
        }
        // Snowy weather
        else if (description.includes('snow')) {
            insights = {
                icon: '⛄',
                title: 'Winter wonderland!',
                description: 'Beautiful snow falling! Great for winter activities if you\'re dressed warm.',
                score: 75,
                recommendations: [
                    { icon: '⛷️', text: 'Skiing conditions' },
                    { icon: '☕', text: 'Hot chocolate time' },
                    { icon: '🧤', text: 'Wear warm gloves' },
                    { icon: '❄️', text: 'Beautiful snow views' }
                ]
            };
        }
        // Windy weather
        else if (windSpeed > 5) {
            insights = {
                icon: '💨',
                title: 'Windy conditions',
                description: 'Quite breezy today. Good for kite flying but be careful with loose items.',
                score: 65,
                recommendations: [
                    { icon: '🪁', text: 'Great for kite flying' },
                    { icon: '🧢', text: 'Wear a hat' },
                    { icon: '🌳', text: 'Watch for falling branches' },
                    { icon: '🏃', text: 'Challenging for running' }
                ]
            };
        }
        // Clear and sunny
        else if (description.includes('clear') || icon === '01d') {
            insights = {
                icon: '🌞',
                title: 'Beautiful sunny day!',
                description: 'Perfect clear skies and sunshine. Amazing day for any outdoor activity!',
                score: 95,
                recommendations: [
                    { icon: '🏖️', text: 'Beach weather' },
                    { icon: '🧴', text: 'Sunscreen essential' },
                    { icon: '🕶️', text: 'Sunglasses needed' },
                    { icon: '📸', text: 'Great for photos' }
                ]
            };
        }
        
        return insights;
    }
}