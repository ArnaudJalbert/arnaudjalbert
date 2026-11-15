import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://arnaudjalbert.com",
  i18n: {
    locales: ["en", "fr"],
    defaultLocale: "en",
    routing: {
      prefixDefaultLocale: true,
    },
  },
});
