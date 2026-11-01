import { test as base } from '@playwright/test';

export const test = base.extend({
  papelAutenticado: async ({}, use, testInfo) => {
    const papel = testInfo.project.name.split('-')[0];
    await use(papel);
  }
});

export { expect } from '@playwright/test';
