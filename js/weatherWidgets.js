// Weather Widgets System for Desktop
class WeatherWidgets {
    constructor() {
        this.widgets = [];
        this.widgetContainer = null;
        this.isDragging = false;
        this.currentWidget = null;
        this.offset = { x: 0, y: 0 };
        
        this.init();
    }

    init() {
        this.createWidgetContainer();
        this.setupDragAndDrop();
        this.loadWidgetPositions();
    }

    createWidgetContainer() {
        this.widgetContainer = document.createElement('div');
        this.widgetContainer.id = 'widget-container';
        this.widgetContainer.className = 'widget-container';
        document.body.appendChild(this.widgetContainer);
    }

    setupDragAndDrop() {
        document.addEventListener('mousedown', (e) => this.startDrag(e));
        document.addEventListener('mousemove', (e) => this.drag(e));
        document.addEventListener('mouseup', () => this.endDrag());
    }

    startDrag(e) {
        const widget = e.target.closest('.weather-widget');
        if (widget && widget.classList.contains('draggable')) {
            this.isDragging = true;
            this.currentWidget = widget;
            
            const rect = widget.getBoundingClientRect();
            this.offset.x = e.clientX - rect.left;
            this.offset.y = e.clientY - rect.top;
            
            widget.style.zIndex = 1000;
            widget.style.cursor = 'grabbing';
        }
    }

    drag(e) {
        if (!this.isDragging || !this.currentWidget) return;
        
        e.preventDefault();
        
        const x = e.clientX - this.offset.x;
        const y = e.clientY - this.offset.y;
        
        // Keep widget within viewport
        const maxX = window.innerWidth - this.currentWidget.offsetWidth;
        const maxY = window.innerHeight - this.currentWidget.offsetHeight;
        
        this.currentWidget.style.left = Math.max(0, Math.min(x, maxX)) + 'px';
        this.currentWidget.style.top = Math.max(0, Math.min(y, maxY)) + 'px';
    }

    endDrag() {
        if (this.currentWidget) {
            this.currentWidget.style.zIndex = '';
            this.currentWidget.style.cursor = 'grab';
            this.saveWidgetPositions();
        }
        
        this.isDragging = false;
        this.currentWidget = null;
    }

    createMiniWidget(type, data) {
        const widget = document.createElement('div');
        widget.className = `weather-widget mini-widget ${type}-widget draggable`;
        widget.id = `widget-${type}-${Date.now()}`;
        
        let content = '';
        
        switch (type) {
            case 'current':
                content = this.createCurrentWidgetContent(data);
                break;
            case 'forecast':
                content = this.createForecastWidgetContent(data);
                break;
            case 'hourly':
                content = this.createHourlyWidgetContent(data);
                break;
            case 'alerts':
                content = this.createAlertsWidgetContent(data);
                break;
        }
        
        widget.innerHTML = content;
        this.widgetContainer.appendChild(widget);
        
        // Add close button
        this.addWidgetControls(widget, type);
        
        // Position widget
        this.positionWidget(widget);
        
        this.widgets.push({ element: widget, type, data });
        
        return widget;
    }

    createCurrentWidgetContent(data) {
        return `
            <div class="widget-header">
                <span class="widget-title">Current Weather</span>
                <div class="widget-controls">
                    <button class="widget-close">×</button>
                </div>
            </div>
            <div class="widget-content">
                <div class="widget-location">${data.city}</div>
                <div class="widget-temp">${data.temperature}°C</div>
                <div class="widget-desc">${data.description}</div>
                <div class="widget-details">
                    <span>💧 ${data.humidity}%</span>
                    <span>💨 ${data.windSpeed} m/s</span>
                </div>
            </div>
        `;
    }

    createForecastWidgetContent(data) {
        const forecastHTML = data.slice(0, 3).map(day => `
            <div class="widget-forecast-day">
                <div class="widget-date">${new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
                <div class="widget-icon">${CONFIG.WEATHER_ICONS[day.weather.icon] || '🌡️'}</div>
                <div class="widget-temp-range">${day.minTemp}° - ${day.maxTemp}°</div>
            </div>
        `).join('');
        
        return `
            <div class="widget-header">
                <span class="widget-title">3-Day Forecast</span>
                <div class="widget-controls">
                    <button class="widget-close">×</button>
                </div>
            </div>
            <div class="widget-content">
                <div class="widget-forecast">
                    ${forecastHTML}
                </div>
            </div>
        `;
    }

    createHourlyWidgetContent(data) {
        const hourlyHTML = data.slice(0, 6).map(hour => `
            <div class="widget-hour">
                <div class="widget-time">${new Date(hour.dt * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                <div class="widget-icon">${CONFIG.WEATHER_ICONS[hour.weather[0].icon] || '🌡️'}</div>
                <div class="widget-temp">${Math.round(hour.main.temp)}°</div>
            </div>
        `).join('');
        
        return `
            <div class="widget-header">
                <span class="widget-title">6-Hour Forecast</span>
                <div class="widget-controls">
                    <button class="widget-close">×</button>
                </div>
            </div>
            <div class="widget-content">
                <div class="widget-hourly">
                    ${hourlyHTML}
                </div>
            </div>
        `;
    }

    createAlertsWidgetContent(data) {
        const alertsHTML = data.map(alert => `
            <div class="widget-alert">
                <div class="widget-alert-title">${alert.event}</div>
                <div class="widget-alert-desc">${alert.description}</div>
            </div>
        `).join('');
        
        return `
            <div class="widget-header">
                <span class="widget-title">Weather Alerts</span>
                <div class="widget-controls">
                    <button class="widget-close">×</button>
                </div>
            </div>
            <div class="widget-content">
                <div class="widget-alerts">
                    ${alertsHTML || '<div class="no-alerts">No active alerts</div>'}
                </div>
            </div>
        `;
    }

    addWidgetControls(widget, type) {
        const closeBtn = widget.querySelector('.widget-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.removeWidget(widget));
        }
    }

    positionWidget(widget) {
        const savedPositions = this.getSavedPositions();
        const widgetId = widget.id;
        
        if (savedPositions[widgetId]) {
            widget.style.left = savedPositions[widgetId].x + 'px';
            widget.style.top = savedPositions[widgetId].y + 'px';
        } else {
            // Default positioning
            const index = this.widgets.length;
            widget.style.left = (20 + (index % 4) * 220) + 'px';
            widget.style.top = (20 + Math.floor(index / 4) * 150) + 'px';
        }
    }

    removeWidget(widget) {
        widget.remove();
        this.widgets = this.widgets.filter(w => w.element !== widget);
        this.saveWidgetPositions();
    }

    saveWidgetPositions() {
        const positions = {};
        
        this.widgets.forEach(widget => {
            const rect = widget.element.getBoundingClientRect();
            positions[widget.element.id] = {
                x: rect.left,
                y: rect.top
            };
        });
        
        localStorage.setItem('weather-widget-positions', JSON.stringify(positions));
    }

    getSavedPositions() {
        const saved = localStorage.getItem('weather-widget-positions');
        return saved ? JSON.parse(saved) : {};
    }

    loadWidgetPositions() {
        // Positions will be applied when widgets are created
    }

    // Public methods
    createCurrentWidget(weatherData) {
        return this.createMiniWidget('current', weatherData);
    }

    createForecastWidget(forecastData) {
        return this.createMiniWidget('forecast', forecastData);
    }

    createHourlyWidget(hourlyData) {
        return this.createMiniWidget('hourly', hourlyData);
    }

    createAlertsWidget(alertsData) {
        return this.createMiniWidget('alerts', alertsData);
    }

    updateWidget(widgetType, data) {
        const widget = this.widgets.find(w => w.type === widgetType);
        if (widget) {
            // Update widget content
            this.updateWidgetContent(widget.element, widgetType, data);
        }
    }

    updateWidgetContent(widget, type, data) {
        const content = widget.querySelector('.widget-content');
        if (!content) return;
        
        switch (type) {
            case 'current':
                content.innerHTML = `
                    <div class="widget-location">${data.city}</div>
                    <div class="widget-temp">${data.temperature}°C</div>
                    <div class="widget-desc">${data.description}</div>
                    <div class="widget-details">
                        <span>💧 ${data.humidity}%</span>
                        <span>💨 ${data.windSpeed} m/s</span>
                    </div>
                `;
                break;
            // Add other update cases as needed
        }
    }

    toggleWidgets() {
        const container = this.widgetContainer;
        container.style.display = container.style.display === 'none' ? 'block' : 'none';
    }

    clearAllWidgets() {
        this.widgets.forEach(widget => {
            widget.element.remove();
        });
        this.widgets = [];
        localStorage.removeItem('weather-widget-positions');
    }

    // Widget management panel
    showWidgetPanel() {
        if (document.getElementById('widget-panel')) return;
        
        const panel = document.createElement('div');
        panel.id = 'widget-panel';
        panel.className = 'widget-panel';
        panel.innerHTML = `
            <div class="widget-panel-header">
                <h3>Weather Features</h3>
                <button class="panel-close">×</button>
            </div>
            <div class="widget-panel-content">
                <div class="widget-section">
                    <h4>📱 Widgets</h4>
                    <div class="widget-options">
                        <button class="widget-btn" data-widget="current">Current Weather</button>
                        <button class="widget-btn" data-widget="forecast">3-Day Forecast</button>
                        <button class="widget-btn" data-widget="hourly">6-Hour Forecast</button>
                        <button class="widget-btn" data-widget="alerts">Weather Alerts</button>
                    </div>
                </div>
                <div class="widget-section">
                    <h4>🌍 3D Globe</h4>
                    <div class="globe-controls">
                        <button class="globe-btn" id="globe-toggle">Toggle Globe</button>
                        <button class="globe-btn" id="globe-clear">Clear Markers</button>
                    </div>
                </div>
                <div class="widget-section">
                    <h4>🔔 Notifications</h4>
                    <div class="notification-controls">
                        <button class="notification-btn" id="test-notification">Test Notification</button>
                    </div>
                </div>
                <div class="widget-section">
                    <h4>🔊 Sounds</h4>
                    <div class="sound-controls">
                        <button class="sound-btn" id="test-rain">Test Rain Sound</button>
                        <button class="sound-btn" id="test-thunder">Test Thunder</button>
                        <button class="sound-btn" id="test-wind">Test Wind</button>
                        <button class="sound-btn" id="mute-sounds">Mute All</button>
                    </div>
                </div>
                <div class="widget-actions">
                    <button class="clear-widgets">Clear All Widgets</button>
                    <button class="toggle-widgets">Toggle Visibility</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // Setup event listeners
        panel.querySelector('.panel-close').addEventListener('click', () => {
            panel.remove();
        });
        
        // Widget buttons
        panel.querySelectorAll('.widget-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const widgetType = e.target.dataset.widget;
                this.createWidgetByType(widgetType);
            });
        });
        
        // Globe controls
        const globeToggle = panel.getElementById('globe-toggle');
        if (globeToggle) {
            globeToggle.addEventListener('click', () => {
                if (window.weatherGlobe) {
                    window.weatherGlobe.toggle();
                }
            });
        }
        
        const globeClear = panel.getElementById('globe-clear');
        if (globeClear) {
            globeClear.addEventListener('click', () => {
                if (window.weatherGlobe) {
                    window.weatherGlobe.clearMarkers();
                    window.weatherGlobe.addDemoMarkers(); // Add demo markers back
                }
            });
        }
        
        // Notification controls
        const testNotification = panel.getElementById('test-notification');
        if (testNotification) {
            testNotification.addEventListener('click', () => {
                if (window.smartNotifications) {
                    window.smartNotifications.testNotification();
                }
            });
        }
        
        // Sound controls
        const testRain = panel.getElementById('test-rain');
        if (testRain) {
            testRain.addEventListener('click', () => {
                if (window.weatherSounds) {
                    window.weatherSounds.testSound('rain');
                }
            });
        }
        
        const testThunder = panel.getElementById('test-thunder');
        if (testThunder) {
            testThunder.addEventListener('click', () => {
                if (window.weatherSounds) {
                    window.weatherSounds.testSound('thunder');
                }
            });
        }
        
        const testWind = panel.getElementById('test-wind');
        if (testWind) {
            testWind.addEventListener('click', () => {
                if (window.weatherSounds) {
                    window.weatherSounds.testSound('wind');
                }
            });
        }
        
        const muteSounds = panel.getElementById('mute-sounds');
        if (muteSounds) {
            muteSounds.addEventListener('click', () => {
                if (window.weatherSounds) {
                    window.weatherSounds.toggleMute();
                }
            });
        }
        
        // Action buttons
        panel.querySelector('.clear-widgets').addEventListener('click', () => {
            this.clearAllWidgets();
        });
        
        panel.querySelector('.toggle-widgets').addEventListener('click', () => {
            this.toggleWidgets();
        });
    }

    createWidgetByType(type) {
        if (!window.app || !window.app.currentWeatherData) return;
        
        const weatherData = window.app.currentWeatherData;
        
        switch (type) {
            case 'current':
                this.createCurrentWidget(weatherData.current);
                break;
            case 'forecast':
                // Would need forecast data
                break;
            case 'hourly':
                // Would need hourly data
                break;
            case 'alerts':
                // Would need alerts data
                break;
        }
    }
}

// Initialize weather widgets
let weatherWidgets;

document.addEventListener('DOMContentLoaded', () => {
    weatherWidgets = new WeatherWidgets();
    window.weatherWidgets = weatherWidgets;
});
