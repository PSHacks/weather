const API_KEY = '9bc29f6208ea46988a4111451251211'; 
const ENDPOINT = 'https://api.weatherapi.com/v1/current.json';

const form = document.getElementById('form');
const input = document.getElementById('city');
const sendBtn = document.getElementById('send');

const empty = document.getElementById('empty');
const dataBlock = document.getElementById('data');
const errorBlock = document.getElementById('error');

const cityNameEl = document.getElementById('cityName');
const locationMeta = document.getElementById('locationMeta');
const iconEl = document.getElementById('icon');
const tempEl = document.getElementById('temp');
const condTextEl = document.getElementById('condText');
const lastUpdatedEl = document.getElementById('lastUpdated');
const feelsEl = document.getElementById('feels');
const windEl = document.getElementById('wind');
const humEl = document.getElementById('hum');
const presEl = document.getElementById('pres');
const precipEl = document.getElementById('precip');
const visEl = document.getElementById('vis');
const uvEl = document.getElementById('uv');
const tzEl = document.getElementById('tz');
const coordsEl = document.getElementById('coords');
const mapLink = document.getElementById('maplink');

function setLoading(on){
  if(on){
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<span class="loader" aria-hidden="true"></span> Loading';
  } else {
    sendBtn.disabled = false;
    sendBtn.textContent = 'Send';
  }
}

function showError(message){
  errorBlock.style.display = 'block';
  errorBlock.textContent = message;
}

function hideError(){
  errorBlock.style.display = 'none';
  errorBlock.textContent = '';
}

function clearData(){
  dataBlock.style.display = 'none';
  empty.style.display = 'block';
  hideError();
}

function showData(){
  dataBlock.style.display = 'block';
  empty.style.display = 'none';
  hideError();
}

async function fetchWeather(query){
  if(!API_KEY){
    throw new Error('API key not found');
  }
  const url = ENDPOINT + '?key=' + encodeURIComponent(API_KEY) + '&q=' + encodeURIComponent(query) + '&aqi=no';
  const resp = await fetch(url, { method: 'GET' });
  if(!resp.ok){
    const txt = await resp.text().catch(()=>null);
    throw new Error('Ошибка сети: ' + resp.status + ' ' + resp.statusText + (txt ? ' - ' + txt : ''));
  }
  const json = await resp.json();
  if(json && json.error){
    throw new Error(json.error.message || 'Ошибка API');
  }
  return json;
}

function populate(json){
  try{
    const loc = json.location;
    const cur = json.current;
    const lat = loc.lat;
    const lon = loc.lon;
    const gmaps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lat + ',' + lon)}`;

    // City name large and as link to Google Maps (new tab)
    cityNameEl.textContent = loc.name;
    mapLink.href = gmaps;

    locationMeta.textContent = `${loc.region ? loc.region + ', ' : ''}${loc.country} • local: ${loc.localtime}`;

    // condition icon: WeatherAPI returns "//cdn.weatherapi.com/..."
    let iconUrl = cur.condition.icon || '';
    if(iconUrl && iconUrl.startsWith('//')) iconUrl = 'https:' + iconUrl;
    iconEl.src = iconUrl;
    iconEl.alt = cur.condition.text || 'Condition';

    tempEl.textContent = `${Number(cur.temp_c).toFixed(1)}°C`;
    condTextEl.textContent = cur.condition.text || '';

    lastUpdatedEl.textContent = `Последнее обновление: ${cur.last_updated}`;

    feelsEl.textContent = `${Number(cur.feelslike_c).toFixed(1)}°C`;
    windEl.textContent = `${cur.wind_kph} kph • ${cur.wind_dir}`;
    humEl.textContent = `${cur.humidity}%`;
    presEl.textContent = `${cur.pressure_mb} mb`;
    precipEl.textContent = `${cur.precip_mm} mm`;
    visEl.textContent = `${cur.vis_km} km`;
    uvEl.textContent = `${cur.uv}`;

    tzEl.textContent = `${loc.tz_id}`;
    coordsEl.textContent = `lat ${lat.toFixed(4)}, lon ${lon.toFixed(4)}`;

    showData();
  }catch(e){
    showError('Ошибка при разборе ответа: ' + e.message);
    console.error(e);
  }
}

form.addEventListener('submit', async (ev) => {
  ev.preventDefault();
  hideError();
  const q = input.value.trim();
  if(!q) return;
  setLoading(true);
  clearData();
  try{
    const json = await fetchWeather(q);
    populate(json);
  }catch(err){
    console.error(err);
    showError(err.message || 'Неизвестная ошибка');
  }finally{
    setLoading(false);
  }
});

// allow Enter in input
input.addEventListener('keydown', (e) => {
  if(e.key === 'Enter'){
    e.preventDefault();
    form.dispatchEvent(new Event('submit', {cancelable:true}));
  }
});
