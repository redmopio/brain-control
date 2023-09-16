/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').options & import("@ianvs/prettier-plugin-sort-imports").PrettierConfig} */
const config = {
  plugins: [
    "prettier-plugin-tailwindcss",
    "@ianvs/prettier-plugin-sort-imports",
  ],
  pluginSearchDirs: false,

  importOrder: ["<THIRD_PARTY_MODULES>", "", "^@/(.*)$", "", "^[./]"],
};

export default config;
