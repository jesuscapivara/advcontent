import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import { defineConfig } from 'eslint/config'
import prettier from 'eslint-plugin-prettier/recommended'
import importPlugin from 'eslint-plugin-import'

const config = defineConfig([
  {
    ignores: ['**/*.d.ts', 'dist/**', 'node_modules/**'],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    plugins: { js, import: importPlugin },
    extends: ['js/recommended'],
    languageOptions: { globals: globals.node },
    rules: {
      'import/order': [
        'error',
        {
          groups: [
            'builtin',   // fs, path, etc.
            'external',  // lodash, react, etc.
            'internal',  // @org/*
            'parent',    // ../*
            'sibling',   // ./*
            'index',     // index.js
          ],
          pathGroups: [
            {
              pattern: '@org/**',
              group: 'internal',
              position: 'after',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',      
            caseInsensitive: true,
          },
        },
      ],
    },
  },
  tseslint.configs.recommendedTypeChecked.map((c) => ({ ...c, files: ['**/*.ts'] })),
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      "@typescript-eslint/no-unsafe-call": "off",
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: '<rootDir>',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
  },
  {
    files: ['**/*.spec.js'],
    rules: {
      'no-undef': 'off',
    },
  },
  {
    files: ['**/*.spec.ts'],
    rules: {
      '@typescript-eslint/unbound-method': 'off',
    },
  },
  prettier,
])

export { config }
