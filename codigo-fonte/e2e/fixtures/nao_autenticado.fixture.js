import { test as base } from '@playwright/test';

export const test = base.extend({
  papelAutenticado: async ({}, use, testInfo) => {
    const papel = testInfo.project.name.split('-')[0];
    await use(papel);
  },
  nao_autenticado: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: undefined,
      locale: 'pt-BR',
      timezoneId: 'America/Sao_Paulo',
      viewport: { width: 1280, height: 720 },
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  }
});

export { expect } from '@playwright/test';
