# Weather Forecast Dashboard & GitHub Actions CI Pipeline

A lightweight, modern, and production-ready Weather Forecast Dashboard built with **Vite** and **React** for a DevOps lab experiment. The project integrates an automated **GitHub Actions CI/CD pipeline** that runs lint checks, unit & integration tests, builds production bundles, uploads artifacts, and optionally deploys to GitHub Pages.

here uchsdiuvshfvh

## 🚀 Features

- **Framework**: Built with Vite and React (JavaScript, ES modules).
- **Weather Data**: Queries the OpenWeatherMap Current Weather API (`units=metric`) with URL-encoded city names.
- **Config & Security**: API key is managed via environment variables (`import.meta.env.VITE_WEATHER_API_KEY`) isolated in `src/config.js` to enable clean mocking and prevent secret leakage.
- **Design & UI**: Premium glassmorphism dark-mode UI housed in a single stylesheet (`src/App.css`) with smooth transitions and responsive layout.
- **Testing**: Test suite powered by Jest, `@testing-library/react`, `@testing-library/jest-dom`, and `@testing-library/user-event` with network isolation.
- **Code Quality**: ESLint Flat Config (`eslint.config.js`) configured with React and Jest globals.
- **CI/CD Automation**: Dual-job GitHub Actions workflow (`.github/workflows/ci.yml`) for continuous integration and continuous deployment.

---

## 📂 Project Structure

```text
weather/
├── .babelrc.json                # Babel config for Jest and React automatic JSX runtime
├── .env.example                 # Template for environment variables
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions CI/CD workflow pipeline
├── .gitignore                   # Excludes .env, node_modules, dist, logs
├── __mocks__/
│   └── styleMock.js             # CSS module mock for Jest
├── eslint.config.js             # ESLint flat config with Jest globals
├── index.html                   # HTML entry point with metadata
├── jest.config.cjs              # Jest config with jsdom and CSS module mapper
├── package.json                 # Project dependencies and npm scripts
├── package-lock.json            # Deterministic lockfile for reproducible npm ci
├── public/                      # Static assets
├── src/
│   ├── App.css                  # Unified styling for the dashboard
│   ├── App.jsx                  # Main dashboard component
│   ├── App.test.jsx             # Jest unit and integration tests
│   ├── config.js                # Environment variable reader for API key
│   ├── main.jsx                 # React root renderer
│   └── setupTests.js            # Extends Jest with @testing-library/jest-dom
└── vite.config.js               # Vite config with base: './' for GitHub Pages
```

---

## 🛠️ Local Setup

### 1. Prerequisites
- **Node.js**: v20 or higher (v20 LTS recommended)
- **npm**: v10 or higher

### 2. Installation
Clone the repository and install dependencies using `npm install` or `npm ci`:

```bash
git clone <repository-url>
cd weather
npm ci
```

### 3. Configure Environment Variables
Copy `.env.example` to create your local `.env` file:

```bash
cp .env.example .env
```

Open `.env` and insert your [OpenWeatherMap API Key](https://openweathermap.org/api):

```env
VITE_WEATHER_API_KEY=your_actual_api_key_here
```

> **Note**: `.env` is listed in `.gitignore` and will never be tracked or committed.

### 4. Run the Development Server
Start Vite's local dev server:

```bash
npm run dev
```

Navigate to `http://localhost:5173` to explore the dashboard.

---

## 🧪 Verification Commands

You can run the following scripts locally to verify code quality, tests, and compilation:

### Run Linter
Verifies all source and test files using ESLint:
```bash
npm run lint
```

### Run Tests
Executes the Jest test suite:
```bash
npm test
```
To run tests in non-interactive CI mode:
```bash
npm test -- --ci
```

### Build for Production
Compiles the React application into static assets in `dist/`:
```bash
npm run build
```

### Preview Production Build
Previews the production build locally:
```bash
npm run preview
```

---

## 🔄 How the CI Pipeline Works

The GitHub Actions workflow is defined in [`.github/workflows/ci.yml`](.github/workflows/ci.yml) and is triggered on **push** and **pull_request** events across all branches.

### Job 1: `build-test` (Ubuntu Latest)
Runs sequentially through the following steps:
1. **`actions/checkout@v4`**: Checks out repository code.
2. **`actions/setup-node@v4`**: Configures Node.js 20 and enables npm dependency caching.
3. **`npm ci`**: Performs a clean, reproducible installation of packages from `package-lock.json`.
4. **`npm run lint`**: Runs ESLint checks to enforce zero errors and warnings.
5. **`npm test -- --ci`**: Executes Jest test suites in CI mode with isolated mocks.
6. **`npm run build`**: Builds the static production bundle into `dist/`, injecting `VITE_WEATHER_API_KEY` from repository secrets.
7. **`actions/upload-artifact@v4`**: Archives and uploads the `dist/` directory as an artifact named `dist`.

### Job 2: `deploy` (Optional GitHub Pages Deployment)
- Runs **only** on push to the `main` branch after `build-test` completes successfully (`needs: build-test`).
- Requires `pages: write` and `id-token: write` permissions.
- Downloads the `dist` artifact and publishes it to GitHub Pages using `actions/upload-pages-artifact@v3` and `actions/deploy-pages@v4`.
- Because `base: './'` is configured in `vite.config.js`, the app works under any custom repository base path.

---

## 🔑 How to Add the `WEATHER_API_KEY` Secret in GitHub

To enable production builds and deployment in GitHub Actions:

1. Open your repository on GitHub.
2. Click **Settings** (tab at the top).
3. In the left sidebar, expand **Secrets and variables** and click **Actions**.
4. Click the **New repository secret** button.
5. In the **Name** field, enter:
   ```text
   WEATHER_API_KEY
   ```
6. In the **Secret** field, paste your OpenWeatherMap API key (e.g. `abc123def456...`).
7. Click **Add secret**.

Whenever a commit is pushed or a PR is opened, the workflow will securely access this secret in step 6 of `build-test`.
