# 🌤️ Bucharest Weather CLI v3.0

**Tool profesional pentru vremea din București cu sistem avansat de template-uri vizuale și inteligență artificială**

[![GitHub license](https://img.shields.io/github/license/Gzeu/bucharest-weather-cli)](https://github.com/Gzeu/bucharest-weather-cli/blob/main/LICENSE)
[![npm version](https://badge.fury.io/js/bucharest-weather-cli.svg)](https://badge.fury.io/js/bucharest-weather-cli)
[![Node.js CI](https://github.com/Gzeu/bucharest-weather-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/Gzeu/bucharest-weather-cli/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/Gzeu/bucharest-weather-cli/branch/main/graph/badge.svg)](https://codecov.io/gh/Gzeu/bucharest-weather-cli)

## ✨ Ce e nou în v3.0

### 🎨 **Sistem Avansat de Template-uri**
- **10+ Template-uri Vizuale**: Classic, Modern Cards, Dashboard, Minimal, ASCII Art, Retro Terminal, Weather Map, Mobile Style, Matrix, Gauge Meters
- **8 Teme de Culori**: Default, Dark, Ocean, Forest, Sunset, Cyberpunk, Minimal, Rainbow
- **Configurare Interactivă**: Setup GUI prin CLI pentru personalizare completă
- **Preset-uri Personalizate**: Salvează și aplica configurații pentru diferite scenarii
- **Export/Import Setări**: Partajează configurațiile cu echipa ta

### 🤖 **AI și Inteligentă Avansată**
- **Recomandări Contextuale**: AI adaptează sfaturile la condițiile meteorologice
- **Predicii Predictive**: Analize avansate pentru planificare zilnică
- **Alerte Inteligente**: Notificări personalizate pentru condiții extreme

## 🚀 Quick Start

### Instalare Rapidă
```bash
# Clone repository
git clone https://github.com/Gzeu/bucharest-weather-cli.git
cd bucharest-weather-cli

# Install dependencies
npm install

# Setup API key
cp .env.example .env
# Edit .env cu API key de la openweathermap.org

# Test și demo
npm run demo
```

### Comenzi Esențiale
```bash
# Vremea actuală cu template-ul activ
bw now

# Configurare interactivă (RECOMANDAT pentru început)
bw config

# Explorează template-urile disponibile
bw templates --gallery

# Schimbă tema de culori
bw theme ocean

# Demo toate template-urile
bw demo --templates

# Quick switch template
bw quick
```

## 🎨 Template-uri Disponibile

### 1. **Classic Professional** (`classic`)
Template elegant cu design tradițional și borduri profesionale.
```bash
bw now --template classic
```

### 2. **Modern Cards** (`modern`)
Layout cu carduri moderne, perfect pentru utilizatori contemporani.
```bash
bw now --template modern
```

### 3. **Terminal Dashboard** (`dashboard`)
Dashboard complet cu tabele, grafice și indicații detaliate.
```bash
bw now --template dashboard
```

### 4. **Minimal Clean** (`minimal`)
Design minimalist pentru utilizatori care prefer simplitatea.
```bash
bw now --template minimal
```

### 5. **ASCII Art Weather** (`ascii`)
Ilustrații artistice în terminal cu arte ASCII personalizate.
```bash
bw now --template ascii
```

### 6. **Retro Terminal** (`retro`)
Stil vintage anii 80-90 cu efecte retro și culori clasice.
```bash
bw now --template retro
```

### 7. **Weather Map** (`map`)
Hartă vizuală a Bucureștiului cu indicații geografice.
```bash
bw now --template map
```

### 8. **Mobile Style** (`mobile`)
Design inspirat din aplicațiile mobile moderne.
```bash
bw now --template mobile
```

### 9. **Matrix Code** (`matrix`)
Efecte Matrix cu cod digital și animatii futuriste.
```bash
bw now --template matrix
```

### 10. **Gauge Meters** (`gauge`)
Indicatori vizuali tip gauge pentru toate datele meteorologice.
```bash
bw now --template gauge
```

## 🎨 Teme de Culori

| Temă | Descriere | Exemplu Utilizare |
|--------|-----------|-------------------|
| `default` | Albastru/Cyan clasic | `bw theme default` |
| `dark` | Temă întunecată minimală | `bw theme dark` |
| `ocean` | Nuanțe de albastru ocean | `bw theme ocean` |
| `forest` | Verde natural pădure | `bw theme forest` |
| `sunset` | Portocaliu/Roșu apus | `bw theme sunset` |
| `cyberpunk` | Magenta/Cyan futurist | `bw theme cyberpunk` |
| `minimal` | Doar alb/gri simplu | `bw theme minimal` |
| `rainbow` | Culori multicolore | `bw theme rainbow` |

## ⚙️ Configurare Avansată

### Setup Interactiv
```bash
bw config
```
Această comandă lansează un GUI interactiv pentru:
- Alegerea template-ului preferat
- Selectarea temei de culori
- Configurarea setărilor avansate
- Personalizarea experienței CLI

### Managementul Preset-urilor
```bash
# Listă preset-uri disponibile
bw preset --list

# Aplică preset pentru dezvoltatori
bw preset developer

# Creează preset personalizat
bw preset --create my-preset

# Preset-uri built-in:
# - developer: Dashboard + Cyberpunk + cache info
# - casual: Modern + Default + animații
# - minimal_user: Minimal + Minimal + compact
# - artistic: ASCII + Rainbow + efecte
```

### Export/Import Configurații
```bash
# Exportă setările actuale
bw config --export my-config.json

# Importă configurații
bw config --import my-config.json

# Reset la default
bw config --reset
```

## 📊 Features Avansate

### Template Cu Prognoze
```bash
# Prognoza cu template specific
bw forecast --template dashboard --days 7

# Combină template + temă
bw forecast --template modern --theme ocean --days 5
```

### Preview și Demo
```bash
# Preview template fără API call
bw templates --preview modern

# Demo toate template-urile
bw demo --templates

# Demo toate temele
bw demo --themes
```

### Export Date cu Template Info
```bash
# Export cu metadata template
bw export --format json --output data.json
# Include: template actual, temă, timestamp, etc.

# Export CSV cu info complet
bw export --format csv --output data.csv
```

## 💻 Comenzi Complete CLI

### Comenzi Esențiale
```bash
bw now                    # Vremea actuală cu template activ
bw forecast              # Prognoza cu template activ
bw templates             # Management template-uri
bw theme [name]          # Management teme
bw config                # Configurare interactivă
bw quick                 # Quick switch template
bw preset [name]         # Management preset-uri
bw demo                  # Demo și showcase
bw export                # Export date
bw info                  # System info
bw welcome              # Banner și features
```

### Opțiuni Avansate
```bash
# Template și temă specifică
bw now --template modern --theme ocean

# Forecast cu zile personalizate
bw forecast --days 10 --template dashboard

# Verbose mode cu detalii system
bw now --verbose

# Template preview
bw templates --preview ascii

# Lista template-uri
bw templates --list

# Galerie completă
bw templates --gallery
```

## 🔧 Personalizare Avansată

### Customizing Templates
Fiecare template poate fi personalizat prin:
```bash
# Customize template clasic
bw config
# → Alege "Customize Template"
# → Modifică border style, padding, culori
```

### Creați Template-uri Custom
Puteți adăuga template-uri personalizate în:
```
~/.bucharest-weather-cli/custom-templates/
```

### Setări Config File
Configurația se salvează în:
```
~/.bucharest-weather-cli/template-config.json
```

## 📈 Performance și Cacheing

- **Smart Caching**: Cache inteligent pentru API calls
- **Template Caching**: Template-urile se încarcă o singură dată
- **Lazy Loading**: Încărcare la cerere pentru performance optim
- **Async Rendering**: Rendering asincron pentru template-uri complexe

## 🐞 Debugging și Troubleshooting

### Debugging Template-uri
```bash
# Verbose mode pentru debugging
bw now --verbose

# Check system info
bw info

# Test cu date mock (fără API)
bw demo --templates
```

### Common Issues
1. **Template nu se încarcă**: Verificați `bw config --show`
2. **Culori nu apar**: Terminal-ul trebuie să suporte culori
3. **Cache issues**: `bw config --reset` pentru reset complet

## 🔥 Exemple de Utilizare

### Pentru Dezvoltatori
```bash
# Setup pentru dezvoltatori
bw preset developer
bw now --verbose  # Vezi info cache și performance
```

### Pentru Utilizatori Casnici
```bash
# Setup casual cu animații
bw preset casual
bw forecast --days 3
```

### Pentru Terminale Minimale
```bash
# Setup minimal fără efecte
bw preset minimal_user
bw now  # Output curat, rapid
```

### Pentru Fun și Artistic
```bash
# Setup artistic cu efecte
bw preset artistic
bw now  # ASCII art + rainbow colors
```

## 📚 API și Integrare

### Weather Templates API
```javascript
import { WeatherTemplates } from './src/templates/weather-templates.js';

const templates = new WeatherTemplates();
templates.setTheme('ocean');

const output = templates.renderTemplate(
  'modern', 
  weatherData, 
  forecastData, 
  aiInsights
);
```

### Template Config API
```javascript
import { TemplateConfig } from './src/templates/template-config.js';

const config = new TemplateConfig();
await config.init();

// Programmatic configuration
await config.setTemplate('dashboard');
await config.setTheme('cyberpunk');
```

## 📎 Roadmap v3.1+

### Next Features
- [ ] **Custom Template Builder**: GUI pentru creare template-uri
- [ ] **Weather Widgets**: Template-uri pentru desktop widgets
- [ ] **Terminal Themes**: Import teme din popular terminal themes
- [ ] **Animation System**: Animații și tranziții avansate
- [ ] **Voice Commands**: Control vocal pentru schimbare template
- [ ] **Mobile Companion**: Sincronizare cu aplicația mobilă

### Template Extensions
- [ ] **3D Weather Models**: Modele 3D ASCII pentru condiții meteo
- [ ] **Interactive Maps**: Hărți interactive cu zoom și pan
- [ ] **Weather Animations**: Animații pentru ploaie, zăpadă, etc.
- [ ] **Social Features**: Partajare template-uri în comunitate

## 🤝 Contribuții

Template-urile sunt deschise pentru contribuții!

### Contribuie Template-uri Noi
1. Fork repository-ul
2. Creează template în `src/templates/weather-templates.js`
3. Adaugă documentație și exemple
4. Testează cu `bw demo --templates`
5. Submit Pull Request

### Contribuie Teme Noi
1. Adaugă tema în `themes` object
2. Testează cu toate template-urile
3. Documentațievb noul tema
4. Submit PR cu screenshots

## 📜 Documentație Completă

- **[API Documentation](./docs/api.md)**
- **[Template Development Guide](./docs/template-guide.md)**
- **[Theme Creation Tutorial](./docs/theme-tutorial.md)**
- **[Configuration Reference](./docs/config-reference.md)**
- **[Troubleshooting Guide](./docs/troubleshooting.md)**

## 📝 License

**MIT License** - Liber de folosit pentru proiecte comerciale și personale.

## 👏 Credits

- **🎆 Powered by**: OpenWeatherMap API pentru date meteorologice precise
- **🚀 Built with**: Modern Node.js ecosystem și best practices
- **🇷🇴 Made in**: Bucharest, Romania cu ❤️ pentru comunitatea tech locală
- **💫 Inspired by**: Modern CLI tools și needs ale dezvoltatorilor

---

## 🌟 **Professional Weather Intelligence cu Style pentru București** 🌟

*Tool-ul preferat al dezvoltatorilor români pentru vremea din capitală - acum cu template-uri vizuale avansate!*

**Demo Live**: 
```bash
git clone https://github.com/Gzeu/bucharest-weather-cli.git
cd bucharest-weather-cli && npm install && npm run demo
```

**Quick Links**:
- 🐛 [Report Issues](https://github.com/Gzeu/bucharest-weather-cli/issues)
- 💬 [Discussions](https://github.com/Gzeu/bucharest-weather-cli/discussions) 
- ⭐ [Star on GitHub](https://github.com/Gzeu/bucharest-weather-cli)
- 📨 [Email Support](mailto:pricopgeorge@gmail.com)