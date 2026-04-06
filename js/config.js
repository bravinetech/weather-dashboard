// Configuration file for Weather Dashboard
const CONFIG = {
    // OpenWeatherMap API Configuration
    API: {
        BASE_URL: 'https://api.openweathermap.org/data/2.5',
        GEO_URL: 'https://api.openweathermap.org/geo/1.0',
        ONECALL_URL: 'https://api.openweathermap.org/data/3.0/onecall',
        API_KEY: 'ce436a8378fbd68feae0ad65bf2594ce', // Updated API key
        UNITS: 'metric', // metric, imperial, or kelvin
        LANG: 'en'
    },

    // Map Configuration
    MAP: {
        DEFAULT_CENTER: [40.7128, -74.0060], // New York
        DEFAULT_ZOOM: 10,
        TILE_LAYER: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        TILE_ATTRIBUTION: '© OpenStreetMap contributors'
    },

    // Weather Layers
    WEATHER_LAYERS: {
        TEMPERATURE: 'temp_new',
        PRECIPITATION: 'precipitation_new',
        WIND: 'wind_new',
        PRESSURE: 'pressure_new',
        CLOUDS: 'clouds_new'
    },

    // App Settings
    APP: {
        REFRESH_INTERVAL: 600000, // 10 minutes in milliseconds
        GEOLOCATION_TIMEOUT: 10000, // 10 seconds
        MAX_FORECAST_DAYS: 7,
        MAX_HOURLY_ITEMS: 24,
        ANIMATION_DURATION: 300
    },

    // Weather Icons Mapping
    WEATHER_ICONS: {
        '01d': '☀️', '01n': '🌙',
        '02d': '⛅', '02n': '☁️',
        '03d': '☁️', '03n': '☁️',
        '04d': '☁️', '04n': '☁️',
        '09d': '🌧️', '09n': '🌧️',
        '10d': '🌦️', '10n': '🌧️',
        '11d': '⛈️', '11n': '⛈️',
        '13d': '❄️', '13n': '❄️',
        '50d': '🌫️', '50n': '🌫️'
    },

    // Alert Types
    ALERT_TYPES: {
        'extreme heat': 'danger',
        'heat': 'warning',
        'cold': 'warning',
        'wind': 'warning',
        'snow': 'warning',
        'ice': 'danger',
        'thunderstorm': 'danger',
        'flood': 'danger',
        'tornado': 'danger',
        'hurricane': 'danger'
    },

    // Error Messages
    ERROR_MESSAGES: {
        API_KEY_MISSING: 'OpenWeatherMap API key is required. Please add your API key to config.js',
        NETWORK_ERROR: 'Network error. Please check your internet connection.',
        LOCATION_NOT_FOUND: 'Location not found. Please try a different search term.',
        GEOLOCATION_DENIED: 'Geolocation access denied. Please enable location services or search manually.',
        GEOLOCATION_TIMEOUT: 'Geolocation request timed out. Please try again.',
        API_LIMIT_EXCEEDED: 'API rate limit exceeded. Please try again later.',
        INVALID_RESPONSE: 'Invalid response from weather service.'
    }
};