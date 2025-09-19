# 🌤️ Bucharest Weather CLI

**Tool profesional pentru vremea din București cu inteligentă artificială și predicții avansate**

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)
![Quality](https://img.shields.io/badge/code%20quality-professional-success.svg)

## ✨ Features

- ☁️ **Vremea actuală** cu detalii meteorologice complete pentru București
- 📅 **Prognoza pe 5 zile** cu temperaturi min/max și condiții atmosferice
- 🤖 **AI Recommendations** pentru îmbrăcăminte, activități și planificare
- 🚨 **Smart Alerts** pentru condiții meteorologice extreme
- 📊 **Export date** în JSON/CSV pentru analize și integrări
- ⚡ **CLI ultra-rapid** cu comenzi scurte și eficiente
- 🎨 **Interface modern** cu styling colorat și iconițe intuitive
- 🔄 **Auto-refresh** și cache pentru performanță optimă

## 🚀 Instalare și Setup

### Metoda Recomandată (Git Clone)
```bash
# Clone repository
git clone https://github.com/Gzeu/bucharest-weather-cli.git
cd bucharest-weather-cli

# Install dependencies
npm install

# Setup configurație (gratuit)
cp .env.example .env
# Editează .env cu API key de la openweathermap.org

# Test funcționalitate
npm run demo
```

### Instalare Globală (NPM)
```bash
# Coming soon to NPM registry
npm install -g bucharest-weather-cli
bw now
```

## 🔑 Configurare API Key

### Pasul 1: Obține API Key Gratuit
1. Acceseasă [OpenWeatherMap API](https://openweathermap.org/api)
2. Creează cont gratuit (2 minute)
3. Obține API key instant
4. Configurează în `.env`:

```env
# Required: OpenWeatherMap API Key
OPENWEATHER_API_KEY=your_api_key_here

# Optional: Custom settings
WEATHER_CITY=Bucharest
WEATHER_COUNTRY=RO
REFRESH_INTERVAL=300
```

### Pasul 2: Verifică Setup
```bash
node src/cli.js setup
bw --version
```

## 💻 Utilizare Avansată

### Comenzi Principale

```bash
# Vremea curentă cu AI insights
node src/cli.js now
bw current                # alias

# Prognoza extinsă
node src/cli.js forecast
bw f --days 3             # 3 zile specifice
bw f -d 7                 # maxim 7 zile

# Export și analiză
node src/cli.js export --format json
bw export -f csv > weather_data.csv

# Ajutor și configurare
node src/cli.js setup
bw help
bw --version
```

### Comenzi Avansate

```bash
# Monitor continuu
watch -n 300 'bw now'     # Refresh la 5 minute

# Pipeline cu alte tools
bw export -f json | jq '.current.temp'
bw current | grep "Temperatură" | cut -d: -f2

# Integrări cu scripturi
bw export -f json | curl -X POST -d @- your-webhook-url
```

## 📊 Exemple de Output

### Current Weather (Enhanced)
```
╭───────────────────────────────────────────────╮
│                                               │
│   🌡️  VREMEA ACUM ÎN BUCUREȘTI              │
│   19 septembrie 2025, 03:45 EEST             │
│                                               │
│   Temperatură: 22°C (simte ca 24°C)          │
│   Descriere: parțial înnorat                 │
│   Umiditate: 65% | Presiune: 1013 hPa        │
│   Vânt: 3.2 m/s NE | Vizibilitate: 10 km    │
│   Răsărit: 06:45 | Apus: 19:30             │
│                                               │
│   🤖 AI RECOMANDĂRI PERSONALIZATE:           │
│   👔 Îmbrăcăminte: Cămașă subțire + jachetă   │
│   🎯 Activitate ideală: Cycling în Herastrau  │
│   📈 Trend: Temperaturi stabile următoarele ore │
│   ✅ Condiții optime pentru activități outdoor  │
│                                               │
╰───────────────────────────────────────────────╯
```

### Extended Forecast
```
📅 PROGNOZA EXTINSĂ 7 ZILE - BUCUREȘTI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🗓️  Astăzi (Vineri):     18°C - 25°C    ☁️ parțial înnorat
     📍 Ideal pentru: plimbări, terase, cycling

🗓️  Mâine (Sâmbătă):   16°C - 23°C    🌦️ ploaie ușoară
     📍 Recomandare: activități indoor, muzee

🗓️  Duminică:          14°C - 20°C    ☁️ înnorat
     📍 Bun pentru: cafenele, shopping mall-uri
```

## 🔧 Arhitectură Tehnică

### Stack Tehnologic
- **Runtime**: Node.js 16+ cu ES Modules native
- **CLI Framework**: Commander.js pentru parsing și help
- **HTTP Client**: Axios cu retry logic și timeout
- **Styling**: Chalk (colors) + Boxen (borders) + Figlet (ASCII art)
- **API Integration**: OpenWeatherMap REST API v2.5
- **AI Engine**: Logic proprietar pentru recomandări contextuale
- **Testing**: Suite de teste automate cu coverage
- **CI/CD**: GitHub Actions pentru Node 16/18/20

### Structura Modulara
```
bucharest-weather-cli/
├── src/                    # Core application logic
│   ├── index.js            # Main application entry
│   ├── cli.js              # Command-line interface
│   ├── weather.js          # OpenWeatherMap API client
│   └── ai-insights.js      # AI recommendation engine
├── bin/                    # Executable binaries
│   └── bucharest-weather   # Global CLI executable
├── test/                   # Test suite
│   └── test.js             # Automated test cases
├── examples/               # Usage documentation
│   └── usage.md            # Detailed examples
├── .github/workflows/      # CI/CD automation
│   ├── ci.yml              # Testing pipeline
│   └── demo.yml            # Demo automation
└── docs/                   # Project documentation
```

## 🧪 Quality Assurance

### Testing
```bash
# Suite completă de teste
npm test

# Coverage report
npm run test:coverage

# Performance testing
npm run test:performance

# Manual testing
npm run dev
node test/test.js
```

### CI/CD Pipeline
- **✅ Automated Testing** pe Node.js 16, 18, 20
- **✅ Security Scanning** cu npm audit
- **✅ Code Quality** checks
- **✅ Cross-platform** compatibility (Linux, macOS, Windows)

## 🚀 Roadmap și Extensii

### Version 1.1 (Current Development)
- [ ] **Multiple Cities Support** - Cluj, Timișoara, Iași
- [ ] **Advanced AI Integration** - Groq API pentru predicții ML
- [ ] **Weather Alerts** - Desktop notifications pentru extreme
- [ ] **Historical Data** - Analiză trendinds pe 30 zile

### Version 1.2 (Planning)
- [ ] **Web Dashboard** - Express.js server cu real-time data
- [ ] **Docker Container** - Containerized deployment
- [ ] **Webhook Support** - Integrări cu Slack, Discord, Teams
- [ ] **Weather Maps** - ASCII art maps în terminal

### Version 2.0 (Future)
- [ ] **Multi-language Support** - English, French, German
- [ ] **Weather API Aggregation** - Multiple data sources
- [ ] **Machine Learning** - Custom prediction models
- [ ] **Mobile App** - React Native companion

## 💬 Developer API

### Core Classes

#### WeatherAPI
```javascript
import { WeatherAPI } from './src/weather.js';

const weather = new WeatherAPI({
  apiKey: 'your-key',
  city: 'Bucharest',
  units: 'metric',
  language: 'ro'
});

// Get current conditions
const current = await weather.getCurrent();

// Get extended forecast
const forecast = await weather.getForecast(7);

// Get historical data
const history = await weather.getHistorical(30);
```

#### AIInsights
```javascript
import { AIInsights } from './src/ai-insights.js';

const ai = new AIInsights();

// Generate personalized recommendations
const insights = await ai.generateInsights(weatherData);

// Get clothing advice
const clothing = ai.getClothingAdvice(temperature, conditions);

// Activity suggestions
const activities = ai.getActivitySuggestions(weather, time);
```

## 🐛 Support și Community

### Official Channels
- **🐛 Bug Reports**: [GitHub Issues](https://github.com/Gzeu/bucharest-weather-cli/issues)
- **💡 Feature Requests**: [GitHub Discussions](https://github.com/Gzeu/bucharest-weather-cli/discussions)
- **📬 Direct Contact**: pricopgeorge@gmail.com
- **💬 Community**: Join our Discord server (coming soon)

### Contributing Guidelines
1. **Fork** repository-ul pe GitHub
2. **Create branch** pentru feature (`git checkout -b feature/awesome-feature`)
3. **Implement** cu teste și documentație
4. **Test** pe multiple Node.js versions
5. **Submit** Pull Request cu descriere detaliată

## 📜 Licență și Credits

### Open Source License
**MIT License** - Liber de folosit pentru proiecte comerciale și personale.  
Vezi [LICENSE](LICENSE) pentru termeni completi.

### Credits și Mulțumiri
- **🎆 Powered by**: OpenWeatherMap API pentru date meteorologice precise
- **🚀 Built with**: Modern Node.js ecosystem și best practices
- **🇷🇴 Made in**: Bucharest, Romania cu ❤️ pentru comunitatea tech locală
- **💫 Inspired by**: Nevoile zilnice ale dezvoltatorilor și tech enthusiasts

---

### 🌟 **Professional Weather Intelligence pentru București** 🌟

*Tool-ul preferat al dezvoltatorilor români pentru vremea din capitală.*