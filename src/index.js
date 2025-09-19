#!/usr/bin/env node

import { WeatherAPI } from './weather.js';
import { AIInsights } from './ai-insights.js';
import chalk from 'chalk';
import boxen from 'boxen';
import figlet from 'figlet';

/**
 * Main Weather CLI Application
 * Creat via MCP pentru București
 */
class BucharestWeatherApp {
  constructor() {
    this.weather = new WeatherAPI();
    this.ai = new AIInsights();
  }

  async showBanner() {
    const banner = figlet.textSync('BW CLI', { font: 'Small' });
    console.log(chalk.cyan(banner));
    console.log(chalk.gray('🌤️  Bucharest Weather CLI v1.0.0'));
    console.log(chalk.gray('   Creat cu MCP în Perplexity\n'));
  }

  async getCurrentWeather() {
    try {
      const data = await this.weather.getCurrent();
      const insights = await this.ai.generateInsights(data);
      
      const output = [
        chalk.bold.blue('🌡️  VREMEA ACUM ÎN BUCUREȘTI'),
        '',
        `${chalk.yellow('Temperatură:')} ${data.temp}°C (simte ca ${data.feels_like}°C)`,
        `${chalk.cyan('Descriere:')} ${data.description}`,
        `${chalk.green('Umiditate:')} ${data.humidity}%`,
        `${chalk.magenta('Vânt:')} ${data.wind_speed} m/s`,
        `${chalk.red('Presiune:')} ${data.pressure} hPa`,
        '',
        chalk.bold.green('🤖 AI RECOMANDĂRI:'),
        insights.clothing,
        insights.activities,
        insights.alerts
      ].join('\n');

      console.log(boxen(output, {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'blue'
      }));

    } catch (error) {
      console.error(chalk.red('❌ Eroare:', error.message));
    }
  }

  async getForecast(days = 5) {
    try {
      const forecast = await this.weather.getForecast(days);
      
      console.log(chalk.bold.blue(`📅 PROGNOZA ${days} ZILE - BUCUREȘTI\n`));
      
      forecast.forEach((day, index) => {
        const dayName = index === 0 ? 'Astăzi' : 
                       index === 1 ? 'Mâine' : day.date;
        
        console.log(chalk.yellow(`${dayName}: ${day.temp_min}°C - ${day.temp_max}°C`));
        console.log(chalk.gray(`   ${day.description}`));
        console.log('');
      });

    } catch (error) {
      console.error(chalk.red('❌ Eroare forecast:', error.message));
    }
  }

  async exportData(format = 'json') {
    try {
      const current = await this.weather.getCurrent();
      const forecast = await this.weather.getForecast(5);
      
      const data = {
        timestamp: new Date().toISOString(),
        location: 'București, România',
        current,
        forecast
      };

      if (format === 'json') {
        console.log(JSON.stringify(data, null, 2));
      } else {
        // CSV format
        console.log('Date,Location,Temp,Description,Humidity,Wind');
        console.log(`${data.timestamp},${data.location},${current.temp},${current.description},${current.humidity},${current.wind_speed}`);
      }

    } catch (error) {
      console.error(chalk.red('❌ Eroare export:', error.message));
    }
  }
}

export { BucharestWeatherApp };

// Direct execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const app = new BucharestWeatherApp();
  await app.showBanner();
  await app.getCurrentWeather();
}