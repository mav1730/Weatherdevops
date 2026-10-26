import { useState } from 'react';
import { API_KEY } from './config';
import './App.css';

export default function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const query = city.trim();
    if (!query) {
      return;
    }

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
      setWeather({
        city: data.name,
        temp: Math.round(data.main.temp),
      });
      setError('');
    } catch {
      setError('City not found. Please try again.');
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="weather-container">
      <div className="weather-card">
        <h1 className="weather-title">Weather Forecast Dashboard</h1>
        <form onSubmit={handleSubmit} className="search-form">
          <input
            id="city-input"
            type="text"
            aria-label="city"
            placeholder="Search city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        <div className="output-area">
          {error && (
            <p role="alert" className="error-message">
              {error}
            </p>
          )}

          {weather && (
            <div data-testid="temp" className="temp-display">
              {weather.city}: {weather.temp}°C
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
