module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "prettier",
  ],
  plugins: ["svelte3", "@typescript-eslint"],
  overrides: [
    {
      files: ["*.svelte"],
      processor: "svelte3/svelte3",
    },
  ],
  settings: {
    "svelte3/typescript": () => require("typescript"),
  },
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2020,
  },
  env: {
    browser: true,
    es2017: true,
    node: true,
  },
  rules: {
    "no-empty-function": "off",
    "@typescript-eslint/no-empty-function": ["warn"],
    "import/newline-after-import": ["warn"],
    "import/no-unresolved": [
      "warn",
      { ignore: ["^virtual", "^\\$lib", "^\\$app", "^\\$site", "^\\/"] },
    ],
    "import/order": [
      "error",
      {
        alphabetize: { order: "asc", caseInsensitive: true },
        pathGroups: [
          { pattern: "$lib/**", group: "internal", position: "after" },
          { pattern: "$lib", group: "internal", position: "after" },
        ],
        groups: [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
          "object",
        ],
        "newlines-between": "always",
      },
    ],
  },
};
