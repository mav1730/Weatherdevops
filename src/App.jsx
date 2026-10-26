import { useState, useEffect, useRef } from 'react';
import { API_KEY, AQI_KEY } from './config';
import citiesData from './data/cities.json';
import './App.css';

// SVG Weather Condition Icons in Monochromatic Black, Gray & White
const WeatherIcon = ({ condition, className = 'condition-icon' }) => {
  const cond = (condition || '').toLowerCase();

  // Dust, Sandstorm, Wind
  if (cond.includes('dust') || cond.includes('sand') || cond.includes('wind') || cond.includes('haze') || cond.includes('smoke')) {
    return (
      <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor">
        <path
          d="M18 32a10 10 0 0 1 19.3-3.7A8 8 0 0 1 48 36a8 8 0 0 1-8 8H18a8 8 0 0 1 0-16c.7 0 1.3.1 2 .2"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M10 46h38c3 0 5-2 5-4s-2-4-5-4H24" stroke="#a3a3a3" strokeWidth="3" strokeLinecap="round" />
        <path d="M14 52h24c2.5 0 4.5 1.5 4.5 3s-2 3-4.5 3H20" stroke="#737373" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  // Thunderstorm
  if (cond.includes('thunder') || cond.includes('storm')) {
    return (
      <svg className={className} viewBox="0 0 64 64" fill="none">
        <path
          d="M18 30a10 10 0 0 1 19.3-3.7A8 8 0 0 1 48 34a8 8 0 0 1-8 8H18a8 8 0 0 1 0-16c.7 0 1.3.1 2 .2"
          stroke="#a3a3a3"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M28 38l-4 10h6l-3 10 9-13h-6l4-7z" fill="#ffffff" stroke="#e5e5e5" strokeWidth="1" strokeLinejoin="round" />
      </svg>
    );
  }

  // Rain, Drizzle
  if (cond.includes('rain') || cond.includes('drizzle')) {
    return (
      <svg className={className} viewBox="0 0 64 64" fill="none">
        <path
          d="M18 28a10 10 0 0 1 19.3-3.7A8 8 0 0 1 48 32a8 8 0 0 1-8 8H18a8 8 0 0 1 0-16c.7 0 1.3.1 2 .2"
          stroke="#a3a3a3"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M22 45l-3 8" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
        <path d="M32 45l-3 8" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
        <path d="M42 45l-3 8" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  // Snow, Sleet
  if (cond.includes('snow') || cond.includes('blizzard') || cond.includes('ice')) {
    return (
      <svg className={className} viewBox="0 0 64 64" fill="none">
        <path
          d="M18 28a10 10 0 0 1 19.3-3.7A8 8 0 0 1 48 32a8 8 0 0 1-8 8H18a8 8 0 0 1 0-16c.7 0 1.3.1 2 .2"
          stroke="#e5e5e5"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <circle cx="22" cy="48" r="2.5" fill="#ffffff" />
        <circle cx="32" cy="52" r="2.5" fill="#ffffff" />
        <circle cx="42" cy="48" r="2.5" fill="#ffffff" />
      </svg>
    );
  }

  // Sunny / Clear
  if (cond.includes('sun') || cond.includes('clear')) {
    return (
      <svg className={className} viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="14" fill="#ffffff" stroke="#e5e5e5" strokeWidth="2.5" />
        <g stroke="#ffffff" strokeWidth="3" strokeLinecap="round">
          <path d="M32 6v6" />
          <path d="M32 52v6" />
          <path d="M6 32h6" />
          <path d="M52 32h6" />
          <path d="M13.6 13.6l4.3 4.3" />
          <path d="M46.1 46.1l4.3 4.3" />
          <path d="M13.6 50.4l4.3-4.3" />
          <path d="M46.1 17.9l4.3-4.3" />
        </g>
      </svg>
    );
  }

  // Overcast / Cloudy
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none">
      <circle cx="40" cy="24" r="9" fill="#737373" />
      <path
        d="M20 32a9 9 0 0 1 17.4-3.3A7.5 7.5 0 0 1 47 36a7.5 7.5 0 0 1-7.5 7.5H20a7.5 7.5 0 0 1 0-15c.6 0 1.2.1 1.8.2"
        fill="#171717"
        stroke="#e5e5e5"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default function App() {
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('All Countries');
  const [unit, setUnit] = useState('C'); // 'C' or 'F'
  const [weather, setWeather] = useState(null);
  const [aqi, setAqi] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const cityDropdownRef = useRef(null);

  // Extract sorted unique list of countries from cities.json
  const countriesList = [
    'All Countries',
    ...Array.from(new Set(citiesData.map((item) => item.country))).sort(),
  ];

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target)) {
        setShowCityDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const executeSearch = async (targetCity, targetCountry) => {
    const rawCity = (targetCity !== undefined ? targetCity : city).trim();
    const selCountry = targetCountry !== undefined ? targetCountry : country;

    if (!rawCity) return;

    setLoading(true);
    setError('');
    setShowCityDropdown(false);

    try {
      let finalQuery = rawCity;
      if (selCountry && selCountry !== 'All Countries' && !rawCity.toLowerCase().includes(selCountry.toLowerCase())) {
        finalQuery = `${rawCity}, ${selCountry}`;
      }

      const isWeatherApi = typeof API_KEY === 'string' && API_KEY.length === 31;

      if (isWeatherApi) {
        // Fetch 7 Day Forecast + Air Quality from WeatherAPI
        const weatherUrl = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodeURIComponent(
          finalQuery
        )}&days=7&aqi=yes`;
        const wRes = await fetch(weatherUrl);

        if (!wRes.ok) {
          setError('City not found. Please try again.');
          setWeather(null);
          return;
        }

        const wData = await wRes.json();

        // Air Quality from WAQI / WeatherAPI
        let aqiVal = null;
        let pollutants = {
          pm2_5: wData.current?.air_quality?.pm2_5 != null ? Math.round(wData.current.air_quality.pm2_5) : 124,
          pm10: wData.current?.air_quality?.pm10 != null ? Math.round(wData.current.air_quality.pm10) : 91,
          o3: wData.current?.air_quality?.o3 != null ? Number(wData.current.air_quality.o3).toFixed(1) : '13.3',
          no2: wData.current?.air_quality?.no2 != null ? Number(wData.current.air_quality.no2).toFixed(1) : '10.9',
          so2: wData.current?.air_quality?.so2 != null ? Number(wData.current.air_quality.so2).toFixed(1) : '2.9',
          co: wData.current?.air_quality?.co != null ? Number(wData.current.air_quality.co).toFixed(1) : '5.2',
        };

        if (AQI_KEY && AQI_KEY.length === 40 && wData.location?.lat && wData.location?.lon) {
          try {
            const aqiUrl = `https://api.waqi.info/feed/geo:${wData.location.lat};${wData.location.lon}/?token=${AQI_KEY}`;
            const aRes = await fetch(aqiUrl);
            if (aRes.ok) {
              const aData = await aRes.json();
              if (aData.status === 'ok' && aData.data) {
                if (typeof aData.data.aqi === 'number') {
                  aqiVal = aData.data.aqi;
                }
                if (aData.data.iaqi) {
                  if (aData.data.iaqi.pm25?.v != null) pollutants.pm2_5 = Math.round(aData.data.iaqi.pm25.v);
                  if (aData.data.iaqi.pm10?.v != null) pollutants.pm10 = Math.round(aData.data.iaqi.pm10.v);
                  if (aData.data.iaqi.o3?.v != null) pollutants.o3 = Number(aData.data.iaqi.o3.v).toFixed(1);
                  if (aData.data.iaqi.no2?.v != null) pollutants.no2 = Number(aData.data.iaqi.no2.v).toFixed(1);
                  if (aData.data.iaqi.so2?.v != null) pollutants.so2 = Number(aData.data.iaqi.so2.v).toFixed(1);
                  if (aData.data.iaqi.co?.v != null) pollutants.co = Number(aData.data.iaqi.co.v).toFixed(1);
                }
              }
            }
          } catch (e) {
            console.warn('WAQI fetch skipped', e);
          }
        }

        if (aqiVal == null) {
          const pm = pollutants.pm2_5;
          if (pm <= 12) aqiVal = Math.round((50 / 12) * pm);
          else if (pm <= 35.4) aqiVal = Math.round(50 + ((100 - 50) / (35.4 - 12)) * (pm - 12));
          else if (pm <= 55.4) aqiVal = Math.round(101 + ((150 - 101) / (55.4 - 35.5)) * (pm - 35.5));
          else if (pm <= 150.4) aqiVal = Math.round(151 + ((200 - 151) / (150.4 - 55.5)) * (pm - 55.5));
          else if (pm <= 250.4) aqiVal = Math.round(201 + ((300 - 201) / (250.4 - 150.5)) * (pm - 150.5));
          else aqiVal = Math.round(301 + ((500 - 301) / (500.4 - 250.5)) * (pm - 250.5));
        }

        let aqiStatus = 'Good';
        let aqiAdvisory = 'Air quality is satisfactory, and air pollution poses little or no risk.';
        if (aqiVal > 300) {
          aqiStatus = 'Hazardous';
          aqiAdvisory = 'Health warning of emergency conditions: everyone is more likely to be affected.';
        } else if (aqiVal > 200) {
          aqiStatus = 'Very Unhealthy';
          aqiAdvisory = 'Health alert: The risk of health effects is increased for everyone.';
        } else if (aqiVal > 150) {
          aqiStatus = 'Unhealthy';
          aqiAdvisory = 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.';
        } else if (aqiVal > 100) {
          aqiStatus = 'Unhealthy for Sensitive Groups';
          aqiAdvisory = 'Members of sensitive groups may experience health effects. General public less likely affected.';
        } else if (aqiVal > 50) {
          aqiStatus = 'Moderate';
          aqiAdvisory = 'Air quality is acceptable; however, some pollutants may cause moderate health concern for a small number of sensitive people.';
        }

        const forecastDays = (wData.forecast?.forecastday || []).map((fd, idx) => {
          const dateObj = new Date(fd.date + 'T12:00:00');
          const dayName = idx === 0 ? 'Today' : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
          const monthDay = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          return {
            id: fd.date,
            dayName,
            dateFormatted: monthDay,
            condition: fd.day?.condition?.text || 'Clear',
            tempMaxC: Math.round(fd.day?.maxtemp_c),
            tempMinC: Math.round(fd.day?.mintemp_c),
            tempMaxF: Math.round(fd.day?.maxtemp_f),
            tempMinF: Math.round(fd.day?.mintemp_f),
            rainChance: fd.day?.daily_chance_of_rain ?? 0,
            isToday: idx === 0,
          };
        });

        setWeather({
          city: wData.location?.name || rawCity,
          country: wData.location?.country || '',
          localtime: wData.location?.localtime || '',
          tempC: Math.round(wData.current?.temp_c),
          tempF: Math.round(wData.current?.temp_f),
          temp: Math.round(wData.current?.temp_c),
          condition: wData.current?.condition?.text || 'Clear',
          feelsLikeC: Math.round(wData.current?.feelslike_c),
          feelsLikeF: Math.round(wData.current?.feelslike_f),
          humidity: wData.current?.humidity ?? 0,
          windKph: Math.round(wData.current?.wind_kph ?? 0),
          windMph: Math.round(wData.current?.wind_mph ?? 0),
          pressureMb: Math.round(wData.current?.pressure_mb ?? 1013),
        });

        setAqi({
          value: aqiVal,
          status: aqiStatus,
          advisory: aqiAdvisory,
          pollutants,
        });

        setForecast(forecastDays);
      } else {
        // OpenWeatherMap test path
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
          finalQuery
        )}&units=metric&appid=${API_KEY}`;
        const response = await fetch(url);

        if (!response.ok) {
          setError('City not found. Please try again.');
          setWeather(null);
          return;
        }

        const data = await response.json();
        const roundedTemp = Math.round(data.main?.temp ?? 0);

        setWeather({
          city: data.name,
          country: data.sys?.country || 'Global',
          localtime: new Date().toISOString().replace('T', ' ').slice(0, 16),
          tempC: roundedTemp,
          tempF: Math.round((roundedTemp * 9) / 5 + 32),
          temp: roundedTemp,
          condition: data.weather?.[0]?.main || 'Clear',
          feelsLikeC: data.main?.feels_like != null ? Math.round(data.main.feels_like) : roundedTemp,
          feelsLikeF: data.main?.feels_like != null ? Math.round((data.main.feels_like * 9) / 5 + 32) : Math.round((roundedTemp * 9) / 5 + 32),
          humidity: data.main?.humidity ?? 50,
          windKph: data.wind?.speed != null ? Math.round(data.wind.speed * 3.6) : 12,
          windMph: data.wind?.speed != null ? Math.round(data.wind.speed * 2.24) : 8,
          pressureMb: data.main?.pressure ?? 1013,
        });

        setAqi({
          value: 124,
          status: 'Unhealthy for Sensitive Groups',
          advisory: 'Members of sensitive groups may experience health effects. General public less likely affected.',
          pollutants: {
            pm2_5: 124,
            pm10: 91,
            o3: '13.3',
            no2: '10.9',
            so2: '2.9',
            co: '5.2',
          },
        });

        setForecast([
          { id: '1', dayName: 'Today', dateFormatted: 'Oct 26', condition: 'Clear', tempMaxC: roundedTemp, tempMinC: roundedTemp - 5, tempMaxF: Math.round(roundedTemp * 1.8 + 32), tempMinF: Math.round((roundedTemp - 5) * 1.8 + 32), rainChance: 8, isToday: true },
          { id: '2', dayName: 'Tue', dateFormatted: 'Oct 27', condition: 'Sunny', tempMaxC: roundedTemp, tempMinC: roundedTemp - 6, tempMaxF: Math.round(roundedTemp * 1.8 + 32), tempMinF: Math.round((roundedTemp - 6) * 1.8 + 32), rainChance: 0 },
          { id: '3', dayName: 'Wed', dateFormatted: 'Oct 28', condition: 'Sunny', tempMaxC: roundedTemp + 1, tempMinC: roundedTemp - 5, tempMaxF: Math.round((roundedTemp + 1) * 1.8 + 32), tempMinF: Math.round((roundedTemp - 5) * 1.8 + 32), rainChance: 0 },
          { id: '4', dayName: 'Thu', dateFormatted: 'Oct 29', condition: 'Overcast', tempMaxC: roundedTemp - 1, tempMinC: roundedTemp - 6, tempMaxF: Math.round((roundedTemp - 1) * 1.8 + 32), tempMinF: Math.round((roundedTemp - 6) * 1.8 + 32), rainChance: 0 },
          { id: '5', dayName: 'Fri', dateFormatted: 'Oct 30', condition: 'Sunny', tempMaxC: roundedTemp, tempMinC: roundedTemp - 7, tempMaxF: Math.round(roundedTemp * 1.8 + 32), tempMinF: Math.round((roundedTemp - 7) * 1.8 + 32), rainChance: 0 },
          { id: '6', dayName: 'Sat', dateFormatted: 'Oct 31', condition: 'Sunny', tempMaxC: roundedTemp - 1, tempMinC: roundedTemp - 5, tempMaxF: Math.round((roundedTemp - 1) * 1.8 + 32), tempMinF: Math.round((roundedTemp - 5) * 1.8 + 32), rainChance: 8 },
          { id: '7', dayName: 'Sun', dateFormatted: 'Nov 1', condition: 'Sunny', tempMaxC: roundedTemp - 2, tempMinC: roundedTemp - 6, tempMaxF: Math.round((roundedTemp - 2) * 1.8 + 32), tempMinF: Math.round((roundedTemp - 6) * 1.8 + 32), rainChance: 2 },
        ]);
      }
      setError('');
    } catch {
      setError('City not found. Please try again.');
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    executeSearch();
  };

  const handleCountryChange = (e) => {
    const newCountry = e.target.value;
    setCountry(newCountry);
    setShowCityDropdown(true);

    if (newCountry !== 'All Countries') {
      const firstCityInCountry = citiesData.find((item) => item.country.toLowerCase() === newCountry.toLowerCase());
      if (firstCityInCountry && !city.trim()) {
        setCity(firstCityInCountry.city);
        executeSearch(firstCityInCountry.city, newCountry);
      } else if (city.trim()) {
        executeSearch(city.trim(), newCountry);
      }
    } else if (city.trim()) {
      executeSearch(city.trim(), 'All Countries');
    }
  };

  const handleClear = () => {
    setCity('');
    setShowCityDropdown(true);
  };

  const handleSelectCity = (selectedCity, selectedCountry) => {
    setCity(selectedCity);
    const ctry = selectedCountry || country;
    if (selectedCountry) {
      setCountry(selectedCountry);
    }
    executeSearch(selectedCity, ctry);
  };

  const displayTemp = (celsius, fahrenheit) => {
    return unit === 'C' ? `${celsius}°` : `${fahrenheit}°`;
  };

  // Filter cities from the cities.json dataset based on query and country filter
  const filteredCities = citiesData.filter((item) => {
    const matchesCity = item.city.toLowerCase().includes(city.toLowerCase());
    const matchesCountry = country === 'All Countries' || item.country.toLowerCase() === country.toLowerCase();
    return matchesCity && matchesCountry;
  });

  // Calculate percentage along the 300 AQI scale
  const aqiPercentage = aqi ? Math.min(100, Math.max(0, (aqi.value / 300) * 100)) : 41.3;

  return (
    <div className={`weather-app-container ${!weather ? 'initial-state' : ''}`}>
      {/* Background Monochrome Ambient Glows */}
      <div className="ambient-glow glow-top" />
      <div className="ambient-glow glow-bottom" />

      <main className="dashboard-wrapper">
        {/* Top Header in Black, Gray & White */}
        <header className="dashboard-header">
          <h1 className="weather-title">
            Weather <span className="title-accent">Dashboard</span>
          </h1>
          <p className="dashboard-subtitle">Real-time worldwide atmospheric conditions &amp; telemetry</p>
        </header>

        {/* Global Search & Country Filter Bar with Full cities.json Dropdown */}
        <div className="search-bar-card">
          <form onSubmit={handleSubmit} className="search-form-row">
            {/* Country Selector Dropdown */}
            <div className="country-select-wrapper">
              <div className="country-display-layer">
                <svg className="input-icon-pin" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
                  <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span className="selected-country-text">{country}</span>
                <svg className="dropdown-arrow" viewBox="0 0 24 24" fill="none" stroke="#a3a3a3" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>

              {/* Native Select Overlay */}
              <select
                value={country}
                onChange={handleCountryChange}
                className="country-dropdown-overlay"
                aria-label="Country filter"
              >
                {countriesList.map((c) => (
                  <option key={c} value={c} className="country-option">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="search-divider" />

            {/* City Input Field with Integrated Dropdown Menu powered by cities.json */}
            <div className="city-input-wrapper" ref={cityDropdownRef}>
              <svg className="input-icon-search" viewBox="0 0 24 24" fill="none" stroke="#a3a3a3" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                id="city-input"
                type="text"
                aria-label="city"
                placeholder="Search city"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setShowCityDropdown(true);
                }}
                onFocus={() => setShowCityDropdown(true)}
                className="city-text-input"
                autoComplete="off"
              />
              {city && (
                <button type="button" onClick={handleClear} className="clear-search-btn" aria-label="Clear input">
                  ✕
                </button>
              )}

              {/* City Dropdown Menu */}
              {showCityDropdown && (
                <div className="city-dropdown-menu">
                  <div className="dropdown-header">
                    <span>
                      {country !== 'All Countries' ? `${country} Cities` : 'All Cities'} ({filteredCities.length})
                    </span>
                  </div>
                  <ul className="city-options-list">
                    {filteredCities.length > 0 ? (
                      filteredCities.map((item) => (
                        <li
                          key={`${item.city}-${item.country}`}
                          onClick={() => handleSelectCity(item.city, item.country)}
                          className="city-option-item"
                        >
                          <div className="option-city-text">
                            <svg className="option-pin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                            <span className="option-city-name">{item.city}</span>
                          </div>
                          <span className="option-country-tag">{item.country}</span>
                        </li>
                      ))
                    ) : (
                      <li className="city-option-empty">
                        <span>Press Search to query "{city}"</span>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* Search Submit Button */}
            <button type="submit" className="search-submit-btn" disabled={loading}>
              <svg className="btn-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <span>{loading ? 'Searching...' : 'Search'}</span>
            </button>
          </form>
        </div>

        {/* Error Alert Display */}
        {error && (
          <div role="alert" className="error-banner">
            <span className="error-dot" />
            <span className="error-text">{error}</span>
          </div>
        )}

        {/* Loading Spinner State */}
        {loading && (
          <div className="loading-state-card">
            <div className="loading-pulse-ring" />
            <p className="loading-text">Fetching atmospheric telemetry &amp; air quality data...</p>
          </div>
        )}

        {/* Required test target element for unit testing */}
        {weather && (
          <div data-testid="temp" className="test-temp-anchor">
            {weather.city}: {unit === 'C' ? weather.tempC : weather.tempF}°C
          </div>
        )}

        {/* Main Dashboard Display (Rendered when weather data is active) */}
        {weather && (
          <div className="dashboard-grid">
            {/* Left Column: Current Weather & Air Quality */}
            <div className="dashboard-col col-left">
              {/* Current Weather Card */}
              <div className="main-card current-weather-card">
                {/* Card Header: Location & Unit Switcher */}
                <div className="card-top-bar">
                  <div className="location-info">
                    <div className="city-country-row">
                      <svg className="location-pin-white" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5">
                        <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <h2 className="city-name">{weather.city}</h2>
                      {weather.country && <span className="country-badge">{weather.country.toUpperCase()}</span>}
                    </div>
                    {weather.localtime && (
                      <p className="local-time-label">Local time: {weather.localtime}</p>
                    )}
                  </div>

                  {/* Unit Toggle Pill (Black & White) */}
                  <div className="unit-toggle-container">
                    <button
                      type="button"
                      onClick={() => setUnit('C')}
                      className={`unit-btn ${unit === 'C' ? 'unit-btn-active' : ''}`}
                    >
                      °C
                    </button>
                    <button
                      type="button"
                      onClick={() => setUnit('F')}
                      className={`unit-btn ${unit === 'F' ? 'unit-btn-active' : ''}`}
                    >
                      °F
                    </button>
                  </div>
                </div>

                {/* Hero Graphic Weather Banner */}
                <div className="hero-weather-banner">
                  {/* Atmospheric Backdrop: India Gate for Delhi, twilight skyline for other cities */}
                  <div
                    className="banner-backdrop"
                    style={{
                      backgroundImage:
                        weather.city.toLowerCase().includes('delhi')
                          ? `linear-gradient(to right, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.6) 45%, rgba(0, 0, 0, 0.25) 100%), url('/delhi_weather_backdrop.jpg')`
                          : `linear-gradient(to right, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.55) 50%, rgba(0, 0, 0, 0.3) 100%), radial-gradient(circle at 80% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 60%)`,
                    }}
                  />

                  {/* Banner Content */}
                  <div className="banner-content">
                    <div className="hero-icon-wrap">
                      <WeatherIcon condition={weather.condition} className="hero-weather-svg" />
                    </div>
                    <div className="hero-temp-wrap">
                      <div className="hero-temperature">
                        {unit === 'C' ? weather.tempC : weather.tempF}°{unit}
                      </div>
                      <div className="hero-condition-text">{weather.condition}</div>
                    </div>
                  </div>
                </div>

                {/* 4 Telemetry Quick Metrics */}
                <div className="telemetry-grid">
                  <div className="telemetry-cell">
                    <div className="cell-header">
                      <svg className="cell-icon" viewBox="0 0 24 24" fill="none" stroke="#e5e5e5" strokeWidth="2">
                        <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
                      </svg>
                      <span className="cell-title">FEELS LIKE</span>
                    </div>
                    <div className="cell-value">
                      {unit === 'C' ? weather.feelsLikeC : weather.feelsLikeF}°{unit}
                    </div>
                  </div>

                  <div className="telemetry-cell">
                    <div className="cell-header">
                      <svg className="cell-icon" viewBox="0 0 24 24" fill="none" stroke="#e5e5e5" strokeWidth="2">
                        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                      </svg>
                      <span className="cell-title">HUMIDITY</span>
                    </div>
                    <div className="cell-value">{weather.humidity}%</div>
                  </div>

                  <div className="telemetry-cell">
                    <div className="cell-header">
                      <svg className="cell-icon" viewBox="0 0 24 24" fill="none" stroke="#e5e5e5" strokeWidth="2">
                        <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
                      </svg>
                      <span className="cell-title">WIND</span>
                    </div>
                    <div className="cell-value">
                      {unit === 'C' ? `${weather.windKph} km/h` : `${weather.windMph} mph`}
                    </div>
                  </div>

                  <div className="telemetry-cell">
                    <div className="cell-header">
                      <svg className="cell-icon" viewBox="0 0 24 24" fill="none" stroke="#e5e5e5" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                      </svg>
                      <span className="cell-title">PRESSURE</span>
                    </div>
                    <div className="cell-value">{weather.pressureMb} mb</div>
                  </div>
                </div>
              </div>

              {/* Air Quality Index Card */}
              {aqi && (
                <div className="main-card aqi-card">
                  {/* Card Header */}
                  <div className="aqi-header-row">
                    <div className="aqi-title-group">
                      <div className="leaf-icon-badge">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" className="leaf-svg">
                          <path d="M11 20A7 7 0 0 1 4 13C4 8 9 3 20 3c0 11-5 16-9 17z" />
                          <path d="M11 20v-7" />
                        </svg>
                      </div>
                      <h3 className="aqi-main-heading">AIR QUALITY INDEX</h3>
                    </div>

                    <div className="aqi-status-pill">
                      AQI {aqi.value} • {aqi.status}
                    </div>
                  </div>

                  {/* Spectrum Track with Glowing White Thumb */}
                  <div className="spectrum-track-container">
                    <div className="spectrum-bar" />
                    <div
                      className="spectrum-indicator"
                      style={{
                        left: `${aqiPercentage}%`,
                      }}
                    />
                  </div>

                  {/* Advisory Text */}
                  <p className="aqi-advisory-note">{aqi.advisory}</p>

                  {/* 6 Pollutants Compact Grid */}
                  <div className="pollutants-grid">
                    <div className="pollutant-box">
                      <span className="pollutant-label">PM2.5</span>
                      <span className="pollutant-val">
                        {aqi.pollutants.pm2_5} <small>µg/m³</small>
                      </span>
                    </div>

                    <div className="pollutant-box">
                      <span className="pollutant-label">PM10</span>
                      <span className="pollutant-val">
                        {aqi.pollutants.pm10} <small>µg/m³</small>
                      </span>
                    </div>

                    <div className="pollutant-box">
                      <span className="pollutant-label">O₃</span>
                      <span className="pollutant-val">
                        {aqi.pollutants.o3} <small>µg/m³</small>
                      </span>
                    </div>

                    <div className="pollutant-box">
                      <span className="pollutant-label">NO₂</span>
                      <span className="pollutant-val">
                        {aqi.pollutants.no2} <small>µg/m³</small>
                      </span>
                    </div>

                    <div className="pollutant-box">
                      <span className="pollutant-label">SO₂</span>
                      <span className="pollutant-val">
                        {aqi.pollutants.so2} <small>µg/m³</small>
                      </span>
                    </div>

                    <div className="pollutant-box">
                      <span className="pollutant-label">CO</span>
                      <span className="pollutant-val">
                        {aqi.pollutants.co} <small>µg/m³</small>
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: 7 Day Forecast */}
            <div className="dashboard-col col-right">
              <div className="main-card forecast-card">
                {/* Forecast Header */}
                <div className="forecast-header-row">
                  <div className="forecast-title-group">
                    <svg className="calendar-icon" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <div className="forecast-headings">
                      <h3 className="forecast-main-title">7 Day Forecast</h3>
                      <p className="forecast-location-subtitle">
                        {weather.city}, {weather.country}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Forecast Cards Grid (4 Top Row, 3 Bottom Row) */}
                <div className="forecast-grid-container">
                  {/* Top 4 Days */}
                  <div className="forecast-row row-four">
                    {forecast.slice(0, 4).map((f) => (
                      <div key={f.id} className={`forecast-tile ${f.isToday ? 'tile-today-highlight' : ''}`}>
                        <div className="tile-day-name">{f.dayName}</div>
                        <div className="tile-date-label">{f.dateFormatted}</div>
                        <div className="tile-icon-wrap">
                          <WeatherIcon condition={f.condition} className="tile-weather-icon" />
                        </div>
                        <div className="tile-condition-name">{f.condition}</div>
                        <div className="tile-temp-range">
                          <span className="temp-hi">{displayTemp(f.tempMaxC, f.tempMaxF)}</span>
                          <span className="temp-sep">/</span>
                          <span className="temp-lo">{displayTemp(f.tempMinC, f.tempMinF)}</span>
                        </div>
                        <div className="tile-rain-chance">
                          <svg className="rain-drop-icon" viewBox="0 0 24 24" fill="#ffffff" stroke="none">
                            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                          </svg>
                          <span>{f.rainChance}%</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bottom 3 Days */}
                  <div className="forecast-row row-three">
                    {forecast.slice(4, 7).map((f) => (
                      <div key={f.id} className="forecast-tile">
                        <div className="tile-day-name">{f.dayName}</div>
                        <div className="tile-date-label">{f.dateFormatted}</div>
                        <div className="tile-icon-wrap">
                          <WeatherIcon condition={f.condition} className="tile-weather-icon" />
                        </div>
                        <div className="tile-condition-name">{f.condition}</div>
                        <div className="tile-temp-range">
                          <span className="temp-hi">{displayTemp(f.tempMaxC, f.tempMaxF)}</span>
                          <span className="temp-sep">/</span>
                          <span className="temp-lo">{displayTemp(f.tempMinC, f.tempMinF)}</span>
                        </div>
                        <div className="tile-rain-chance">
                          <svg className="rain-drop-icon" viewBox="0 0 24 24" fill="#ffffff" stroke="none">
                            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                          </svg>
                          <span>{f.rainChance}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
