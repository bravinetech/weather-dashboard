// Custom Weather Alerts Manager
class CustomAlerts {
    constructor() {
        this.alerts = [];
        this.storageKey = 'weather-alerts';
        this.activeAlerts = new Set();
        this.alertHistory = [];
        this.maxAlerts = 10;
        
        this.init();
    }

    init() {
        this.loadSavedAlerts();
        this.createAlertInterface();
        this.setupEventListeners();
        this.startAlertMonitoring();
    }

    loadSavedAlerts() {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
            this.alerts = JSON.parse(saved);
        }
    }

    saveAlerts() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.alerts));
    }

    createAlertInterface() {
        // Create custom alerts section
        const alertsSection = document.createElement('section');
        alertsSection.className = 'custom-alerts';
        alertsSection.innerHTML = `
            <div class="alerts-header">
                <h2>🔔 Custom Weather Alerts</h2>
                <div class="alerts-controls">
                    <button class="alert-btn" id="add-alert">+ Create Alert</button>
                    <button class="alert-btn" id="test-alerts">🧪 Test All</button>
                    <button class="alert-btn" id="clear-history">🗑️ Clear History</button>
                </div>
            </div>
            <div class="alerts-grid" id="alerts-grid">
                <!-- Alert cards will be inserted here -->
            </div>
            <div class="alert-history" id="alert-history">
                <h3>📋 Alert History</h3>
                <div class="history-list" id="history-list">
                    <!-- Alert history will be inserted here -->
                </div>
            </div>
        `;

        // Insert after multi-location section
        const multiLocation = document.querySelector('.multi-location');
        if (multiLocation) {
            multiLocation.parentNode.insertBefore(alertsSection, multiLocation.nextSibling);
        } else {
            document.querySelector('.main .container').appendChild(alertsSection);
        }

        this.alertsGrid = document.getElementById('alerts-grid');
        this.historyList = document.getElementById('history-list');
        
        this.renderAlertCards();
        this.renderAlertHistory();
    }

    setupEventListeners() {
        // Add alert button
        document.getElementById('add-alert').addEventListener('click', () => {
            this.showCreateAlertDialog();
        });

        // Test alerts button
        document.getElementById('test-alerts').addEventListener('click', () => {
            this.testAllAlerts();
        });

        // Clear history button
        document.getElementById('clear-history').addEventListener('click', () => {
            this.clearAlertHistory();
        });
    }

    addAlert(alertConfig) {
        if (this.alerts.length >= this.maxAlerts) {
            this.showNotification('Maximum alerts reached', `You can only create ${this.maxAlerts} custom alerts.`);
            return false;
        }

        const alert = {
            id: Date.now(),
            name: alertConfig.name,
            type: alertConfig.type,
            threshold: alertConfig.threshold,
            operator: alertConfig.operator,
            message: alertConfig.message,
            enabled: alertConfig.enabled !== false,
            createdAt: new Date().toISOString(),
            lastTriggered: null
        };

        this.alerts.push(alert);
        this.saveAlerts();
        this.renderAlertCards();
        this.showNotification('Alert created', `"${alert.name}" has been created successfully.`);
        return true;
    }

    removeAlert(alertId) {
        this.alerts = this.alerts.filter(alert => alert.id !== alertId);
        this.saveAlerts();
        this.renderAlertCards();
        this.showNotification('Alert removed', 'The alert has been deleted.');
    }

    toggleAlert(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.enabled = !alert.enabled;
            this.saveAlerts();
            this.renderAlertCards();
            this.showNotification(
                alert.enabled ? 'Alert enabled' : 'Alert disabled',
                `"${alert.name}" has been ${alert.enabled ? 'enabled' : 'disabled'}.`
            );
        }
    }

    renderAlertCards() {
        if (!this.alertsGrid) return;

        this.alertsGrid.innerHTML = '';

        this.alerts.forEach(alert => {
            const card = this.createAlertCard(alert);
            this.alertsGrid.appendChild(card);
        });
    }

    createAlertCard(alert) {
        const card = document.createElement('div');
        card.className = `alert-card ${alert.enabled ? 'enabled' : 'disabled'}`;
        card.dataset.alertId = alert.id;
        
        card.innerHTML = `
            <div class="alert-header">
                <h3>${alert.name}</h3>
                <div class="alert-actions">
                    <button class="mini-btn ${alert.enabled ? 'success' : 'secondary'}" 
                            onclick="window.customAlerts.toggleAlert(${alert.id})">
                        ${alert.enabled ? '🔔 ON' : '🔕 OFF'}
                    </button>
                    <button class="mini-btn danger" onclick="window.customAlerts.removeAlert(${alert.id})">×</button>
                </div>
            </div>
            <div class="alert-details">
                <div class="alert-condition">
                    <span class="alert-type">${this.getAlertTypeLabel(alert.type)}</span>
                    <span class="alert-operator">${this.getOperatorLabel(alert.operator)}</span>
                    <span class="alert-threshold">${alert.threshold}</span>
                </div>
                <div class="alert-message">
                    <small>${alert.message}</small>
                </div>
            </div>
            <div class="alert-footer">
                <small>Created: ${this.formatDate(alert.createdAt)}</small>
                ${alert.lastTriggered ? `<small>Last triggered: ${this.formatDate(alert.lastTriggered)}</small>` : ''}
            </div>
        `;

        return card;
    }

    getAlertTypeLabel(type) {
        const labels = {
            temperature: '🌡️ Temperature',
            humidity: '💧 Humidity',
            wind: '💨 Wind Speed',
            pressure: '🔵 Pressure',
            precipitation: '🌧️ Precipitation',
            uv: '☀️ UV Index',
            visibility: '👁️ Visibility'
        };
        return labels[type] || type;
    }

    getOperatorLabel(operator) {
        const labels = {
            gt: '>',
            gte: '≥',
            lt: '<',
            lte: '≤',
            eq: '=',
            between: 'between'
        };
        return labels[operator] || operator;
    }

    startAlertMonitoring() {
        // Check alerts every 5 minutes
        setInterval(() => {
            this.checkAlerts();
        }, 5 * 60 * 1000);
    }

    async checkAlerts() {
        if (!window.app || !window.app.currentWeatherData) return;

        const currentWeather = window.app.currentWeatherData.current;
        const enabledAlerts = this.alerts.filter(alert => alert.enabled);

        for (const alert of enabledAlerts) {
            const shouldTrigger = this.evaluateAlert(alert, currentWeather);
            
            if (shouldTrigger && !this.wasRecentlyTriggered(alert.id)) {
                this.triggerAlert(alert, currentWeather);
            }
        }
    }

    evaluateAlert(alert, weatherData) {
        let currentValue;
        
        switch (alert.type) {
            case 'temperature':
                currentValue = weatherData.temperature || weatherData.temp;
                break;
            case 'humidity':
                currentValue = weatherData.humidity;
                break;
            case 'wind':
                currentValue = weatherData.windSpeed || 0;
                break;
            case 'pressure':
                currentValue = weatherData.pressure;
                break;
            case 'precipitation':
                currentValue = weatherData.precipitation || 0;
                break;
            case 'uv':
                currentValue = weatherData.uvi || 0;
                break;
            case 'visibility':
                currentValue = weatherData.visibility || 0;
                break;
            default:
                return false;
        }

        return this.compareValues(currentValue, alert.operator, alert.threshold);
    }

    compareValues(currentValue, operator, threshold) {
        switch (operator) {
            case 'gt':
                return currentValue > threshold;
            case 'gte':
                return currentValue >= threshold;
            case 'lt':
                return currentValue < threshold;
            case 'lte':
                return currentValue <= threshold;
            case 'eq':
                return currentValue === threshold;
            case 'between':
                const [min, max] = threshold.split('-');
                return currentValue >= parseFloat(min) && currentValue <= parseFloat(max);
            default:
                return false;
        }
    }

    wasRecentlyTriggered(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (!alert || !alert.lastTriggered) return false;

        const timeSinceTriggered = Date.now() - new Date(alert.lastTriggered).getTime();
        const cooldownPeriod = 30 * 60 * 1000; // 30 minutes cooldown
        
        return timeSinceTriggered < cooldownPeriod;
    }

    triggerAlert(alert, weatherData) {
        // Update last triggered time
        alert.lastTriggered = new Date().toISOString();
        this.saveAlerts();

        // Add to history
        const historyEntry = {
            id: Date.now(),
            alertId: alert.id,
            alertName: alert.name,
            triggeredAt: new Date().toISOString(),
            weatherData: {
                temperature: weatherData.temperature || weatherData.temp,
                humidity: weatherData.humidity,
                description: weatherData.description
            }
        };
        
        this.alertHistory.unshift(historyEntry);
        if (this.alertHistory.length > 50) {
            this.alertHistory = this.alertHistory.slice(0, 50);
        }
        
        this.saveAlertHistory();
        this.renderAlertHistory();
        this.renderAlertCards();

        // Show notification
        this.showNotification(
            '🔔 Weather Alert Triggered!',
            `${alert.name}: ${alert.message}`,
            'alert',
            { urgency: 'high', requireInteraction: false }
        );

        // Update active alerts set
        this.activeAlerts.add(alert.id);
        
        // Clear from active alerts after 30 seconds
        setTimeout(() => {
            this.activeAlerts.delete(alert.id);
        }, 30000);
    }

    showCreateAlertDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'alert-dialog';
        dialog.innerHTML = `
            <div class="dialog-content">
                <h3>Create Custom Alert</h3>
                <div class="form-group">
                    <label>Alert Name:</label>
                    <input type="text" id="alert-name" placeholder="e.g., High Temperature Warning" required>
                </div>
                <div class="form-group">
                    <label>Alert Type:</label>
                    <select id="alert-type">
                        <option value="temperature">🌡️ Temperature</option>
                        <option value="humidity">💧 Humidity</option>
                        <option value="wind">💨 Wind Speed</option>
                        <option value="pressure">🔵 Pressure</option>
                        <option value="precipitation">🌧️ Precipitation</option>
                        <option value="uv">☀️ UV Index</option>
                        <option value="visibility">👁️ Visibility</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Condition:</label>
                    <select id="alert-operator">
                        <option value="gt">Greater than (>)</option>
                        <option value="gte">Greater or equal (≥)</option>
                        <option value="lt">Less than (<)</option>
                        <option value="lte">Less or equal (≤)</option>
                        <option value="eq">Equal (=)</option>
                        <option value="between">Between (min-max)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Threshold:</label>
                    <input type="number" id="alert-threshold" placeholder="e.g., 30" step="0.1" required>
                    <small class="form-hint">For "between", use format: "20-30"</small>
                </div>
                <div class="form-group">
                    <label>Alert Message:</label>
                    <textarea id="alert-message" placeholder="e.g., Temperature is too high! Stay hydrated." rows="3" required></textarea>
                </div>
                <div class="form-actions">
                    <button class="btn primary" id="confirm-create-alert">Create Alert</button>
                    <button class="btn secondary" id="cancel-create-alert">Cancel</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        // Setup dialog events
        document.getElementById('confirm-create-alert').addEventListener('click', () => {
            const alertConfig = {
                name: document.getElementById('alert-name').value.trim(),
                type: document.getElementById('alert-type').value,
                operator: document.getElementById('alert-operator').value,
                threshold: document.getElementById('alert-threshold').value,
                message: document.getElementById('alert-message').value.trim(),
                enabled: true
            };

            if (alertConfig.name && alertConfig.threshold && alertConfig.message) {
                this.addAlert(alertConfig);
                dialog.remove();
            } else {
                this.showNotification('Error', 'Please fill in all required fields.');
            }
        });

        document.getElementById('cancel-create-alert').addEventListener('click', () => {
            dialog.remove();
        });

        // Close on outside click
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                dialog.remove();
            }
        });
    }

    renderAlertHistory() {
        if (!this.historyList) return;

        if (this.alertHistory.length === 0) {
            this.historyList.innerHTML = '<p class="no-history">No alert history yet.</p>';
            return;
        }

        const historyHTML = this.alertHistory.slice(0, 20).map(entry => `
            <div class="history-item">
                <div class="history-header">
                    <strong>${entry.alertName}</strong>
                    <span class="history-time">${this.formatDate(entry.triggeredAt)}</span>
                </div>
                <div class="history-details">
                    <span>🌡️ ${entry.weatherData.temperature}°C</span>
                    <span>💧 ${entry.weatherData.humidity}%</span>
                    <span>${entry.weatherData.description}</span>
                </div>
            </div>
        `).join('');

        this.historyList.innerHTML = historyHTML;
    }

    saveAlertHistory() {
        localStorage.setItem('weather-alert-history', JSON.stringify(this.alertHistory));
    }

    loadAlertHistory() {
        const saved = localStorage.getItem('weather-alert-history');
        if (saved) {
            this.alertHistory = JSON.parse(saved);
        }
    }

    clearAlertHistory() {
        this.alertHistory = [];
        this.saveAlertHistory();
        this.renderAlertHistory();
        this.showNotification('History cleared', 'Alert history has been cleared.');
    }

    testAllAlerts() {
        if (!window.app || !window.app.currentWeatherData) {
            this.showNotification('No weather data', 'Please load weather data first.');
            return;
        }

        const currentWeather = window.app.currentWeatherData.current;
        const enabledAlerts = this.alerts.filter(alert => alert.enabled);

        if (enabledAlerts.length === 0) {
            this.showNotification('No alerts', 'Create some alerts first.');
            return;
        }

        this.showNotification('Testing alerts', `Testing ${enabledAlerts.length} alert(s)...`);

        // Test each alert
        enabledAlerts.forEach(alert => {
            setTimeout(() => {
                const shouldTrigger = this.evaluateAlert(alert, currentWeather);
                if (shouldTrigger) {
                    this.showNotification(
                        `🧪 Test: ${alert.name}`,
                        `Would trigger: ${alert.message}`,
                        'test'
                    );
                }
            }, Math.random() * 2000); // Random delay for each test
        });
    }

    showNotification(title, message, type = 'info', options = {}) {
        if (window.smartNotifications) {
            window.smartNotifications.showNotification(title, message, type, options);
        }
    }

    formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            month: 'short',
            day: 'numeric'
        });
    }

    // Public methods
    getActiveAlerts() {
        return this.alerts.filter(alert => alert.enabled);
    }

    getAlertHistory() {
        return this.alertHistory;
    }

    exportAlerts() {
        const data = {
            alerts: this.alerts,
            history: this.alertHistory,
            exportedAt: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `weather-alerts-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Alerts exported', 'Your alerts have been exported successfully.');
    }
}

// Initialize custom alerts
let customAlerts;

document.addEventListener('DOMContentLoaded', () => {
    customAlerts = new CustomAlerts();
    window.customAlerts = customAlerts;
});
