#!/usr/bin/env node

import { Command } from 'commander';
import { BucharestWeatherApp } from './index.js';
import chalk from 'chalk';
import ora from 'ora';

const program = new Command();
const app = new BucharestWeatherApp();

program
  .name('bucharest-weather')
  .alias('bw')
  .description('🌤️ CLI tool pentru vremea din București')
  .version('1.0.0');

// Current weather command
program
  .command('now')
  .alias('current')
  .description('Vremea actuală în București')
  .action(async () => {
    const spinner = ora('Obțin datele meteo...').start();
    try {
      await app.showBanner();
      spinner.stop();
      await app.getCurrentWeather();
    } catch (error) {
      spinner.fail('Eroare la obținerea datelor');
      console.error(chalk.red(error.message));
    }
  });

// Forecast command
program
  .command('forecast')
  .alias('f')
  .description('Prognoza pe 5 zile')
  .option('-d, --days <number>', 'Numărul de zile (1-5)', '5')
  .action(async (options) => {
    const spinner = ora('Obțin prognoza...').start();
    try {
      spinner.stop();
      const days = Math.min(Math.max(parseInt(options.days), 1), 5);
      await app.getForecast(days);
    } catch (error) {
      spinner.fail('Eroare la obținerea prognozei');
      console.error(chalk.red(error.message));
    }
  });

// Export command
program
  .command('export')
  .description('Exportă datele meteo')
  .option('-f, --format <type>', 'Format: json sau csv', 'json')
  .action(async (options) => {
    const spinner = ora('Exportez datele...').start();
    try {
      spinner.stop();
      await app.exportData(options.format);
    } catch (error) {
      spinner.fail('Eroare la export');
      console.error(chalk.red(error.message));
    }
  });

// Setup command
program
  .command('setup')
  .description('Configurare API key')
  .action(() => {
    console.log(chalk.blue('🔧 SETUP INSTRUCȚIUNI:\n'));
    console.log('1. Obține API key de la: https://openweathermap.org/api');
    console.log('2. Creează fișier .env în directorul proiectului');
    console.log('3. Adaugă: OPENWEATHER_API_KEY=your_api_key_here');
    console.log('4. Rulează: bw now\n');
    console.log(chalk.green('Exemplu .env:'));
    console.log(chalk.gray('OPENWEATHER_API_KEY=abc123def456'));
  });

// Default action
program
  .action(async () => {
    await app.showBanner();
    await app.getCurrentWeather();
  });

program.parse();