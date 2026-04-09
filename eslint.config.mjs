export default [
  {
    ignores: ["index.html", "styles.css"],
  },
  {
    files: ["script.js"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "script",
      globals: {
        document: "readonly",
      },
    },
    rules: {},
  },
];
