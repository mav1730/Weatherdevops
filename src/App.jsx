import { useState, useEffect } from 'react';
import { API_KEY } from './config';
import './App.css';

const CURATED_CITIES = ['Tokyo', 'London', 'New York', 'Paris', 'Zürich', 'Reykjavík'];

// Custom hairline geometric architectural icons
function WeatherIcon({ condition }) {
  const cond = (condition || '').toLowerCase();

  if (cond.includes('rain') || cond.includes('drizzle')) {
    return (
      <svg className="editorial-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M18 36a14 14 0 0 1 26.6-4.6A11 11 0 0 1 52 42a10 10 0 0 1-10 10H18A12 12 0 0 1 18 36z" strokeLinejoin="round" />
        <line x1="22" y1="56" x2="18" y2="64" strokeLinecap="round" strokeDasharray="3 3" />
        <line x1="32" y1="56" x2="28" y2="64" strokeLinecap="round" strokeDasharray="3 3" />
        <line x1="42" y1="56" x2="38" y2="64" strokeLinecap="round" strokeDasharray="3 3" />
      </svg>
    );
  }

  if (cond.includes('cloud')) {
    return (
      <svg className="editorial-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M18 38a14 14 0 0 1 26.6-4.6A11 11 0 0 1 52 44a10 10 0 0 1-10 10H18A12 12 0 0 1 18 38z" strokeLinejoin="round" />
        <path d="M22 24a10 10 0 0 1 18.5-3.5" strokeLinecap="round" strokeDasharray="2 3" opacity="0.6" />
      </svg>
    );
  }

  if (cond.includes('snow')) {
    return (
      <svg className="editorial-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.75">
        <line x1="32" y1="12" x2="32" y2="52" strokeLinecap="round" />
        <line x1="12" y1="32" x2="52" y2="32" strokeLinecap="round" />
        <line x1="18" y1="18" x2="46" y2="46" strokeLinecap="round" />
        <line x1="18" y1="46" x2="46" y2="18" strokeLinecap="round" />
        <circle cx="32" cy="32" r="3" fill="currentColor" />
      </svg>
    );
  }

  if (cond.includes('thunder')) {
    return (
      <svg className="editorial-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M18 32a13 13 0 0 1 24.8-4A10 10 0 0 1 50 38a9 9 0 0 1-9 9H18A11 11 0 0 1 18 32z" strokeLinejoin="round" />
        <polygon points="30 42 24 54 33 54 28 66 42 50 33 50 38 42" fill="currentColor" opacity="0.8" />
      </svg>
    );
  }

  // Default / Clear Sun
  return (
    <svg className="editorial-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.75">
      <circle cx="32" cy="32" r="13" />
      <line x1="32" y1="6" x2="32" y2="13" strokeLinecap="round" />
      <line x1="32" y1="51" x2="32" y2="58" strokeLinecap="round" />
      <line x1="6" y1="32" x2="13" y2="32" strokeLinecap="round" />
      <line x1="51" y1="32" x2="58" y2="32" strokeLinecap="round" />
      <line x1="13.6" y1="13.6" x2="18.5" y2="18.5" strokeLinecap="round" />
      <line x1="45.5" y1="45.5" x2="50.4" y2="50.4" strokeLinecap="round" />
      <line x1="13.6" y1="50.4" x2="18.5" y2="45.5" strokeLinecap="round" />
      <line x1="45.5" y1="18.5" x2="50.4" y2="13.6" strokeLinecap="round" />
    </svg>
  );
}

export default function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [clock, setClock] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setClock(
        now.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZoneName: 'short',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const executeSearch = async (targetCity) => {
    const query = (targetCity || city).trim();
    if (!query) return;

    setLoading(true);
    setError('');
    setWeather(null);

    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        query
      )}&units=metric&appid=${API_KEY}`;
      const response = await fetch(url);

      if (!response.ok) {
        setError('City not found. Please try again.');
        setWeather(null);
        return;
      }

      const data = await response.json();
      const roundedTemp = Math.round(data.main.temp);

      setWeather({
        city: data.name,
        temp: roundedTemp,
        country: data.sys?.country || '',
        condition: data.weather?.[0]?.main || 'Clear',
        description: data.weather?.[0]?.description || 'Clear sky',
        feelsLike: data.main?.feels_like != null ? Math.round(data.main.feels_like) : null,
        tempMin: data.main?.temp_min != null ? Math.round(data.main.temp_min) : null,
        tempMax: data.main?.temp_max != null ? Math.round(data.main.temp_max) : null,
        humidity: data.main?.humidity ?? null,
        pressure: data.main?.pressure ?? null,
        windSpeed: data.wind?.speed != null ? Math.round(data.wind.speed * 3.6) : null, // km/h
        windDeg: data.wind?.deg ?? null,
        visibility: data.visibility != null ? (data.visibility / 1000).toFixed(1) : null, // km
        clouds: data.clouds?.all ?? null,
        coord: data.coord ? `${data.coord.lat.toFixed(2)}°N, ${data.coord.lon.toFixed(2)}°E` : null,
        sunrise: data.sys?.sunrise
          ? new Date(data.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : null,
        sunset: data.sys?.sunset
          ? new Date(data.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : null,
      });

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

  const handleQuickSelect = (selectedCity) => {
    setCity(selectedCity);
    executeSearch(selectedCity);
  };

  const handleCopy = () => {
    if (!weather) return;
    const summary = `${weather.city}, ${weather.country || 'Global'} — ${weather.temp}°C (${weather.condition}). Humidity: ${weather.humidity ?? 'N/A'}%, Wind: ${weather.windSpeed ?? 'N/A'} km/h, Pressure: ${weather.pressure ?? 'N/A'} hPa.`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="editorial-canvas">
      {/* Editorial Grain Overlay */}
      <div className="grain-layer" />

      <main className="editorial-layout">
        {/* Masthead Header */}
        <header className="editorial-masthead">
          <div className="masthead-meta">
            <span className="brandmark">
              <span className="brandmark-square" /> ATMOS / ED. 26
            </span>
            <div className="masthead-indicators">
              <span className="status-live">
                <span className="live-dot" /> REAL-TIME OBSERVATORY
              </span>
              <span className="time-display">{clock}</span>
            </div>
          </div>

          <div className="masthead-title-wrap">
            <h1 className="weather-title">Weather Forecast Dashboard</h1>
            <p className="masthead-tagline">
              Curated global atmospheric readings & precision micro-climatic metrics.
            </p>
          </div>
        </header>

        {/* Search Architecture */}
        <section className="search-section">
          <form onSubmit={handleSubmit} className="search-form">
            <div className="search-input-container">
              <span className="search-symbol">↗</span>
              <input
                id="city-input"
                type="text"
                aria-label="city"
                placeholder="Search city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="search-input"
                autoComplete="off"
                spellCheck="false"
              />
              {city && (
                <button
                  type="button"
                  className="clear-btn"
                  onClick={() => setCity('')}
                  aria-label="Clear city input"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="submit"
              className="search-button"
              disabled={loading}
            >
              {loading ? (
                <span className="btn-inner loading">
                  <span className="minimal-spinner" /> Fetching
                </span>
              ) : (
                <span className="btn-inner">
                  Search <span className="btn-arrow">→</span>
                </span>
              )}
            </button>
          </form>

          {/* Curated City Index */}
          <div className="curated-cities-row">
            <span className="curated-label">INDEX:</span>
            <div className="curated-pills">
              {CURATED_CITIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="curated-pill"
                  onClick={() => handleQuickSelect(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Display Output Area */}
        <section className="output-area">
          {error && (
            <div role="alert" className="editorial-alert">
              <span className="alert-bullet" />
              <div className="alert-copy">
                <span className="alert-eyebrow">NOTICE</span>
                <p className="alert-message">{error}</p>
              </div>
            </div>
          )}

          {weather && (
            <div className="weather-dossier">
              {/* Hero Reading Banner */}
              <div className="dossier-hero">
                <div className="hero-typography">
                  <div className="location-eyebrow">
                    <span>{weather.country ? `${weather.country} / ` : ''}OBSERVATION RECORD</span>
                    {weather.coord && <span className="coord-tag">{weather.coord}</span>}
                  </div>

                  {/* Required element for test suite */}
                  <div data-testid="temp" className="temp-display">
                    {weather.city}: {weather.temp}°C
                  </div>

                  <div className="condition-descriptor">
                    <span className="condition-state">{weather.condition}</span>
                    <span className="condition-sep">—</span>
                    <span className="condition-note">{weather.description}</span>
                  </div>
                </div>

                <div className="hero-visual">
                  <div className="icon-frame">
                    <WeatherIcon condition={weather.condition} />
                  </div>
                  {weather.feelsLike != null && (
                    <div className="feels-chip">
                      Apparent: <strong>{weather.feelsLike}°C</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Architectural Metric Ledger */}
              <div className="spec-ledger">
                <div className="ledger-header">
                  <span>METEOROLOGICAL SPECIFICATIONS</span>
                  <span className="ledger-index">REF // 02.26</span>
                </div>

                <div className="ledger-grid">
                  {/* Item 01 */}
                  <div className="spec-cell">
                    <span className="cell-num">01 / WIND</span>
                    <span className="cell-value">
                      {weather.windSpeed != null ? `${weather.windSpeed} km/h` : '—'}
                    </span>
                    <span className="cell-sub">
                      {weather.windDeg != null ? `Bearing ${weather.windDeg}°` : 'Surface Velocity'}
                    </span>
                  </div>

                  {/* Item 02 */}
                  <div className="spec-cell">
                    <span className="cell-num">02 / HUMIDITY</span>
                    <span className="cell-value">
                      {weather.humidity != null ? `${weather.humidity}%` : '—'}
                    </span>
                    <span className="cell-sub">Relative Saturation</span>
                  </div>

                  {/* Item 03 */}
                  <div className="spec-cell">
                    <span className="cell-num">03 / PRESSURE</span>
                    <span className="cell-value">
                      {weather.pressure != null ? `${weather.pressure} hPa` : '—'}
                    </span>
                    <span className="cell-sub">Sea-Level Barometric</span>
                  </div>

                  {/* Item 04 */}
                  <div className="spec-cell">
                    <span className="cell-num">04 / VISIBILITY</span>
                    <span className="cell-value">
                      {weather.visibility != null ? `${weather.visibility} km` : '—'}
                    </span>
                    <span className="cell-sub">Horizontal Distance</span>
                  </div>

                  {/* Item 05 */}
                  <div className="spec-cell">
                    <span className="cell-num">05 / CLOUD COVER</span>
                    <span className="cell-value">
                      {weather.clouds != null ? `${weather.clouds}%` : '—'}
                    </span>
                    <span className="cell-sub">Sky Obscuration</span>
                  </div>

                  {/* Item 06 */}
                  <div className="spec-cell">
                    <span className="cell-num">06 / DAYLIGHT</span>
                    <span className="cell-value spec-solar">
                      {weather.sunrise ? `${weather.sunrise} ↑  ${weather.sunset || ''} ↓` : '—'}
                    </span>
                    <span className="cell-sub">Solar Horizon Horizon</span>
                  </div>
                </div>
              </div>

              {/* Footer Utilities */}
              <div className="dossier-footer">
                <button
                  type="button"
                  className="dossier-action-btn"
                  onClick={handleCopy}
                >
                  {copied ? '✓ COPIED TO CLIPBOARD' : 'SHARE DOSSIER'}
                </button>
                <button
                  type="button"
                  className="dossier-action-btn"
                  onClick={() => executeSearch(weather.city)}
                >
                  REFRESH READING
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Colophon / Studio Credit */}
        <footer className="editorial-colophon">
          <div className="colophon-left">
            <span>ATMOS STUDIO</span>
            <span className="colophon-divider">/</span>
            <span>OPENWEATHERMAP ENGINE</span>
          </div>
          <div className="colophon-right">
            <span>HELVETICA &amp; GROTESK SPEC</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
