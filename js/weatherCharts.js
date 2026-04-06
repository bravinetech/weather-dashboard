// Weather Charts Manager
class WeatherCharts {
    constructor() {
        this.chartContainer = null;
        this.charts = {};
        this.chartColors = {
            temperature: '#FF6B6B',
            humidity: '#4ECDC4',
            wind: '#45B7D1',
            pressure: '#96CEB4',
            precipitation: '#3B82F6'
        };
        
        this.init();
    }

    init() {
        this.createChartContainer();
        this.loadChartLibrary();
    }

    createChartContainer() {
        // Create charts section in HTML
        const chartsSection = document.createElement('section');
        chartsSection.className = 'weather-charts';
        chartsSection.innerHTML = `
            <div class="charts-header">
                <h2>📊 Weather Analytics</h2>
                <div class="chart-controls">
                    <button class="chart-btn active" data-chart="temperature">Temperature</button>
                    <button class="chart-btn" data-chart="humidity">Humidity</button>
                    <button class="chart-btn" data-chart="wind">Wind</button>
                    <button class="chart-btn" data-chart="pressure">Pressure</button>
                    <button class="chart-btn" data-chart="all">All Charts</button>
                </div>
            </div>
            <div class="charts-grid">
                <div class="chart-container">
                    <canvas id="temperature-chart" class="weather-chart"></canvas>
                    <div class="chart-title">Temperature Trend (24h)</div>
                </div>
                <div class="chart-container">
                    <canvas id="humidity-chart" class="weather-chart"></canvas>
                    <div class="chart-title">Humidity Levels (24h)</div>
                </div>
                <div class="chart-container">
                    <canvas id="wind-chart" class="weather-chart"></canvas>
                    <div class="chart-title">Wind Speed (24h)</div>
                </div>
                <div class="chart-container">
                    <canvas id="pressure-chart" class="weather-chart"></canvas>
                    <div class="chart-title">Pressure Trend (24h)</div>
                </div>
            </div>
        `;

        // Insert after AI Insights section
        const aiSection = document.querySelector('.ai-insights');
        if (aiSection) {
            aiSection.parentNode.insertBefore(chartsSection, aiSection.nextSibling);
        } else {
            document.querySelector('.main .container').appendChild(chartsSection);
        }

        this.chartContainer = chartsSection;
        this.setupChartControls();
    }

    setupChartControls() {
        const buttons = this.chartContainer.querySelectorAll('.chart-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remove active class from all buttons
                buttons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                const chartType = e.target.dataset.chart;
                this.toggleChart(chartType);
            });
        });
    }

    toggleChart(chartType) {
        const containers = this.chartContainer.querySelectorAll('.chart-container');
        
        if (chartType === 'all') {
            containers.forEach(container => container.style.display = 'block');
        } else {
            containers.forEach(container => {
                const chartId = container.querySelector('canvas').id;
                if (chartId.includes(chartType)) {
                    container.style.display = 'block';
                } else {
                    container.style.display = 'none';
                }
            });
        }
    }

    loadChartLibrary() {
        // Simple chart drawing without external library
        this.setupCharts();
    }

    setupCharts() {
        // Initialize all chart canvases
        this.charts.temperature = new SimpleChart('temperature-chart', this.chartColors.temperature);
        this.charts.humidity = new SimpleChart('humidity-chart', this.chartColors.humidity);
        this.charts.wind = new SimpleChart('wind-chart', this.chartColors.wind);
        this.charts.pressure = new SimpleChart('pressure-chart', this.chartColors.pressure);
    }

    updateCharts(weatherData, forecastData) {
        // Process hourly forecast data for charts
        const hourlyData = forecastData.list || [];
        const last24Hours = hourlyData.slice(0, 24); // Get last 24 hours

        // Update temperature chart
        if (this.charts.temperature) {
            const tempData = last24Hours.map(hour => ({
                time: new Date(hour.dt * 1000),
                value: hour.main.temp
            }));
            this.charts.temperature.update(tempData, 'Temperature (°C)');
        }

        // Update humidity chart
        if (this.charts.humidity) {
            const humidityData = last24Hours.map(hour => ({
                time: new Date(hour.dt * 1000),
                value: hour.main.humidity
            }));
            this.charts.humidity.update(humidityData, 'Humidity (%)');
        }

        // Update wind chart
        if (this.charts.wind) {
            const windData = last24Hours.map(hour => ({
                time: new Date(hour.dt * 1000),
                value: hour.wind?.speed || 0
            }));
            this.charts.wind.update(windData, 'Wind Speed (m/s)');
        }

        // Update pressure chart
        if (this.charts.pressure) {
            const pressureData = last24Hours.map(hour => ({
                time: new Date(hour.dt * 1000),
                value: hour.main.pressure
            }));
            this.charts.pressure.update(pressureData, 'Pressure (hPa)');
        }
    }

    // Add current weather point to charts
    addCurrentWeatherPoint(weatherData) {
        const currentPoint = {
            time: new Date(),
            value: weatherData.temperature || weatherData.temp
        };

        Object.values(this.charts).forEach(chart => {
            if (chart && chart.addCurrentPoint) {
                chart.addCurrentPoint(currentPoint);
            }
        });
    }

    // Show/hide charts section
    show() {
        if (this.chartContainer) {
            this.chartContainer.style.display = 'block';
        }
    }

    hide() {
        if (this.chartContainer) {
            this.chartContainer.style.display = 'none';
        }
    }

    toggle() {
        if (this.chartContainer) {
            this.chartContainer.style.display = 
                this.chartContainer.style.display === 'none' ? 'block' : 'none';
        }
    }
}

// Simple Chart Class (without external library)
class SimpleChart {
    constructor(canvasId, color) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.color = color;
        this.data = [];
        this.padding = 20;
        this.currentPoint = null;
        
        this.setupCanvas();
    }

    setupCanvas() {
        // Set canvas size
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        
        // High DPI support
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
    }

    update(data, label) {
        this.data = data;
        this.label = label;
        this.draw();
    }

    addCurrentPoint(point) {
        this.currentPoint = point;
        this.draw();
    }

    draw() {
        if (!this.ctx || this.data.length === 0) return;

        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Calculate dimensions
        const chartWidth = width - (this.padding * 2);
        const chartHeight = height - (this.padding * 2);
        
        // Find min and max values
        const values = this.data.map(d => d.value);
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        const valueRange = maxValue - minValue || 1;
        
        // Draw grid lines
        this.drawGrid(chartWidth, chartHeight, minValue, maxValue);
        
        // Draw data line
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        this.data.forEach((point, index) => {
            const x = this.padding + (index / (this.data.length - 1)) * chartWidth;
            const y = this.padding + (1 - (point.value - minValue) / valueRange) * chartHeight;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Draw data points
        ctx.fillStyle = this.color;
        this.data.forEach((point, index) => {
            const x = this.padding + (index / (this.data.length - 1)) * chartWidth;
            const y = this.padding + (1 - (point.value - minValue) / valueRange) * chartHeight;
            
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Draw current point
        if (this.currentPoint) {
            const x = this.padding + chartWidth;
            const y = this.padding + (1 - (this.currentPoint.value - minValue) / valueRange) * chartHeight;
            
            ctx.fillStyle = '#FF0000';
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw value label
            ctx.fillStyle = '#333';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(`${this.currentPoint.value.toFixed(1)}°`, x + 10, y + 5);
        }
        
        // Draw axes labels
        this.drawAxes(minValue, maxValue);
    }

    drawGrid(chartWidth, chartHeight, minValue, maxValue) {
        const ctx = this.ctx;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 1;
        
        // Horizontal grid lines
        for (let i = 0; i <= 5; i++) {
            const y = this.padding + (i / 5) * chartHeight;
            ctx.beginPath();
            ctx.moveTo(this.padding, y);
            ctx.lineTo(this.padding + chartWidth, y);
            ctx.stroke();
        }
        
        // Vertical grid lines
        for (let i = 0; i <= 10; i++) {
            const x = this.padding + (i / 10) * chartWidth;
            ctx.beginPath();
            ctx.moveTo(x, this.padding);
            ctx.lineTo(x, this.padding + chartHeight);
            ctx.stroke();
        }
    }

    drawAxes(minValue, maxValue) {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        const chartHeight = height - (this.padding * 2);
        
        ctx.fillStyle = '#666';
        ctx.font = '10px Arial';
        ctx.textAlign = 'right';
        
        // Y-axis labels
        for (let i = 0; i <= 5; i++) {
            const value = minValue + (maxValue - minValue) * (1 - i / 5);
            const y = this.padding + (i / 5) * chartHeight;
            ctx.fillText(value.toFixed(1), this.padding - 5, y + 3);
        }
        
        // Draw title
        if (this.label) {
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(this.label, width / 2, 15);
        }
    }
}

// Initialize weather charts
let weatherCharts;

document.addEventListener('DOMContentLoaded', () => {
    weatherCharts = new WeatherCharts();
    window.weatherCharts = weatherCharts;
});
