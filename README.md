# Weather Dashboard

A modern, responsive weather dashboard application with real-time weather tracking, interactive maps, 7-day forecasts, and location-based weather alerts.

## Features

### 🌤️ Current Weather
- Real-time weather data for any location
- Temperature, humidity, wind speed, pressure, and visibility
- UV index, sunrise, and sunset times
- Beautiful weather icons and descriptions
- "Feels like" temperature

### 📅 7-Day Forecast
- Daily temperature highs and lows
- Weather conditions and precipitation chances
- Humidity and wind information
- Interactive forecast cards with animations

### ⏰ Hourly Forecast
- 24-hour detailed forecast
- Temperature trends throughout the day
- Precipitation probability
- Scrollable timeline view

### 🗺️ Interactive Maps
- Click anywhere on the map to get weather for that location
- Multiple weather overlay layers (temperature, precipitation, wind)
- Zoom controls and fullscreen mode
- Weather markers with detailed popups

### ⚠️ Weather Alerts
- Automatic severe weather alerts
- Temperature extremes warnings
- Wind, precipitation, and storm alerts
- Color-coded alert severity levels

### 🔍 Search & Location
- Search for any city worldwide
- Geolocation support for automatic location detection
- Location history and favorites
- Smart location suggestions

### 📱 Responsive Design
- Mobile-friendly interface
- Tablet and desktop optimized
- Touch-friendly controls
- Progressive Web App ready

## Technology Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Maps**: Leaflet.js with OpenStreetMap
- **Weather API**: OpenWeatherMap API
- **Styling**: CSS Grid, Flexbox, CSS Animations
- **Icons**: OpenWeatherMap Weather Icons
- **Fonts**: Google Fonts (Inter)

## Quick Start

### Prerequisites
- Node.js (optional, for development server)
- OpenWeatherMap API key

### Installation

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd weather-dashboard
   ```

2. **Get OpenWeatherMap API Key**
   - Sign up at [OpenWeatherMap](https://openweathermap.org/api)
   - Get your free API key
   - Replace `YOUR_API_KEY_HERE` in `js/config.js` with your API key

3. **Configure API Key**
   Open `js/config.js` and update:
   ```javascript
   API_KEY: 'your_actual_api_key_here',
   ```

4. **Run the application**
   
   **Option 1: Using Node.js (recommended)**
   ```bash
   npm install
   npm start
   ```
   
   **Option 2: Using a local server**
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using PHP
   php -S localhost:8000
   
   # Using Live Server extension in VS Code
   # Right-click index.html and select "Open with Live Server"
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000` (or your chosen port)

## Usage

### Basic Usage
1. **Allow Location Access**: The app will automatically request your location
2. **Search Locations**: Type any city name in the search bar
3. **Explore Maps**: Click on the map to get weather for any location
4. **View Forecasts**: Scroll through hourly and 7-day forecasts
5. **Check Alerts**: Monitor weather alerts for severe conditions

### Advanced Features

#### Map Layers
- **Temperature Layer**: Shows temperature gradients
- **Precipitation Layer**: Displays rainfall/snowfall data
- **Wind Layer**: Shows wind patterns and speed

#### Keyboard Shortcuts
- `Ctrl/Cmd + K`: Focus search bar
- `Escape`: Clear search
- `Enter`: Search when search bar is focused

#### Debug Tools
Open browser console and use:
```javascript
weatherDebug.exportData()    // Export current weather data
weatherDebug.shareData()     // Share weather information
weatherDebug.getStats()      // Get weather statistics
weatherDebug.refresh()       // Refresh weather data
weatherDebug.clearCache()    // Clear API cache
```

## Configuration

### API Settings
Edit `js/config.js` to customize:
- API key and endpoints
- Units (metric/imperial/kelvin)
- Language settings
- Refresh intervals
- Map defaults

### Customization
- **Colors**: Modify CSS variables in `styles.css`
- **Fonts**: Update Google Fonts import in `index.html`
- **Animations**: Adjust CSS animation durations
- **Map Styles**: Customize Leaflet map appearance

## API Integration

### OpenWeatherMap API
The app uses several OpenWeatherMap endpoints:

1. **Current Weather**: `/weather`
2. **5-Day Forecast**: `/forecast`
3. **Geocoding**: `/geo/1.0/direct`
4. **Weather Layers**: Map tiles for overlays

### Rate Limits
- Free tier: 1,000 calls/day, 60 calls/minute
- Data is cached for 10 minutes to reduce API calls

## Browser Support

- **Chrome**: 60+
- **Firefox**: 55+
- **Safari**: 12+
- **Edge**: 79+
- **Mobile**: iOS Safari 12+, Chrome Mobile 60+

## Performance Features

- **API Caching**: 10-minute cache to reduce API calls
- **Lazy Loading**: Images and data loaded as needed
- **Responsive Images**: Optimized weather icons
- **Minified Assets**: Production-ready code
- **Service Worker**: Offline support (PWA)

## Security

- **HTTPS Required**: For geolocation and API calls
- **API Key Protection**: Client-side key (consider server proxy for production)
- **CORS Handling**: Proper cross-origin request handling
- **Input Validation**: Sanitized search inputs

## Troubleshooting

### Common Issues

1. **API Key Error**
   - Ensure you've replaced `YOUR_API_KEY_HERE` in `config.js`
   - Verify your API key is active and not expired

2. **Geolocation Not Working**
   - Check browser location permissions
   - Ensure HTTPS is used (required for geolocation)
   - Try manual search as alternative

3. **Map Not Loading**
   - Check internet connection
   - Verify Leaflet.js is loading properly
   - Check browser console for errors

4. **Weather Data Not Updating**
   - Check API rate limits
   - Verify cache settings
   - Try manual refresh

### Debug Mode
Enable debug logging by adding to `js/app.js`:
```javascript
const DEBUG = true;
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Check the troubleshooting section
- Review browser console for errors
- Verify API key and network connection
- Create an issue with detailed information

## Future Enhancements

- [ ] Weather radar and satellite imagery
- [ ] Historical weather data
- [ ] Weather comparison between locations
- [ ] Custom weather notifications
- [ ] Integration with weather stations
- [ ] Air quality index
- [ ] Pollen count and allergen information
- [ ] Ski and snow reports
- [ ] Marine weather forecasts
- [ ] Agricultural weather data

---

**Weather Dashboard** - Your comprehensive weather information hub 🌤️
