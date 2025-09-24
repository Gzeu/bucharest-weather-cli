#!/usr/bin/env node

import { WeatherAPI } from './weather.js';
import { AIInsights } from './ai-insights.js';
import chalk from 'chalk';
import boxen from 'boxen';
import figlet from 'figlet';
import { table } from 'table';
import moment from 'moment';
import ora from 'ora';
import fs from 'fs/promises';
import { createObjectCsvWriter } from 'csv-writer';

/**
 * Enhanced Bucharest Weather CLI Application v2.0
 * Professional weather tool with AI insights and advanced features
 */
export class BucharestWeatherApp {
  constructor(options = {}) {
    this.weather = new WeatherAPI(options);
    this.ai = new AIInsights(options);
    this.config = {
      showBanner: options.showBanner !== false,
      showCache: options.showCache || false,
      verboseMode: options.verbose || false,
      language: options.language || 'ro'
    };
  }

  async showBanner() {
    if (!this.config.showBanner) return;
    
    const banner = figlet.textSync('BW CLI v2', { font: 'Small' });
    console.log(chalk.cyan(banner));
    console.log(chalk.gray('🌤️  Bucharest Weather CLI v2.0.0'));
    console.log(chalk.gray('   Professional Weather Intelligence'));
    console.log(chalk.gray('   Powered by MCP + Perplexity AI\n'));
  }

  async getCurrentWeather(showExtended = false) {
    const spinner = ora('Obțin datele meteorologice avansate...').start();
    
    try {
      // Fetch all weather data in parallel
      const [currentData, airQuality, uvIndex] = await Promise.allSettled([
        this.weather.getCurrent(),
        this.weather.getAirQuality(),
        this.weather.getUVIndex()
      ]);
      
      const current = currentData.value;
      const air = airQuality.status === 'fulfilled' ? airQuality.value : null;
      const uv = uvIndex.status === 'fulfilled' ? uvIndex.value : null;
      
      spinner.succeed('Date meteo obținute cu succes!');
      
      // Generate AI insights
      const insights = await this.ai.generateInsights(current, null, air, uv);
      
      // Display current weather
      await this.displayCurrentWeather(current, insights, air, uv, showExtended);
      
      return { current, air, uv, insights };
      
    } catch (error) {
      spinner.fail('Eroare la obținerea datelor');
      console.error(chalk.red('❌ Eroare:', error.message));
      
      // Fallback to mock data if API fails
      if (error.message.includes('API key')) {
        console.log(chalk.yellow('\n📝 Folosesc date demo:'));
        const mockData = this.weather.getMockData();
        const mockInsights = await this.ai.generateInsights(mockData);
        await this.displayCurrentWeather(mockData, mockInsights, null, null, showExtended);
      }
    }
  }

  async displayCurrentWeather(data, insights, airQuality, uvIndex, showExtended) {
    const timestamp = new Date().toLocaleString('ro-RO');
    const cacheIndicator = data.fromCache ? chalk.yellow(' [Cache]') : '';
    
    // Main weather info
    const mainInfo = [
      chalk.bold.blue('🌡️ VREMEA ACUM ÎN BUCUREȘTI') + cacheIndicator,
      chalk.gray(`${timestamp}`),
      '',
      `${chalk.yellow('Temperatură:')} ${this.formatTemperature(data.temp)} (simte ca ${data.feels_like}°C)`,
      `${chalk.cyan('Descriere:')} ${data.description} ${this.getWeatherIcon(data.icon)}`,
      `${chalk.green('Umiditate:')} ${data.humidity}% | ${chalk.magenta('Presiune:')} ${data.pressure} hPa`,
      `${chalk.blue('Vânt:')} ${data.wind_speed} m/s ${data.wind_direction || ''} | ${chalk.white('Vizibilitate:')} ${data.visibility} km`,
      `${chalk.orange('Nori:')} ${data.cloudiness}% | ${chalk.red('Răsărit:')} ${data.sunrise} | ${chalk.red('Apus:')} ${data.sunset}`,
    ];
    
    // Add precipitation if present
    if (data.rain_1h > 0 || data.rain_3h > 0) {
      mainInfo.push(`${chalk.blue('Ploaie:')} ${data.rain_1h || 0} mm/h, ${data.rain_3h || 0} mm/3h`);
    }
    
    if (data.snow_1h > 0 || data.snow_3h > 0) {
      mainInfo.push(`${chalk.white('Zăpadă:')} ${data.snow_1h || 0} mm/h, ${data.snow_3h || 0} mm/3h`);
    }
    
    // Extended info section
    if (showExtended) {
      mainInfo.push('', chalk.bold.cyan('📈 DETALII AVANSATE:'));
      
      if (airQuality) {
        mainInfo.push(`${chalk.green('Calitatea aerului:')} ${airQuality.aqi_description} (AQI: ${airQuality.aqi})`);
        mainInfo.push(`${chalk.gray('PM2.5:')} ${airQuality.pm2_5} μg/m³ | ${chalk.gray('PM10:')} ${airQuality.pm10} μg/m³`);
      }
      
      if (uvIndex) {
        mainInfo.push(`${chalk.yellow('Indice UV:')} ${uvIndex.uv_index} (${uvIndex.uv_description})`);
      }
      
      if (data.temp_min !== data.temp_max) {
        mainInfo.push(`${chalk.cyan('Interval:')} ${data.temp_min}°C - ${data.temp_max}°C`);
      }
    }
    
    console.log(boxen(mainInfo.join('\n'), {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'blue',
      title: '🌤️ VREMEA LIVE',
      titleAlignment: 'center'
    }));

    // AI Insights section
    await this.displayAIInsights(insights);
    
    // Smart alerts
    await this.displaySmartAlerts(insights.alerts);
  }

  async displayAIInsights(insights) {
    const aiInfo = [
      chalk.bold.green('🤖 RECOMANDĂRI AI PERSONALIZATE:'),
      '',
      `👕 ${chalk.yellow('Îmbrăcăminte:')} ${insights.clothing}`,
      `${insights.activities}`,
      `🎯 ${chalk.cyan('Localizări:')} ${insights.locations}`,
      '',
      `💊 ${chalk.green('Sănătate:')} ${insights.health}`
    ];
    
    console.log(boxen(aiInfo.join('\n'), {
      padding: 1,
      margin: 1,
      borderStyle: 'single',
      borderColor: 'green',
      title: '🤖 AI INSIGHTS',
      titleAlignment: 'center'
    }));
  }

  async displaySmartAlerts(alerts) {
    if (!alerts || alerts.length === 0) return;
    
    const alertMessages = alerts.map(alert => {
      const icon = this.getAlertIcon(alert.level);
      const color = this.getAlertColor(alert.level);
      return color(`${icon} ${alert.message}`);
    });
    
    console.log(boxen(alertMessages.join('\n'), {
      padding: 1,
      margin: 1,
      borderStyle: 'double',
      borderColor: 'yellow',
      title: '⚠️ ALERTE METEO',
      titleAlignment: 'center'
    }));
  }

  async getForecast(days = 5, showHourly = false) {
    const spinner = ora(`Obțin prognoza pentru ${days} zile...`).start();
    
    try {
      const forecast = await this.weather.getForecast(days);
      spinner.succeed('Prognoza obținută cu succes!');
      
      await this.displayForecast(forecast, days, showHourly);
      return forecast;
      
    } catch (error) {
      spinner.fail('Eroare la obținerea prognozei');
      console.error(chalk.red('❌ Eroare prognoză:', error.message));
      
      // Fallback to mock data
      const mockForecast = this.weather.getMockForecast(days);
      console.log(chalk.yellow('\n📝 Folosesc prognoza demo:'));
      await this.displayForecast(mockForecast, days, showHourly);
    }
  }

  async displayForecast(forecast, days, showHourly) {
    console.log(chalk.bold.blue(`\n📅 PROGNOZA ${days} ZILE - BUCUREȘTI`));
    console.log(chalk.gray('─'.repeat(60)));
    
    forecast.forEach((day, index) => {
      const dayName = index === 0 ? 'Astăzi' : 
                     index === 1 ? 'Mâine' : day.dayName;
      
      const tempRange = `${day.temp_min}°C - ${day.temp_max}°C`;
      const avgTemp = day.temp_avg ? ` (med: ${day.temp_avg}°C)` : '';
      
      console.log(chalk.yellow(`\n📆 ${dayName} (${day.date}):`))
      console.log(`   ${chalk.cyan('Temperaturi:')} ${tempRange}${avgTemp}`);
      console.log(`   ${chalk.green('Descriere:')} ${day.description}`);
      
      if (day.humidity_avg) {
        console.log(`   ${chalk.blue('Umiditate:')} ${day.humidity_avg}% | ${chalk.magenta('Vânt:')} ${day.wind_speed_avg} m/s`);
      }
      
      if (day.precipitation_total > 0) {
        console.log(`   ${chalk.cyan('Precipitații:')} ${day.precipitation_total} mm`);
      }
      
      // Show hourly breakdown for today and tomorrow if requested
      if (showHourly && index < 2 && day.hourly) {
        console.log(chalk.gray('   Detalii orare:'));
        day.hourly.slice(0, 8).forEach(hour => {
          console.log(chalk.gray(`     ${hour.time}: ${hour.temp}°C ${hour.description}`));
        });
      }
    });
    
    console.log(chalk.gray('\n' + '─'.repeat(60)));
  }

  async displayForecastTable(forecast) {
    const data = [
      ['Zi', 'Data', 'Min', 'Max', 'Descriere', 'Umiditate', 'Vânt']
    ];
    
    forecast.forEach((day, index) => {
      const dayName = index === 0 ? 'Astăzi' : index === 1 ? 'Mâine' : day.dayName;
      data.push([
        dayName,
        day.date,
        `${day.temp_min}°C`,
        `${day.temp_max}°C`,
        day.description,
        `${day.humidity_avg || 'N/A'}%`,
        `${day.wind_speed_avg || 'N/A'} m/s`
      ]);
    });
    
    const config = {
      border: {
        topBody: '─',
        topJoin: '┬',
        topLeft: '┌',
        topRight: '┐',
        bottomBody: '─',
        bottomJoin: '┴',
        bottomLeft: '└',
        bottomRight: '┘',
        bodyLeft: '│',
        bodyRight: '│',
        bodyJoin: '│'
      }
    };
    
    console.log('\n' + table(data, config));
  }

  async exportData(format = 'json', filename = null) {
    const spinner = ora('Exportă datele meteo...').start();
    
    try {
      const current = await this.weather.getCurrent();
      const forecast = await this.weather.getForecast(7);
      const airQuality = await this.weather.getAirQuality().catch(() => null);
      const uvIndex = await this.weather.getUVIndex().catch(() => null);
      
      const data = {
        timestamp: new Date().toISOString(),
        location: 'București, România',
        coordinates: { lat: 44.4268, lon: 26.1025 },
        current,
        forecast,
        airQuality,
        uvIndex,
        metadata: {
          apiVersion: '2.0',
          source: 'OpenWeatherMap',
          generatedBy: 'Bucharest Weather CLI v2.0.0'
        }
      };
      
      const timestamp = moment().format('YYYY-MM-DD_HH-mm');
      const defaultFilename = `bucharest-weather-${timestamp}`;
      
      if (format === 'json') {
        const content = JSON.stringify(data, null, 2);
        const file = filename || `${defaultFilename}.json`;
        
        if (filename) {
          await fs.writeFile(file, content, 'utf8');
          spinner.succeed(`Date exportate în ${file}`);
        } else {
          spinner.stop();
          console.log(content);
        }
      } else if (format === 'csv') {
        const file = filename || `${defaultFilename}.csv`;
        
        // Prepare CSV data
        const csvData = [
          {
            date: data.timestamp,
            location: data.location,
            temperature: current.temp,
            feels_like: current.feels_like,
            description: current.description,
            humidity: current.humidity,
            pressure: current.pressure,
            wind_speed: current.wind_speed,
            wind_direction: current.wind_direction,
            visibility: current.visibility,
            cloudiness: current.cloudiness,
            air_quality: airQuality ? airQuality.aqi_description : 'N/A',
            uv_index: uvIndex ? uvIndex.uv_index : 'N/A'
          }
        ];
        
        if (filename) {
          const csvWriter = createObjectCsvWriter({
            path: file,
            header: Object.keys(csvData[0]).map(key => ({ id: key, title: key }))
          });
          
          await csvWriter.writeRecords(csvData);
          spinner.succeed(`Date exportate în ${file}`);
        } else {
          spinner.stop();
          // Output CSV to console
          const headers = Object.keys(csvData[0]).join(',');
          const values = Object.values(csvData[0]).join(',');
          console.log(headers);
          console.log(values);
        }
      }
      
      return data;
      
    } catch (error) {
      spinner.fail('Eroare la export');
      console.error(chalk.red('❌ Eroare export:', error.message));
    }
  }

  async showSystemInfo() {
    const cacheStats = this.weather.getCacheStats();
    const aiMetrics = this.ai.getPerformanceMetrics();
    
    const systemInfo = [
      chalk.bold.cyan('📊 SISTEM INFO:'),
      '',
      `${chalk.yellow('Versiune:')} v2.0.0`,
      `${chalk.green('Cache activ:')} ${cacheStats.keys.length} chei`,
      `${chalk.blue('AI Engine:')} v${aiMetrics.algorithmVersion}`,
      `${chalk.magenta('Acuratețe AI:')} ${aiMetrics.accuracy}`,
      `${chalk.cyan('Timp răspuns:')} ${aiMetrics.responseTime}`,
      '',
      `${chalk.gray('Features:')}`
    ];
    
    aiMetrics.features.forEach(feature => {
      systemInfo.push(chalk.gray(`  ✓ ${feature}`));
    });
    
    console.log(boxen(systemInfo.join('\n'), {
      padding: 1,
      margin: 1,
      borderStyle: 'single',
      borderColor: 'cyan',
      title: '📊 SYSTEM STATUS',
      titleAlignment: 'center'
    }));
  }

  // Helper methods
  formatTemperature(temp) {
    if (temp > 30) return chalk.red(`${temp}°C`);
    if (temp < 0) return chalk.blue(`${temp}°C`);
    if (temp < 10) return chalk.cyan(`${temp}°C`);
    return chalk.yellow(`${temp}°C`);
  }

  getWeatherIcon(iconCode) {
    const icons = {
      '01d': '☀️', '01n': '🌙',
      '02d': '⛅', '02n': '☁️',
      '03d': '☁️', '03n': '☁️',
      '04d': '☁️', '04n': '☁️',
      '09d': '🌧️', '09n': '🌧️',
      '10d': '🌦️', '10n': '🌧️',
      '11d': '⛈️', '11n': '⛈️',
      '13d': '🌨️', '13n': '🌨️',
      '50d': '🌫️', '50n': '🌫️'
    };
    return icons[iconCode] || '🌤️';
  }

  getAlertIcon(level) {
    const icons = {
      danger: '🛑',
      warning: '⚠️',
      info: 'ℹ️',
      success: '✅'
    };
    return icons[level] || 'ℹ️';
  }

  getAlertColor(level) {
    const colors = {
      danger: chalk.red,
      warning: chalk.yellow,
      info: chalk.blue,
      success: chalk.green
    };
    return colors[level] || chalk.white;
  }
}

// Direct execution for testing
if (import.meta.url === `file://${process.argv[1]}`) {
  const app = new BucharestWeatherApp();
  await app.showBanner();
  await app.getCurrentWeather(true);
  await app.getForecast(5);
}