import { defineConfig, devices } from 'playwright/test';

// The spike's own config. Its `testMatch` is not a pattern the root `bun test` or the root Playwright config collects.
export default defineConfig({
  testDir: './checks',
  testMatch: '*.check.ts',
  outputDir: './out/test-results',
  timeout: 180_000,
  workers: 3,
  // A cold Vite dev server re-optimises dependencies once and reloads the first page it serves.
  retries: 1,
  use: { baseURL: 'http://127.0.0.1:4331' },
  webServer: [
    {
      command: 'bunx vite --config vite.config.mts',
      url: 'http://127.0.0.1:4331/pages/surface.html',
      reuseExistingServer: true,
    },
    {
      // Serves `out/dist`, which `bun scripts/build.ts` writes before the checks run.
      command: 'bunx vite preview --config vite.config.mts',
      url: 'http://127.0.0.1:4332/b/pages/bundle-b.html',
      reuseExistingServer: true,
    },
  ],
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  reporter: [['list']],
});
