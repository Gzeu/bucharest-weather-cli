# 🌤️ Bucharest Weather CLI

**CLI tool inteligent pentru vremea din București cu AI insights și predicții**

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)
![Created](https://img.shields.io/badge/created%20with-MCP%20%2B%20Perplexity-purple.svg)

## ✨ Features

- ☁️ **Vremea actuală** cu detalii complete pentru București
- 📅 **Prognoza pe 5 zile** cu temperaturi min/max
- 🤖 **AI Recommendations** pentru îmbrăcăminte și activități
- 🚨 **Smart Alerts** pentru condiții extreme
- 📊 **Export date** în JSON/CSV
- ⚡ **CLI rapid** cu comenzi scurte
- 🎨 **Interface colorat** cu boxe și iconițe

## 🚀 Instalare Rapidă

### Via Git Clone
```bash
# Clone repository
git clone https://github.com/Gzeu/bucharest-weather-cli.git
cd bucharest-weather-cli

# Install dependencies
npm install

# Setup API key (gratuit)
cp .env.example .env
# Editează .env cu API key de la openweathermap.org

# Test
npm run dev
```

### Via NPM (Coming Soon)
```bash
npm install -g bucharest-weather-cli
bw now
```

## 🔑 Setup API Key

1. Merge la [OpenWeatherMap](https://openweathermap.org/api)
2. Creează cont gratuit
3. Obține API key
4. Adaugă în `.env`:
   ```env
   OPENWEATHER_API_KEY=your_api_key_here
   ```

## 💻 Utilizare

### Comenzi Principale

```bash
# Vremea acum
node src/cli.js now
bw now                    # (după install global)

# Prognoza 5 zile
node src/cli.js forecast
bw f -d 3                 # 3 zile

# Export date
node src/cli.js export
bw export -f csv          # format CSV

# Setup help
node src/cli.js setup
bw --help
```

### Exemple de Output

#### Current Weather
```
┌─────────────────────────────────────────┐
│                                         │
│   🌡️  VREMEA ACUM ÎN BUCUREȘTI        │
│                                         │
│   Temperatură: 22°C (simte ca 24°C)    │
│   Descriere: parțial înnorat           │
│   Umiditate: 65%                       │
│   Vânt: 3.2 m/s                       │
│   Presiune: 1013 hPa                   │
│                                         │
│   🤖 AI RECOMANDĂRI:                   │
│   👔 Cămașă subțire, pantaloni lungi   │
│   🎯 Cycling în parc                 │
│   ✅ Condiții normale                  │
│                                         │
└─────────────────────────────────────────┘
```

#### Forecast
```
📅 PROGNOZA 5 ZILE - BUCUREȘTI

Astăzi: 18°C - 25°C
   parțial înnorat

Mâine: 16°C - 23°C
   ploaie ușoară

Vineri: 14°C - 20°C
   înnorat
```

## 🔧 Tehnologii

- **Node.js** 16+ cu ES Modules
- **Commander.js** pentru CLI
- **Axios** pentru HTTP requests
- **Chalk** și **Boxen** pentru styling
- **OpenWeatherMap API** pentru date meteo
- **AI Logic** pentru recomandări inteligente

## 📝 Structura Proiectului

```
bucharest-weather-cli/
├── src/
│   ├── index.js         # Main app
│   ├── cli.js           # CLI interface
│   ├── weather.js       # OpenWeatherMap API
│   └── ai-insights.js   # AI recommendations
├── bin/
│   └── bucharest-weather # Executable
├── examples/
│   └── usage.md         # Detailed examples
├── test/
│   └── test.js          # Simple test suite
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## 🧪 Testing

```bash
# Run test suite
npm test

# Manual testing
npm run dev
node test/test.js
```

## 🚀 Extensii Viitoare

- [ ] **Multiple cities** support
- [ ] **Groq AI integration** pentru predicții avansate
- [ ] **Weather alerts** via notifications
- [ ] **Web dashboard** cu Express.js
- [ ] **Docker container** pentru deployment
- [ ] **Webhook support** pentru integrări
- [ ] **Historical data** analysis
- [ ] **Weather maps** în terminal

## 💬 API Reference

### WeatherAPI Class
```javascript
import { WeatherAPI } from './src/weather.js';

const api = new WeatherAPI();
const current = await api.getCurrent();
const forecast = await api.getForecast(5);
```

### AIInsights Class
```javascript
import { AIInsights } from './src/ai-insights.js';

const ai = new AIInsights();
const insights = await ai.generateInsights(weatherData);
```

## 🐛 Issues și Support

- **Bug Reports**: [GitHub Issues](https://github.com/Gzeu/bucharest-weather-cli/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/Gzeu/bucharest-weather-cli/discussions)
- **Email**: pricopgeorge@gmail.com

## 📜 Licență

MIT License - vezi [LICENSE](LICENSE) pentru detalii.

## ❤️ Contribute

1. Fork repository-ul
2. Creează branch pentru feature (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push la branch (`git push origin feature/amazing-feature`)
5. Deschide Pull Request

## 🎆 Credits

- **Creat cu**: [GitHub MCP Server](https://github.com/github/github-mcp-server) + [Perplexity](https://perplexity.ai)
- **API**: [OpenWeatherMap](https://openweathermap.org)
- **Inspirat de**: Nevoile zilnice ale dezvoltatorilor din București

---

**Made with ❤️ in Bucharest, Romania** 🇷🇴

*Proiect demonstrație pentru capabilitățile GitHub MCP și dezvoltarea rapidă fără repository local.*