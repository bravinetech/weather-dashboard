// 3D Weather Globe Visualization
class WeatherGlobe {
    constructor() {
        this.canvas = document.getElementById('globeCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.rotation = 0;
        this.markers = [];
        this.isAnimating = false;
        
        this.init();
    }

    init() {
        // Set canvas size explicitly
        if (this.canvas) {
            this.canvas.width = 150;
            this.canvas.height = 150;
            this.canvas.style.width = '150px';
            this.canvas.style.height = '150px';
            this.canvas.style.display = 'block';
        }
        
        window.addEventListener('resize', () => this.resizeCanvas());
        this.startAnimation();
        
        // Add some demo markers
        this.addDemoMarkers();
    }

    addDemoMarkers() {
        // Add some major cities with demo weather data
        const demoCities = [
            { lat: 40.7128, lon: -74.0060, temp: 22, desc: 'clear sky', icon: '01d' },
            { lat: 51.5074, lon: -0.1278, temp: 18, desc: 'few clouds', icon: '02d' },
            { lat: 35.6762, lon: 139.6503, temp: 25, desc: 'scattered clouds', icon: '03d' },
            { lat: -33.8688, lon: 151.2093, temp: 20, desc: 'broken clouds', icon: '04d' },
            { lat: 48.8566, lon: 2.3522, temp: 15, desc: 'light rain', icon: '10d' }
        ];
        
        demoCities.forEach(city => {
            this.addWeatherMarker(city.lat, city.lon, {
                temperature: city.temp,
                description: city.desc,
                icon: city.icon
            });
        });
    }

    resizeCanvas() {
        if (this.canvas) {
            const width = this.canvas.offsetWidth || 150;
            const height = this.canvas.offsetHeight || 150;
            this.canvas.width = width;
            this.canvas.height = height;
        }
    }

    addWeatherMarker(lat, lon, weatherData) {
        this.markers.push({
            lat: lat,
            lon: lon,
            temp: weatherData.temperature,
            description: weatherData.description,
            icon: weatherData.icon,
            color: this.getTemperatureColor(weatherData.temperature)
        });
    }

    getTemperatureColor(temp) {
        if (temp < 0) return '#4FC3F7'; // Blue for cold
        if (temp < 10) return '#81C784'; // Green for cool
        if (temp < 20) return '#FFB74D'; // Orange for mild
        if (temp < 30) return '#FF8A65'; // Red-orange for warm
        return '#E57373'; // Red for hot
    }

    startAnimation() {
        this.isAnimating = true;
        this.animate();
    }

    stopAnimation() {
        this.isAnimating = false;
    }

    animate() {
        if (!this.isAnimating) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw globe
        this.drawGlobe();
        
        // Draw markers
        this.drawMarkers();
        
        // Rotate
        this.rotation += 0.005;
        
        requestAnimationFrame(() => this.animate());
    }

    drawGlobe() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 10;
        
        // Draw sphere
        const gradient = this.ctx.createRadialGradient(
            centerX - radius/3, centerY - radius/3, 0,
            centerX, centerY, radius
        );
        gradient.addColorStop(0, '#1E88E5');
        gradient.addColorStop(0.5, '#1565C0');
        gradient.addColorStop(1, '#0D47A1');
        
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        // Draw grid lines
        this.drawGridLines(centerX, centerY, radius);
    }

    drawGridLines(centerX, centerY, radius) {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 0.5;
        
        // Latitude lines
        for (let lat = -60; lat <= 60; lat += 30) {
            this.ctx.beginPath();
            for (let lon = 0; lon <= 360; lon += 15) {
                const point = this.latLonToXY(lat, lon, centerX, centerY, radius);
                if (point && point.z > 0) {
                    if (lon === 0) {
                        this.ctx.moveTo(point.x, point.y);
                    } else {
                        this.ctx.lineTo(point.x, point.y);
                    }
                }
            }
            this.ctx.stroke();
        }
        
        // Longitude lines
        for (let lon = 0; lon < 360; lon += 30) {
            this.ctx.beginPath();
            for (let lat = -90; lat <= 90; lat += 15) {
                const point = this.latLonToXY(lat, lon, centerX, centerY, radius);
                if (point && point.z > 0) {
                    if (lat === -90) {
                        this.ctx.moveTo(point.x, point.y);
                    } else {
                        this.ctx.lineTo(point.x, point.y);
                    }
                }
            }
            this.ctx.stroke();
        }
    }

    latLonToXY(lat, lon, centerX, centerY, radius) {
        const phi = (90 - lat) * Math.PI / 180;
        const theta = (lon + this.rotation * 180 / Math.PI) * Math.PI / 180;
        
        const x = centerX + radius * Math.sin(phi) * Math.cos(theta);
        const y = centerY - radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);
        
        // Only show if visible (z > 0)
        if (z < 0) return null;
        
        return { x, y, z };
    }

    drawMarkers() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 10;
        
        this.markers.forEach(marker => {
            const point = this.latLonToXY(marker.lat, marker.lon, centerX, centerY, radius);
            
            if (point && point.z > 0) {
                // Draw marker
                this.ctx.beginPath();
                this.ctx.arc(point.x, point.y, 3 + point.z / 100, 0, Math.PI * 2);
                this.ctx.fillStyle = marker.color;
                this.ctx.fill();
                
                // Draw temperature
                this.ctx.fillStyle = 'white';
                this.ctx.font = '8px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(`${marker.temp}°`, point.x, point.y - 8);
            }
        });
    }

    clearMarkers() {
        this.markers = [];
    }

    // Show/hide globe
    show() {
        if (this.canvas) {
            this.canvas.style.display = 'block';
        }
    }

    hide() {
        if (this.canvas) {
            this.canvas.style.display = 'none';
        }
    }

    toggle() {
        if (this.canvas) {
            this.canvas.style.display = this.canvas.style.display === 'none' ? 'block' : 'none';
        }
    }
}

// Initialize globe
let weatherGlobe;

document.addEventListener('DOMContentLoaded', () => {
    const globeCanvas = document.getElementById('globeCanvas');
    if (globeCanvas) {
        weatherGlobe = new WeatherGlobe();
        window.weatherGlobe = weatherGlobe;
    }
});
