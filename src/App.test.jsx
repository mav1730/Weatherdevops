import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

jest.mock('./config', () => ({
  API_KEY: 'mocked_api_key',
  AQI_KEY: 'mocked_aqi_key',
}));

describe('Weather Forecast Dashboard', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders the search box', () => {
    render(<App />);
    const searchInput = screen.getByRole('textbox', { name: 'city' });
    expect(searchInput).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search city')).toBeInTheDocument();
  });

  test('shows an error message for an invalid city', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ message: 'city not found' }),
    });

    const user = userEvent.setup();
    render(<App />);

    const searchInput = screen.getByRole('textbox', { name: 'city' });
    const searchButton = screen.getByRole('button', { name: /search/i });

    await user.type(searchInput, 'InvalidCityName');
    await user.click(searchButton);

    const alertMessage = await screen.findByRole('alert');
    expect(alertMessage).toBeInTheDocument();
    expect(alertMessage).toHaveTextContent('City not found. Please try again.');
  });

  test('displays the temperature for a valid city', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        name: 'London',
        main: {
          temp: 18.4,
        },
      }),
    });

    const user = userEvent.setup();
    render(<App />);

    const searchInput = screen.getByRole('textbox', { name: 'city' });
    const searchButton = screen.getByRole('button', { name: /search/i });

    await user.type(searchInput, 'London');
    await user.click(searchButton);

    const tempElement = await screen.findByTestId('temp');
    expect(tempElement).toBeInTheDocument();
    expect(tempElement).toHaveTextContent('London: 18°C');
  });

  test('displays air quality index and pollutants', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        name: 'Delhi',
        main: {
          temp: 32,
        },
      }),
    });

    const user = userEvent.setup();
    render(<App />);

    const searchInput = screen.getByRole('textbox', { name: 'city' });
    const searchButton = screen.getByRole('button', { name: /search/i });

    await user.type(searchInput, 'Delhi');
    await user.click(searchButton);

    expect(await screen.findByText(/AIR QUALITY INDEX/i)).toBeInTheDocument();
    expect(screen.getByText('PM2.5')).toBeInTheDocument();
    expect(screen.getByText('PM10')).toBeInTheDocument();
    expect(screen.getByText('O₃')).toBeInTheDocument();
    expect(screen.getByText('NO₂')).toBeInTheDocument();
  });

  test('toggles temperature units between Celsius and Fahrenheit', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        name: 'London',
        main: {
          temp: 20,
        },
      }),
    });

    const user = userEvent.setup();
    render(<App />);

    const searchInput = screen.getByRole('textbox', { name: 'city' });
    const searchButton = screen.getByRole('button', { name: /search/i });

    await user.type(searchInput, 'London');
    await user.click(searchButton);

    const btnF = await screen.findByRole('button', { name: '°F' });
    const btnC = screen.getByRole('button', { name: '°C' });

    expect(btnC).toHaveClass('unit-btn-active');

    await user.click(btnF);
    expect(btnF).toHaveClass('unit-btn-active');

    await user.click(btnC);
    expect(btnC).toHaveClass('unit-btn-active');
  });

  test('displays 7 day forecast section', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        name: 'Tokyo',
        main: {
          temp: 17,
        },
      }),
    });

    const user = userEvent.setup();
    render(<App />);

    const searchInput = screen.getByRole('textbox', { name: 'city' });
    const searchButton = screen.getByRole('button', { name: /search/i });

    await user.type(searchInput, 'Tokyo');
    await user.click(searchButton);

    expect(await screen.findByText('7 Day Forecast')).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
  });
});
