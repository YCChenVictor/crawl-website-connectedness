import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierPlugin from "eslint-plugin-prettier";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  {
    ignores: [
      '**/coverage/**',
      '**/dist/**',
      '**/migrations/**',
      '**/*.config.js',
      '**/*.config.ts'
    ],
  },
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      "prettier/prettier": "error",
    },
  },
);
