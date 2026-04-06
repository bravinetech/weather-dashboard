// Weather Sounds Manager
class WeatherSounds {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.currentSound = null;
        this.volume = 0.3;
        this.isPlaying = false;
        
        this.init();
    }

    init() {
        // Initialize Web Audio API
        if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.generateSounds();
        }
        
        // Load user preferences
        this.loadSettings();
    }

    generateSounds() {
        // Generate rain sound
        this.sounds.rain = this.generateRainSound();
        
        // Generate thunder sound
        this.sounds.thunder = this.generateThunderSound();
        
        // Generate wind sound
        this.sounds.wind = this.generateWindSound();
        
        // Generate birds chirping (for sunny weather)
        this.sounds.birds = this.generateBirdsSound();
        
        // Generate ocean waves (for coastal areas)
        this.sounds.ocean = this.generateOceanSound();
    }

    generateRainSound() {
        const duration = 10; // 10 seconds loop
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = buffer.getChannelData(channel);
            for (let i = 0; i < channelData.length; i++) {
                // Generate filtered white noise for rain
                let sample = (Math.random() - 0.5) * 0.1;
                
                // Add some low-frequency filtering
                sample *= Math.sin(i * 0.001) * 0.5 + 0.5;
                
                // Add occasional drops
                if (Math.random() < 0.001) {
                    sample += (Math.random() - 0.5) * 0.3;
                }
                
                channelData[i] = sample;
            }
        }
        
        return buffer;
    }

    generateThunderSound() {
        const duration = 3;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = buffer.getChannelData(channel);
            for (let i = 0; i < channelData.length; i++) {
                const t = i / sampleRate;
                
                // Thunder rumble with multiple frequency components
                let sample = 0;
                sample += Math.sin(50 * Math.PI * 2 * t) * Math.exp(-t * 2) * 0.3;
                sample += Math.sin(100 * Math.PI * 2 * t) * Math.exp(-t * 3) * 0.2;
                sample += (Math.random() - 0.5) * 0.1 * Math.exp(-t * 1.5);
                
                // Add some crackle
                if (Math.random() < 0.001) {
                    sample += (Math.random() - 0.5) * 0.5;
                }
                
                channelData[i] = sample;
            }
        }
        
        return buffer;
    }

    generateWindSound() {
        const duration = 8;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = buffer.getChannelData(channel);
            for (let i = 0; i < channelData.length; i++) {
                const t = i / sampleRate;
                
                // Wind noise with varying intensity
                const intensity = Math.sin(t * 0.1) * 0.5 + 0.5;
                let sample = (Math.random() - 0.5) * 0.05 * intensity;
                
                // Add low-frequency wind howl
                sample += Math.sin(20 * Math.PI * 2 * t) * 0.1 * intensity;
                
                // Add some gusts
                if (Math.random() < 0.002) {
                    sample += (Math.random() - 0.5) * 0.2;
                }
                
                channelData[i] = sample;
            }
        }
        
        return buffer;
    }

    generateBirdsSound() {
        const duration = 6;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = buffer.getChannelData(channel);
            for (let i = 0; i < channelData.length; i++) {
                const t = i / sampleRate;
                let sample = 0;
                
                // Generate occasional bird chirps
                if (Math.random() < 0.005) {
                    const chirpFreq = 2000 + Math.random() * 3000;
                    const chirpDuration = 0.1 + Math.random() * 0.2;
                    const chirpStart = Math.random();
                    
                    if (t >= chirpStart && t < chirpStart + chirpDuration) {
                        sample = Math.sin(chirpFreq * Math.PI * 2 * (t - chirpStart)) * 
                                Math.exp(-(t - chirpStart) * 10) * 0.1;
                    }
                }
                
                channelData[i] = sample;
            }
        }
        
        return buffer;
    }

    generateOceanSound() {
        const duration = 10;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = buffer.getChannelData(channel);
            for (let i = 0; i < channelData.length; i++) {
                const t = i / sampleRate;
                
                // Ocean waves with multiple frequencies
                let sample = 0;
                sample += Math.sin(0.5 * Math.PI * 2 * t) * 0.1; // Low frequency waves
                sample += Math.sin(1.2 * Math.PI * 2 * t) * 0.05; // Mid frequency
                sample += Math.sin(2.5 * Math.PI * 2 * t) * 0.02; // High frequency
                
                // Add some foam noise
                sample += (Math.random() - 0.5) * 0.02;
                
                // Apply envelope for wave crests
                const envelope = Math.sin(t * Math.PI) * 0.5 + 0.5;
                sample *= envelope;
                
                channelData[i] = sample;
            }
        }
        
        return buffer;
    }

    playSound(soundName, options = {}) {
        if (!this.audioContext || !this.sounds[soundName]) return;
        
        // Stop current sound if requested
        if (options.stopCurrent && this.currentSound) {
            this.stopSound();
        }
        
        const buffer = this.sounds[soundName];
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        source.buffer = buffer;
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Set volume
        gainNode.gain.value = options.volume || this.volume;
        
        // Loop if specified
        if (options.loop !== false) {
            source.loop = true;
        }
        
        // Fade in
        if (options.fadeIn) {
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(
                this.volume, 
                this.audioContext.currentTime + (options.fadeInTime || 1)
            );
        }
        
        // Fade out
        if (options.fadeOut) {
            gainNode.gain.linearRampToValueAtTime(
                0, 
                this.audioContext.currentTime + (options.fadeOutTime || 2)
            );
            source.stop(this.audioContext.currentTime + (options.fadeOutTime || 2));
        }
        
        source.start(0);
        this.currentSound = { source, gainNode, name: soundName };
        this.isPlaying = true;
        
        return source;
    }

    stopSound() {
        if (this.currentSound) {
            // Fade out before stopping
            this.currentSound.gainNode.gain.linearRampToValueAtTime(
                0, 
                this.audioContext.currentTime + 0.5
            );
            
            setTimeout(() => {
                if (this.currentSound && this.currentSound.source) {
                    this.currentSound.source.stop();
                }
                this.currentSound = null;
                this.isPlaying = false;
            }, 500);
        }
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        this.saveSettings();
        
        // Update current sound volume
        if (this.currentSound && this.currentSound.gainNode) {
            this.currentSound.gainNode.gain.value = this.volume;
        }
    }

    updateWeatherSounds(weatherData) {
        if (!weatherData) return;
        
        const description = weatherData.description.toLowerCase();
        const icon = weatherData.icon;
        
        // Stop current sound
        this.stopSound();
        
        // Play appropriate sound
        if (description.includes('rain') || description.includes('drizzle')) {
            this.playSound('rain', { fadeIn: true, fadeInTime: 2 });
            
            // Add occasional thunder
            if (description.includes('thunder')) {
                this.scheduleThunder();
            }
        } else if (description.includes('wind')) {
            this.playSound('wind', { fadeIn: true, fadeInTime: 2 });
        } else if (icon === '01d' && description.includes('clear')) {
            this.playSound('birds', { fadeIn: true, fadeInTime: 2 });
        } else if (description.includes('snow')) {
            // Snow is quiet, no sound
        } else {
            // Default: no sound for moderate weather
        }
    }

    scheduleThunder() {
        setTimeout(() => {
            this.playSound('thunder', { volume: 0.5, loop: false });
            
            // Schedule next thunder
            if (this.isPlaying) {
                this.scheduleThunder();
            }
        }, Math.random() * 10000 + 5000); // 5-15 seconds
    }

    // User controls
    toggleMute() {
        if (this.isPlaying) {
            this.stopSound();
        } else {
            // Resume last sound
            if (window.app && window.app.currentWeatherData) {
                this.updateWeatherSounds(window.app.currentWeatherData.current);
            }
        }
    }

    loadSettings() {
        const saved = localStorage.getItem('weather-sounds-settings');
        if (saved) {
            const settings = JSON.parse(saved);
            this.volume = settings.volume || 0.3;
        }
    }

    saveSettings() {
        const settings = {
            volume: this.volume
        };
        localStorage.setItem('weather-sounds-settings', JSON.stringify(settings));
    }

    // Test sounds
    testSound(soundName) {
        this.playSound(soundName, { 
            stopCurrent: true, 
            fadeIn: true, 
            fadeOut: true, 
            fadeOutTime: 3 
        });
    }

    cleanup() {
        this.stopSound();
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}

// Initialize weather sounds
let weatherSounds;

document.addEventListener('DOMContentLoaded', () => {
    weatherSounds = new WeatherSounds();
    window.weatherSounds = weatherSounds;
});
