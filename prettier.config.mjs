/** @type {import("prettier").Config} */
export default {
  printWidth: 100,
  semi: true,
  singleQuote: false,
  trailingComma: "all",
  arrowParens: "always",
  bracketSpacing: true,
  bracketSameLine: false,
  endOfLine: "lf",

  overrides: [
    {
      files: "*.md",
      options: { proseWrap: "preserve", printWidth: 80 },
    },
    {
      files: ["*.yml", "*.yaml"],
      options: { singleQuote: false },
    },
    {
      files: "*.json",
      options: { printWidth: 80 },
    },
  ],
};
