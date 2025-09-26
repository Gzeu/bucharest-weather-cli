import chalk from 'chalk';
import boxen from 'boxen';
import { table } from 'table';
import figlet from 'figlet';

/**
 * Advanced Weather CLI Templates v3.0
 * Multiple visual styles for weather data presentation
 */
export class WeatherTemplates {
  constructor() {
    this.themes = {
      default: {
        primary: 'blue',
        secondary: 'cyan',
        accent: 'yellow',
        success: 'green',
        warning: 'yellow',
        danger: 'red',
        text: 'white'
      },
      dark: {
        primary: 'gray',
        secondary: 'white',
        accent: 'magenta',
        success: 'green',
        warning: 'orange',
        danger: 'red',
        text: 'gray'
      },
      ocean: {
        primary: 'blue',
        secondary: 'cyan',
        accent: 'white',
        success: 'cyan',
        warning: 'yellow',
        danger: 'red',
        text: 'blue'
      },
      forest: {
        primary: 'green',
        secondary: 'yellow',
        accent: 'white',
        success: 'green',
        warning: 'orange',
        danger: 'red',
        text: 'green'
      },
      sunset: {
        primary: 'red',
        secondary: 'orange',
        accent: 'yellow',
        success: 'orange',
        warning: 'yellow',
        danger: 'red',
        text: 'orange'
      },
      cyberpunk: {
        primary: 'magenta',
        secondary: 'cyan',
        accent: 'green',
        success: 'green',
        warning: 'yellow',
        danger: 'red',
        text: 'magenta'
      },
      minimal: {
        primary: 'white',
        secondary: 'gray',
        accent: 'white',
        success: 'white',
        warning: 'white',
        danger: 'white',
        text: 'white'
      },
      rainbow: {
        primary: 'rainbow',
        secondary: 'rainbow',
        accent: 'rainbow',
        success: 'green',
        warning: 'yellow',
        danger: 'red',
        text: 'rainbow'
      }
    };
    
    this.currentTheme = 'default';
  }

  setTheme(theme) {
    if (this.themes[theme]) {
      this.currentTheme = theme;
      return true;
    }
    return false;
  }

  getColor(type) {
    const theme = this.themes[this.currentTheme];
    return theme[type] || theme.text;
  }

  // TEMPLATE 1: Classic Professional
  renderClassicProfessional(weatherData, insights) {
    const primaryColor = this.getColor('primary');
    const secondaryColor = this.getColor('secondary');
    const accentColor = this.getColor('accent');
    
    const header = figlet.textSync('VREMEA', { font: 'Small' });
    const timestamp = new Date().toLocaleString('ro-RO');
    
    const content = [
      chalk[primaryColor](header),
      chalk[secondaryColor]('🌤️ Bucharest Weather Intelligence System'),
      chalk.gray(`Actualizat: ${timestamp}`),
      '',
      chalk[accentColor].bold('━━━ CONDIȚII METEOROLOGICE ACTUALE ━━━'),
      '',
      `🌡️  Temperatură: ${this.formatTemp(weatherData.temp)} (simte ca ${weatherData.feels_like}°C)`,
      `☁️  Condiții: ${weatherData.description} ${this.getWeatherIcon(weatherData.icon)}`,
      `💨  Vânt: ${weatherData.wind_speed} m/s ${weatherData.wind_direction || ''}`,
      `💧  Umiditate: ${weatherData.humidity}% | Presiune: ${weatherData.pressure} hPa`,
      `👁️  Vizibilitate: ${weatherData.visibility} km | Nori: ${weatherData.cloudiness}%`,
      `🌅  Răsărit: ${weatherData.sunrise} | 🌇  Apus: ${weatherData.sunset}`,
      '',
      chalk[accentColor].bold('━━━ RECOMANDĂRI INTELIGENTE ━━━'),
      '',
      `👔  Îmbrăcăminte: ${insights.clothing}`,
      `🎯  Activități: ${insights.activities}`,
      `📍  Locații: ${insights.locations}`,
      `💚  Sănătate: ${insights.health}`
    ];
    
    return boxen(content.join('\n'), {
      padding: 1,
      margin: 1,
      borderStyle: 'double',
      borderColor: primaryColor,
      title: '🏛️ PROFESSIONAL WEATHER REPORT',
      titleAlignment: 'center'
    });
  }

  // TEMPLATE 2: Modern Card Layout
  renderModernCard(weatherData, insights) {
    const theme = this.themes[this.currentTheme];
    const cards = [];
    
    // Main Weather Card
    const mainCard = [
      chalk[theme.primary].bold('🌤️ VREMEA ACUM'),
      '',
      `${this.formatTempLarge(weatherData.temp)}`,
      chalk[theme.secondary](weatherData.description),
      '',
      chalk.gray(`Simte ca ${weatherData.feels_like}°C`)
    ];
    
    cards.push(boxen(mainCard.join('\n'), {
      padding: 1,
      borderStyle: 'round',
      borderColor: theme.primary,
      width: 25,
      textAlignment: 'center'
    }));
    
    // Details Card
    const detailsCard = [
      chalk[theme.secondary].bold('📊 DETALII'),
      '',
      `💨 ${weatherData.wind_speed} m/s`,
      `💧 ${weatherData.humidity}%`,
      `📊 ${weatherData.pressure} hPa`,
      `👁️ ${weatherData.visibility} km`,
      `☁️ ${weatherData.cloudiness}%`
    ];
    
    cards.push(boxen(detailsCard.join('\n'), {
      padding: 1,
      borderStyle: 'round',
      borderColor: theme.secondary,
      width: 25
    }));
    
    // AI Insights Card
    const aiCard = [
      chalk[theme.accent].bold('🤖 AI TIPS'),
      '',
      `👕 ${insights.clothing.substring(0, 20)}...`,
      `🎯 ${insights.activities.substring(0, 20)}...`,
      `📍 ${insights.locations.substring(0, 20)}...`,
      '',
      chalk[theme.success]('✓ Condiții optime')
    ];
    
    cards.push(boxen(aiCard.join('\n'), {
      padding: 1,
      borderStyle: 'round',
      borderColor: theme.accent,
      width: 25
    }));
    
    // Arrange cards horizontally
    const lines = cards[0].split('\n');
    const result = [];
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      if (cards[1] && cards[1].split('\n')[i]) {
        line += '  ' + cards[1].split('\n')[i];
      }
      if (cards[2] && cards[2].split('\n')[i]) {
        line += '  ' + cards[2].split('\n')[i];
      }
      result.push(line);
    }
    
    return result.join('\n');
  }

  // TEMPLATE 3: Terminal Dashboard
  renderTerminalDashboard(weatherData, forecast, insights) {
    const theme = this.themes[this.currentTheme];
    
    const dashboard = [];
    
    // Header
    dashboard.push(chalk[theme.primary].bold('▓▓▓ BUCHAREST WEATHER DASHBOARD ▓▓▓'));
    dashboard.push(chalk.gray(`${new Date().toLocaleString('ro-RO')} | System Online`));
    dashboard.push('');
    
    // Current Weather Row
    const currentRow = [
      `[CURRENT] ${this.formatTempLarge(weatherData.temp)} ${weatherData.description}`,
      `[WIND] ${weatherData.wind_speed}m/s ${weatherData.wind_direction || 'N/A'}`,
      `[HUMIDITY] ${weatherData.humidity}%`,
      `[PRESSURE] ${weatherData.pressure}hPa`
    ];
    
    dashboard.push(chalk[theme.accent](currentRow.join(' | ')));
    dashboard.push(chalk.gray('─'.repeat(80)));
    dashboard.push('');
    
    // Forecast Table
    if (forecast) {
      dashboard.push(chalk[theme.secondary].bold('[FORECAST - 5 DAYS]'));
      
      const forecastData = [
        ['DAY', 'MIN', 'MAX', 'DESC', 'WIND', 'HUMIDITY']
      ];
      
      forecast.slice(0, 5).forEach((day, index) => {
        const dayName = index === 0 ? 'TODAY' : index === 1 ? 'TOMRW' : day.dayName.substring(0, 5);
        forecastData.push([
          dayName,
          `${day.temp_min}°C`,
          `${day.temp_max}°C`,
          day.description.substring(0, 10),
          `${day.wind_speed_avg || 'N/A'}m/s`,
          `${day.humidity_avg || 'N/A'}%`
        ]);
      });
      
      const config = {
        border: {
          topBody: '═',
          topJoin: '╤',
          topLeft: '╔',
          topRight: '╗',
          bottomBody: '═',
          bottomJoin: '╧',
          bottomLeft: '╚',
          bottomRight: '╝',
          bodyLeft: '║',
          bodyRight: '║',
          bodyJoin: '│'
        },
        columnDefault: {
          width: 8
        }
      };
      
      dashboard.push(table(forecastData, config));
    }
    
    // AI Status Panel
    dashboard.push('');
    dashboard.push(chalk[theme.primary]('[AI-INSIGHTS] STATUS: ACTIVE'));
    dashboard.push(chalk[theme.success](`>>> ${insights.clothing}`));
    dashboard.push(chalk[theme.success](`>>> ${insights.activities}`));
    dashboard.push(chalk[theme.success](`>>> ${insights.health}`));
    
    return dashboard.join('\n');
  }

  // TEMPLATE 4: Minimalist Clean
  renderMinimalist(weatherData, insights) {
    const lines = [];
    
    lines.push('');
    lines.push(chalk.white.bold(`bucuresti ${weatherData.temp}°c`));
    lines.push(chalk.gray(weatherData.description));
    lines.push('');
    lines.push(chalk.gray(`feels like ${weatherData.feels_like}°c`));
    lines.push(chalk.gray(`${weatherData.humidity}% humidity, ${weatherData.wind_speed}m/s wind`));
    lines.push('');
    lines.push(chalk.white(`${insights.clothing.toLowerCase()}`));
    lines.push('');
    
    return lines.join('\n');
  }

  // TEMPLATE 5: ASCII Art Weather
  renderASCIIArt(weatherData, insights) {
    const weatherArt = this.getWeatherASCII(weatherData.icon);
    const theme = this.themes[this.currentTheme];
    
    const content = [
      chalk[theme.primary](weatherArt.art),
      '',
      chalk[theme.accent].bold(`${weatherData.temp}°C în BUCUREȘTI`),
      chalk[theme.secondary](weatherData.description),
      '',
      `${weatherArt.description}`,
      '',
      chalk.gray('─'.repeat(50)),
      '',
      chalk[theme.primary]('🤖 AI RECOMANDĂ:'),
      chalk[theme.success](`• ${insights.clothing}`),
      chalk[theme.success](`• ${insights.activities}`),
      chalk[theme.success](`• ${insights.health}`)
    ];
    
    return boxen(content.join('\n'), {
      padding: 2,
      borderStyle: 'classic',
      borderColor: theme.primary,
      title: weatherArt.title,
      titleAlignment: 'center'
    });
  }

  // TEMPLATE 6: Retro Terminal
  renderRetroTerminal(weatherData, insights) {
    const lines = [];
    
    lines.push(chalk.green('> SYSTEM BOOT COMPLETE'));
    lines.push(chalk.green('> INITIALIZING WEATHER MODULE...'));
    lines.push(chalk.green('> CONNECTING TO BUCHAREST SENSORS...'));
    lines.push(chalk.green('> [OK] CONNECTION ESTABLISHED'));
    lines.push('');
    lines.push(chalk.yellow('╔═══════════════════════════════════════╗'));
    lines.push(chalk.yellow('║') + chalk.white.bold(' WEATHER TERMINAL v3.0               ') + chalk.yellow('║'));
    lines.push(chalk.yellow('╠═══════════════════════════════════════╣'));
    lines.push(chalk.yellow('║') + chalk.cyan(` TEMP: ${weatherData.temp}°C                     `) + chalk.yellow('║'));
    lines.push(chalk.yellow('║') + chalk.cyan(` DESC: ${weatherData.description.padEnd(27)} `) + chalk.yellow('║'));
    lines.push(chalk.yellow('║') + chalk.cyan(` WIND: ${weatherData.wind_speed}m/s                   `) + chalk.yellow('║'));
    lines.push(chalk.yellow('║') + chalk.cyan(` HUMI: ${weatherData.humidity}%                       `) + chalk.yellow('║'));
    lines.push(chalk.yellow('╠═══════════════════════════════════════╣'));
    lines.push(chalk.yellow('║') + chalk.green(' AI-ASSIST: ACTIVE                   ') + chalk.yellow('║'));
    lines.push(chalk.yellow('║') + chalk.green(` > ${insights.clothing.substring(0, 30)}`.padEnd(39)) + chalk.yellow('║'));
    lines.push(chalk.yellow('╚═══════════════════════════════════════╝'));
    lines.push('');
    lines.push(chalk.green('> READY FOR COMMANDS'));
    
    return lines.join('\n');
  }

  // TEMPLATE 7: Weather Map
  renderWeatherMap(weatherData, insights) {
    const map = this.generateBucharestMap(weatherData);
    const theme = this.themes[this.currentTheme];
    
    const content = [
      chalk[theme.primary].bold('🗺️ WEATHER MAP - BUCUREȘTI'),
      '',
      map,
      '',
      chalk[theme.secondary](`Temperatură: ${weatherData.temp}°C | ${weatherData.description}`),
      chalk[theme.secondary](`Vânt: ${weatherData.wind_speed}m/s | Umiditate: ${weatherData.humidity}%`),
      '',
      chalk[theme.accent].bold('📍 ZONE RECOMANDATE:'),
      chalk[theme.success](`• ${insights.locations}`),
      chalk[theme.success](`• ${insights.activities}`)
    ];
    
    return boxen(content.join('\n'), {
      padding: 1,
      borderStyle: 'double',
      borderColor: theme.primary,
      title: '🌍 WEATHER GEOGRAPHY',
      titleAlignment: 'center'
    });
  }

  // TEMPLATE 8: Mobile-Style Cards
  renderMobileCards(weatherData, insights) {
    const theme = this.themes[this.currentTheme];
    const cards = [];
    
    // Temperature Card
    const tempCard = [
      chalk[theme.primary]('┌─────────────────┐'),
      chalk[theme.primary]('│') + chalk[theme.accent].bold(`    ${weatherData.temp}°C        `) + chalk[theme.primary]('│'),
      chalk[theme.primary]('│') + chalk[theme.secondary](`  ${weatherData.description.padEnd(15)}`) + chalk[theme.primary]('│'),
      chalk[theme.primary]('│') + chalk.gray(`  Simte ca ${weatherData.feels_like}°C   `) + chalk[theme.primary]('│'),
      chalk[theme.primary]('└─────────────────┘')
    ];
    
    // Wind & Humidity Card
    const detailsCard = [
      chalk[theme.secondary]('┌─────────────────┐'),
      chalk[theme.secondary]('│') + chalk.white(`  💨 ${weatherData.wind_speed}m/s       `) + chalk[theme.secondary]('│'),
      chalk[theme.secondary]('│') + chalk.white(`  💧 ${weatherData.humidity}%           `) + chalk[theme.secondary]('│'),
      chalk[theme.secondary]('│') + chalk.white(`  📊 ${weatherData.pressure}hPa   `) + chalk[theme.secondary]('│'),
      chalk[theme.secondary]('└─────────────────┘')
    ];
    
    // AI Tips Card
    const aiCard = [
      chalk[theme.accent]('┌─────────────────┐'),
      chalk[theme.accent]('│') + chalk.white('  🤖 AI TIPS      ') + chalk[theme.accent]('│'),
      chalk[theme.accent]('│') + chalk[theme.success](`  👕 Îmbrăcăminte   `) + chalk[theme.accent]('│'),
      chalk[theme.accent]('│') + chalk[theme.success](`  🎯 Activități     `) + chalk[theme.accent]('│'),
      chalk[theme.accent]('└─────────────────┘')
    ];
    
    return [tempCard.join('\n'), detailsCard.join('\n'), aiCard.join('\n')].join('\n\n');
  }

  // TEMPLATE 9: Matrix Style
  renderMatrix(weatherData, insights) {
    const matrix = this.generateMatrix(weatherData);
    
    const content = [
      chalk.green('█▓▒░ WEATHER MATRIX PROTOCOL ░▒▓█'),
      '',
      chalk.green(matrix),
      '',
      chalk.green(`> DECODING WEATHER DATA...`),
      chalk.green(`> TEMPERATURE: ${weatherData.temp}°C`),
      chalk.green(`> CONDITIONS: ${weatherData.description.toUpperCase()}`),
      chalk.green(`> WIND_SPEED: ${weatherData.wind_speed}m/s`),
      chalk.green(`> HUMIDITY: ${weatherData.humidity}%`),
      '',
      chalk.cyan('> AI_MODULE_STATUS: ONLINE'),
      chalk.cyan(`> RECOMMENDATION: ${insights.clothing.toUpperCase()}`),
      chalk.cyan(`> ACTIVITY_SUGGEST: ${insights.activities.toUpperCase()}`),
      '',
      chalk.green('> END TRANSMISSION')
    ];
    
    return content.join('\n');
  }

  // TEMPLATE 10: Weather Gauge
  renderGauge(weatherData, insights) {
    const tempGauge = this.createTempGauge(weatherData.temp);
    const windGauge = this.createWindGauge(weatherData.wind_speed);
    const humidityGauge = this.createHumidityGauge(weatherData.humidity);
    
    const theme = this.themes[this.currentTheme];
    
    const content = [
      chalk[theme.primary].bold('📊 WEATHER GAUGES - BUCUREȘTI'),
      '',
      `🌡️  TEMPERATURĂ: ${tempGauge}`,
      `💨  VÂNT: ${windGauge}`,
      `💧  UMIDITATE: ${humidityGauge}`,
      '',
      chalk[theme.secondary](`Condiții: ${weatherData.description}`),
      chalk[theme.secondary](`Presiune: ${weatherData.pressure} hPa`),
      '',
      chalk[theme.accent].bold('🎯 RECOMANDĂRI:'),
      chalk[theme.success](insights.clothing),
      chalk[theme.success](insights.activities)
    ];
    
    return boxen(content.join('\n'), {
      padding: 1,
      borderStyle: 'round',
      borderColor: theme.primary,
      title: '📈 WEATHER ANALYTICS',
      titleAlignment: 'center'
    });
  }

  // Helper methods
  formatTemp(temp) {
    if (temp > 30) return chalk.red.bold(`${temp}°C`);
    if (temp < 0) return chalk.blue.bold(`${temp}°C`);
    if (temp < 10) return chalk.cyan.bold(`${temp}°C`);
    return chalk.yellow.bold(`${temp}°C`);
  }

  formatTempLarge(temp) {
    const tempStr = `${temp}°C`;
    if (temp > 30) return chalk.red.bold(tempStr);
    if (temp < 0) return chalk.blue.bold(tempStr);
    if (temp < 10) return chalk.cyan.bold(tempStr);
    return chalk.yellow.bold(tempStr);
  }

  getWeatherIcon(iconCode) {
    const icons = {
      '01d': '☀️', '01n': '🌙', '02d': '⛅', '02n': '☁️',
      '03d': '☁️', '03n': '☁️', '04d': '☁️', '04n': '☁️',
      '09d': '🌧️', '09n': '🌧️', '10d': '🌦️', '10n': '🌧️',
      '11d': '⛈️', '11n': '⛈️', '13d': '🌨️', '13n': '🌨️',
      '50d': '🌫️', '50n': '🌫️'
    };
    return icons[iconCode] || '🌤️';
  }

  getWeatherASCII(iconCode) {
    const artMap = {
      '01d': {
        art: `    \   /    
     .--.     
  .-'      '. 
 .'  SUNNY   '.
 '___.       _.'
     '--'     `,
        title: '☀️ SUNNY WEATHER',
        description: 'Soare strălucitor în București!'
      },
      '02d': {
        art: `   \  /  
 _ /"".-.   
   \_(   ). 
   /'(_)('.)
          '-'
     CLOUDS    `,
        title: '⛅ PARTLY CLOUDY',
        description: 'Parțial înnorat cu soare'
      },
      '09d': {
        art: `     .--.    
  .-(    ).  
 (___.__)__) 
  ' ' ' ' '  
 ' ' ' ' ' ' 
     RAIN     `,
        title: '🌧️ RAINY WEATHER',
        description: 'Ploaie în București'
      },
      default: {
        art: `    .---.    
   (     )   
  (___.__)  
    CLOUDY   `,
        title: '☁️ CLOUDY WEATHER',
        description: 'Vremea înnorat'
      }
    };
    
    return artMap[iconCode] || artMap.default;
  }

  generateBucharestMap(weatherData) {
    const temp = weatherData.temp;
    const tempColor = temp > 25 ? 'red' : temp > 15 ? 'yellow' : 'blue';
    
    const map = [
      '     ┌─────────────────┐',
      '     │ SECTORUL 1      │',
      '     │   🏛️  🌡️' + chalk[tempColor](`${temp}°C`) + '   │',
      '     └─────┬───────────┘',
      '           │',
      '     ┌─────┴───────────┐',
      '     │ CENTRUL VECHI   │',
      '     │   🏰  ' + this.getWeatherIcon(weatherData.icon) + '      │',
      '     └─────┬───────────┘',
      '           │',
      '     ┌─────┴───────────┐',
      '     │ SECTORUL 3-4    │',
      '     │   🏢  💨' + weatherData.wind_speed + 'm/s │',
      '     └─────────────────┘'
    ];
    
    return map.join('\n');
  }

  generateMatrix(weatherData) {
    const chars = '01';
    let matrix = '';
    
    for (let i = 0; i < 5; i++) {
      let line = '';
      for (let j = 0; j < 20; j++) {
        if (Math.random() < 0.3) {
          line += chars[Math.floor(Math.random() * chars.length)];
        } else {
          line += ' ';
        }
      }
      matrix += line + '\n';
    }
    
    return matrix;
  }

  createTempGauge(temp) {
    const min = -20, max = 50;
    const percentage = Math.max(0, Math.min(100, ((temp - min) / (max - min)) * 100));
    const filled = Math.floor(percentage / 5);
    const empty = 20 - filled;
    
    let gauge = '[';
    gauge += chalk.red('█'.repeat(filled));
    gauge += chalk.gray('░'.repeat(empty));
    gauge += `] ${temp}°C`;
    
    return gauge;
  }

  createWindGauge(windSpeed) {
    const max = 30;
    const percentage = Math.max(0, Math.min(100, (windSpeed / max) * 100));
    const filled = Math.floor(percentage / 5);
    const empty = 20 - filled;
    
    let gauge = '[';
    gauge += chalk.blue('█'.repeat(filled));
    gauge += chalk.gray('░'.repeat(empty));
    gauge += `] ${windSpeed}m/s`;
    
    return gauge;
  }

  createHumidityGauge(humidity) {
    const filled = Math.floor(humidity / 5);
    const empty = 20 - filled;
    
    let gauge = '[';
    gauge += chalk.cyan('█'.repeat(filled));
    gauge += chalk.gray('░'.repeat(empty));
    gauge += `] ${humidity}%`;
    
    return gauge;
  }

  // Template selector method
  renderTemplate(templateName, weatherData, forecast = null, insights = null) {
    switch (templateName) {
      case 'classic':
        return this.renderClassicProfessional(weatherData, insights);
      case 'modern':
        return this.renderModernCard(weatherData, insights);
      case 'dashboard':
        return this.renderTerminalDashboard(weatherData, forecast, insights);
      case 'minimal':
        return this.renderMinimalist(weatherData, insights);
      case 'ascii':
        return this.renderASCIIArt(weatherData, insights);
      case 'retro':
        return this.renderRetroTerminal(weatherData, insights);
      case 'map':
        return this.renderWeatherMap(weatherData, insights);
      case 'mobile':
        return this.renderMobileCards(weatherData, insights);
      case 'matrix':
        return this.renderMatrix(weatherData, insights);
      case 'gauge':
        return this.renderGauge(weatherData, insights);
      default:
        return this.renderClassicProfessional(weatherData, insights);
    }
  }

  // Get available templates
  getAvailableTemplates() {
    return [
      { name: 'classic', description: 'Template profesional clasic cu design elegant' },
      { name: 'modern', description: 'Layout modern cu carduri și design clean' },
      { name: 'dashboard', description: 'Dashboard terminal cu tabele și indicatori' },
      { name: 'minimal', description: 'Design minimalist pentru utilizatori avansați' },
      { name: 'ascii', description: 'Arte ASCII cu ilustrații meteorologice' },
      { name: 'retro', description: 'Terminal retro în stil anii 80-90' },
      { name: 'map', description: 'Hartă meteo pentru București' },
      { name: 'mobile', description: 'Design inspirat din aplicații mobile' },
      { name: 'matrix', description: 'Stil Matrix cu efecte vizuale' },
      { name: 'gauge', description: 'Indicatori vizuali tip gauge pentru date meteo' }
    ];
  }

  // Get available themes
  getAvailableThemes() {
    return Object.keys(this.themes).map(theme => ({
      name: theme,
      colors: this.themes[theme]
    }));
  }
}