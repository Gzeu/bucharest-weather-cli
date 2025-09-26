import cron from 'node-cron';
import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import winston from 'winston';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Professional Weather Notification Manager
 * Handles scheduled notifications, alerts, and user subscriptions
 */
export class WeatherNotificationManager {
  constructor(weatherService, aiInsights, options = {}) {
    this.weatherService = weatherService;
    this.aiInsights = aiInsights;
    this.subscribers = new Map();
    this.scheduledJobs = new Map();
    this.configPath = options.configPath || path.join(process.env.HOME || process.env.USERPROFILE, '.bucharest-weather-cli', 'notifications.json');
    
    // Setup logger
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: path.join(__dirname, '../logs/notifications.log') }),
        new winston.transports.Console({ format: winston.format.simple() })
      ]
    });

    // Email transporter setup
    this.emailTransporter = null;
    this.initializeEmailTransporter();
    
    // Load saved configuration
    this.loadConfiguration();
  }

  /**
   * Initialize email transporter if credentials are provided
   */
  async initializeEmailTransporter() {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        this.emailTransporter = nodemailer.createTransporter({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });
        this.logger.info('Email transporter initialized successfully');
      } catch (error) {
        this.logger.error('Failed to initialize email transporter:', error);
      }
    }
  }

  /**
   * Load notification configuration from file
   */
  async loadConfiguration() {
    try {
      const configData = await fs.readFile(this.configPath, 'utf8');
      const config = JSON.parse(configData);
      
      // Restore subscribers
      if (config.subscribers) {
        this.subscribers = new Map(Object.entries(config.subscribers));
      }
      
      // Restore scheduled jobs
      if (config.scheduledJobs) {
        for (const [jobId, jobConfig] of Object.entries(config.scheduledJobs)) {
          await this.scheduleNotification(jobId, jobConfig);
        }
      }
      
      this.logger.info('Notification configuration loaded successfully');
    } catch (error) {
      this.logger.info('No existing notification configuration found, using defaults');
    }
  }

  /**
   * Save notification configuration to file
   */
  async saveConfiguration() {
    try {
      const config = {
        subscribers: Object.fromEntries(this.subscribers),
        scheduledJobs: Object.fromEntries(
          Array.from(this.scheduledJobs.entries()).map(([id, job]) => [
            id,
            { ...job.config, isActive: job.isActive }
          ])
        ),
        lastUpdated: new Date().toISOString()
      };
      
      // Ensure directory exists
      await fs.mkdir(path.dirname(this.configPath), { recursive: true });
      
      await fs.writeFile(this.configPath, JSON.stringify(config, null, 2));
      this.logger.info('Notification configuration saved successfully');
    } catch (error) {
      this.logger.error('Failed to save notification configuration:', error);
    }
  }

  /**
   * Add a subscriber with preferences
   */
  async addSubscriber(userId, preferences = {}) {
    const defaultPreferences = {
      email: null,
      phone: null,
      dailyForecast: true,
      severeWeatherAlerts: true,
      morningReport: '07:00',
      eveningReport: null,
      weeklyDigest: 'monday',
      threshold: {
        temperature: { min: -5, max: 35 },
        windSpeed: 15,
        precipitation: 10,
        airQuality: 3
      },
      locations: ['București'],
      language: 'ro'
    };

    this.subscribers.set(userId, {
      ...defaultPreferences,
      ...preferences,
      subscribedAt: new Date().toISOString()
    });

    await this.saveConfiguration();
    this.logger.info(`Subscriber ${userId} added successfully`);
    
    return this.subscribers.get(userId);
  }

  /**
   * Setup daily weather notification
   */
  async setupDailyWeatherNotification(cronTime = '0 7 * * *', jobId = 'daily-morning-report') {
    const jobConfig = {
      cronTime,
      type: 'daily-report',
      name: 'Daily Morning Weather Report',
      isActive: true
    };

    return await this.scheduleNotification(jobId, jobConfig);
  }

  /**
   * Schedule a notification job
   */
  async scheduleNotification(jobId, jobConfig) {
    try {
      // Destroy existing job if it exists
      if (this.scheduledJobs.has(jobId)) {
        this.scheduledJobs.get(jobId).task.destroy();
      }

      const task = cron.schedule(jobConfig.cronTime, async () => {
        await this.executeScheduledNotification(jobConfig);
      }, {
        scheduled: false,
        timezone: 'Europe/Bucharest'
      });

      if (jobConfig.isActive) {
        task.start();
      }

      this.scheduledJobs.set(jobId, {
        task,
        config: jobConfig,
        isActive: jobConfig.isActive,
        createdAt: new Date().toISOString()
      });

      await this.saveConfiguration();
      this.logger.info(`Scheduled notification job: ${jobId}`);
      
      return jobId;
    } catch (error) {
      this.logger.error(`Failed to schedule notification ${jobId}:`, error);
      throw error;
    }
  }

  /**
   * Execute a scheduled notification
   */
  async executeScheduledNotification(jobConfig) {
    try {
      this.logger.info(`Executing scheduled notification: ${jobConfig.name}`);
      
      for (const [userId, preferences] of this.subscribers) {
        if (!preferences.dailyForecast && jobConfig.type === 'daily-report') continue;
        
        for (const location of preferences.locations) {
          const weather = await this.weatherService.getCurrentWeather(location);
          const forecast = await this.weatherService.getForecast(location, 1);
          const insights = await this.aiInsights.generateInsights(weather);

          const notification = {
            userId,
            location,
            weather,
            forecast,
            insights,
            timestamp: new Date().toISOString(),
            type: jobConfig.type
          };

          await this.sendNotification(notification, preferences);
        }
      }
    } catch (error) {
      this.logger.error('Failed to execute scheduled notification:', error);
    }
  }

  /**
   * Check for severe weather alerts
   */
  async checkSevereWeatherAlerts() {
    try {
      for (const [userId, preferences] of this.subscribers) {
        if (!preferences.severeWeatherAlerts) continue;
        
        for (const location of preferences.locations) {
          const weather = await this.weatherService.getCurrentWeather(location);
          const alerts = await this.generateAlerts(weather, preferences.threshold);
          
          if (alerts.length > 0) {
            const notification = {
              userId,
              location,
              weather,
              alerts,
              timestamp: new Date().toISOString(),
              type: 'severe-weather-alert',
              priority: 'high'
            };
            
            await this.sendNotification(notification, preferences);
          }
        }
      }
    } catch (error) {
      this.logger.error('Failed to check severe weather alerts:', error);
    }
  }

  /**
   * Generate weather alerts based on thresholds
   */
  async generateAlerts(weather, thresholds) {
    const alerts = [];
    
    // Temperature alerts
    if (weather.temp < thresholds.temperature.min) {
      alerts.push({
        level: 'danger',
        icon: '🥶',
        message: `Temperatură extremă: ${weather.temp}°C (sub ${thresholds.temperature.min}°C)`
      });
    } else if (weather.temp > thresholds.temperature.max) {
      alerts.push({
        level: 'danger', 
        icon: '🔥',
        message: `Temperatură extremă: ${weather.temp}°C (peste ${thresholds.temperature.max}°C)`
      });
    }
    
    // Wind speed alerts
    if (weather.wind_speed > thresholds.windSpeed) {
      alerts.push({
        level: 'warning',
        icon: '💨',
        message: `Vânt puternic: ${weather.wind_speed} km/h (peste ${thresholds.windSpeed} km/h)`
      });
    }
    
    // Precipitation alerts
    const rainAmount = weather.rain_1h || weather.rain_3h || 0;
    if (rainAmount > thresholds.precipitation) {
      alerts.push({
        level: 'warning',
        icon: '🌧️',
        message: `Precipitații intense: ${rainAmount}mm/h (peste ${thresholds.precipitation}mm/h)`
      });
    }
    
    return alerts;
  }

  /**
   * Send notification via multiple channels
   */
  async sendNotification(notification, preferences) {
    try {
      // Console notification (always shown)
      await this.sendConsoleNotification(notification);
      
      // Email notification
      if (preferences.email && this.emailTransporter) {
        await this.sendEmailNotification(notification, preferences.email);
      }
      
      // Log notification
      this.logger.info('Notification sent successfully', {
        userId: notification.userId,
        location: notification.location,
        type: notification.type
      });
      
    } catch (error) {
      this.logger.error('Failed to send notification:', error);
    }
  }

  /**
   * Send console notification with professional formatting
   */
  async sendConsoleNotification(notification) {
    console.log('\n' + '═'.repeat(80));
    console.log(chalk.cyan.bold(`🌤️  WEATHER NOTIFICATION - ${notification.location.toUpperCase()}`));
    console.log('═'.repeat(80));
    console.log(chalk.gray(`📅 ${new Date(notification.timestamp).toLocaleString('ro-RO', { timeZone: 'Europe/Bucharest' })}\n`));
    
    if (notification.weather) {
      console.log(chalk.white.bold('📊 CURRENT CONDITIONS:'));
      console.log(`🌡️  Temperature: ${chalk.yellow(notification.weather.temp + '°C')}`);
      console.log(`💧 Humidity: ${chalk.blue(notification.weather.humidity + '%')}`);
      console.log(`🌬️  Wind: ${chalk.green(notification.weather.wind_speed + ' km/h')}`);
      console.log(`☁️  Conditions: ${chalk.white(notification.weather.description)}\n`);
    }
    
    if (notification.alerts && notification.alerts.length > 0) {
      console.log(chalk.red.bold('⚠️  WEATHER ALERTS:'));
      for (const alert of notification.alerts) {
        const color = alert.level === 'danger' ? chalk.red : chalk.yellow;
        console.log(color(`${alert.icon} ${alert.message}`));
      }
      console.log('');
    }
    
    if (notification.insights) {
      console.log(chalk.green.bold('🤖 AI INSIGHTS:'));
      if (notification.insights.clothing) console.log(`👔 ${notification.insights.clothing}`);
      if (notification.insights.activities) console.log(`🎯 ${notification.insights.activities}`);
      if (notification.insights.health) console.log(`🏥 ${notification.insights.health}`);
      if (notification.insights.locations) console.log(`📍 ${notification.insights.locations}`);
    }
    
    console.log('═'.repeat(80) + '\n');
  }

  /**
   * Send email notification
   */
  async sendEmailNotification(notification, email) {
    if (!this.emailTransporter) return;
    
    const subject = `Weather Alert - ${notification.location} | ${new Date().toLocaleDateString('ro-RO')}`;
    
    const html = this.generateEmailHTML(notification);
    
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject,
      html
    };
    
    try {
      await this.emailTransporter.sendMail(mailOptions);
      this.logger.info(`Email notification sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${email}:`, error);
    }
  }

  /**
   * Generate HTML content for email notifications
   */
  generateEmailHTML(notification) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
        <div style="background: white; border-radius: 10px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h1 style="color: #2c5aa0; margin-bottom: 20px; text-align: center;">
            🌤️ Weather Report - ${notification.location}
          </h1>
          
          <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
            <h3 style="color: #333; margin-bottom: 10px;">📊 Current Conditions</h3>
            ${notification.weather ? `
              <p><strong>🌡️ Temperature:</strong> ${notification.weather.temp}°C</p>
              <p><strong>💧 Humidity:</strong> ${notification.weather.humidity}%</p>
              <p><strong>🌬️ Wind Speed:</strong> ${notification.weather.wind_speed} km/h</p>
              <p><strong>☁️ Conditions:</strong> ${notification.weather.description}</p>
            ` : ''}
          </div>
          
          ${notification.alerts && notification.alerts.length > 0 ? `
            <div style="margin-bottom: 20px; padding: 15px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px;">
              <h3 style="color: #856404; margin-bottom: 10px;">⚠️ Weather Alerts</h3>
              ${notification.alerts.map(alert => `
                <p style="color: #856404; margin: 5px 0;">${alert.icon} ${alert.message}</p>
              `).join('')}
            </div>
          ` : ''}
          
          ${notification.insights ? `
            <div style="margin-bottom: 20px; padding: 15px; background: #e8f5e8; border-radius: 8px;">
              <h3 style="color: #155724; margin-bottom: 10px;">🤖 AI Recommendations</h3>
              ${notification.insights.clothing ? `<p><strong>👔 Clothing:</strong> ${notification.insights.clothing}</p>` : ''}
              ${notification.insights.activities ? `<p><strong>🎯 Activities:</strong> ${notification.insights.activities}</p>` : ''}
              ${notification.insights.health ? `<p><strong>🏥 Health:</strong> ${notification.insights.health}</p>` : ''}
              ${notification.insights.locations ? `<p><strong>📍 Locations:</strong> ${notification.insights.locations}</p>` : ''}
            </div>
          ` : ''}
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">Generated by Bucharest Weather CLI v3.0</p>
            <p style="color: #666; font-size: 12px;">📅 ${new Date(notification.timestamp).toLocaleString('ro-RO', { timeZone: 'Europe/Bucharest' })}</p>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Start severe weather monitoring
   */
  async startSevereWeatherMonitoring(intervalMinutes = 30) {
    const monitoringJobId = 'severe-weather-monitor';
    const cronTime = `*/${intervalMinutes} * * * *`;
    
    const jobConfig = {
      cronTime,
      type: 'severe-weather-monitoring',
      name: 'Severe Weather Monitoring',
      isActive: true
    };

    const task = cron.schedule(cronTime, async () => {
      await this.checkSevereWeatherAlerts();
    }, {
      scheduled: true,
      timezone: 'Europe/Bucharest'
    });

    this.scheduledJobs.set(monitoringJobId, {
      task,
      config: jobConfig,
      isActive: true,
      createdAt: new Date().toISOString()
    });

    this.logger.info(`Started severe weather monitoring every ${intervalMinutes} minutes`);
    return monitoringJobId;
  }

  /**
   * Stop a scheduled job
   */
  async stopScheduledJob(jobId) {
    if (this.scheduledJobs.has(jobId)) {
      const job = this.scheduledJobs.get(jobId);
      job.task.stop();
      job.isActive = false;
      await this.saveConfiguration();
      this.logger.info(`Stopped scheduled job: ${jobId}`);
      return true;
    }
    return false;
  }

  /**
   * Get all scheduled jobs status
   */
  getScheduledJobsStatus() {
    const jobs = [];
    for (const [jobId, job] of this.scheduledJobs) {
      jobs.push({
        id: jobId,
        name: job.config.name,
        type: job.config.type,
        cronTime: job.config.cronTime,
        isActive: job.isActive,
        createdAt: job.createdAt
      });
    }
    return jobs;
  }

  /**
   * Get subscribers count
   */
  getSubscribersCount() {
    return this.subscribers.size;
  }

  /**
   * Remove subscriber
   */
  async removeSubscriber(userId) {
    const removed = this.subscribers.delete(userId);
    if (removed) {
      await this.saveConfiguration();
      this.logger.info(`Subscriber ${userId} removed successfully`);
    }
    return removed;
  }

  /**
   * Cleanup and stop all jobs
   */
  async cleanup() {
    for (const [jobId, job] of this.scheduledJobs) {
      job.task.destroy();
      this.logger.info(`Cleaned up job: ${jobId}`);
    }
    this.scheduledJobs.clear();
    await this.saveConfiguration();
  }
}