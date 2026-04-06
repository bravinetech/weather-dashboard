// Weather API handling module
class WeatherAPI {
    constructor() {
        this.apiKey = CONFIG.API.API_KEY;
        this.baseUrl = CONFIG.API.BASE_URL;
        this.geoUrl = CONFIG.API.GEO_URL;
        this.units = CONFIG.API.UNITS;
        this.lang = CONFIG.API.LANG;
    }

    // Get current weather by city name
    async getCurrentWeather(city) {
        try {
            const url = `${this.baseUrl}/weather?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=${this.units}&lang=${this.lang}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch weather data');
            }
            
            const data = await response.json();
            return this.formatCurrentWeather(data);
        } catch (error) {
            console.error('Error fetching current weather:', error);
            throw error;
        }
    }

    // Get weather by coordinates
    async getWeatherByCoords(lat, lon) {
        try {
            const url = `${this.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=${this.units}&lang=${this.lang}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch weather data');
            }
            
            const data = await response.json();
            return this.formatCurrentWeather(data);
        } catch (error) {
            console.error('Error fetching weather by coordinates:', error);
            throw error;
        }
    }

    // Get 5-day forecast
    async getForecast(city) {
        try {
            const url = `${this.baseUrl}/forecast?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=${this.units}&lang=${this.lang}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Failed to fetch forecast data');
            }
            
            const data = await response.json();
            return this.formatForecastData(data);
        } catch (error) {
            console.error('Error fetching forecast:', error);
            throw error;
        }
    }

    // Get forecast by coordinates
    async getForecastByCoords(lat, lon) {
        try {
            const url = `${this.baseUrl}/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=${this.units}&lang=${this.lang}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Failed to fetch forecast data');
            }
            
            const data = await response.json();
            return this.formatForecastData(data);
        } catch (error) {
            console.error('Error fetching forecast by coordinates:', error);
            throw error;
        }
    }

    // Search cities by name (geocoding)
    async searchCities(query) {
        try {
            const url = `${this.geoUrl}/direct?q=${encodeURIComponent(query)}&limit=5&appid=${this.apiKey}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Failed to search cities');
            }
            
            const data = await response.json();
            return data.map(city => ({
                name: city.name,
                country: city.country,
                state: city.state,
                lat: city.lat,
                lon: city.lon
            }));
        } catch (error) {
            console.error('Error searching cities:', error);
            throw error;
        }
    }

    // Format current weather data
    formatCurrentWeather(data) {
        return {
            city: data.name,
            country: data.sys.country,
            temperature: Math.round(data.main.temp),
            feelsLike: Math.round(data.main.feels_like),
            humidity: data.main.humidity,
            pressure: data.main.pressure,
            windSpeed: data.wind.speed,
            windDeg: data.wind.deg,
            description: data.weather[0].description,
            icon: data.weather[0].icon,
            iconCode: data.weather[0].id,
            sunrise: data.sys.sunrise,
            sunset: data.sys.sunset,
            clouds: data.clouds.all,
            visibility: data.visibility / 1000, // Convert to km
            lat: data.coord.lat,
            lon: data.coord.lon
        };
    }

    // Format forecast data (group by day)
    formatForecastData(data) {
        const dailyForecasts = {};
        
        data.list.forEach(item => {
            const date = new Date(item.dt * 1000);
            const dateKey = date.toDateString();
            
            if (!dailyForecasts[dateKey]) {
                dailyForecasts[dateKey] = {
                    date: date,
                    temps: [],
                    minTemp: Infinity,
                    maxTemp: -Infinity,
                    humidity: [],
                    weather: item.weather[0],
                    windSpeed: [],
                    pressure: []
                };
            }
            
            const temp = item.main.temp;
            dailyForecasts[dateKey].temps.push(temp);
            dailyForecasts[dateKey].minTemp = Math.min(dailyForecasts[dateKey].minTemp, temp);
            dailyForecasts[dateKey].maxTemp = Math.max(dailyForecasts[dateKey].maxTemp, temp);
            dailyForecasts[dateKey].humidity.push(item.main.humidity);
            dailyForecasts[dateKey].windSpeed.push(item.wind.speed);
            dailyForecasts[dateKey].pressure.push(item.main.pressure);
        });
        
        // Convert to array and calculate averages
        const forecasts = Object.values(dailyForecasts).slice(0, CONFIG.APP.MAX_FORECAST_DAYS).map(day => ({
            date: day.date,
            minTemp: Math.round(day.minTemp),
            maxTemp: Math.round(day.maxTemp),
            avgTemp: Math.round(day.temps.reduce((a, b) => a + b, 0) / day.temps.length),
            humidity: Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length),
            windSpeed: Math.round(day.windSpeed.reduce((a, b) => a + b, 0) / day.windSpeed.length),
            pressure: Math.round(day.pressure.reduce((a, b) => a + b, 0) / day.pressure.length),
            weather: day.weather,
            icon: this.getWeatherIcon(day.weather.icon)
        }));
        
        return forecasts;
    }

    // Get weather icon
    getWeatherIcon(iconCode) {
        return CONFIG.WEATHER_ICONS[iconCode] || '🌡️';
    }

    // Get air quality data
    async getAirQuality(lat, lon) {
        try {
            const url = `${this.baseUrl}/air_pollution?lat=${lat}&lon=${lon}&appid=${this.apiKey}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Failed to fetch air quality data');
            }
            
            const data = await response.json();
            return this.formatAirQuality(data);
        } catch (error) {
            console.error('Error fetching air quality:', error);
            return null;
        }
    }

    // Get coordinates for a location (geocoding)
    async getCoordinates(locationName) {
        try {
            const cities = await this.searchCities(locationName);
            if (cities.length === 0) {
                throw new Error('Location not found');
            }
            return {
                lat: cities[0].lat,
                lon: cities[0].lon,
                name: cities[0].name
            };
        } catch (error) {
            console.error('Error getting coordinates:', error);
            throw error;
        }
    }

    // Get weather alerts (mock implementation)
    async getWeatherAlerts(lat, lon) {
        try {
            // Note: OpenWeatherMap's alert API requires special subscription
            // This is a mock implementation for demonstration
            const url = `${this.baseUrl}/onecall?lat=${lat}&lon=${lon}&appid=${this.apiKey}&exclude=current,minutely,hourly,daily`;
            const response = await fetch(url);
            
            if (!response.ok) {
                // Return empty alerts if API doesn't support alerts
                return [];
            }
            
            const data = await response.json();
            return data.alerts || [];
        } catch (error) {
            console.error('Error fetching weather alerts:', error);
            return [];
        }
    }

    // Clear cache method
    clearCache() {
        // Simple cache clearing - in production you'd want more sophisticated caching
        if (this.cache) {
            this.cache.clear();
        }
    }

    // Format air quality data
    formatAirQuality(data) {
        const aqi = data.list[0].main.aqi;
        const components = data.list[0].components;
        
        const aqiText = {
            1: 'Good',
            2: 'Fair',
            3: 'Moderate',
            4: 'Poor',
            5: 'Very Poor'
        };
        
        return {
            aqi: aqi,
            aqiText: aqiText[aqi],
            components: {
                pm2_5: components.pm2_5,
                pm10: components.pm10,
                no2: components.no2,
                o3: components.o3,
                so2: components.so2
            }
        };
    }
}