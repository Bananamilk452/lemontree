/** @type {import("prettier").Config} */
export default {
  plugins: [
    "prettier-plugin-tailwindcss",
    "@ianvs/prettier-plugin-sort-imports",
  ],
  importOrder: [
    "^~/hooks/(.*)$",
    "",
    "^~/lib/(.*)$",
    "",
    "^~/components/(.*)$",
    "",
    "^[./]",
  ],
};
