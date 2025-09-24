import axios from 'axios';
import dotenv from 'dotenv';
import NodeCache from 'node-cache';
import moment from 'moment';

dotenv.config();

/**
 * Enhanced WeatherAPI Class v2.0
 * Professional integration with OpenWeatherMap API
 * Features: Caching, Retry Logic, Extended Data, Error Handling
 */
export class WeatherAPI {
  constructor(options = {}) {
    this.apiKey = process.env.OPENWEATHER_API_KEY || 'demo_key';
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
    this.airQualityUrl = 'https://api.openweathermap.org/data/2.5/air_pollution';
    
    // Configuration
    this.config = {
      city: options.city || process.env.WEATHER_CITY || 'Bucharest',
      country: options.country || process.env.WEATHER_COUNTRY || 'RO',
      language: options.language || process.env.DEFAULT_LANGUAGE || 'ro',
      units: options.units || 'metric',
      timeout: options.timeout || parseInt(process.env.TIMEOUT) || 10000,
      retryAttempts: options.retryAttempts || parseInt(process.env.RETRY_ATTEMPTS) || 3,
      cacheDuration: options.cacheDuration || parseInt(process.env.CACHE_DURATION) || 300 // 5 minutes
    };

    // Initialize cache
    this.cache = new NodeCache({ 
      stdTTL: this.config.cacheDuration,
      checkperiod: 60,
      useClones: false
    });

    // Request interceptor for retry logic
    this.axiosInstance = axios.create({
      timeout: this.config.timeout,
      headers: {
        'User-Agent': 'BucharestWeatherCLI/2.0.0',
        'Accept': 'application/json'
      }
    });

    this.setupRetryLogic();
    
    // Coordinates for Bucharest (for air quality and UV data)
    this.coordinates = {
      lat: 44.4268,
      lon: 26.1025
    };
  }

  setupRetryLogic() {
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const config = error.config;
        
        if (!config || !config.retry) {
          config.retry = 0;
        }
        
        config.retry += 1;
        
        if (config.retry <= this.config.retryAttempts && 
            (error.response?.status >= 500 || error.code === 'ECONNABORTED')) {
          
          const delayRetryRequest = new Promise((resolve) => {
            setTimeout(() => {
              resolve();
            }, Math.pow(2, config.retry) * 1000); // Exponential backoff
          });
          
          await delayRetryRequest;
          return this.axiosInstance(config);
        }
        
        return Promise.reject(error);
      }
    );
  }

  async getCurrent(useCache = true) {
    const cacheKey = `current_${this.config.city}_${this.config.country}`;
    
    if (useCache) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return { ...cached, fromCache: true };
      }
    }

    try {
      const response = await this.axiosInstance.get(`${this.baseUrl}/weather`, {
        params: {
          q: `${this.config.city},${this.config.country}`,
          appid: this.apiKey,
          units: this.config.units,
          lang: this.config.language
        },
        retry: 0
      });

      const data = response.data;
      const processedData = {
        // Basic weather data
        temp: Math.round(data.main.temp),
        feels_like: Math.round(data.main.feels_like),
        temp_min: Math.round(data.main.temp_min),
        temp_max: Math.round(data.main.temp_max),
        description: data.weather[0].description,
        main: data.weather[0].main,
        icon: data.weather[0].icon,
        
        // Atmospheric data
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        sea_level: data.main.sea_level,
        grnd_level: data.main.grnd_level,
        
        // Wind data
        wind_speed: data.wind?.speed || 0,
        wind_deg: data.wind?.deg || 0,
        wind_gust: data.wind?.gust || 0,
        wind_direction: this.getWindDirection(data.wind?.deg || 0),
        
        // Visibility and clouds
        visibility: data.visibility ? (data.visibility / 1000) : 10, // km
        cloudiness: data.clouds?.all || 0,
        
        // Sun times
        sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString(this.config.language === 'ro' ? 'ro-RO' : 'en-US'),
        sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString(this.config.language === 'ro' ? 'ro-RO' : 'en-US'),
        
        // Precipitation (if available)
        rain_1h: data.rain?.['1h'] || 0,
        rain_3h: data.rain?.['3h'] || 0,
        snow_1h: data.snow?.['1h'] || 0,
        snow_3h: data.snow?.['3h'] || 0,
        
        // Metadata
        timestamp: new Date().toISOString(),
        timezone: data.timezone,
        coord: data.coord,
        fromCache: false
      };

      // Cache the result
      this.cache.set(cacheKey, processedData);
      
      return processedData;
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  async getForecast(days = 5, useCache = true) {
    const cacheKey = `forecast_${this.config.city}_${days}d`;
    
    if (useCache) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const response = await this.axiosInstance.get(`${this.baseUrl}/forecast`, {
        params: {
          q: `${this.config.city},${this.config.country}`,
          appid: this.apiKey,
          units: this.config.units,
          lang: this.config.language,
          cnt: days * 8 // 8 measurements per day (every 3 hours)
        },
        retry: 0
      });

      const forecasts = response.data.list;
      const dailyData = {};

      // Group by days and process
      forecasts.forEach(item => {
        const date = moment(item.dt * 1000).format('YYYY-MM-DD');
        const dayName = moment(item.dt * 1000).format('dddd');
        
        if (!dailyData[date]) {
          dailyData[date] = {
            temps: [],
            feels_like: [],
            descriptions: [],
            humidity: [],
            wind_speeds: [],
            precipitation: [],
            date: date,
            dayName: dayName,
            formatted_date: moment(item.dt * 1000).format('DD MMM YYYY'),
            items: []
          };
        }
        
        dailyData[date].temps.push(item.main.temp);
        dailyData[date].feels_like.push(item.main.feels_like);
        dailyData[date].descriptions.push(item.weather[0].description);
        dailyData[date].humidity.push(item.main.humidity);
        dailyData[date].wind_speeds.push(item.wind?.speed || 0);
        dailyData[date].precipitation.push(item.rain?.['3h'] || item.snow?.['3h'] || 0);
        dailyData[date].items.push({
          time: moment(item.dt * 1000).format('HH:mm'),
          temp: Math.round(item.main.temp),
          description: item.weather[0].description,
          icon: item.weather[0].icon,
          humidity: item.main.humidity,
          wind_speed: item.wind?.speed || 0
        });
      });

      // Calculate daily aggregates
      const processedForecast = Object.values(dailyData).slice(0, days).map(day => ({
        date: day.formatted_date,
        dayName: day.dayName,
        temp_min: Math.round(Math.min(...day.temps)),
        temp_max: Math.round(Math.max(...day.temps)),
        temp_avg: Math.round(day.temps.reduce((a, b) => a + b, 0) / day.temps.length),
        feels_like_avg: Math.round(day.feels_like.reduce((a, b) => a + b, 0) / day.feels_like.length),
        description: this.getMostFrequent(day.descriptions),
        humidity_avg: Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length),
        wind_speed_avg: Math.round((day.wind_speeds.reduce((a, b) => a + b, 0) / day.wind_speeds.length) * 10) / 10,
        wind_speed_max: Math.round(Math.max(...day.wind_speeds) * 10) / 10,
        precipitation_total: Math.round((day.precipitation.reduce((a, b) => a + b, 0)) * 10) / 10,
        hourly: day.items
      }));

      // Cache the result
      this.cache.set(cacheKey, processedForecast);
      
      return processedForecast;
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  async getAirQuality(useCache = true) {
    const cacheKey = `air_quality_${this.coordinates.lat}_${this.coordinates.lon}`;
    
    if (useCache) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const response = await this.axiosInstance.get(this.airQualityUrl, {
        params: {
          lat: this.coordinates.lat,
          lon: this.coordinates.lon,
          appid: this.apiKey
        },
        retry: 0
      });

      const data = response.data.list[0];
      const airQualityData = {
        aqi: data.main.aqi, // Air Quality Index (1-5)
        aqi_description: this.getAQIDescription(data.main.aqi),
        co: data.components.co, // Carbon monoxide
        no: data.components.no, // Nitric oxide
        no2: data.components.no2, // Nitrogen dioxide
        o3: data.components.o3, // Ozone
        so2: data.components.so2, // Sulphur dioxide
        pm2_5: data.components.pm2_5, // PM2.5
        pm10: data.components.pm10, // PM10
        nh3: data.components.nh3, // Ammonia
        timestamp: new Date().toISOString()
      };

      this.cache.set(cacheKey, airQualityData);
      return airQualityData;
    } catch (error) {
      console.warn('Air quality data unavailable:', error.message);
      return null;
    }
  }

  async getUVIndex(useCache = true) {
    const cacheKey = `uv_index_${this.coordinates.lat}_${this.coordinates.lon}`;
    
    if (useCache) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const response = await this.axiosInstance.get(`${this.baseUrl}/uvi`, {
        params: {
          lat: this.coordinates.lat,
          lon: this.coordinates.lon,
          appid: this.apiKey
        },
        retry: 0
      });

      const uvData = {
        uv_index: response.data.value,
        uv_description: this.getUVDescription(response.data.value),
        timestamp: new Date().toISOString()
      };

      this.cache.set(cacheKey, uvData);
      return uvData;
    } catch (error) {
      console.warn('UV index data unavailable:', error.message);
      return null;
    }
  }

  // Helper methods
  getWindDirection(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return directions[Math.round(degrees / 22.5) % 16];
  }

  getMostFrequent(arr) {
    return arr.sort((a, b) =>
      arr.filter(v => v === a).length - arr.filter(v => v === b).length
    ).pop();
  }

  getAQIDescription(aqi) {
    const descriptions = {
      1: 'Foarte bun',
      2: 'Bun',
      3: 'Moderat',
      4: 'Slab',
      5: 'Foarte slab'
    };
    return descriptions[aqi] || 'Necunoscut';
  }

  getUVDescription(uv) {
    if (uv <= 2) return 'Scăzut';
    if (uv <= 5) return 'Moderat';
    if (uv <= 7) return 'Ridicat';
    if (uv <= 10) return 'Foarte ridicat';
    return 'Extrem';
  }

  handleApiError(error) {
    if (error.response?.status === 401) {
      throw new Error('🔑 API key invalid sau expirat. Rulează: bw setup');
    } else if (error.response?.status === 404) {
      throw new Error('🏙️ Orașul nu a fost găsit. Verifică configurația.');
    } else if (error.response?.status === 429) {
      throw new Error('⏰ Prea multe cereri. Încearcă din nou în câteva minute.');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('⏱️ Timeout: cererea a durat prea mult. Verifică conexiunea.');
    } else if (!error.response) {
      throw new Error('🌐 Eroare de rețea. Verifică conexiunea la internet.');
    } else {
      throw new Error(`🔥 Eroare API: ${error.message}`);
    }
  }

  // Cache management
  clearCache() {
    this.cache.flushAll();
    return 'Cache cleared successfully';
  }

  getCacheStats() {
    return {
      keys: this.cache.keys(),
      stats: this.cache.getStats()
    };
  }

  // Mock data for development (when API key is not available)
  getMockData() {
    return {
      temp: 22,
      feels_like: 24,
      temp_min: 18,
      temp_max: 25,
      description: 'parțial înnorat',
      main: 'Clouds',
      icon: '02d',
      humidity: 65,
      pressure: 1013,
      wind_speed: 3.2,
      wind_deg: 45,
      wind_direction: 'NE',
      visibility: 10,
      cloudiness: 40,
      sunrise: '06:45:00',
      sunset: '19:30:00',
      timestamp: new Date().toISOString(),
      fromCache: false
    };
  }

  getMockForecast(days = 5) {
    const forecast = [];
    for (let i = 0; i < days; i++) {
      const date = moment().add(i, 'days');
      forecast.push({
        date: date.format('DD MMM YYYY'),
        dayName: date.format('dddd'),
        temp_min: Math.round(18 + Math.random() * 5),
        temp_max: Math.round(23 + Math.random() * 7),
        temp_avg: Math.round(20 + Math.random() * 5),
        description: ['însorit', 'parțial înnorat', 'înnorat', 'ploaie ușoară'][Math.floor(Math.random() * 4)],
        humidity_avg: Math.round(60 + Math.random() * 20),
        wind_speed_avg: Math.round((2 + Math.random() * 3) * 10) / 10,
        precipitation_total: Math.round(Math.random() * 5 * 10) / 10
      });
    }
    return forecast;
  }
}