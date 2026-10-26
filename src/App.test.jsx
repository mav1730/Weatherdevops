import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

jest.mock('./config', () => ({
  API_KEY: 'mocked_api_key',
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
});
