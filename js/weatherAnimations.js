// Weather Animation Manager
class WeatherAnimations {
    constructor() {
        this.canvas = document.getElementById('weatherCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.animationType = null;
        this.animationId = null;
        
        this.init();
    }

    init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    // Start weather animation based on conditions
    startAnimation(weatherData) {
        this.stopAnimation();
        
        const description = weatherData.description.toLowerCase();
        const icon = weatherData.icon;
        
        if (description.includes('rain') || description.includes('drizzle')) {
            this.startRainAnimation();
        } else if (description.includes('snow')) {
            this.startSnowAnimation();
        } else if (description.includes('cloud') && !description.includes('clear')) {
            this.startCloudAnimation();
        } else if (icon === '01d' && description.includes('clear')) {
            this.startSunAnimation();
        } else {
            this.stopAnimation();
        }
    }

    stopAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.particles = [];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Rain Animation
    startRainAnimation() {
        this.animationType = 'rain';
        this.particles = [];
        
        // Create rain drops
        for (let i = 0; i < 100; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height - this.canvas.height,
                length: Math.random() * 20 + 10,
                speed: Math.random() * 10 + 15,
                opacity: Math.random() * 0.5 + 0.3,
                width: Math.random() * 2 + 1
            });
        }
        
        this.animateRain();
    }

    animateRain() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(drop => {
            this.ctx.beginPath();
            this.ctx.moveTo(drop.x, drop.y);
            this.ctx.lineTo(drop.x, drop.y + drop.length);
            this.ctx.strokeStyle = `rgba(174, 194, 224, ${drop.opacity})`;
            this.ctx.lineWidth = drop.width;
            this.ctx.stroke();
            
            // Update position
            drop.y += drop.speed;
            
            // Reset if off screen
            if (drop.y > this.canvas.height) {
                drop.y = -drop.length;
                drop.x = Math.random() * this.canvas.width;
            }
        });
        
        this.animationId = requestAnimationFrame(() => this.animateRain());
    }

    // Snow Animation
    startSnowAnimation() {
        this.animationType = 'snow';
        this.particles = [];
        
        // Create snowflakes
        for (let i = 0; i < 80; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 4 + 2,
                speed: Math.random() * 3 + 1,
                wind: Math.random() * 2 - 1,
                opacity: Math.random() * 0.8 + 0.2,
                swing: Math.random() * 2
            });
        }
        
        this.animateSnow();
    }

    animateSnow() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(flake => {
            this.ctx.beginPath();
            this.ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
            this.ctx.fill();
            
            // Add glow effect
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
            
            // Update position with swaying motion
            flake.y += flake.speed;
            flake.x += flake.wind + Math.sin(flake.y / flake.swing) * 0.5;
            
            // Reset if off screen
            if (flake.y > this.canvas.height + flake.radius) {
                flake.y = -flake.radius;
                flake.x = Math.random() * this.canvas.width;
            }
            
            // Keep within horizontal bounds
            if (flake.x > this.canvas.width + flake.radius) {
                flake.x = -flake.radius;
            } else if (flake.x < -flake.radius) {
                flake.x = this.canvas.width + flake.radius;
            }
        });
        
        this.animationId = requestAnimationFrame(() => this.animateSnow());
    }

    // Cloud Animation
    startCloudAnimation() {
        this.animationType = 'clouds';
        this.particles = [];
        
        // Create clouds
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * (this.canvas.height * 0.3) + 50,
                width: Math.random() * 200 + 100,
                height: Math.random() * 60 + 40,
                speed: Math.random() * 0.5 + 0.2,
                opacity: Math.random() * 0.3 + 0.1,
                circles: this.generateCloudCircles()
            });
        }
        
        this.animateClouds();
    }

    generateCloudCircles() {
        const circles = [];
        const numCircles = Math.floor(Math.random() * 4) + 3;
        for (let i = 0; i < numCircles; i++) {
            circles.push({
                offsetX: Math.random() * 60 - 30,
                offsetY: Math.random() * 20 - 10,
                radius: Math.random() * 30 + 20
            });
        }
        return circles;
    }

    animateClouds() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(cloud => {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${cloud.opacity})`;
            
            // Draw cloud using multiple circles
            cloud.circles.forEach(circle => {
                this.ctx.beginPath();
                this.ctx.arc(
                    cloud.x + circle.offsetX,
                    cloud.y + circle.offsetY,
                    circle.radius,
                    0,
                    Math.PI * 2
                );
                this.ctx.fill();
            });
            
            // Update position
            cloud.x += cloud.speed;
            
            // Reset if off screen
            if (cloud.x > this.canvas.width + cloud.width) {
                cloud.x = -cloud.width;
                cloud.y = Math.random() * (this.canvas.height * 0.3) + 50;
            }
        });
        
        this.animationId = requestAnimationFrame(() => this.animateClouds());
    }

    // Sun Animation (subtle rays)
    startSunAnimation() {
        this.animationType = 'sun';
        this.particles = [];
        
        // Create sun rays
        const centerX = this.canvas.width * 0.8;
        const centerY = this.canvas.height * 0.2;
        const numRays = 12;
        
        for (let i = 0; i < numRays; i++) {
            const angle = (Math.PI * 2 / numRays) * i;
            this.particles.push({
                angle: angle,
                length: Math.random() * 100 + 150,
                width: Math.random() * 3 + 2,
                speed: Math.random() * 0.01 + 0.005,
                opacity: Math.random() * 0.3 + 0.1
            });
        }
        
        this.animateSun();
    }

    animateSun() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const centerX = this.canvas.width * 0.8;
        const centerY = this.canvas.height * 0.2;
        
        // Draw sun circle
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 40, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255, 223, 0, 0.8)';
        this.ctx.fill();
        
        // Draw sun glow
        const gradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 100);
        gradient.addColorStop(0, 'rgba(255, 223, 0, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 223, 0, 0)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(centerX - 100, centerY - 100, 200, 200);
        
        // Draw animated rays
        this.particles.forEach(ray => {
            const endX = centerX + Math.cos(ray.angle) * ray.length;
            const endY = centerY + Math.sin(ray.angle) * ray.length;
            
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.lineTo(endX, endY);
            this.ctx.strokeStyle = `rgba(255, 223, 0, ${ray.opacity})`;
            this.ctx.lineWidth = ray.width;
            this.ctx.stroke();
            
            // Rotate ray
            ray.angle += ray.speed;
        });
        
        this.animationId = requestAnimationFrame(() => this.animateSun());
    }

    // Public method to update weather
    updateWeather(weatherData) {
        this.startAnimation(weatherData);
    }
}

// Initialize weather animations
let weatherAnimations;

document.addEventListener('DOMContentLoaded', () => {
    weatherAnimations = new WeatherAnimations();
    
    // Make it globally accessible
    window.weatherAnimations = weatherAnimations;
});
