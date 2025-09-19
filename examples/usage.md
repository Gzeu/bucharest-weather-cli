# Exemple de Utilizare - Bucharest Weather CLI

## Instalare

```bash
# Clone repository
git clone https://github.com/Gzeu/bucharest-weather-cli.git
cd bucharest-weather-cli

# Install dependencies
npm install

# Setup API key
cp .env.example .env
# Editează .env cu API key-ul tău

# Install global (optional)
npm install -g .
```

## Comenzi Disponibile

### 1. Vremea Actuală
```bash
# Metodă lungă
node src/cli.js now

# Metodă scurtă (după install global)
bw now
bw current

# Execuție directă
node src/index.js
```

### 2. Prognoza Meteo
```bash
# Prognoza pe 5 zile
bw forecast
bw f

# Prognoza pe 3 zile
bw forecast --days 3
bw f -d 3
```

### 3. Export Date
```bash
# Export JSON
bw export
bw export --format json

# Export CSV
bw export --format csv
bw export -f csv
```

### 4. Setup și Configurare
```bash
# Instrucțiuni setup
bw setup

# Versiune
bw --version

# Help
bw --help
bw forecast --help
```

## Exemple de Output

### Current Weather
```
╭─────────────────────────────────────────╮
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
│   🎯 Activitate recomandată: Plimbare  │
│   ✅ Condiții normale                  │
│                                         │
╰─────────────────────────────────────────╯
```

### Forecast
```
📅 PROGNOZA 5 ZILE - BUCUREȘTI

Astăzi: 18°C - 25°C
   parțial înnorat

Mâine: 16°C - 23°C
   ploaie ușoară

...
```

## Integrări Avansate

### 1. Cron Job pentru Alerte
```bash
# Adaugă în crontab pentru alertă zilnică
0 8 * * * /usr/local/bin/bw now
```

### 2. Script pentru Status Bar
```bash
#!/bin/bash
# weather-status.sh
bw now | grep "Temperatură" | cut -d: -f2
```

### 3. Pipeline cu Alte Tools
```bash
# Export și procesare
bw export -f json | jq '.current.temp'

# Combinat cu curl pentru webhooks
bw export -f json | curl -X POST -d @- webhook-url
```

## Troubleshooting

### Erori Comune

1. **API key invalid**
   ```
   Soluție: bw setup și verifică .env
   ```

2. **Network error**
   ```
   Verifică conexiunea internet
   ```

3. **Module not found**
   ```
   npm install
   ```

### Support
- Issues: https://github.com/Gzeu/bucharest-weather-cli/issues
- Discussions: GitHub Discussions
