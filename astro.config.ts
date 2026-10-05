import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { getPage, siteUrl } from "./src/site";

export default defineConfig({
  site: siteUrl,
  output: "static",
  trailingSlash: "never",
  build: { format: "file" },
  integrations: [
    sitemap({
      serialize(item) {
        const page = getPage(new URL(item.url).pathname);
        if (page.noindex) return undefined;
        return { ...item, url: new URL(page.path, siteUrl).href };
      },
    }),
  ],
});
