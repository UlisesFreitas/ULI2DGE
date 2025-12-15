import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Añadimos una sección para ignorar archivos y carpetas.
  {
    ignores: [
      '**/dist/**', // Ignora todas las carpetas 'dist'
      '**/node_modules/**',
    ],
  },

  eslintConfigPrettier // Prettier siempre debe ir al final.
);
