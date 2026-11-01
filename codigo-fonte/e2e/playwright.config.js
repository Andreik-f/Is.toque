import { defineConfig, devices } from '@playwright/test';
import env from './config/env.js';
import { obterCaminhoArmazenamentoEstado } from './config/usuarios.js';

export default defineConfig({
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: 90000,
  expect: { timeout: 10000 },
  globalSetup: './global/global-setup.js',
  use: {
    baseURL: env.baseURL,
    headless: process.env.HEADLESS === 'true',
    viewport: { width: 1280, height: 720 },
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --port 5173 --strictPort',
    cwd: env.frontDir,
    url: env.baseURL,
    reuseExistingServer: true,
    timeout: 180000,
  },
  projects: (() => {
    const papeis = [
      { nome: 'administrador', modulo: 'istoque', storageState: obterCaminhoArmazenamentoEstado('istoque', 'administrador') },
      { nome: 'gerente', modulo: 'istoque', storageState: obterCaminhoArmazenamentoEstado('istoque', 'gerente') },
      { nome: 'funcionario', modulo: 'istoque', storageState: obterCaminhoArmazenamentoEstado('istoque', 'funcionario') },
    ];
    const browsers = process.env.CI
      ? [{ name: 'chromium', device: devices['Desktop Chrome'] }]
      : [
          { name: 'chromium', device: devices['Desktop Chrome'] },
          { name: 'firefox', device: devices['Desktop Firefox'] },
          { name: 'webkit', device: devices['Desktop Safari'] },
        ];
    return papeis.flatMap(papel =>
      browsers.map(browser => ({
        name: `${papel.nome}-${browser.name}`,
        testDir: './e2e',
        use: {
          ...browser.device,
          storageState: papel.storageState,
        },
      }))
    );
  })(),
});
