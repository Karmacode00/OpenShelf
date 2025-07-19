// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const pluginPrettier = require('eslint-plugin-prettier');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
    plugins: {
      prettier: pluginPrettier,
    },
    rules: {
      'prettier/prettier': 'error',
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', ['internal', 'parent', 'sibling', 'index']],
          pathGroups: [
            {
              pattern: '@/**',
              group: 'internal',
              position: 'after',
            },
            {
              pattern: '@components',
              group: 'internal',
              position: 'after',
            },
            {
              pattern: '@constants',
              group: 'internal',
              position: 'after',
            },
            {
              pattern: '@hooks',
              group: 'internal',
              position: 'after',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
          'newlines-between': 'always',
        },
      ],
    },
  },
]);
