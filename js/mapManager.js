// Map Manager for interactive weather maps
class MapManager {
    constructor() {
        this.map = null;
        this.currentMarker = null;
        this.weatherLayers = {};
        this.activeLayers = new Set();
        this.tileLayer = null;
        this.heatmapLayer = null;
    }

    // Initialize the map
    initMap(center = CONFIG.MAP.DEFAULT_CENTER, zoom = CONFIG.MAP.DEFAULT_ZOOM) {
        try {
            // Create the map instance
            this.map = L.map('weatherMap').setView(center, zoom);

            // Add tile layer
            this.tileLayer = L.tileLayer(CONFIG.MAP.TILE_LAYER, {
                attribution: CONFIG.MAP.TILE_ATTRIBUTION,
                maxZoom: 19
            });

            this.tileLayer.addTo(this.map);

            // Add click event for location selection
            this.map.on('click', (e) => {
                this.handleMapClick(e);
            });

            return true;
        } catch (error) {
            console.error('Failed to initialize map:', error);
            return false;
        }
    }

    // Handle map click events
    handleMapClick(event) {
        const { lat, lng } = event.latlng;
        
        // Update marker
        this.updateMarker(lat, lng);
        
        // Trigger weather data update
        if (window.app && window.app.updateWeatherByCoordinates) {
            window.app.updateWeatherByCoordinates(lat, lng);
        }
    }

    // Update or create marker
    updateMarker(lat, lon, popupContent = null) {
        // Remove existing marker
        if (this.currentMarker) {
            this.map.removeLayer(this.currentMarker);
        }

        // Create new marker
        this.currentMarker = L.marker([lat, lon]);
        
        // Add popup content if provided
        if (popupContent) {
            this.currentMarker.bindPopup(popupContent).openPopup();
        }

        this.currentMarker.addTo(this.map);
        
        // Center map on marker
        this.map.setView([lat, lon], this.map.getZoom());
    }

    // Update marker with weather information
    updateWeatherMarker(lat, lon, weatherData) {
        const popupContent = this.createWeatherPopup(weatherData);
        this.updateMarker(lat, lon, popupContent);
    }

    // Create weather popup content
    createWeatherPopup(weatherData) {
        const { location, current } = weatherData;
        
        return `
            <div style="font-family: Arial, sans-serif; padding: 10px; min-width: 200px;">
                <h3 style="margin: 0 0 10px 0; color: #333;">${location.name}</h3>
                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                    <img src="${this.getWeatherIconUrl(current.icon)}" alt="Weather" style="width: 50px; height: 50px; margin-right: 10px;">
                    <div>
                        <div style="font-size: 24px; font-weight: bold;">${current.temperature}°C</div>
                        <div style="color: #666;">${current.description}</div>
                    </div>
                </div>
                <div style="font-size: 12px; color: #666;">
                    <div>💧 Humidity: ${current.humidity}%</div>
                    <div>💨 Wind: ${current.windSpeed} m/s</div>
                    <div>🌡️ Feels like: ${current.feelsLike}°C</div>
                </div>
            </div>
        `;
    }

    // Add weather overlay layers
    addWeatherLayer(layerType, data) {
        if (!this.map) return;

        // Remove existing layer of same type
        this.removeWeatherLayer(layerType);

        let layer;
        
        switch (layerType) {
            case CONFIG.WEATHER_LAYERS.TEMPERATURE:
                layer = this.createTemperatureLayer(data);
                break;
            case CONFIG.WEATHER_LAYERS.PRECIPITATION:
                layer = this.createPrecipitationLayer(data);
                break;
            case CONFIG.WEATHER_LAYERS.WIND:
                layer = this.createWindLayer(data);
                break;
            case CONFIG.WEATHER_LAYERS.PRESSURE:
                layer = this.createPressureLayer(data);
                break;
            case CONFIG.WEATHER_LAYERS.CLOUDS:
                layer = this.createCloudsLayer(data);
                break;
            default:
                console.warn(`Unknown layer type: ${layerType}`);
                return;
        }

        if (layer) {
            layer.addTo(this.map);
            this.weatherLayers[layerType] = layer;
            this.activeLayers.add(layerType);
        }
    }

    // Remove weather overlay layer
    removeWeatherLayer(layerType) {
        if (this.weatherLayers[layerType]) {
            this.map.removeLayer(this.weatherLayers[layerType]);
            delete this.weatherLayers[layerType];
            this.activeLayers.delete(layerType);
        }
    }

    // Toggle weather layer
    toggleWeatherLayer(layerType, data) {
        if (this.activeLayers.has(layerType)) {
            this.removeWeatherLayer(layerType);
            return false;
        } else {
            this.addWeatherLayer(layerType, data);
            return true;
        }
    }

    // Create temperature overlay layer
    createTemperatureLayer(data) {
        // Note: This would require access to temperature grid data
        // For demonstration, we'll create a simple colored overlay
        const bounds = this.map.getBounds();
        const colors = this.getTemperatureColors(data?.current?.temperature || 20);
        
        return L.rectangle(bounds, {
            color: colors.border,
            fillColor: colors.fill,
            fillOpacity: 0.3,
            weight: 2
        });
    }

    // Create precipitation overlay layer
    createPrecipitationLayer(data) {
        // Note: This would require access to precipitation radar data
        // For demonstration, we'll create a simple overlay
        const precipitation = data?.current?.precipitation || 0;
        const opacity = Math.min(precipitation / 100, 0.7);
        
        return L.layerGroup([
            L.tileLayer(`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${CONFIG.API.API_KEY}`, {
                attribution: 'Weather data © OpenWeatherMap',
                opacity: opacity
            })
        ]);
    }

    // Create wind overlay layer
    createWindLayer(data) {
        // Note: This would require access to wind data
        // For demonstration, we'll create a simple overlay
        return L.tileLayer(`https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${CONFIG.API.API_KEY}`, {
            attribution: 'Weather data © OpenWeatherMap',
            opacity: 0.5
        });
    }

    // Create pressure overlay layer
    createPressureLayer(data) {
        // Note: This would require access to pressure data
        // For demonstration, we'll create a simple overlay
        return L.tileLayer(`https://tile.openweathermap.org/map/pressure_new/{z}/{x}/{y}.png?appid=${CONFIG.API.API_KEY}`, {
            attribution: 'Weather data © OpenWeatherMap',
            opacity: 0.5
        });
    }

    // Create clouds overlay layer
    createCloudsLayer(data) {
        // Note: This would require access to cloud data
        // For demonstration, we'll create a simple overlay
        return L.tileLayer(`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${CONFIG.API.API_KEY}`, {
            attribution: 'Weather data © OpenWeatherMap',
            opacity: 0.5
        });
    }

    // Get temperature colors based on value
    getTemperatureColors(temperature) {
        if (temperature < -10) {
            return { fill: '#0000ff', border: '#000080' };
        } else if (temperature < 0) {
            return { fill: '#0080ff', border: '#004080' };
        } else if (temperature < 10) {
            return { fill: '#00ffff', border: '#008080' };
        } else if (temperature < 20) {
            return { fill: '#00ff00', border: '#008000' };
        } else if (temperature < 30) {
            return { fill: '#ffff00', border: '#808000' };
        } else if (temperature < 40) {
            return { fill: '#ff8000', border: '#804000' };
        } else {
            return { fill: '#ff0000', border: '#800000' };
        }
    }

    // Add multiple weather markers
    addWeatherMarkers(locations) {
        const markerGroup = L.layerGroup();
        
        locations.forEach(location => {
            const marker = L.marker([location.lat, location.lon]);
            const popupContent = this.createWeatherPopup(location.weatherData);
            marker.bindPopup(popupContent);
            markerGroup.addLayer(marker);
        });
        
        markerGroup.addTo(this.map);
        return markerGroup;
    }

    // Set map view to specific coordinates
    setView(lat, lon, zoom = null) {
        if (!this.map) return;
        
        const targetZoom = zoom || this.map.getZoom();
        this.map.setView([lat, lon], targetZoom);
    }

    // Get current map center
    getCenter() {
        if (!this.map) return null;
        const center = this.map.getCenter();
        return { lat: center.lat, lon: center.lng };
    }

    // Get current map bounds
    getBounds() {
        if (!this.map) return null;
        return this.map.getBounds();
    }

    // Add scale control
    addScaleControl() {
        if (!this.map) return;
        L.control.scale().addTo(this.map);
    }

    // Add zoom control
    addZoomControl() {
        if (!this.map) return;
        L.control.zoom({
            position: 'topright'
        }).addTo(this.map);
    }

    // Add fullscreen control
    addFullscreenControl() {
        if (!this.map) return;
        
        // Simple fullscreen toggle
        const fullscreenControl = L.control({ position: 'topright' });
        fullscreenControl.onAdd = function() {
            const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
            const button = L.DomUtil.create('button', '', div);
            button.innerHTML = '⛶';
            button.style.width = '30px';
            button.style.height = '30px';
            button.style.border = 'none';
            button.style.background = 'white';
            button.style.cursor = 'pointer';
            
            button.onclick = () => {
                const mapContainer = document.getElementById('weatherMap');
                if (!document.fullscreenElement) {
                    mapContainer.requestFullscreen();
                } else {
                    document.exitFullscreen();
                }
            };
            
            return div;
        };
        
        fullscreenControl.addTo(this.map);
    }

    // Clear all weather layers
    clearWeatherLayers() {
        Object.keys(this.weatherLayers).forEach(layerType => {
            this.removeWeatherLayer(layerType);
        });
        this.activeLayers.clear();
    }

    // Destroy map instance
    destroy() {
        if (this.map) {
            this.map.remove();
            this.map = null;
            this.currentMarker = null;
            this.weatherLayers = {};
            this.activeLayers.clear();
        }
    }

    // Helper method to get weather icon URL
    getWeatherIconUrl(iconCode) {
        return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MapManager;
}
