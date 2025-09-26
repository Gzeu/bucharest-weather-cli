#!/usr/bin/env node

import { program } from 'commander';
import { BucharestWeatherApp } from './index.js';
import { WeatherTemplates } from './templates/weather-templates.js';
import { TemplateConfig } from './templates/template-config.js';
import chalk from 'chalk';
import ora from 'ora';
import boxen from 'boxen';
import figlet from 'figlet';

/**
 * Enhanced Bucharest Weather CLI v3.0
 * Advanced template system with multiple visual styles
 */

class WeatherCLI {
  constructor() {
    this.app = new BucharestWeatherApp();
    this.templates = new WeatherTemplates();
    this.config = new TemplateConfig();
    this.version = '3.0.0';
  }

  async init() {
    await this.config.init();
    
    // Apply current theme and template settings
    const currentTheme = this.config.getCurrentTheme();
    const currentTemplate = this.config.getCurrentTemplate();
    
    this.templates.setTheme(currentTheme);
    
    return { theme: currentTheme, template: currentTemplate };
  }

  async displayWeatherWithTemplate(template, options = {}) {
    const spinner = ora('Obțin datele meteorologice...').start();
    
    try {
      // Get weather data
      const weatherResult = await this.app.getCurrentWeather(false);
      let forecast = null;
      
      if (options.includeForecast) {
        forecast = await this.app.getForecast(options.forecastDays || 5);
      }
      
      spinner.succeed('Date meteo obținute!');
      
      // Render with selected template
      const output = this.templates.renderTemplate(
        template,
        weatherResult.current,
        forecast,
        weatherResult.insights
      );
      
      console.log('\n' + output);
      
      // Show additional info if verbose
      if (options.verbose) {
        await this.app.showSystemInfo();
      }
      
    } catch (error) {
      spinner.fail('Eroare la obținerea datelor');
      console.error(chalk.red('❌ Eroare:', error.message));
    }
  }

  showWelcomeBanner() {
    const banner = figlet.textSync('BW CLI v3', { font: 'Small' });
    const welcomeText = [
      chalk.cyan(banner),
      '',
      chalk.blue.bold('🌤️  Bucharest Weather CLI v3.0'),
      chalk.gray('   Advanced Template System & Visual Styles'),
      chalk.gray('   Made with ❤️ for Romanian developers'),
      '',
      chalk.yellow('✨ Features:'),
      chalk.gray('   • 10+ Visual Templates (classic, modern, dashboard, minimal...)'),
      chalk.gray('   • 8 Color Themes (default, dark, ocean, cyberpunk...)'),
      chalk.gray('   • AI-Powered Weather Insights'),
      chalk.gray('   • Interactive Configuration System'),
      chalk.gray('   • Export/Import Settings'),
      '',
      chalk.cyan('🚀 Quick Start:'),
      chalk.white('   bw now              '), chalk.gray('- Vezi vremea cu template-ul curent'),
      chalk.white('   bw templates         '), chalk.gray('- Explorează toate template-urile'),
      chalk.white('   bw config           '), chalk.gray('- Configurare interactivă'),
      chalk.white('   bw theme ocean      '), chalk.gray('- Schimbă tema de culori'),
      '',
      chalk.magenta('💡 Pro Tips:'),
      chalk.gray('   • Folosește "bw quick" pentru comutare rapidă template'),
      chalk.gray('   • Template-urile se salvează automat în ~/.bucharest-weather-cli'),
      chalk.gray('   • Poți crea preset-uri personalizate pentru diferite situații')
    ];
    
    console.log(boxen(welcomeText.join('\n'), {
      padding: 1,
      margin: 1,
      borderStyle: 'double',
      borderColor: 'cyan',
      title: '🎨 ADVANCED WEATHER TEMPLATES',
      titleAlignment: 'center'
    }));
  }

  async showTemplateGallery() {
    console.log(chalk.cyan.bold('🎨 GALERIA DE TEMPLATE-URI\n'));
    
    const templates = this.templates.getAvailableTemplates();
    const currentTemplate = this.config.getCurrentTemplate();
    
    for (const template of templates) {
      const isActive = template.name === currentTemplate;
      const status = isActive ? chalk.green('✓ ACTIV') : chalk.gray('○ disponibil');
      
      console.log(chalk.yellow.bold(`${template.name.toUpperCase()} ${status}`));
      console.log(chalk.gray(template.description));
      console.log('');
      
      // Show preview
      const preview = this.config.getTemplatePreview(template.name);
      console.log(preview);
      console.log('');
      console.log(chalk.gray('─'.repeat(80)));
      console.log('');
    }
  }

  async showThemeGallery() {
    console.log(chalk.cyan.bold('🎨 GALERIA DE TEME\n'));
    
    const themes = this.templates.getAvailableThemes();
    const currentTheme = this.config.getCurrentTheme();
    
    themes.forEach(theme => {
      const isActive = theme.name === currentTheme;
      const status = isActive ? chalk.green('✓ ACTIVĂ') : chalk.gray('○ disponibilă');
      
      console.log(chalk.yellow.bold(`${theme.name.toUpperCase()} ${status}`));
      
      // Show theme colors
      const colors = theme.colors;
      console.log(
        chalk[colors.primary]('■ Primary'), 
        chalk[colors.secondary]('■ Secondary'),
        chalk[colors.accent]('■ Accent'),
        chalk[colors.success]('■ Success'),
        chalk[colors.warning]('■ Warning'),
        chalk[colors.danger]('■ Danger')
      );
      console.log('');
    });
  }

  async previewTemplate(templateName, themeName = null) {
    if (themeName) {
      this.templates.setTheme(themeName);
    }
    
    console.log(chalk.cyan(`🔍 Preview: ${templateName} ${themeName ? `cu tema ${themeName}` : ''}\n`));
    
    // Generate mock weather data for preview
    const mockWeather = {
      temp: 22,
      feels_like: 24,
      description: 'parțial înnorat',
      icon: '02d',
      humidity: 65,
      pressure: 1013,
      wind_speed: 3.2,
      wind_direction: 'NE',
      visibility: 10,
      cloudiness: 40,
      sunrise: '06:45',
      sunset: '19:30'
    };
    
    const mockInsights = {
      clothing: 'Cămașă subțire + jachetă ușoară',
      activities: 'Ideal pentru plimbări în parc sau cycling',
      locations: 'Herăstrău, Centrul Vechi, Calea Victoriei',
      health: 'Condiții bune pentru activități outdoor',
      alerts: []
    };
    
    const output = this.templates.renderTemplate(templateName, mockWeather, null, mockInsights);
    console.log(output);
  }
}

// Initialize CLI
const cli = new WeatherCLI();

// CLI Commands Configuration
program
  .name('bucharest-weather')
  .description('🌤️ Professional weather CLI for Bucharest with advanced templates')
  .version(cli.version);

// Welcome command
program
  .command('welcome')
  .alias('w')
  .description('Show welcome banner with features overview')
  .action(() => {
    cli.showWelcomeBanner();
  });

// Current weather with template support
program
  .command('now')
  .alias('n')
  .description('Show current weather with active template')
  .option('-t, --template <name>', 'Use specific template')
  .option('-th, --theme <name>', 'Use specific theme')
  .option('-v, --verbose', 'Show detailed system info')
  .action(async (options) => {
    await cli.init();
    
    const template = options.template || cli.config.getCurrentTemplate();
    
    if (options.theme) {
      cli.templates.setTheme(options.theme);
    }
    
    await cli.displayWeatherWithTemplate(template, {
      verbose: options.verbose
    });
  });

// Forecast with template support
program
  .command('forecast')
  .alias('f')
  .description('Show weather forecast with template')
  .option('-d, --days <number>', 'Number of forecast days (1-7)', '5')
  .option('-t, --template <name>', 'Use specific template')
  .option('-th, --theme <name>', 'Use specific theme')
  .action(async (options) => {
    await cli.init();
    
    const template = options.template || cli.config.getCurrentTemplate();
    const days = parseInt(options.days);
    
    if (options.theme) {
      cli.templates.setTheme(options.theme);
    }
    
    await cli.displayWeatherWithTemplate(template, {
      includeForecast: true,
      forecastDays: days
    });
  });

// Template management
program
  .command('templates')
  .alias('tpl')
  .description('Explore and manage templates')
  .option('-l, --list', 'List all available templates')
  .option('-s, --set <name>', 'Set active template')
  .option('-p, --preview <name>', 'Preview a specific template')
  .option('-g, --gallery', 'Show template gallery with previews')
  .action(async (options) => {
    await cli.init();
    
    if (options.list) {
      const templates = cli.templates.getAvailableTemplates();
      console.log(chalk.cyan.bold('📋 TEMPLATE-URI DISPONIBILE:\n'));
      templates.forEach((template, index) => {
        const isActive = template.name === cli.config.getCurrentTemplate();
        const status = isActive ? chalk.green(' ✓') : '';
        console.log(`${index + 1}. ${chalk.yellow(template.name)}${status}`);
        console.log(chalk.gray(`   ${template.description}\n`));
      });
      return;
    }
    
    if (options.set) {
      const success = await cli.config.setTemplate(options.set);
      if (success) {
        console.log(chalk.green(`✅ Template schimbat la: ${options.set}`));
      } else {
        console.log(chalk.red(`❌ Template "${options.set}" nu există`));
      }
      return;
    }
    
    if (options.preview) {
      await cli.previewTemplate(options.preview);
      return;
    }
    
    if (options.gallery) {
      await cli.showTemplateGallery();
      return;
    }
    
    // Default: show current template info
    const currentTemplate = cli.config.getCurrentTemplate();
    console.log(chalk.cyan('🎨 Template activ:'), chalk.yellow(currentTemplate));
    console.log(chalk.gray('Folosește --help pentru mai multe opțiuni'));
  });

// Theme management
program
  .command('theme')
  .alias('th')
  .description('Manage color themes')
  .argument('[theme-name]', 'Set specific theme')
  .option('-l, --list', 'List all available themes')
  .option('-g, --gallery', 'Show theme gallery')
  .action(async (themeName, options) => {
    await cli.init();
    
    if (options.list) {
      const themes = cli.templates.getAvailableThemes();
      console.log(chalk.cyan.bold('🎨 TEME DISPONIBILE:\n'));
      themes.forEach((theme, index) => {
        const isActive = theme.name === cli.config.getCurrentTheme();
        const status = isActive ? chalk.green(' ✓') : '';
        console.log(`${index + 1}. ${chalk.yellow(theme.name)}${status}`);
      });
      return;
    }
    
    if (options.gallery) {
      await cli.showThemeGallery();
      return;
    }
    
    if (themeName) {
      const success = await cli.config.setTheme(themeName);
      if (success) {
        console.log(chalk.green(`✅ Temă schimbată la: ${themeName}`));
        // Show preview with new theme
        cli.templates.setTheme(themeName);
        await cli.previewTemplate(cli.config.getCurrentTemplate(), themeName);
      } else {
        console.log(chalk.red(`❌ Tema "${themeName}" nu există`));
      }
      return;
    }
    
    // Default: show current theme
    const currentTheme = cli.config.getCurrentTheme();
    console.log(chalk.cyan('🎨 Temă activă:'), chalk.yellow(currentTheme));
  });

// Interactive configuration
program
  .command('config')
  .alias('cfg')
  .description('Interactive configuration setup')
  .option('-r, --reset', 'Reset to default settings')
  .option('-s, --show', 'Show current configuration')
  .option('-e, --export <file>', 'Export configuration to file')
  .option('-i, --import <file>', 'Import configuration from file')
  .action(async (options) => {
    await cli.init();
    
    if (options.reset) {
      await cli.config.resetToDefaults();
      return;
    }
    
    if (options.show) {
      cli.config.displayCurrentConfig();
      return;
    }
    
    if (options.export) {
      await cli.config.exportConfig(options.export);
      return;
    }
    
    if (options.import) {
      await cli.config.importConfig(options.import);
      return;
    }
    
    // Default: interactive setup
    await cli.config.interactiveSetup();
  });

// Quick template switching
program
  .command('quick')
  .alias('q')
  .description('Quick template switching')
  .action(async () => {
    await cli.init();
    const newTemplate = await cli.config.quickSwitch();
    
    // Show preview of new template
    console.log('\n' + chalk.cyan('🔍 Preview nou template:'));
    await cli.previewTemplate(newTemplate);
  });

// Preset management
program
  .command('preset')
  .alias('p')
  .description('Manage configuration presets')
  .argument('[preset-name]', 'Apply specific preset')
  .option('-l, --list', 'List available presets')
  .option('-c, --create <name>', 'Create new preset with current settings')
  .action(async (presetName, options) => {
    await cli.init();
    
    if (options.list) {
      const presets = cli.config.getAvailablePresets();
      console.log(chalk.cyan.bold('🎯 PRESET-URI DISPONIBILE:\n'));
      presets.forEach((preset, index) => {
        console.log(`${index + 1}. ${chalk.yellow(preset.name)}`);
        console.log(chalk.gray(`   Template: ${preset.template} | Temă: ${preset.theme}`));
        console.log('');
      });
      return;
    }
    
    if (options.create) {
      const currentTemplate = cli.config.getCurrentTemplate();
      const currentTheme = cli.config.getCurrentTheme();
      const currentSettings = cli.config.getSettings();
      
      await cli.config.createCustomPreset(
        options.create,
        currentTemplate,
        currentTheme,
        currentSettings
      );
      
      console.log(chalk.green(`✅ Preset "${options.create}" creat cu succes!`));
      return;
    }
    
    if (presetName) {
      const success = await cli.config.applyPreset(presetName);
      if (success) {
        console.log(chalk.green(`✅ Preset "${presetName}" aplicat!`));
        
        // Reload settings and show preview
        await cli.init();
        await cli.previewTemplate(cli.config.getCurrentTemplate());
      } else {
        console.log(chalk.red(`❌ Preset "${presetName}" nu există`));
      }
      return;
    }
    
    console.log(chalk.cyan('🎯 Folosește --list pentru a vedea preset-urile disponibile'));
  });

// Demo command - showcase all templates
program
  .command('demo')
  .description('Showcase all templates and themes')
  .option('-t, --templates', 'Demo all templates')
  .option('-th, --themes', 'Demo all themes')
  .action(async (options) => {
    await cli.init();
    
    if (options.templates) {
      const templates = cli.templates.getAvailableTemplates();
      
      for (const template of templates) {
        console.log(chalk.cyan.bold(`\n🎨 DEMO: ${template.name.toUpperCase()}`));
        console.log(chalk.gray(template.description));
        console.log(chalk.gray('─'.repeat(60)));
        await cli.previewTemplate(template.name);
        console.log('\n' + '═'.repeat(80));
      }
      return;
    }
    
    if (options.themes) {
      const themes = cli.templates.getAvailableThemes();
      const currentTemplate = cli.config.getCurrentTemplate();
      
      for (const theme of themes) {
        console.log(chalk.cyan.bold(`\n🎨 DEMO TEMĂ: ${theme.name.toUpperCase()}`));
        console.log(chalk.gray('─'.repeat(60)));
        await cli.previewTemplate(currentTemplate, theme.name);
        console.log('\n' + '═'.repeat(80));
      }
      return;
    }
    
    // Default demo - show welcome and current template
    cli.showWelcomeBanner();
    console.log('\n' + chalk.cyan.bold('🎨 DEMO TEMPLATE CURENT:'));
    await cli.displayWeatherWithTemplate(cli.config.getCurrentTemplate());
  });

// Export command
program
  .command('export')
  .description('Export weather data')
  .option('-f, --format <format>', 'Export format (json|csv)', 'json')
  .option('-o, --output <file>', 'Output file (optional)')
  .action(async (options) => {
    await cli.init();
    await cli.app.exportData(options.format, options.output);
  });

// System info
program
  .command('info')
  .alias('i')
  .description('Show system information and stats')
  .action(async () => {
    await cli.init();
    await cli.app.showSystemInfo();
    cli.config.displayCurrentConfig();
  });

// Error handling
program.on('command:*', (operands) => {
  console.error(chalk.red(`❌ Comandă necunoscută: ${operands[0]}`));
  console.log(chalk.yellow('💡 Folosește --help pentru comenzile disponibile'));
  process.exitCode = 1;
});

// Global error handler
process.on('uncaughtException', (error) => {
  console.error(chalk.red('❌ Eroare critică:'), error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('❌ Promise rejection:'), reason);
  process.exit(1);
});

// Parse CLI arguments
program.parse();

// Show help if no command provided
if (process.argv.length === 2) {
  program.help();
}

export { WeatherCLI };