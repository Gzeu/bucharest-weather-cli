import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * WeatherAPI Class
 * Integrare cu OpenWeatherMap pentru București
 */
export class WeatherAPI {
  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY || 'demo_key';
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
    this.city = 'Bucharest';
    this.country = 'RO';
  }

  async getCurrent() {
    try {
      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          q: `${this.city},${this.country}`,
          appid: this.apiKey,
          units: 'metric',
          lang: 'ro'
        }
      });

      const data = response.data;
      return {
        temp: Math.round(data.main.temp),
        feels_like: Math.round(data.main.feels_like),
        description: data.weather[0].description,
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        wind_speed: data.wind.speed,
        visibility: data.visibility / 1000, // km
        sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString('ro-RO'),
        sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString('ro-RO'),
        icon: data.weather[0].icon
      };
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('API key invalid. Rulează: bw setup');
      }
      throw new Error(`Eroare API: ${error.message}`);
    }
  }

  async getForecast(days = 5) {
    try {
      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          q: `${this.city},${this.country}`,
          appid: this.apiKey,
          units: 'metric',
          lang: 'ro',
          cnt: days * 8 // 8 măsurători pe zi (la 3 ore)
        }
      });

      const forecasts = response.data.list;
      const dailyData = {};

      // Grupează pe zile
      forecasts.forEach(item => {
        const date = new Date(item.dt * 1000).toDateString();
        if (!dailyData[date]) {
          dailyData[date] = {
            temps: [],
            descriptions: [],
            date: new Date(item.dt * 1000).toLocaleDateString('ro-RO')
          };
        }
        dailyData[date].temps.push(item.main.temp);
        dailyData[date].descriptions.push(item.weather[0].description);
      });

      // Calculează min/max pe zi
      return Object.values(dailyData).slice(0, days).map(day => ({
        date: day.date,
        temp_min: Math.round(Math.min(...day.temps)),
        temp_max: Math.round(Math.max(...day.temps)),
        description: day.descriptions[0] // Prima descriere din zi
      }));
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('API key invalid. Rulează: bw setup');
      }
      throw new Error(`Eroare forecast: ${error.message}`);
    }
  }

  // Mock data pentru demo (când API key nu e setat)
  getMockData() {
    return {
      temp: 22,
      feels_like: 24,
      description: 'parțial înnorat',
      humidity: 65,
      pressure: 1013,
      wind_speed: 3.2,
      visibility: 10,
      sunrise: '06:45:00',
      sunset: '19:30:00',
      icon: '02d'
    };
  }
}