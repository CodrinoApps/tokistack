// @ts-check

import eslint from "@eslint/js";
import angular from "angular-eslint";
import eslintPluginJest from "eslint-plugin-jest";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  {
    ignores: [
      "**/node_modules/*",
      "**/dist/*",
      "**/build/*",
      "**/coverage/*",
      "**/jest.config.js",
      "**/.gitignore",
      ".github/workflows/*",
      "apps/e2e/playwright-report/*",
      "apps/e2e/test-results/*",
      ".changelog.config.cjs",
    ],
  },
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
    ],
    rules: {
      "no-console": "error",
    },
  },
  {
    files: ["apps/api/**/*.ts", "apps/migrator/**/*.ts", "packages/**/*.ts", "infrastructure/**/*.ts"],
    plugins: {
      jest: eslintPluginJest,
    },
    rules: {
      "jest/no-disabled-tests": "warn",
      "jest/no-focused-tests": "error",
      "jest/no-identical-title": "error",
    },
  },
  {
    files: ["apps/web/**/*.ts"],
    extends: [
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
  },
  {
    files: ["apps/web/**/*.html"],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
  },
);
