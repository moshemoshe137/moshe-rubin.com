const js = require("@eslint/js");

module.exports = [
  {
    files: ["script.js"],
    ...js.configs.recommended,
    languageOptions: {
      ...js.configs.recommended.languageOptions,
      globals: {
        document: "readonly",
        FormData: "readonly",
        fetch: "readonly",
      },
    },
  },
];
