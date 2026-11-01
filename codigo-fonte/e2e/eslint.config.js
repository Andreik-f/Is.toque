module.exports = [
  {
    ignores: ['node_modules/**', '_backup_testes_antigos/**', 'playwright-report/**', 'test-results/**', 'docs-referencia-e2e/**'],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    rules: {
      semi: ['error', 'always'],
    },
  },
];
