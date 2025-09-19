#!/usr/bin/env node

/**
 * Basic Test Suite pentru Bucharest Weather CLI
 * Simple testing fără dependențe externe
 */

import { WeatherAPI } from '../src/weather.js';
import { AIInsights } from '../src/ai-insights.js';
import chalk from 'chalk';

class SimpleTest {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(name, fn) {
    this.tests.push({ name, fn });
  }

  async run() {
    console.log(chalk.blue('🧪 Running Bucharest Weather CLI Tests\n'));

    for (const test of this.tests) {
      try {
        await test.fn();
        console.log(chalk.green(`✅ ${test.name}`));
        this.passed++;
      } catch (error) {
        console.log(chalk.red(`❌ ${test.name}`));
        console.log(chalk.gray(`   Error: ${error.message}`));
        this.failed++;
      }
    }

    console.log(`\n📊 Results: ${chalk.green(this.passed + ' passed')}, ${chalk.red(this.failed + ' failed')}`);
    
    if (this.failed > 0) {
      process.exit(1);
    }
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }

  assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(message || `Expected ${expected}, got ${actual}`);
    }
  }
}

// Test Suite
const tester = new SimpleTest();

// Test WeatherAPI class
tester.test('WeatherAPI - Constructor', () => {
  const api = new WeatherAPI();
  tester.assert(api.city === 'Bucharest', 'City should be Bucharest');
  tester.assert(api.country === 'RO', 'Country should be RO');
});

// Test AIInsights class
tester.test('AIInsights - Constructor', () => {
  const ai = new AIInsights();
  tester.assert(ai.clothingRules, 'Should have clothing rules');
  tester.assert(ai.activityRules, 'Should have activity rules');
});

// Test clothing advice
tester.test('AIInsights - Clothing Advice Hot Weather', () => {
  const ai = new AIInsights();
  const advice = ai.getClothingAdvice(30);
  tester.assert(advice.includes('ușoară'), 'Should recommend light clothing for hot weather');
});

tester.test('AIInsights - Clothing Advice Cold Weather', () => {
  const ai = new AIInsights();
  const advice = ai.getClothingAdvice(-5);
  tester.assert(advice.includes('iarnă'), 'Should recommend winter clothing for freezing weather');
});

// Test activity suggestions
tester.test('AIInsights - Activity Suggestions Sunny', () => {
  const ai = new AIInsights();
  const activity = ai.getActivitySuggestions('senin', 25);
  tester.assert(activity.includes('Activitate recomandată'), 'Should provide activity recommendation');
});

// Test alerts generation
tester.test('AIInsights - Generate Alerts Cold', () => {
  const ai = new AIInsights();
  const mockData = {
    temp: -5,
    humidity: 60,
    wind_speed: 5,
    pressure: 1013
  };
  const alerts = ai.generateAlerts(mockData);
  tester.assert(alerts.includes('sub zero'), 'Should alert for freezing temperatures');
});

tester.test('AIInsights - Generate Alerts Normal', () => {
  const ai = new AIInsights();
  const mockData = {
    temp: 20,
    humidity: 60,
    wind_speed: 5,
    pressure: 1013
  };
  const alerts = ai.generateAlerts(mockData);
  tester.assert(alerts.includes('normale'), 'Should show normal conditions');
});

// Test mock data
tester.test('WeatherAPI - Mock Data Structure', () => {
  const api = new WeatherAPI();
  const mockData = api.getMockData();
  
  tester.assert(typeof mockData.temp === 'number', 'Temperature should be number');
  tester.assert(typeof mockData.description === 'string', 'Description should be string');
  tester.assert(typeof mockData.humidity === 'number', 'Humidity should be number');
});

// Test insights generation with mock data
tester.test('AIInsights - Generate Complete Insights', async () => {
  const ai = new AIInsights();
  const api = new WeatherAPI();
  const mockData = api.getMockData();
  
  const insights = await ai.generateInsights(mockData);
  
  tester.assert(insights.clothing, 'Should have clothing advice');
  tester.assert(insights.activities, 'Should have activity suggestions');
  tester.assert(insights.alerts, 'Should have alerts');
});

// Mock API test (pentru demo fără API key)
tester.test('WeatherAPI - API Key Validation', () => {
  const api = new WeatherAPI();
  // Test că avem măcar demo key
  tester.assert(api.apiKey, 'Should have some API key (even demo)');
  tester.assert(api.baseUrl.includes('openweathermap'), 'Should use OpenWeatherMap URL');
});

// Run all tests
if (import.meta.url === `file://${process.argv[1]}`) {
  tester.run().catch(console.error);
}

export { SimpleTest };
