import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import chalk from 'chalk';
import inquirer from 'inquirer';

/**
 * Template Configuration Manager v3.0
 * Advanced template and theme management system
 */
export class TemplateConfig {
  constructor() {
    this.configDir = path.join(os.homedir(), '.bucharest-weather-cli');
    this.configFile = path.join(this.configDir, 'template-config.json');
    this.customTemplatesDir = path.join(this.configDir, 'custom-templates');
    
    this.defaultConfig = {
      currentTemplate: 'classic',
      currentTheme: 'default',
      customSettings: {
        showTimestamp: true,
        showCache: false,
        animationsEnabled: true,
        compactMode: false,
        language: 'ro',
        units: 'metric',
        timezone: 'Europe/Bucharest',
        updateInterval: 300,
        notificationsEnabled: true,
        soundEffects: false
      },
      templates: {
        classic: {
          enabled: true,
          customizations: {
            borderStyle: 'double',
            padding: 1,
            margin: 1,
            showHeader: true,
            showFooter: true,
            colorOverrides: {}
          }
        },
        modern: {
          enabled: true,
          customizations: {
            cardWidth: 25,
            cardSpacing: 2,
            showShadows: true,
            roundedCorners: true
          }
        },
        dashboard: {
          enabled: true,
          customizations: {
            showSystemInfo: true,
            showForecastTable: true,
            maxForecastDays: 5,
            refreshRate: 'real-time'
          }
        },
        minimal: {
          enabled: true,
          customizations: {
            showOnlyEssentials: true,
            useEmojis: false,
            compactLayout: true
          }
        }
      },
      themes: {
        default: { enabled: true },
        dark: { enabled: true },
        ocean: { enabled: true },
        forest: { enabled: true },
        sunset: { enabled: true },
        cyberpunk: { enabled: true },
        minimal: { enabled: true },
        rainbow: { enabled: true }
      },
      presets: {
        developer: {
          template: 'dashboard',
          theme: 'cyberpunk',
          settings: {
            showCache: true,
            animationsEnabled: false,
            compactMode: true
          }
        },
        casual: {
          template: 'modern',
          theme: 'default',
          settings: {
            showTimestamp: false,
            animationsEnabled: true,
            soundEffects: true
          }
        },
        minimal_user: {
          template: 'minimal',
          theme: 'minimal',
          settings: {
            compactMode: true,
            showOnlyEssentials: true
          }
        },
        artistic: {
          template: 'ascii',
          theme: 'rainbow',
          settings: {
            animationsEnabled: true,
            soundEffects: true
          }
        }
      }
    };
    
    this.config = { ...this.defaultConfig };
  }

  async init() {
    try {
      // Create config directory if it doesn't exist
      await fs.mkdir(this.configDir, { recursive: true });
      await fs.mkdir(this.customTemplatesDir, { recursive: true });
      
      // Load existing config or create default
      await this.loadConfig();
      
      return true;
    } catch (error) {
      console.error('Failed to initialize template config:', error.message);
      return false;
    }
  }

  async loadConfig() {
    try {
      const configData = await fs.readFile(this.configFile, 'utf8');
      const loadedConfig = JSON.parse(configData);
      
      // Merge with defaults to ensure all keys exist
      this.config = this.mergeConfigs(this.defaultConfig, loadedConfig);
      
      return this.config;
    } catch (error) {
      // Config doesn't exist, use defaults
      await this.saveConfig();
      return this.config;
    }
  }

  async saveConfig() {
    try {
      const configJson = JSON.stringify(this.config, null, 2);
      await fs.writeFile(this.configFile, configJson, 'utf8');
      return true;
    } catch (error) {
      console.error('Failed to save config:', error.message);
      return false;
    }
  }

  mergeConfigs(defaultConfig, userConfig) {
    const merged = { ...defaultConfig };
    
    for (const key in userConfig) {
      if (typeof userConfig[key] === 'object' && !Array.isArray(userConfig[key])) {
        merged[key] = { ...merged[key], ...userConfig[key] };
      } else {
        merged[key] = userConfig[key];
      }
    }
    
    return merged;
  }

  // Template management
  getCurrentTemplate() {
    return this.config.currentTemplate;
  }

  async setTemplate(templateName) {
    if (this.config.templates[templateName]?.enabled) {
      this.config.currentTemplate = templateName;
      await this.saveConfig();
      return true;
    }
    return false;
  }

  getTemplateCustomizations(templateName) {
    return this.config.templates[templateName]?.customizations || {};
  }

  async setTemplateCustomizations(templateName, customizations) {
    if (this.config.templates[templateName]) {
      this.config.templates[templateName].customizations = {
        ...this.config.templates[templateName].customizations,
        ...customizations
      };
      await this.saveConfig();
      return true;
    }
    return false;
  }

  // Theme management
  getCurrentTheme() {
    return this.config.currentTheme;
  }

  async setTheme(themeName) {
    if (this.config.themes[themeName]?.enabled) {
      this.config.currentTheme = themeName;
      await this.saveConfig();
      return true;
    }
    return false;
  }

  // Settings management
  getSettings() {
    return this.config.customSettings;
  }

  async updateSettings(settings) {
    this.config.customSettings = {
      ...this.config.customSettings,
      ...settings
    };
    await this.saveConfig();
    return this.config.customSettings;
  }

  // Preset management
  async applyPreset(presetName) {
    const preset = this.config.presets[presetName];
    if (!preset) return false;
    
    this.config.currentTemplate = preset.template;
    this.config.currentTheme = preset.theme;
    this.config.customSettings = {
      ...this.config.customSettings,
      ...preset.settings
    };
    
    await this.saveConfig();
    return true;
  }

  getAvailablePresets() {
    return Object.keys(this.config.presets).map(name => ({
      name,
      ...this.config.presets[name]
    }));
  }

  async createCustomPreset(name, template, theme, settings) {
    this.config.presets[name] = {
      template,
      theme,
      settings
    };
    await this.saveConfig();
    return true;
  }

  // Interactive configuration
  async interactiveSetup() {
    console.log(chalk.cyan('🎨 Configurare Template-uri & Teme CLI'));
    console.log(chalk.gray('Personalizează experiența ta CLI\n'));
    
    const questions = [
      {
        type: 'list',
        name: 'template',
        message: 'Alege template-ul preferat:',
        choices: [
          { name: '🏛️  Classic Professional - Design elegant cu boxe', value: 'classic' },
          { name: '💎  Modern Cards - Layout cu carduri moderne', value: 'modern' },
          { name: '📊  Terminal Dashboard - Dashboard complet cu tabele', value: 'dashboard' },
          { name: '⚡  Minimal Clean - Design minimalist rapid', value: 'minimal' },
          { name: '🎨  ASCII Art - Ilustrații artistic în terminal', value: 'ascii' },
          { name: '👾  Retro Terminal - Stil vintage anii 80-90', value: 'retro' },
          { name: '🗺️  Weather Map - Hartă vizuală București', value: 'map' },
          { name: '📱  Mobile Style - Design inspirat mobile', value: 'mobile' },
          { name: '🔢  Matrix Code - Efecte Matrix digitale', value: 'matrix' },
          { name: '📏  Gauge Meters - Indicatori vizuali gauge', value: 'gauge' }
        ],
        default: this.config.currentTemplate
      },
      {
        type: 'list',
        name: 'theme',
        message: 'Alege tema de culori:',
        choices: [
          { name: '🔵  Default - Albastru/Cyan clasic', value: 'default' },
          { name: '⚫  Dark - Tema întunecată minimă', value: 'dark' },
          { name: '🌊  Ocean - Nuanțe de albastru ocean', value: 'ocean' },
          { name: '🌲  Forest - Verde natural pădure', value: 'forest' },
          { name: '🌅  Sunset - Portocaliu/Roșu apus', value: 'sunset' },
          { name: '💜  Cyberpunk - Magenta/Cyan futurist', value: 'cyberpunk' },
          { name: '⚪  Minimal - Doar alb/gri simplu', value: 'minimal' },
          { name: '🌈  Rainbow - Culori multicolore', value: 'rainbow' }
        ],
        default: this.config.currentTheme
      },
      {
        type: 'confirm',
        name: 'showTimestamp',
        message: 'Afișează timestamp-ul?',
        default: this.config.customSettings.showTimestamp
      },
      {
        type: 'confirm',
        name: 'animationsEnabled',
        message: 'Activează animațiile și efectele?',
        default: this.config.customSettings.animationsEnabled
      },
      {
        type: 'confirm',
        name: 'compactMode',
        message: 'Modul compact (mai puține detalii)?',
        default: this.config.customSettings.compactMode
      },
      {
        type: 'list',
        name: 'language',
        message: 'Limbă preferată:',
        choices: [
          { name: '🇷🇴  Română', value: 'ro' },
          { name: '🇺🇸  English', value: 'en' },
          { name: '🇪🇸  Español', value: 'es' },
          { name: '🇫🇷  Français', value: 'fr' }
        ],
        default: this.config.customSettings.language
      },
      {
        type: 'input',
        name: 'updateInterval',
        message: 'Interval actualizare cache (secunde):',
        default: this.config.customSettings.updateInterval,
        validate: (input) => {
          const num = parseInt(input);
          return num >= 60 && num <= 3600 ? true : 'Introdu o valoare între 60 și 3600';
        }
      }
    ];
    
    const answers = await inquirer.prompt(questions);
    
    // Apply settings
    this.config.currentTemplate = answers.template;
    this.config.currentTheme = answers.theme;
    this.config.customSettings.showTimestamp = answers.showTimestamp;
    this.config.customSettings.animationsEnabled = answers.animationsEnabled;
    this.config.customSettings.compactMode = answers.compactMode;
    this.config.customSettings.language = answers.language;
    this.config.customSettings.updateInterval = parseInt(answers.updateInterval);
    
    await this.saveConfig();
    
    console.log('\n' + chalk.green('✅ Configurația a fost salvată cu succes!'));
    console.log(chalk.cyan(`📋 Template: ${answers.template}`));
    console.log(chalk.cyan(`🎨 Temă: ${answers.theme}`));
    console.log(chalk.gray(`💾 Salvat în: ${this.configFile}\n`));
    
    return this.config;
  }

  // Advanced template customization
  async customizeTemplate(templateName) {
    const template = this.config.templates[templateName];
    if (!template) {
      console.log(chalk.red(`❌ Template "${templateName}" nu există`));
      return false;
    }
    
    console.log(chalk.cyan(`🎨 Personalizare Template: ${templateName}`));
    
    const questions = [];
    
    // Template-specific customizations
    switch (templateName) {
      case 'classic':
        questions.push(
          {
            type: 'list',
            name: 'borderStyle',
            message: 'Stil bordură:',
            choices: ['single', 'double', 'round', 'bold', 'singleDouble', 'doubleSingle', 'classic'],
            default: template.customizations.borderStyle
          },
          {
            type: 'input',
            name: 'padding',
            message: 'Padding intern (0-5):',
            default: template.customizations.padding,
            validate: (input) => parseInt(input) >= 0 && parseInt(input) <= 5
          }
        );
        break;
        
      case 'modern':
        questions.push(
          {
            type: 'input',
            name: 'cardWidth',
            message: 'Lățime carduri (15-40):',
            default: template.customizations.cardWidth,
            validate: (input) => parseInt(input) >= 15 && parseInt(input) <= 40
          },
          {
            type: 'confirm',
            name: 'showShadows',
            message: 'Afișează umbre pentru carduri?',
            default: template.customizations.showShadows
          }
        );
        break;
        
      case 'dashboard':
        questions.push(
          {
            type: 'confirm',
            name: 'showSystemInfo',
            message: 'Afișează info sistem?',
            default: template.customizations.showSystemInfo
          },
          {
            type: 'input',
            name: 'maxForecastDays',
            message: 'Zile prognoză maximă (1-10):',
            default: template.customizations.maxForecastDays,
            validate: (input) => parseInt(input) >= 1 && parseInt(input) <= 10
          }
        );
        break;
    }
    
    if (questions.length > 0) {
      const answers = await inquirer.prompt(questions);
      
      this.config.templates[templateName].customizations = {
        ...template.customizations,
        ...answers
      };
      
      await this.saveConfig();
      console.log(chalk.green(`✅ Template "${templateName}" personalizat cu succes!`));
    }
    
    return true;
  }

  // Export/Import configurations
  async exportConfig(filePath) {
    try {
      const configJson = JSON.stringify(this.config, null, 2);
      await fs.writeFile(filePath, configJson, 'utf8');
      console.log(chalk.green(`✅ Configurația a fost exportată în: ${filePath}`));
      return true;
    } catch (error) {
      console.log(chalk.red(`❌ Eroare la export: ${error.message}`));
      return false;
    }
  }

  async importConfig(filePath) {
    try {
      const configData = await fs.readFile(filePath, 'utf8');
      const importedConfig = JSON.parse(configData);
      
      this.config = this.mergeConfigs(this.defaultConfig, importedConfig);
      await this.saveConfig();
      
      console.log(chalk.green(`✅ Configurația a fost importată din: ${filePath}`));
      return true;
    } catch (error) {
      console.log(chalk.red(`❌ Eroare la import: ${error.message}`));
      return false;
    }
  }

  // Reset to defaults
  async resetToDefaults() {
    const confirm = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'reset',
        message: 'Ești sigur că vrei să resetezi toate setările?',
        default: false
      }
    ]);
    
    if (confirm.reset) {
      this.config = { ...this.defaultConfig };
      await this.saveConfig();
      console.log(chalk.green('✅ Configurația a fost resetată la valorile default'));
      return true;
    }
    
    return false;
  }

  // Get template preview
  getTemplatePreview(templateName) {
    const previews = {
      classic: `${chalk.blue('╭───────────────────────────╮')}
${chalk.blue('│')} ${chalk.yellow('🌤️  VREMEA ACUM ÎN BUCUREȘTI')} ${chalk.blue('│')}
${chalk.blue('│')} ${chalk.cyan('22°C (simte ca 24°C)')}      ${chalk.blue('│')}
${chalk.blue('│')} ${chalk.green('parțial înnorat ⛅')}         ${chalk.blue('│')}
${chalk.blue('╰───────────────────────────╯')}`,
      
      modern: `${chalk.blue('┌─────────────┐')}  ${chalk.cyan('┌─────────────┐')}  ${chalk.yellow('┌─────────────┐')}
${chalk.blue('│')} ${chalk.white('🌡️ 22°C')}     ${chalk.blue('│')}  ${chalk.cyan('│')} ${chalk.white('💨 3m/s')}     ${chalk.cyan('│')}  ${chalk.yellow('│')} ${chalk.white('🤖 AI TIPS')}  ${chalk.yellow('│')}
${chalk.blue('│')} ${chalk.gray('parțial')}    ${chalk.blue('│')}  ${chalk.cyan('│')} ${chalk.white('65% humi')}   ${chalk.cyan('│')}  ${chalk.yellow('│')} ${chalk.green('jachetă +')}  ${chalk.yellow('│')}
${chalk.blue('│')} ${chalk.gray('înnorat')}    ${chalk.blue('│')}  ${chalk.cyan('│')} ${chalk.white('1013 hPa')}   ${chalk.cyan('│')}  ${chalk.yellow('│')} ${chalk.green('cămașă')}    ${chalk.yellow('│')}
${chalk.blue('└─────────────┘')}  ${chalk.cyan('└─────────────┘')}  ${chalk.yellow('└─────────────┘')}`,
      
      minimal: `${chalk.white('bucuresti 22°c')}
${chalk.gray('parțial înnorat')}
${chalk.gray('simte ca 24°c')}
${chalk.white('jachetă subțire + cămașă')}`,
      
      dashboard: `${chalk.cyan('▓▓▓ BUCHAREST WEATHER DASHBOARD ▓▓▓')}
${chalk.yellow('[CURRENT] 22°C parțial înnorat | [WIND] 3m/s NE | [HUMIDITY] 65%')}
${chalk.gray('─'.repeat(60))}
${chalk.blue('║ DAY    ║ MIN ║ MAX ║ DESC     ║ WIND  ║')}
${chalk.blue('║ TODAY  ║ 18° ║ 25° ║ înnorat  ║ 3m/s  ║')}
${chalk.green('[AI-INSIGHTS] >>> jachetă subțire recomandat')}`
    };
    
    return previews[templateName] || 'Preview indisponibil pentru acest template.';
  }

  // Display current configuration
  displayCurrentConfig() {
    console.log(chalk.cyan.bold('📋 CONFIGURAȚIA CURENTĂ'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(chalk.yellow('Template:'), chalk.white(this.config.currentTemplate));
    console.log(chalk.yellow('Temă:'), chalk.white(this.config.currentTheme));
    console.log();
    
    console.log(chalk.cyan('⚙️  Setări:'));
    Object.entries(this.config.customSettings).forEach(([key, value]) => {
      console.log(chalk.gray(`  ${key}:`), chalk.white(value));
    });
    
    console.log();
    console.log(chalk.gray(`📁 Locație config: ${this.configFile}`));
  }

  // Quick template switching
  async quickSwitch() {
    const templates = [
      'classic', 'modern', 'dashboard', 'minimal', 
      'ascii', 'retro', 'map', 'mobile', 'matrix', 'gauge'
    ];
    
    const { template } = await inquirer.prompt([
      {
        type: 'list',
        name: 'template',
        message: '🚀 Quick Switch - Alege template:',
        choices: templates.map(t => ({
          name: `${t === this.config.currentTemplate ? '✓ ' : '  '}${t}`,
          value: t
        })),
        pageSize: 10
      }
    ]);
    
    await this.setTemplate(template);
    console.log(chalk.green(`✅ Commutat la template: ${template}`));
    
    return template;
  }
}