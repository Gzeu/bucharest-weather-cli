#!/usr/bin/env node
/* eslint-disable no-console */
const { Command } = require("commander");
const chalk = require("chalk");
const ora = require("ora");
const os = require("os");
const fs = require("fs");
const path = require("path");

// Bucharest coordinates
const LAT = 44.4268;
const LON = 26.1025;

// Helper functions
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const cacheDir = path.join(os.homedir(), ".cache", "bwc");
const cacheFile = (key) => path.join(cacheDir, `${key}.json`);
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Weather icon mapping for WMO codes
const weatherIcon = (code) => {
  const map = {
    0: "☀️ Senin",
    1: "🌤 Mai mult senin",
    2: "⛅ Parțial noros",
    3: "☁️ Noros",
    45: "🌫 Ceață",
    48: "🌫 Ceață cu depuneri",
    51: "🌦 Burniță ușoară",
    53: "🌦 Burniță",
    55: "🌧 Burniță puternică",
    61: "🌦 Ploaie slabă",
    63: "🌧 Ploaie",
    65: "🌧️ Ploaie puternică",
    66: "🌧 Ploaie înghețată slabă",
    67: "🌧 Ploaie înghețată",
    71: "🌨 Ninsoare slabă",
    73: "🌨 Ninsoare",
    75: "❄️ Ninsoare puternică",
    77: "❄️ Ninsoare granulată",
    80: "🌧 Averse slabe",
    81: "🌧 Averse",
    82: "⛈ Averse puternice",
    85: "🌨 Averse ninsoare",
    86: "❄️ Averse ninsoare puternice",
    95: "⛈ Furtună",
    96: "⛈ Furtună cu grindină",
    99: "⛈ Furtună cu grindină puternică",
  };
  return map[code] || `WMO ${code}`;
};

// HTTP fetch with timeout and user agent
async function fetchJson(url, { timeoutMs = 8000 } = {}) {
  const ac = new AbortController();
  const id = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ac.signal,
      headers: { "user-agent": "bwc/1.0" }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(id);
  }
}

// Cache management
function readCache(key) {
  try {
    const f = cacheFile(key);
    const st = fs.statSync(f);
    if (Date.now() - st.mtimeMs > CACHE_TTL_MS) return null;
    return JSON.parse(fs.readFileSync(f, "utf8"));
  } catch {
    return null;
  }
}

function writeCache(key, data) {
  try {
    fs.mkdirSync(cacheDir, { recursive: true });
    fs.writeFileSync(cacheFile(key), JSON.stringify(data));
  } catch {}
}

// Temperature conversion
function cToF(c) {
  return c * 9 / 5 + 32;
}

function fmtTemp(t, unit) {
  if (t == null) return "-";
  return unit === "f" ? `${Math.round(cToF(t))}°F` : `${Math.round(t)}°C`;
}

// API calls to Open-Meteo
async function getCurrent(unit) {
  const key = `current_${unit}`;
  const cached = readCache(key);
  if (cached) return cached;

  const params = new URLSearchParams({
    latitude: LAT,
    longitude: LON,
    timezone: "auto",
    current: [
      "temperature_2m","apparent_temperature","relative_humidity_2m",
      "precipitation","weather_code","wind_speed_10m","wind_direction_10m"
    ].join(","),
  });

  if (unit === "f") {
    params.set("temperature_unit", "fahrenheit");
    params.set("wind_speed_unit", "mph");
  } else {
    params.set("temperature_unit", "celsius");
    params.set("wind_speed_unit", "kmh");
  }

  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  const data = await fetchJson(url);
  writeCache(key, data);
  return data;
}

async function getHourly(unit, hours = 24) {
  const key = `hourly_${unit}_${hours}`;
  const cached = readCache(key);
  if (cached) return cached;

  const params = new URLSearchParams({
    latitude: LAT,
    longitude: LON,
    timezone: "auto",
    hourly: ["temperature_2m","precipitation_probability","relative_humidity_2m","weather_code"].join(","),
  });

  if (unit === "f") params.set("temperature_unit", "fahrenheit");

  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  const data = await fetchJson(url);
  data._trim = hours;
  writeCache(key, data);
  return data;
}

async function getDaily(unit, days = 7) {
  const key = `daily_${unit}_${days}`;
  const cached = readCache(key);
  if (cached) return cached;

  const params = new URLSearchParams({
    latitude: LAT,
    longitude: LON,
    timezone: "auto",
    daily: ["temperature_2m_max","temperature_2m_min","precipitation_sum","weather_code"].join(","),
    forecast_days: String(days)
  });

  if (unit === "f") params.set("temperature_unit", "fahrenheit");

  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  const data = await fetchJson(url);
  writeCache(key, data);
  return data;
}

// Main CLI function
async function run() {
  const program = new Command();
  
  program
    .name("bwc")
    .description("Bucharest Weather CLI (Open-Meteo)")
    .option("--now", "Afișează starea curentă")
    .option("--hours <n>", "Prognoză pe ore (implicit 24)", (v) => parseInt(v, 10), 24)
    .option("--days <n>", "Prognoză pe zile (implicit 7)", (v) => parseInt(v, 10), 7)
    .option("--unit <c|f>", "Unitate temperatură (c/f)", "c")
    .option("--json", "Output JSON brut")
    .option("--no-color", "Dezactivează culorile")
    .parse(process.argv);

  const opts = program.opts();
  const color = new chalk.Instance({ level: opts.color === false ? 0 : 1 });
  const spinner = ora({ text: "Se încarcă vremea...", color: "cyan" }).start();

  try {
    if (opts.now) {
      const data = await getCurrent(opts.unit);
      spinner.stop();
      
      if (opts.json) {
        console.log(JSON.stringify(data, null, 2));
        return;
      }

      const c = data.current;
      console.log(`${color.bold("București - Acum")}`);
      console.log(`${weatherIcon(c.weather_code)} ${fmtTemp(c.temperature_2m, opts.unit)} (se simte ${fmtTemp(c.apparent_temperature, opts.unit)})`);
      console.log(`Umiditate: ${c.relative_humidity_2m}% | Vânt: ${Math.round(c.wind_speed_10m)} ${opts.unit==="f"?"mph":"km/h"} dir ${c.wind_direction_10m}°`);
      return;
    }

    // Default: hourly + daily summary
    const [hourly, daily] = await Promise.all([getHourly(opts.unit, opts.hours), getDaily(opts.unit, opts.days)]);
    spinner.stop();

    if (opts.json) {
      console.log(JSON.stringify({ hourly, daily }, null, 2));
      return;
    }

    console.log(color.bold("București - Următoarele ore"));
    const hours = hourly.hourly.time.slice(0, opts.hours);
    const temps = hourly.hourly.temperature_2m.slice(0, opts.hours);
    const wcodes = hourly.hourly.weather_code.slice(0, opts.hours);
    const probs = hourly.hourly.precipitation_probability?.slice(0, opts.hours) || [];
    
    for (let i = 0; i < hours.length; i++) {
      const t = new Date(hours[i]);
      const hh = t.toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" });
      const icon = weatherIcon(wcodes[i]);
      const pp = probs[i] != null ? `, ploaie ${probs[i]}%` : "";
      console.log(`${hh}  ${icon}  ${fmtTemp(temps[i], opts.unit)}${pp}`);
    }

    console.log("\n" + color.bold("Următoarele zile"));
    const dtime = daily.daily.time;
    const tmax = daily.daily.temperature_2m_max;
    const tmin = daily.daily.temperature_2m_min;
    const dcode = daily.daily.weather_code;
    
    for (let i = 0; i < Math.min(opts.days, dtime.length); i++) {
      const d = new Date(dtime[i]).toLocaleDateString("ro-RO", { weekday: "short", day: "2-digit", month: "2-digit" });
      console.log(`${d}  ${weatherIcon(dcode[i])}  max ${fmtTemp(tmax[i], opts.unit)} / min ${fmtTemp(tmin[i], opts.unit)}`);
    }

  } catch (err) {
    spinner.stop();
    console.error("Eroare:", err?.message || err);
    process.exitCode = 1;
  } finally {
    await sleep(50);
  }
}

run();