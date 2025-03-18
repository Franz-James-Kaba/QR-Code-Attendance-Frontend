import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";

/** @type {import('eslint').Linter.Config[]} */
export default [
  // Ignore patterns
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/coverage/**",
    ]
  },

  // General configuration
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  },

  // Basic JS and TS rules
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,

  // Common rules for all files
  {
    plugins: {
      import: importPlugin
    },
    rules: {
      // Core ESLint rules
      "no-unused-vars": "warn",
      "no-undef": "error",
      "no-undef-init": "error",
      "no-console": ["warn", { "allow": ["warn", "error"] }],

      // Import organization
      "import/order": [
        "warn",
        {
          "groups": ["builtin", "external", "internal", "parent", "sibling", "index", "object", "type"],
          "newlines-between": "always",
          "alphabetize": { "order": "asc", "caseInsensitive": true }
        }
      ],

      // TypeScript rules
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }]
    }
  },

  // Specific configuration for test files
  {
    files: ["**/*.spec.ts"],
    languageOptions: {
      globals: {
        ...globals.jest
      }
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off"
    }
  }
];
