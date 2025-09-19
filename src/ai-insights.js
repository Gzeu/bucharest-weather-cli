/**
 * AIInsights Class
 * Generează recomandări inteligente pe baza vremii
 */
export class AIInsights {
  constructor() {
    this.clothingRules = {
      hot: { min: 25, advice: '👕 Îmbrăcăminte ușoară, tricou, pantaloni scurți' },
      warm: { min: 20, max: 25, advice: '👔 Cămașă subțire, pantaloni lungi' },
      mild: { min: 15, max: 20, advice: '🧥 Jachetă ușoară, bluză' },
      cool: { min: 10, max: 15, advice: '🧥 Jachetă groasă, pulover' },
      cold: { min: 5, max: 10, advice: '🧥 Haină de iarnă, căciulă' },
      freezing: { max: 5, advice: '🧥 Echipament de iarnă complet' }
    };

    this.activityRules = {
      sunny: ['🚴 Cycling în parc', '🏃 Jogging', '☕ Terasă la cafea'],
      cloudy: ['🚶 Plimbare', '🛍️ Shopping', '📚 Citit în parc'],
      rainy: ['🏠 Activități indoor', '🎬 Cinema', '☕ Cafenea'],
      snowy: ['⛄ Activități de iarnă', '🏠 Acasă cu ceai cald']
    };
  }

  async generateInsights(weatherData) {
    const clothing = this.getClothingAdvice(weatherData.temp);
    const activities = this.getActivitySuggestions(weatherData.description, weatherData.temp);
    const alerts = this.generateAlerts(weatherData);

    return {
      clothing,
      activities,
      alerts
    };
  }

  getClothingAdvice(temperature) {
    for (const [category, rule] of Object.entries(this.clothingRules)) {
      if (rule.min !== undefined && rule.max !== undefined) {
        if (temperature >= rule.min && temperature < rule.max) {
          return rule.advice;
        }
      } else if (rule.min !== undefined && temperature >= rule.min) {
        return rule.advice;
      } else if (rule.max !== undefined && temperature < rule.max) {
        return rule.advice;
      }
    }
    return '👕 Îmbrăcăminte standard';
  }

  getActivitySuggestions(description, temperature) {
    let weatherType = 'cloudy'; // default
    
    if (description.includes('senin') || description.includes('soare')) {
      weatherType = 'sunny';
    } else if (description.includes('ploaie') || description.includes('burniță')) {
      weatherType = 'rainy';
    } else if (description.includes('zăpadă') || description.includes('ninsoare')) {
      weatherType = 'snowy';
    }

    const activities = this.activityRules[weatherType] || this.activityRules.cloudy;
    const selected = activities[Math.floor(Math.random() * activities.length)];
    
    return `🎯 Activitate recomandată: ${selected}`;
  }

  generateAlerts(data) {
    const alerts = [];

    if (data.temp < 0) {
      alerts.push('🥶 ATENȚIE: Temperaturi sub zero!');
    }
    
    if (data.temp > 30) {
      alerts.push('🔥 ATENȚIE: Temperaturi ridicate!');
    }

    if (data.humidity > 80) {
      alerts.push('💧 Umiditate ridicată');
    }

    if (data.wind_speed > 10) {
      alerts.push('💨 Vânt puternic');
    }

    if (data.pressure < 1000) {
      alerts.push('📉 Presiune atmosferică scăzută');
    }

    return alerts.length > 0 ? alerts.join(', ') : '✅ Condiții normale';
  }

  // Funcție pentru predicții simple
  generateTrend(currentData, forecastData) {
    if (!forecastData || forecastData.length === 0) {
      return 'Nu sunt disponibile date pentru trend';
    }

    const tomorrow = forecastData[1];
    if (!tomorrow) return 'Trend indisponibil';

    const tempDiff = tomorrow.temp_max - currentData.temp;
    
    if (tempDiff > 5) {
      return '📈 Mâine va fi considerabil mai cald';
    } else if (tempDiff < -5) {
      return '📉 Mâine va fi considerabil mai rece';
    } else {
      return '➡️ Temperaturi similare mâine';
    }
  }
}