import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierPlugin from "eslint-plugin-prettier";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    ignores: [
      '**/coverage/**',
      '**/dist/**',
      '**/migrations/**',
      '**/*.config.js',
      '**/*.config.ts',
    ],
  },
  {
    languageOptions: {
      parserOptions: {
        project: true,
      },
    },
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      "prettier/prettier": "error",
    },
  },
)
