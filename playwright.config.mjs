import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser',
  timeout: 120000,
  workers: 1,
  fullyParallel: false,
  reporter: [['list']],
  use: {
    headless: true,
    viewport: {width:1440,height:900},
    baseURL: 'http://127.0.0.1:4173',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    launchOptions: {args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox']},
  },
  webServer: {
    command: 'node tools/serve.mjs',
    url: 'http://127.0.0.1:4173/town/',
    reuseExistingServer: !process.env.CI,
    timeout: 15000,
  },
});
