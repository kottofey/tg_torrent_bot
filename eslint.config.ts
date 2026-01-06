import { defineConfig, globalIgnores } from 'eslint/config';
import importPlugin from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';

export default defineConfig(
  importPlugin.flatConfigs.typescript,
  {
    name: 'app/files-to-lint',
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,vue,tsx,jsx}'],

    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },

    settings: {
      'import-x/resolver-next': createTypeScriptImportResolver({
        alwaysTryTypes: true,
        project: './tsconfig.json',
      }),
    },
    rules: {
      'import/order': [
        'error',
        {
          groups: ['index', 'external', 'builtin', ['parent', 'sibling']],
          'newlines-between': 'always-and-inside-groups',
        },
      ],
      'import/newline-after-import': [
        'error',
        {
          count: 1,
          exactCount: true,
          considerComments: true,
        },
      ],
    },
  },
  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),
  ...tseslint.configs.recommendedTypeChecked,
);
