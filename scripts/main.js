// ==========================================================
//  CONFIG
// ==========================================================
const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search?name=";
const WEATHER_URL =
  "https://api.open-meteo.com/v1/forecast?current_weather=true&timezone=auto&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,pressure_msl,visibility,precipitation,uv_index,wind_speed_10m,wind_direction_10m";

// ==========================================================
//  LANGUAGE SYSTEM
// ==========================================================
let LANG = localStorage.getItem("lang") || "ru";

const TXT = {
  send: { ru: "Отправить", en: "Send" },
  loading: { ru: "Загрузка", en: "Loading" },
  lastUpdated: { ru: "Последнее обновление", en: "Last updated" },
  local: { ru: "локальное время", en: "local time" },
  coords: { ru: "Координаты", en: "Coordinates" },

  error_geo: { ru: "Ошибка геокодинга", en: "Geocoding error" },
  error_weather: { ru: "Ошибка погоды", en: "Weather error" },
  error_not_found: { ru: "Город не найден", en: "City not found" },

  lbl_feels: { ru: "Ощущается", en: "Feels like" },
  lbl_wind: { ru: "Ветер", en: "Wind" },
  lbl_humidity: { ru: "Влажность", en: "Humidity" },
  lbl_pressure: { ru: "Давление", en: "Pressure" },
  lbl_precip: { ru: "Осадки", en: "Precip" },
  lbl_visibility: { ru: "Видимость", en: "Visibility" },
  lbl_uv: { ru: "УФ", en: "UV" }
};

const WEATHER_TEXT = {
  0: { ru: "Ясно", en: "Clear sky" },
  1: { ru: "Преимущественно ясно", en: "Mainly clear" },
  2: { ru: "Переменная облачность", en: "Partly cloudy" },
  3: { ru: "Пасмурно", en: "Overcast" },
  45: { ru: "Туман", en: "Fog" },
  48: { ru: "Туман с изморозью", en: "Depositing rime fog" },
  51: { ru: "Морось: легкая", en: "Drizzle: Light" },
  53: { ru: "Морось: умеренная", en: "Drizzle: Moderate" },
  55: { ru: "Морось: сильная", en: "Drizzle: Dense" },
  61: { ru: "Дождь: слабый", en: "Rain: Slight" },
  63: { ru: "Дождь: умеренный", en: "Rain: Moderate" },
  65: { ru: "Дождь: сильный", en: "Rain: Heavy" },
  71: { ru: "Снег: слабый", en: "Snow: Slight" },
  73: { ru: "Снег: умеренный", en: "Snow: Moderate" },
  75: { ru: "Снег: сильный", en: "Snow: Heavy" },
  95: { ru: "Гроза", en: "Thunderstorm" },
  96: { ru: "Гроза с градом", en: "Thunderstorm w/ hail" },
  99: { ru: "Гроза с градом", en: "Thunderstorm w/ hail" }
};

function t(key) {
  return TXT[key][LANG];
}

// ==========================================================
// DOM
// ==========================================================
const form = document.getElementById("form");
const input = document.getElementById("city");
const sendBtn = document.getElementById("send");

const empty = document.getElementById("empty");
const dataBlock = document.getElementById("data");
const errorBlock = document.getElementById("error");

const cityNameEl = document.getElementById("cityName");
const locationMeta = document.getElementById("locationMeta");
const iconEl = document.getElementById("icon");
const tempEl = document.getElementById("temp");
const condTextEl = document.getElementById("condText");
const lastUpdatedEl = document.getElementById("lastUpdated");

const feelsEl = document.getElementById("feels");
const windEl = document.getElementById("wind");
const humEl = document.getElementById("hum");
const presEl = document.getElementById("pres");
const precipEl = document.getElementById("precip");
const visEl = document.getElementById("vis");
const uvEl = document.getElementById("uv");

const tzEl = document.getElementById("tz");
const coordsEl = document.getElementById("coords");
const mapLink = document.getElementById("maplink");

// Flags
const langRU = document.getElementById("lang-ru");
const langEN = document.getElementById("lang-en");

// ==========================================================
// UI helpers
// ==========================================================
function applyLang() {
  sendBtn.textContent = t("send");
}

function applyStaticTranslations() {
  document.querySelectorAll("[data-t]").forEach(el => {
    const key = el.getAttribute("data-t");
    if (TXT[key]) el.textContent = TXT[key][LANG];
  });
}

function setLoading(on) {
  if (on) {
    sendBtn.disabled = true;
    sendBtn.innerHTML =
      `<span class="loader" aria-hidden="true"></span> ${t("loading")}`;
  } else {
    sendBtn.disabled = false;
    sendBtn.textContent = t("send");
  }
}

function showError(msg) {
  errorBlock.style.display = "block";
  errorBlock.textContent = msg;
}

function hideError() {
  errorBlock.style.display = "none";
  errorBlock.textContent = "";
}

function clearData() {
  dataBlock.style.display = "none";
  empty.style.display = "block";
  hideError();
}

function showData() {
  dataBlock.style.display = "block";
  empty.style.display = "none";
  hideError();
}

// ==========================================================
// ICON MAP
// ==========================================================
const ICONS = {
  0: "https://cdn.weatherapi.com/weather/64x64/day/113.png",
  1: "https://cdn.weatherapi.com/weather/64x64/day/116.png",
  2: "https://cdn.weatherapi.com/weather/64x64/day/119.png",
  3: "https://cdn.weatherapi.com/weather/64x64/day/122.png",
  45: "https://cdn.weatherapi.com/weather/64x64/day/248.png",
  48: "https://cdn.weatherapi.com/weather/64x64/day/248.png",
  51: "https://cdn.weatherapi.com/weather/64x64/day/266.png",
  53: "https://cdn.weatherapi.com/weather/64x64/day/293.png",
  55: "https://cdn.weatherapi.com/weather/64x64/day/296.png",
  61: "https://cdn.weatherapi.com/weather/64x64/day/296.png",
  63: "https://cdn.weatherapi.com/weather/64x64/day/302.png",
  65: "https://cdn.weatherapi.com/weather/64x64/day/308.png",
  71: "https://cdn.weatherapi.com/weather/64x64/day/326.png",
  73: "https://cdn.weatherapi.com/weather/64x64/day/329.png",
  75: "https://cdn.weatherapi.com/weather/64x64/day/335.png",
  95: "https://cdn.weatherapi.com/weather/64x64/day/389.png",
  96: "https://cdn.weatherapi.com/weather/64x64/day/392.png",
  99: "https://cdn.weatherapi.com/weather/64x64/day/392.png"
};

// ==========================================================
// FETCH
// ==========================================================
async function geocode(name) {
  const url = GEOCODE_URL + encodeURIComponent(name.trim());
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(t("error_geo"));

  const json = await resp.json();
  if (!json.results || json.results.length === 0)
    throw new Error(t("error_not_found"));

  return json.results[0];
}

async function fetchWeather(lat, lon) {
  const url = `${WEATHER_URL}&latitude=${lat}&longitude=${lon}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(t("error_weather"));

  return resp.json();
}

// ==========================================================
// UI FILL
// ==========================================================
function weathercodeToText(code) {
  return WEATHER_TEXT[code]?.[LANG] || "?";
}

function populate(geo, weather) {
  const cw = weather.current_weather;

  const gmaps = `https://www.google.com/maps/search/?api=1&query=${geo.latitude},${geo.longitude}`;

  cityNameEl.textContent = geo.name;
  mapLink.href = gmaps;

  locationMeta.textContent =
    `${geo.country} • ${t("local")}: ${weather.timezone}`;

  iconEl.src = ICONS[cw.weathercode] || ICONS[3];
  iconEl.alt = weathercodeToText(cw.weathercode);
  tempEl.textContent = `${cw.temperature.toFixed(1)}°C`;
  condTextEl.textContent = weathercodeToText(cw.weathercode);
  lastUpdatedEl.textContent = `${t("lastUpdated")}: ${cw.time}`;

  const h = weather.hourly;

  // ищем ближайший час
  const now = new Date(cw.time).getTime();
  let idx = h.time.findIndex(t => Math.abs(new Date(t).getTime() - now) < 60*60*1000);
  if (idx === -1) idx = 0; // fallback на первый

  feelsEl.textContent = `${t("lbl_feels")}: ${h.apparent_temperature[idx].toFixed(1)}°C`;
  humEl.textContent = `${t("lbl_humidity")}: ${h.relative_humidity_2m[idx]}%`;
  presEl.textContent = `${t("lbl_pressure")}: ${h.pressure_msl[idx].toFixed(0)} mb`;
  precipEl.textContent = `${t("lbl_precip")}: ${h.precipitation[idx]} mm`;
  visEl.textContent = `${t("lbl_visibility")}: ${(h.visibility[idx]/1000).toFixed(1)} km`;
  uvEl.textContent = `${t("lbl_uv")}: ${h.uv_index[idx]}`;

  windEl.textContent = `${t("lbl_wind")}: ${cw.windspeed} km/h • ${cw.winddirection}°`;

  tzEl.textContent = weather.timezone;
  coordsEl.textContent = `${t("coords")}: lat ${geo.latitude.toFixed(4)}, lon ${geo.longitude.toFixed(4)}`;

  showData();
}

// ==========================================================
// FORM HANDLING
// ==========================================================
form.addEventListener("submit", async (ev) => {
  ev.preventDefault();
  const q = input.value.trim();
  if (!q) return;

  setLoading(true);
  clearData();

  try {
    const geo = await geocode(q);
    const weather = await fetchWeather(geo.latitude, geo.longitude);
    populate(geo, weather);
  } catch (e) {
    showError(e.message);
  } finally {
    setLoading(false);
  }
});

// Enter = click send
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    form.dispatchEvent(new Event("submit", { cancelable: true }));
  }
});

// ==========================================================
// LANGUAGE SWITCHING
// ==========================================================
function switchLang(lang) {
  LANG = lang;
  localStorage.setItem("lang", lang);

  applyLang();
  applyStaticTranslations();

  // Re-render data if visible
  if (dataBlock.style.display === "block") {
    const city = cityNameEl.textContent;
    if (city) form.dispatchEvent(new Event("submit", { cancelable: true }));
  }
}

langRU.addEventListener("click", () => switchLang("ru"));
langEN.addEventListener("click", () => switchLang("en"));

// initial
applyLang();
applyStaticTranslations();
