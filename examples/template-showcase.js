#!/usr/bin/env node

import { WeatherTemplates } from '../src/templates/weather-templates.js';
import { TemplateConfig } from '../src/templates/template-config.js';
import chalk from 'chalk';
import ora from 'ora';

/**
 * Template Showcase - Demo all visual styles
 * Demonstrează toate template-urile și temele disponibile
 */

class TemplateShowcase {
  constructor() {
    this.templates = new WeatherTemplates();
    this.config = new TemplateConfig();
    
    // Mock weather data for demo
    this.mockWeatherData = {
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
      sunset: '19:30',
      rain_1h: 0,
      rain_3h: 0,
      snow_1h: 0,
      snow_3h: 0,
      temp_min: 18,
      temp_max: 25
    };
    
    this.mockInsights = {
      clothing: 'Cămașă subțire + jachetă ușoară pentru confort optim',
      activities: '🚴 Ideal pentru cycling în Herăstrău sau plimbări în Centrul Vechi',
      locations: 'Herăstrău, Centrul Vechi, Calea Victoriei, Parcul Cișmigiu',
      health: 'Condiții bune pentru activități outdoor, risc scăzut alergii',
      alerts: [
        { level: 'info', message: 'Temperaturi plăcute pentru activități exterior' },
        { level: 'warning', message: 'Posibile schimbări de vreme seara' }
      ]
    };
    
    this.mockForecast = [
      {
        date: '2025-09-26',
        dayName: 'Vineri',
        temp_min: 18,
        temp_max: 25,
        temp_avg: 21.5,
        description: 'parțial înnorat',
        humidity_avg: 65,
        wind_speed_avg: 3.2,
        precipitation_total: 0
      },
      {
        date: '2025-09-27',
        dayName: 'Sâmbătă',
        temp_min: 16,
        temp_max: 23,
        temp_avg: 19.5,
        description: 'ploaie ușoară',
        humidity_avg: 75,
        wind_speed_avg: 4.1,
        precipitation_total: 2.3
      },
      {
        date: '2025-09-28',
        dayName: 'Duminică',
        temp_min: 14,
        temp_max: 20,
        temp_avg: 17,
        description: 'înnorat',
        humidity_avg: 70,
        wind_speed_avg: 2.8,
        precipitation_total: 0
      }
    ];
  }

  async init() {
    await this.config.init();
  }

  async showcaseAllTemplates() {
    console.log(chalk.cyan.bold('🎨 SHOWCASE TOATE TEMPLATE-URILE\n'));
    console.log(chalk.gray('='.repeat(80)));
    
    const templates = this.templates.getAvailableTemplates();
    
    for (const template of templates) {
      console.log('\n' + chalk.yellow.bold(`📋 TEMPLATE: ${template.name.toUpperCase()}`));
      console.log(chalk.gray(template.description));
      console.log(chalk.gray('-'.repeat(60)));
      
      const spinner = ora(`Rendering ${template.name}...`).start();
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing
      
      try {
        const output = this.templates.renderTemplate(
          template.name,
          this.mockWeatherData,
          template.name === 'dashboard' ? this.mockForecast : null,
          this.mockInsights
        );
        
        spinner.succeed(`Template ${template.name} rendered successfully`);
        console.log(output);
        
      } catch (error) {
        spinner.fail(`Error rendering ${template.name}`);
        console.error(chalk.red(`❌ Error: ${error.message}`));
      }
      
      console.log('\n' + chalk.gray('═'.repeat(80)));
    }
  }

  async showcaseAllThemes() {
    console.log(chalk.cyan.bold('🌈 SHOWCASE TOATE TEMELE\n'));
    console.log(chalk.gray('='.repeat(80)));
    
    const themes = this.templates.getAvailableThemes();
    const templateToUse = 'modern'; // Use modern template for theme showcase
    
    for (const theme of themes) {
      console.log('\n' + chalk.yellow.bold(`🎨 TEMĂ: ${theme.name.toUpperCase()}`));
      console.log(chalk.gray(`Primary: ${theme.colors.primary} | Secondary: ${theme.colors.secondary} | Accent: ${theme.colors.accent}`));
      console.log(chalk.gray('-'.repeat(60)));
      
      const spinner = ora(`Applying theme ${theme.name}...`).start();
      await new Promise(resolve => setTimeout(resolve, 300));
      
      try {
        this.templates.setTheme(theme.name);
        
        const output = this.templates.renderTemplate(
          templateToUse,
          this.mockWeatherData,
          null,
          this.mockInsights
        );
        
        spinner.succeed(`Theme ${theme.name} applied successfully`);
        console.log(output);
        
      } catch (error) {
        spinner.fail(`Error applying theme ${theme.name}`);
        console.error(chalk.red(`❌ Error: ${error.message}`));
      }
      
      console.log('\n' + chalk.gray('═'.repeat(80)));
    }
  }

  async showcaseTemplateThemeCombinations() {
    console.log(chalk.cyan.bold('🎭 SHOWCASE COMBINAȚII TEMPLATE + TEMĂ\n'));
    console.log(chalk.gray('='.repeat(80)));
    
    const combinations = [
      { template: 'classic', theme: 'ocean', desc: 'Professional cu nuanțe de ocean' },
      { template: 'modern', theme: 'cyberpunk', desc: 'Carduri moderne cu cyberpunk' },
      { template: 'dashboard', theme: 'forest', desc: 'Dashboard cu verde natural' },
      { template: 'minimal', theme: 'minimal', desc: 'Ultra-minimal monochrome' },
      { template: 'ascii', theme: 'rainbow', desc: 'ASCII art multicolor' },
      { template: 'retro', theme: 'sunset', desc: 'Retro cu culori de apus' },
      { template: 'matrix', theme: 'cyberpunk', desc: 'Matrix cu efecte futuriste' },
      { template: 'gauge', theme: 'dark', desc: 'Gauge meters în temă întunecată' }
    ];
    
    for (const combo of combinations) {
      console.log('\n' + chalk.yellow.bold(`💫 ${combo.template.toUpperCase()} + ${combo.theme.toUpperCase()}`));
      console.log(chalk.gray(combo.desc));
      console.log(chalk.gray('-'.repeat(60)));
      
      const spinner = ora(`Rendering ${combo.template} with ${combo.theme}...`).start();
      await new Promise(resolve => setTimeout(resolve, 400));
      
      try {
        this.templates.setTheme(combo.theme);
        
        const output = this.templates.renderTemplate(
          combo.template,
          this.mockWeatherData,
          combo.template === 'dashboard' ? this.mockForecast : null,
          this.mockInsights
        );
        
        spinner.succeed(`Combination rendered successfully`);
        console.log(output);
        
      } catch (error) {
        spinner.fail(`Error rendering combination`);
        console.error(chalk.red(`❌ Error: ${error.message}`));
      }
      
      console.log('\n' + chalk.gray('═'.repeat(80)));
    }
  }

  async interactiveShowcase() {
    const inquirer = (await import('inquirer')).default;
    
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: '🎨 Ce vrei să vezi?',
        choices: [
          { name: '📋 Toate Template-urile (10+)', value: 'templates' },
          { name: '🌈 Toate Temele (8)', value: 'themes' },
          { name: '💫 Combinații Template+Temă', value: 'combinations' },
          { name: '🎯 Template Specific', value: 'specific' },
          { name: '🚀 Quick Demo', value: 'quick' },
          { name: '🔧 Test Performance', value: 'performance' }
        ]
      }
    ]);
    
    switch (action) {
      case 'templates':
        await this.showcaseAllTemplates();
        break;
      case 'themes':
        await this.showcaseAllThemes();
        break;
      case 'combinations':
        await this.showcaseTemplateThemeCombinations();
        break;
      case 'specific':
        await this.showcaseSpecificTemplate();
        break;
      case 'quick':
        await this.quickDemo();
        break;
      case 'performance':
        await this.performanceTest();
        break;
    }
  }

  async showcaseSpecificTemplate() {
    const inquirer = (await import('inquirer')).default;
    
    const templates = this.templates.getAvailableTemplates();
    const themes = this.templates.getAvailableThemes();
    
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'template',
        message: 'Alege template-ul:',
        choices: templates.map(t => ({ name: `${t.name} - ${t.description}`, value: t.name }))
      },
      {
        type: 'list',
        name: 'theme',
        message: 'Alege tema:',
        choices: themes.map(t => ({ name: t.name, value: t.name }))
      }
    ]);
    
    console.log('\n' + chalk.cyan.bold(`🎨 DEMO: ${answers.template} cu tema ${answers.theme}`));
    console.log(chalk.gray('-'.repeat(60)));
    
    this.templates.setTheme(answers.theme);
    const output = this.templates.renderTemplate(
      answers.template,
      this.mockWeatherData,
      answers.template === 'dashboard' ? this.mockForecast : null,
      this.mockInsights
    );
    
    console.log(output);
  }

  async quickDemo() {
    console.log(chalk.cyan.bold('🚀 QUICK DEMO - Best Templates\n'));
    
    const bestCombinations = [
      { template: 'modern', theme: 'ocean', name: '💎 Modern Ocean' },
      { template: 'dashboard', theme: 'cyberpunk', name: '🤖 Cyberpunk Dashboard' },
      { template: 'ascii', theme: 'rainbow', name: '🎨 Rainbow ASCII Art' }
    ];
    
    for (const combo of bestCombinations) {
      console.log(chalk.yellow.bold(`${combo.name}`));
      console.log(chalk.gray('-'.repeat(40)));
      
      this.templates.setTheme(combo.theme);
      const output = this.templates.renderTemplate(
        combo.template,
        this.mockWeatherData,
        combo.template === 'dashboard' ? this.mockForecast.slice(0, 3) : null,
        this.mockInsights
      );
      
      console.log(output);
      console.log('\n');
    }
  }

  async performanceTest() {
    console.log(chalk.cyan.bold('⚡ PERFORMANCE TEST\n'));
    
    const templates = this.templates.getAvailableTemplates();
    const results = [];
    
    for (const template of templates) {
      const startTime = performance.now();
      
      try {
        this.templates.renderTemplate(
          template.name,
          this.mockWeatherData,
          template.name === 'dashboard' ? this.mockForecast : null,
          this.mockInsights
        );
        
        const endTime = performance.now();
        const duration = (endTime - startTime).toFixed(2);
        
        results.push({
          template: template.name,
          time: duration,
          status: 'success'
        });
        
        console.log(chalk.green(`✓ ${template.name.padEnd(12)} - ${duration}ms`));
        
      } catch (error) {
        results.push({
          template: template.name,
          time: 'error',
          status: 'failed',
          error: error.message
        });
        
        console.log(chalk.red(`✗ ${template.name.padEnd(12)} - ERROR`));
      }
    }
    
    console.log('\n' + chalk.cyan.bold('📊 PERFORMANCE SUMMARY'));
    console.log(chalk.gray('-'.repeat(40)));
    
    const successfulRenders = results.filter(r => r.status === 'success');
    const totalTime = successfulRenders.reduce((sum, r) => sum + parseFloat(r.time), 0);
    const avgTime = (totalTime / successfulRenders.length).toFixed(2);
    
    console.log(chalk.yellow(`Templates testede: ${results.length}`));
    console.log(chalk.green(`Succese: ${successfulRenders.length}`));
    console.log(chalk.red(`Erori: ${results.filter(r => r.status === 'failed').length}`));
    console.log(chalk.cyan(`Timp mediu: ${avgTime}ms`));
    console.log(chalk.cyan(`Timp total: ${totalTime.toFixed(2)}ms`));
    
    // Find fastest and slowest
    if (successfulRenders.length > 0) {
      const fastest = successfulRenders.reduce((min, r) => parseFloat(r.time) < parseFloat(min.time) ? r : min);
      const slowest = successfulRenders.reduce((max, r) => parseFloat(r.time) > parseFloat(max.time) ? r : max);
      
      console.log('\n' + chalk.green(`🏆 Cel mai rapid: ${fastest.template} (${fastest.time}ms)`));
      console.log(chalk.orange(`🐌 Cel mai lent: ${slowest.template} (${slowest.time}ms)`));
    }
  }

  showUsageExamples() {
    console.log(chalk.cyan.bold('📚 EXEMPLE DE UTILIZARE\n'));
    
    const examples = [
      {
        title: '🏢 Pentru Dezvoltatori',
        commands: [
          'bw preset developer    # Dashboard + Cyberpunk + verbose info',
          'bw now --verbose       # Vezi cache și performance',
          'bw info               # System info complet'
        ]
      },
      {
        title: '🏠 Pentru Utilizatori Casnici',
        commands: [
          'bw preset casual       # Modern cards cu animații',
          'bw forecast --days 3   # Prognoza pentru weekend',
          'bw theme ocean        # Tema relaxantă ocean'
        ]
      },
      {
        title: '⚡ Pentru Terminale Rapide',
        commands: [
          'bw preset minimal_user # Output minimal și rapid',
          'bw now                # Informație esențială',
          'bw theme minimal      # Fără culori complexe'
        ]
      },
      {
        title: '🎨 Pentru Fun și Creativitate',
        commands: [
          'bw preset artistic    # ASCII art + rainbow',
          'bw template matrix    # Efecte Matrix',
          'bw template ascii --theme rainbow # Arte colorate'
        ]
      }
    ];
    
    examples.forEach(example => {
      console.log(chalk.yellow.bold(example.title));
      example.commands.forEach(cmd => {
        console.log(chalk.gray('  $ ') + chalk.white(cmd));
      });
      console.log();
    });
  }

  async demonstrateConfiguration() {
    console.log(chalk.cyan.bold('⚙️ DEMO CONFIGURARE\n'));
    
    // Show how to use configuration system
    console.log(chalk.yellow('1. Setup Inițial:'));
    console.log(chalk.gray('   bw config                    # GUI interactiv'));
    console.log(chalk.gray('   bw templates --gallery       # Vezi toate opțiunile'));
    console.log();
    
    console.log(chalk.yellow('2. Quick Actions:'));
    console.log(chalk.gray('   bw quick                     # Switch rapid template'));
    console.log(chalk.gray('   bw theme cyberpunk           # Schimbă tema'));
    console.log(chalk.gray('   bw preset developer          # Preset pentru dev'));
    console.log();
    
    console.log(chalk.yellow('3. Advanced:'));
    console.log(chalk.gray('   bw config --export conf.json # Backup setări'));
    console.log(chalk.gray('   bw config --import conf.json # Restore setări'));
    console.log(chalk.gray('   bw config --reset            # Reset la default'));
    console.log();
    
    // Show current config
    try {
      await this.config.loadConfig();
      console.log(chalk.cyan('📋 Configurația Curentă:'));
      console.log(chalk.gray(`   Template: ${this.config.getCurrentTemplate()}`));
      console.log(chalk.gray(`   Temă: ${this.config.getCurrentTheme()}`));
      console.log(chalk.gray(`   Locație config: ~/.bucharest-weather-cli/`));
    } catch (error) {
      console.log(chalk.red('❌ Nu s-a putut încărca configurația'));
    }
  }

  showBestPractices() {
    console.log(chalk.cyan.bold('💡 BEST PRACTICES & TIPS\n'));
    
    const tips = [
      {
        category: '🎯 Alegerea Template-ului',
        tips: [
          'classic - Pentru prezentări profesionale',
          'modern - Pentru utilizare zilnică modernă',
          'dashboard - Pentru analiza detaliată',
          'minimal - Pentru scripturi și automation',
          'ascii - Pentru terminale creative'
        ]
      },
      {
        category: '🌈 Alegerea Temei',
        tips: [
          'default - Sigur pentru orice terminal',
          'ocean - Relaxant pentru utilizare lungă',
          'cyberpunk - Energizant pentru coding sessions',
          'minimal - Pentru terminale cu limitări de culori'
        ]
      },
      {
        category: '⚡ Performance',
        tips: [
          'Folosește cache pentru API calls frecvente',
          'minimal template pentru scripturi rapide',
          'Dezactivează animațiile pentru automation',
          'Folosește --verbose doar când debuggezi'
        ]
      },
      {
        category: '🔧 Personalizare',
        tips: [
          'Creează preset-uri pentru diferite contexte',
          'Exportă configurațiile pentru backup',
          'Testează template-uri cu bw demo',
          'Contribuie cu template-uri noi pe GitHub'
        ]
      }
    ];
    
    tips.forEach(category => {
      console.log(chalk.yellow.bold(category.category));
      category.tips.forEach(tip => {
        console.log(chalk.gray(`  • ${tip}`));
      });
      console.log();
    });
  }
}

// CLI pentru showcase
if (import.meta.url === `file://${process.argv[1]}`) {
  const showcase = new TemplateShowcase();
  await showcase.init();
  
  const args = process.argv.slice(2);
  
  if (args.includes('--templates')) {
    await showcase.showcaseAllTemplates();
  } else if (args.includes('--themes')) {
    await showcase.showcaseAllThemes();
  } else if (args.includes('--combinations')) {
    await showcase.showcaseTemplateThemeCombinations();
  } else if (args.includes('--config')) {
    await showcase.demonstrateConfiguration();
  } else if (args.includes('--tips')) {
    showcase.showBestPractices();
  } else if (args.includes('--usage')) {
    showcase.showUsageExamples();
  } else if (args.includes('--interactive')) {
    await showcase.interactiveShowcase();
  } else {
    // Default: show everything
    console.log(chalk.magenta.bold('🎨 BUCHAREST WEATHER CLI - TEMPLATE SHOWCASE COMPLET\n'));
    showcase.showUsageExamples();
    await showcase.quickDemo();
    showcase.showBestPractices();
    
    console.log('\n' + chalk.cyan('🎯 Pentru showcase complet:'));
    console.log(chalk.gray('   node examples/template-showcase.js --interactive'));
    console.log(chalk.gray('   node examples/template-showcase.js --templates'));
    console.log(chalk.gray('   node examples/template-showcase.js --themes'));
  }
}

export { TemplateShowcase };