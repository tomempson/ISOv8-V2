import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sanity from "@sanity/astro";

export default defineConfig({
  integrations: [
    sanity({
      projectId: "7esgb0i4",
      dataset: "production",
      useCdn: false,
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});