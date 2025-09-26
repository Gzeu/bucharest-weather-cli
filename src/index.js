#!/usr/bin/env node

import { WeatherAPI } from './weather.js';
import { AIInsights } from './ai-insights.js';
import { WeatherTemplates } from './templates/weather-templates.js';
import { TemplateConfig } from './templates/template-config.js';
import chalk from 'chalk';
import boxen from 'boxen';
import figlet from 'figlet';
import { table } from 'table';
import moment from 'moment';
import ora from 'ora';
import fs from 'fs/promises';
import { createObjectCsvWriter } from 'csv-writer';

/**
 * Enhanced Bucharest Weather CLI Application v3.0
 * Professional weather tool with advanced template system and AI insights
 */
export class BucharestWeatherApp {
  constructor(options = {}) {
    this.weather = new WeatherAPI(options);
    this.ai = new AIInsights(options);
    this.templates = new WeatherTemplates();
    this.templateConfig = new TemplateConfig();
    
    this.config = {
      showBanner: options.showBanner !== false,
      showCache: options.showCache || false,
      verboseMode: options.verbose || false,
      language: options.language || 'ro',
      useAdvancedTemplates: options.useAdvancedTemplates !== false
    };
  }

  async init() {
    // Initialize template configuration
    await this.templateConfig.init();
    
    // Apply current theme
    const currentTheme = this.templateConfig.getCurrentTheme();
    this.templates.setTheme(currentTheme);
    
    return {
      template: this.templateConfig.getCurrentTemplate(),
      theme: currentTheme,
      settings: this.templateConfig.getSettings()
    };
  }

  async showBanner() {
    if (!this.config.showBanner) return;
    
    const settings = this.templateConfig.getSettings();
    
    if (settings.animationsEnabled) {
      // Animated banner
      const spinner = ora({
        text: 'Initializing Bucharest Weather CLI...',
        spinner: 'dots12'
      }).start();
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      spinner.succeed('System ready!');
    }
    
    const banner = figlet.textSync('BW CLI v3', { font: 'Small' });
    console.log(chalk.cyan(banner));
    console.log(chalk.gray('🌤️  Bucharest Weather CLI v3.0.0'));
    console.log(chalk.gray('   Professional Weather Intelligence with Advanced Templates'));
    console.log(chalk.gray('   Powered by MCP + Perplexity AI\n'));
  }

  async getCurrentWeather(showExtended = false, templateName = null) {
    const spinner = ora('Obțin datele meteorologice avansate...').start();
    
    try {
      // Initialize template system if not done
      if (!templateName) {
        await this.init();
        templateName = this.templateConfig.getCurrentTemplate();
      }
      
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
      
      // Use advanced template system if enabled
      if (this.config.useAdvancedTemplates) {
        const templateOutput = this.templates.renderTemplate(
          templateName,
          current,
          null,
          insights
        );
        console.log('\n' + templateOutput);
      } else {
        // Fallback to original display method
        await this.displayCurrentWeatherFallback(current, insights, air, uv, showExtended);
      }
      
      return { current, air, uv, insights };
      
    } catch (error) {
      spinner.fail('Eroare la obținerea datelor');
      console.error(chalk.red('❌ Eroare:', error.message));
      
      // Fallback to mock data if API fails
      if (error.message.includes('API key')) {
        console.log(chalk.yellow('\n📋 Folosesc date demo:'));
        const mockData = this.weather.getMockData();
        const mockInsights = await this.ai.generateInsights(mockData);
        
        if (this.config.useAdvancedTemplates) {
          const templateOutput = this.templates.renderTemplate(
            templateName || 'classic',
            mockData,
            null,
            mockInsights
          );
          console.log('\n' + templateOutput);
        } else {
          await this.displayCurrentWeatherFallback(mockData, mockInsights, null, null, showExtended);
        }
      }
    }
  }

  async getForecast(days = 5, showHourly = false, templateName = null) {
    const spinner = ora(`Obțin prognoza pentru ${days} zile...`).start();
    
    try {
      // Initialize template system if not done
      if (!templateName) {
        await this.init();
        templateName = this.templateConfig.getCurrentTemplate();
      }
      
      const forecast = await this.weather.getForecast(days);
      const current = await this.weather.getCurrent();
      const insights = await this.ai.generateInsights(current, forecast);
      
      spinner.succeed('Prognoza obținută cu succes!');
      
      // Use advanced template system if enabled
      if (this.config.useAdvancedTemplates) {
        const templateOutput = this.templates.renderTemplate(
          templateName,
          current,
          forecast,
          insights
        );
        console.log('\n' + templateOutput);
      } else {
        // Fallback to original display method
        await this.displayForecastFallback(forecast, days, showHourly);
      }
      
      return forecast;
      
    } catch (error) {
      spinner.fail('Eroare la obținerea prognozei');
      console.error(chalk.red('❌ Eroare prognoză:', error.message));
      
      // Fallback to mock data
      const mockForecast = this.weather.getMockForecast(days);
      console.log(chalk.yellow('\n📋 Folosesc prognoza demo:'));
      
      if (this.config.useAdvancedTemplates) {
        const mockCurrent = this.weather.getMockData();
        const mockInsights = await this.ai.generateInsights(mockCurrent, mockForecast);
        const templateOutput = this.templates.renderTemplate(
          templateName || 'dashboard',
          mockCurrent,
          mockForecast,
          mockInsights
        );
        console.log('\n' + templateOutput);
      } else {
        await this.displayForecastFallback(mockForecast, days, showHourly);
      }
    }
  }

  // Fallback display methods for backward compatibility
  async displayCurrentWeatherFallback(data, insights, airQuality, uvIndex, showExtended) {
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
    if (insights.alerts && insights.alerts.length > 0) {
      await this.displaySmartAlerts(insights.alerts);
    }
  }

  async displayForecastFallback(forecast, days, showHourly) {
    console.log(chalk.bold.blue(`\n📅 PROGNOZA ${days} ZILE - BUCUREȘTI`));
    console.log(chalk.gray('─'.repeat(60)));
    
    forecast.forEach((day, index) => {
      const dayName = index === 0 ? 'Astăzi' : 
                     index === 1 ? 'Mâine' : day.dayName;
      
      const tempRange = `${day.temp_min}°C - ${day.temp_max}°C`;
      const avgTemp = day.temp_avg ? ` (med: ${day.temp_avg}°C)` : '';
      
      console.log(chalk.yellow(`\n📆 ${dayName} (${day.date}):`));
      console.log(`   ${chalk.cyan('Temperaturi:')} ${tempRange}${avgTemp}`);
      console.log(`   ${chalk.green('Descriere:')} ${day.description}`);
      
      if (day.humidity_avg) {
        console.log(`   ${chalk.blue('Umiditate:')} ${day.humidity_avg}% | ${chalk.magenta('Vânt:')} ${day.wind_speed_avg} m/s`);
      }
      
      if (day.precipitation_total > 0) {
        console.log(`   ${chalk.cyan('Precipitații:')} ${day.precipitation_total} mm`);
      }
    });
    
    console.log(chalk.gray('\n' + '─'.repeat(60)));
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

  async exportData(format = 'json', filename = null) {
    const spinner = ora('Exportă datele meteo...').start();
    
    try {
      const current = await this.weather.getCurrent();
      const forecast = await this.weather.getForecast(7);
      const airQuality = await this.weather.getAirQuality().catch(() => null);
      const uvIndex = await this.weather.getUVIndex().catch(() => null);
      const insights = await this.ai.generateInsights(current, forecast, airQuality, uvIndex);
      
      const data = {
        timestamp: new Date().toISOString(),
        location: 'București, România',
        coordinates: { lat: 44.4268, lon: 26.1025 },
        current,
        forecast,
        airQuality,
        uvIndex,
        insights,
        metadata: {
          apiVersion: '3.0',
          source: 'OpenWeatherMap',
          generatedBy: 'Bucharest Weather CLI v3.0.0',
          template: this.templateConfig?.getCurrentTemplate() || 'classic',
          theme: this.templateConfig?.getCurrentTheme() || 'default'
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
            uv_index: uvIndex ? uvIndex.uv_index : 'N/A',
            template: data.metadata.template,
            theme: data.metadata.theme
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
    const templateInfo = await this.getTemplateSystemInfo();
    
    const systemInfo = [
      chalk.bold.cyan('📊 SISTEM INFO:'),
      '',
      `${chalk.yellow('Versiune:')} v3.0.0`,
      `${chalk.green('Cache activ:')} ${cacheStats.keys.length} chei`,
      `${chalk.blue('AI Engine:')} v${aiMetrics.algorithmVersion}`,
      `${chalk.magenta('Acurațețe AI:')} ${aiMetrics.accuracy}`,
      `${chalk.cyan('Timp răspuns:')} ${aiMetrics.responseTime}`,
      '',
      chalk.bold.cyan('🎨 TEMPLATE SYSTEM:'),
      `${chalk.yellow('Template activ:')} ${templateInfo.currentTemplate}`,
      `${chalk.yellow('Temă activă:')} ${templateInfo.currentTheme}`,
      `${chalk.green('Template-uri disponibile:')} ${templateInfo.totalTemplates}`,
      `${chalk.green('Teme disponibile:')} ${templateInfo.totalThemes}`,
      '',
      `${chalk.gray('Features:')}`
    ];
    
    // Add AI features
    aiMetrics.features.forEach(feature => {
      systemInfo.push(chalk.gray(`  ✓ ${feature}`));
    });
    
    // Add template features
    templateInfo.features.forEach(feature => {
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

  async getTemplateSystemInfo() {
    const availableTemplates = this.templates.getAvailableTemplates();
    const availableThemes = this.templates.getAvailableThemes();
    
    return {
      currentTemplate: this.templateConfig?.getCurrentTemplate() || 'classic',
      currentTheme: this.templateConfig?.getCurrentTheme() || 'default',
      totalTemplates: availableTemplates.length,
      totalThemes: availableThemes.length,
      features: [
        '10+ Visual Templates',
        '8 Color Themes',
        'Interactive Configuration',
        'Preset Management',
        'Export/Import Settings',
        'Real-time Preview',
        'Custom Template Support'
      ]
    };
  }

  // Render weather with specific template
  async renderWithTemplate(templateName, themeName = null, options = {}) {
    await this.init();
    
    if (themeName) {
      this.templates.setTheme(themeName);
    }
    
    const weatherData = await this.weather.getCurrent();
    const insights = await this.ai.generateInsights(weatherData);
    
    let forecast = null;
    if (options.includeForecast) {
      forecast = await this.weather.getForecast(options.forecastDays || 5);
    }
    
    const output = this.templates.renderTemplate(
      templateName,
      weatherData,
      forecast,
      insights
    );
    
    return output;
  }

  // Template management methods
  async setTemplate(templateName) {
    return await this.templateConfig.setTemplate(templateName);
  }

  async setTheme(themeName) {
    const success = await this.templateConfig.setTheme(themeName);
    if (success) {
      this.templates.setTheme(themeName);
    }
    return success;
  }

  getAvailableTemplates() {
    return this.templates.getAvailableTemplates();
  }

  getAvailableThemes() {
    return this.templates.getAvailableThemes();
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
  const app = new BucharestWeatherApp({
    useAdvancedTemplates: true
  });
  
  await app.showBanner();
  await app.init();
  await app.getCurrentWeather(true);
  console.log('\n' + '='.repeat(80) + '\n');
  await app.getForecast(5);
}