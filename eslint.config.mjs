import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

/** Regras do site em React (Vite). Sai o preset do Next, que não se aplica mais. */
export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'pacote/**',
      // O projeto em Next anterior, guardado para consulta.
      '_antigo-next/**',
      'node_modules/**',
      '.next/**',
      'test-results/**',
      'playwright-report/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { ecmaVersion: 2022, globals: globals.browser },
    settings: { react: { version: 'detect' } },
    plugins: { react, 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    // Configuração e testes rodam no Node, não no navegador.
    files: ['*.config.{ts,mts,mjs}', 'tests/**/*.ts', 'scripts/**/*.mjs'],
    languageOptions: { globals: { ...globals.node } },
  },
);
