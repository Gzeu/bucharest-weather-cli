import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import { format, subDays, subMonths, subYears, parse, isValid } from 'date-fns';
import { ro } from 'date-fns/locale';
import winston from 'winston';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Professional Weather Analytics Engine
 * Provides historical data analysis, trends, and predictive insights
 */
export class WeatherAnalytics {
  constructor(options = {}) {
    this.dbPath = options.dbPath || path.join(process.env.HOME || process.env.USERPROFILE, '.bucharest-weather-cli', 'weather_history.db');
    this.db = null;
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: path.join(__dirname, '../logs/analytics.log') }),
        new winston.transports.Console({ format: winston.format.simple() })
      ]
    });
    
    this.initializeDatabase();
  }

  /**
   * Initialize SQLite database with proper schema
   */
  async initializeDatabase() {
    try {
      // Ensure directory exists
      await fs.mkdir(path.dirname(this.dbPath), { recursive: true });
      
      this.db = new Database(this.dbPath);
      
      // Enable WAL mode for better concurrency
      this.db.pragma('journal_mode = WAL');
      this.db.pragma('synchronous = NORMAL');
      this.db.pragma('cache_size = 1000');
      
      // Create tables
      this.createTables();
      
      // Create indexes for better performance
      this.createIndexes();
      
      this.logger.info('Weather analytics database initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize analytics database:', error);
      throw error;
    }
  }

  /**
   * Create database tables
   */
  createTables() {
    // Main weather data table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS weather_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        location TEXT NOT NULL,
        date TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        temperature REAL NOT NULL,
        feels_like REAL,
        humidity INTEGER,
        pressure REAL,
        wind_speed REAL,
        wind_direction INTEGER,
        visibility REAL,
        uv_index REAL,
        main_condition TEXT,
        description TEXT,
        rain_1h REAL DEFAULT 0,
        rain_3h REAL DEFAULT 0,
        snow_1h REAL DEFAULT 0,
        snow_3h REAL DEFAULT 0,
        cloudiness INTEGER,
        sunrise INTEGER,
        sunset INTEGER,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(location, timestamp)
      )
    `);
    
    // Air quality data table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS air_quality_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        location TEXT NOT NULL,
        date TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        aqi INTEGER,
        co REAL,
        no REAL,
        no2 REAL,
        o3 REAL,
        so2 REAL,
        pm2_5 REAL,
        pm10 REAL,
        nh3 REAL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(location, timestamp)
      )
    `);
    
    // Forecast accuracy tracking
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS forecast_accuracy (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        location TEXT NOT NULL,
        forecast_date TEXT NOT NULL,
        actual_date TEXT NOT NULL,
        forecast_temp REAL,
        actual_temp REAL,
        temp_accuracy REAL,
        forecast_condition TEXT,
        actual_condition TEXT,
        condition_match INTEGER,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Weather alerts log
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS weather_alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        location TEXT NOT NULL,
        alert_type TEXT NOT NULL,
        severity TEXT NOT NULL,
        message TEXT NOT NULL,
        threshold_value REAL,
        actual_value REAL,
        timestamp INTEGER NOT NULL,
        date TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  /**
   * Create database indexes
   */
  createIndexes() {
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_weather_location_date ON weather_data(location, date)',
      'CREATE INDEX IF NOT EXISTS idx_weather_timestamp ON weather_data(timestamp)',
      'CREATE INDEX IF NOT EXISTS idx_weather_temperature ON weather_data(temperature)',
      'CREATE INDEX IF NOT EXISTS idx_air_quality_location_date ON air_quality_data(location, date)',
      'CREATE INDEX IF NOT EXISTS idx_forecast_location_date ON forecast_accuracy(location, forecast_date)',
      'CREATE INDEX IF NOT EXISTS idx_alerts_location_timestamp ON weather_alerts(location, timestamp)'
    ];
    
    indexes.forEach(indexSQL => {
      try {
        this.db.exec(indexSQL);
      } catch (error) {
        // Index might already exist
        this.logger.debug('Index creation note:', error.message);
      }
    });
  }

  /**
   * Store weather data point
   */
  async storeWeatherData(location, weatherData) {
    try {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO weather_data (
          location, date, timestamp, temperature, feels_like, humidity, pressure,
          wind_speed, wind_direction, visibility, uv_index, main_condition, description,
          rain_1h, rain_3h, snow_1h, snow_3h, cloudiness, sunrise, sunset
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const result = stmt.run(
        location,
        format(new Date(), 'yyyy-MM-dd'),
        Math.floor(Date.now() / 1000),
        weatherData.temp,
        weatherData.feels_like,
        weatherData.humidity,
        weatherData.pressure,
        weatherData.wind_speed,
        weatherData.wind_deg,
        weatherData.visibility,
        weatherData.uvi,
        weatherData.main,
        weatherData.description,
        weatherData.rain?.['1h'] || 0,
        weatherData.rain?.['3h'] || 0,
        weatherData.snow?.['1h'] || 0,
        weatherData.snow?.['3h'] || 0,
        weatherData.clouds,
        weatherData.sunrise,
        weatherData.sunset
      );
      
      this.logger.debug(`Weather data stored for ${location}`);
      return result.lastInsertRowid;
    } catch (error) {
      this.logger.error(`Failed to store weather data for ${location}:`, error);
      throw error;
    }
  }

  /**
   * Store air quality data
   */
  async storeAirQualityData(location, aqData) {
    try {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO air_quality_data (
          location, date, timestamp, aqi, co, no, no2, o3, so2, pm2_5, pm10, nh3
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const result = stmt.run(
        location,
        format(new Date(), 'yyyy-MM-dd'),
        Math.floor(Date.now() / 1000),
        aqData.main?.aqi,
        aqData.components?.co,
        aqData.components?.no,
        aqData.components?.no2,
        aqData.components?.o3,
        aqData.components?.so2,
        aqData.components?.pm2_5,
        aqData.components?.pm10,
        aqData.components?.nh3
      );
      
      this.logger.debug(`Air quality data stored for ${location}`);
      return result.lastInsertRowid;
    } catch (error) {
      this.logger.error(`Failed to store air quality data for ${location}:`, error);
      throw error;
    }
  }

  /**
   * Analyze monthly trends
   */
  async analyzeMonthlyTrends(location = 'București', year = new Date().getFullYear()) {
    try {
      const query = `
        SELECT 
          strftime('%m', date) as month,
          COUNT(*) as data_points,
          AVG(temperature) as avg_temp,
          MAX(temperature) as max_temp,
          MIN(temperature) as min_temp,
          AVG(humidity) as avg_humidity,
          AVG(pressure) as avg_pressure,
          AVG(wind_speed) as avg_wind_speed,
          SUM(CASE WHEN rain_1h > 0 THEN 1 ELSE 0 END) as rainy_days,
          AVG(rain_1h) as avg_rainfall
        FROM weather_data 
        WHERE location = ? AND strftime('%Y', date) = ?
        GROUP BY strftime('%m', date)
        ORDER BY month
      `;
      
      const trends = this.db.prepare(query).all(location, year.toString());
      
      console.log('\n' + '═'.repeat(100));
      console.log(chalk.cyan.bold(`📊  ANALIZA TENDINȚELOR LUNARE - ${location.toUpperCase()} ${year}`));
      console.log('═'.repeat(100));
      
      const monthNames = [
        'Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun',
        'Iul', 'Aug', 'Sep', 'Oct', 'Noi', 'Dec'
      ];
      
      console.table(
        trends.map(t => ({
          'Luna': monthNames[parseInt(t.month) - 1],
          'Temp Medie': t.avg_temp ? `${t.avg_temp.toFixed(1)}°C` : 'N/A',
          'Temp Max': t.max_temp ? `${t.max_temp.toFixed(1)}°C` : 'N/A',
          'Temp Min': t.min_temp ? `${t.min_temp.toFixed(1)}°C` : 'N/A',
          'Umiditate': t.avg_humidity ? `${t.avg_humidity.toFixed(0)}%` : 'N/A',
          'Presiune': t.avg_pressure ? `${t.avg_pressure.toFixed(0)} hPa` : 'N/A',
          'Vânt': t.avg_wind_speed ? `${t.avg_wind_speed.toFixed(1)} km/h` : 'N/A',
          'Zile Ploioase': t.rainy_days || 0,
          'Date': t.data_points || 0
        }))
      );
      
      return trends;
    } catch (error) {
      this.logger.error('Failed to analyze monthly trends:', error);
      throw error;
    }
  }

  /**
   * Compare with previous year
   */
  async compareWithLastYear(location = 'București') {
    try {
      const currentYear = new Date().getFullYear();
      const lastYear = currentYear - 1;
      
      const query = `
        SELECT 
          strftime('%Y', date) as year,
          COUNT(*) as data_points,
          AVG(temperature) as avg_temp,
          MAX(temperature) as max_temp,
          MIN(temperature) as min_temp,
          AVG(humidity) as avg_humidity,
          SUM(CASE WHEN rain_1h > 0 THEN 1 ELSE 0 END) as rainy_days
        FROM weather_data 
        WHERE location = ? AND (strftime('%Y', date) = ? OR strftime('%Y', date) = ?)
        GROUP BY strftime('%Y', date)
        ORDER BY year
      `;
      
      const yearData = this.db.prepare(query).all(location, lastYear.toString(), currentYear.toString());
      
      if (yearData.length >= 2) {
        const lastYearData = yearData.find(d => d.year == lastYear);
        const currentYearData = yearData.find(d => d.year == currentYear);
        
        const tempDifference = currentYearData.avg_temp - lastYearData.avg_temp;
        const humidityDifference = currentYearData.avg_humidity - lastYearData.avg_humidity;
        const rainyDaysDifference = currentYearData.rainy_days - lastYearData.rainy_days;
        
        console.log('\n' + '═'.repeat(80));
        console.log(chalk.cyan.bold(`📅  COMPARARE ${lastYear} vs ${currentYear} - ${location.toUpperCase()}`));
        console.log('═'.repeat(80));
        
        console.log(chalk.white.bold('\nTEMPERATUR\u0102:'));
        const tempColor = tempDifference > 0 ? chalk.red : chalk.blue;
        const tempDirection = tempDifference > 0 ? 'mai cald' : 'mai rece';
        console.log(`${tempColor(`${Math.abs(tempDifference).toFixed(1)}°C ${tempDirection}`)} decât anul trecut`);
        
        console.log(chalk.white.bold('\nUMIDITATE:'));
        const humidityColor = humidityDifference > 0 ? chalk.blue : chalk.yellow;
        const humidityDirection = humidityDifference > 0 ? 'mai umed' : 'mai uscat';
        console.log(`${humidityColor(`${Math.abs(humidityDifference).toFixed(1)}% ${humidityDirection}`)} decât anul trecut`);
        
        console.log(chalk.white.bold('\nPRECIPITAȚII:'));
        const rainColor = rainyDaysDifference > 0 ? chalk.blue : chalk.yellow;
        const rainDirection = rainyDaysDifference > 0 ? 'mai multe' : 'mai puține';
        console.log(`${rainColor(`${Math.abs(rainyDaysDifference)} zile ploioase ${rainDirection}`)} decât anul trecut`);
        
        console.log('\n' + chalk.gray(`Date analizate: ${lastYear} (${lastYearData.data_points} înregistrări), ${currentYear} (${currentYearData.data_points} înregistrări)`));
        console.log('═'.repeat(80) + '\n');
        
        return { lastYearData, currentYearData, differences: { tempDifference, humidityDifference, rainyDaysDifference } };
      } else {
        console.log(chalk.yellow('\n⚠️  Date insuficiente pentru comparare. Sunt necesare cel puțin 2 ani de date.\n'));
        return null;
      }
    } catch (error) {
      this.logger.error('Failed to compare with last year:', error);
      throw error;
    }
  }

  /**
   * Analyze extreme weather events
   */
  async analyzeExtremeWeatherEvents(location = 'București', days = 90) {
    try {
      const cutoffDate = format(subDays(new Date(), days), 'yyyy-MM-dd');
      
      const query = `
        SELECT 
          date,
          temperature,
          wind_speed,
          rain_1h,
          humidity,
          main_condition,
          description
        FROM weather_data 
        WHERE location = ? AND date >= ?
          AND (temperature < 0 OR temperature > 30 OR wind_speed > 15 OR rain_1h > 5)
        ORDER BY date DESC
      `;
      
      const extremeEvents = this.db.prepare(query).all(location, cutoffDate);
      
      if (extremeEvents.length > 0) {
        console.log('\n' + '═'.repeat(80));
        console.log(chalk.red.bold(`⚡  EVENIMENTE METEO EXTREME - Ultimele ${days} zile`));
        console.log('═'.repeat(80));
        
        const categorized = {
          extreme_temp: extremeEvents.filter(e => e.temperature < 0 || e.temperature > 30),
          strong_wind: extremeEvents.filter(e => e.wind_speed > 15),
          heavy_rain: extremeEvents.filter(e => e.rain_1h > 5)
        };
        
        if (categorized.extreme_temp.length > 0) {
          console.log(chalk.red('\n🌡️  TEMPERATURE EXTREME:'));
          categorized.extreme_temp.slice(0, 5).forEach(event => {
            const color = event.temperature < 0 ? chalk.cyan : chalk.red;
            console.log(`  ${event.date}: ${color(event.temperature + '°C')} - ${event.description}`);
          });
        }
        
        if (categorized.strong_wind.length > 0) {
          console.log(chalk.yellow('\n💨  VÂNT PUTERNIC:'));
          categorized.strong_wind.slice(0, 5).forEach(event => {
            console.log(`  ${event.date}: ${chalk.yellow(event.wind_speed + ' km/h')} - ${event.description}`);
          });
        }
        
        if (categorized.heavy_rain.length > 0) {
          console.log(chalk.blue('\n🌧️  PLOAIE INTENS\u0102:'));
          categorized.heavy_rain.slice(0, 5).forEach(event => {
            console.log(`  ${event.date}: ${chalk.blue(event.rain_1h + ' mm/h')} - ${event.description}`);
          });
        }
        
        console.log('\n' + '═'.repeat(80) + '\n');
        return extremeEvents;
      } else {
        console.log(chalk.green(`\n✓  Niciun eveniment meteo extrem în ultimele ${days} zile.\n`));
        return [];
      }
    } catch (error) {
      this.logger.error('Failed to analyze extreme weather events:', error);
      throw error;
    }
  }

  /**
   * Get weather statistics for a specific period
   */
  async getWeatherStatistics(location = 'București', days = 30) {
    try {
      const cutoffDate = format(subDays(new Date(), days), 'yyyy-MM-dd');
      
      const query = `
        SELECT 
          COUNT(*) as total_records,
          AVG(temperature) as avg_temp,
          MAX(temperature) as max_temp,
          MIN(temperature) as min_temp,
          AVG(humidity) as avg_humidity,
          AVG(pressure) as avg_pressure,
          AVG(wind_speed) as avg_wind_speed,
          MAX(wind_speed) as max_wind_speed,
          SUM(rain_1h) as total_rainfall,
          COUNT(CASE WHEN rain_1h > 0 THEN 1 END) as rainy_periods,
          AVG(uv_index) as avg_uv_index,
          COUNT(CASE WHEN main_condition = 'Clear' THEN 1 END) as clear_days,
          COUNT(CASE WHEN main_condition = 'Clouds' THEN 1 END) as cloudy_days,
          COUNT(CASE WHEN main_condition = 'Rain' THEN 1 END) as rain_days
        FROM weather_data 
        WHERE location = ? AND date >= ?
      `;
      
      const stats = this.db.prepare(query).get(location, cutoffDate);
      
      if (stats && stats.total_records > 0) {
        console.log('\n' + '═'.repeat(80));
        console.log(chalk.cyan.bold(`📊  STATISTICA VREMII - ${location.toUpperCase()} (Ultimele ${days} zile)`));
        console.log('═'.repeat(80));
        
        console.log(chalk.white.bold('\nTEMPERATUR\u0102:'));
        console.log(`  Medie: ${chalk.yellow(stats.avg_temp.toFixed(1) + '°C')}`);
        console.log(`  Maxim\u0103: ${chalk.red(stats.max_temp.toFixed(1) + '°C')}`);
        console.log(`  Minim\u0103: ${chalk.blue(stats.min_temp.toFixed(1) + '°C')}`);
        
        console.log(chalk.white.bold('\nCONDIȚII ATMOSFERICE:'));
        console.log(`  Umiditate medie: ${chalk.blue(stats.avg_humidity.toFixed(0) + '%')}`);
        console.log(`  Presiune medie: ${chalk.gray(stats.avg_pressure.toFixed(0) + ' hPa')}`);
        console.log(`  Vânt mediu: ${chalk.green(stats.avg_wind_speed.toFixed(1) + ' km/h')}`);
        console.log(`  Vânt maxim: ${chalk.yellow(stats.max_wind_speed.toFixed(1) + ' km/h')}`);
        
        console.log(chalk.white.bold('\nPRECIPITAȚII:'));
        console.log(`  Total: ${chalk.blue(stats.total_rainfall.toFixed(1) + ' mm')}`);
        console.log(`  Perioade cu ploaie: ${chalk.blue(stats.rainy_periods)}`);
        
        console.log(chalk.white.bold('\nCONDIȚII GENERALE:'));
        console.log(`  Zile senine: ${chalk.yellow(stats.clear_days)}`);
        console.log(`  Zile înnoate: ${chalk.gray(stats.cloudy_days)}`);
        console.log(`  Zile ploioase: ${chalk.blue(stats.rain_days)}`);
        
        if (stats.avg_uv_index) {
          console.log(`  Indice UV mediu: ${chalk.orange(stats.avg_uv_index.toFixed(1))}`);
        }
        
        console.log('\n' + chalk.gray(`Date analizate: ${stats.total_records} înregistrări`));
        console.log('═'.repeat(80) + '\n');
        
        return stats;
      } else {
        console.log(chalk.yellow(`\n⚠️  Nu există date pentru ${location} în ultimele ${days} zile.\n`));
        return null;
      }
    } catch (error) {
      this.logger.error('Failed to get weather statistics:', error);
      throw error;
    }
  }

  /**
   * Export data to CSV
   */
  async exportToCSV(location = 'București', days = 30, filename = null) {
    try {
      const cutoffDate = format(subDays(new Date(), days), 'yyyy-MM-dd');
      const exportFilename = filename || `weather-data-${location.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      const exportPath = path.join(process.cwd(), exportFilename);
      
      const query = `
        SELECT 
          date, temperature, feels_like, humidity, pressure, wind_speed, wind_direction,
          visibility, uv_index, main_condition, description, rain_1h, rain_3h,
          snow_1h, snow_3h, cloudiness
        FROM weather_data 
        WHERE location = ? AND date >= ?
        ORDER BY date DESC, timestamp DESC
      `;
      
      const data = this.db.prepare(query).all(location, cutoffDate);
      
      if (data.length > 0) {
        const headers = [
          'Data', 'Temperatura', 'Se simte ca', 'Umiditate', 'Presiune', 'Viteza vant',
          'Directie vant', 'Vizibilitate', 'Indice UV', 'Conditie principala', 'Descriere',
          'Ploaie 1h', 'Ploaie 3h', 'Zapada 1h', 'Zapada 3h', 'Noriositate'
        ];
        
        const csvContent = [
          headers.join(','),
          ...data.map(row => [
            row.date,
            row.temperature,
            row.feels_like || '',
            row.humidity || '',
            row.pressure || '',
            row.wind_speed || '',
            row.wind_direction || '',
            row.visibility || '',
            row.uv_index || '',
            `"${row.main_condition || ''}"`,
            `"${row.description || ''}"`,
            row.rain_1h || 0,
            row.rain_3h || 0,
            row.snow_1h || 0,
            row.snow_3h || 0,
            row.cloudiness || ''
          ].join(','))
        ].join('\n');
        
        await fs.writeFile(exportPath, csvContent, 'utf8');
        
        console.log('\n' + '═'.repeat(60));
        console.log(chalk.green.bold(`✓  DATE EXPORTATE CU SUCCES`));
        console.log('═'.repeat(60));
        console.log(`Fișier: ${chalk.cyan(exportPath)}`);
        console.log(`Locație: ${chalk.yellow(location)}`);
        console.log(`Perioada: ${chalk.blue(cutoffDate)} - ${format(new Date(), 'yyyy-MM-dd')}`);
        console.log(`Înregistrări: ${chalk.green(data.length)}`);
        console.log('═'.repeat(60) + '\n');
        
        return { path: exportPath, records: data.length };
      } else {
        console.log(chalk.yellow(`\n⚠️  Nu există date pentru export.\n`));
        return null;
      }
    } catch (error) {
      this.logger.error('Failed to export to CSV:', error);
      throw error;
    }
  }

  /**
   * Get database info and storage size
   */
  async getDatabaseInfo() {
    try {
      const stats = await fs.stat(this.dbPath);
      const sizeInMB = (stats.size / 1024 / 1024).toFixed(2);
      
      const weatherCount = this.db.prepare('SELECT COUNT(*) as count FROM weather_data').get();
      const airQualityCount = this.db.prepare('SELECT COUNT(*) as count FROM air_quality_data').get();
      const alertsCount = this.db.prepare('SELECT COUNT(*) as count FROM weather_alerts').get();
      
      const oldestRecord = this.db.prepare('SELECT MIN(date) as oldest FROM weather_data').get();
      const newestRecord = this.db.prepare('SELECT MAX(date) as newest FROM weather_data').get();
      
      console.log('\n' + '═'.repeat(60));
      console.log(chalk.cyan.bold('🗄  INFORMAȚII BAZĂ DE DATE'));
      console.log('═'.repeat(60));
      console.log(`Cale fișier: ${chalk.gray(this.dbPath)}`);
      console.log(`Mărime: ${chalk.yellow(sizeInMB + ' MB')}`);
      console.log(`Date meteo: ${chalk.green(weatherCount.count + ' înregistrări')}`);
      console.log(`Date calitate aer: ${chalk.blue(airQualityCount.count + ' înregistrări')}`);
      console.log(`Alerte: ${chalk.red(alertsCount.count + ' înregistrări')}`);
      
      if (oldestRecord.oldest && newestRecord.newest) {
        console.log(`Perioada: ${chalk.blue(oldestRecord.oldest)} - ${chalk.blue(newestRecord.newest)}`);
      }
      
      console.log('═'.repeat(60) + '\n');
      
      return {
        path: this.dbPath,
        sizeInMB: parseFloat(sizeInMB),
        weatherRecords: weatherCount.count,
        airQualityRecords: airQualityCount.count,
        alertRecords: alertsCount.count,
        oldestRecord: oldestRecord.oldest,
        newestRecord: newestRecord.newest
      };
    } catch (error) {
      this.logger.error('Failed to get database info:', error);
      throw error;
    }
  }

  /**
   * Clean old records to manage database size
   */
  async cleanOldRecords(daysToKeep = 365) {
    try {
      const cutoffDate = format(subDays(new Date(), daysToKeep), 'yyyy-MM-dd');
      
      const weatherDeleted = this.db.prepare('DELETE FROM weather_data WHERE date < ?').run(cutoffDate);
      const airQualityDeleted = this.db.prepare('DELETE FROM air_quality_data WHERE date < ?').run(cutoffDate);
      const alertsDeleted = this.db.prepare('DELETE FROM weather_alerts WHERE date < ?').run(cutoffDate);
      
      // Vacuum to reclaim space
      this.db.exec('VACUUM');
      
      console.log('\n' + chalk.green.bold('✓  CLEAN-UP COMPLET'));
      console.log(`🗑️  Date meteo șterse: ${weatherDeleted.changes}`);
      console.log(`🗑️  Date calitate aer șterse: ${airQualityDeleted.changes}`);
      console.log(`🗑️  Alerte șterse: ${alertsDeleted.changes}`);
      console.log(`📋  Păstrate date din ultimele ${daysToKeep} zile\n`);
      
      return {
        weatherDeleted: weatherDeleted.changes,
        airQualityDeleted: airQualityDeleted.changes,
        alertsDeleted: alertsDeleted.changes
      };
    } catch (error) {
      this.logger.error('Failed to clean old records:', error);
      throw error;
    }
  }

  /**
   * Close database connection
   */
  close() {
    if (this.db) {
      this.db.close();
      this.logger.info('Weather analytics database closed');
    }
  }
}