import { defineConfig } from "vite";
import { readFileSync } from "node:fs";
import { renderHead, renderLayout } from "./src/layout";
import { getPage, notFound, pages, siteUrl } from "./src/site";
import type { Page } from "./src/site";

function renderPage(html: string, page: Page): string {
  const content = readFileSync(
    new URL(`./src/pages/${page.content}/content.html`, import.meta.url),
    "utf8",
  );
  return html
    .replace("<!--page-head-->", renderHead(page))
    .replace("<!--page-body-->", renderLayout(page, content));
}

export default defineConfig({
  appType: "mpa",
  plugins: [
    {
      name: "static-public-pages",
      enforce: "post",
      configureServer(server) {
        server.middlewares.use((request, _response, next) => {
          const path = new URL(request.url ?? "/", siteUrl).pathname;
          if (!getPage(path).noindex) request.url = "/index.html";
          next();
        });
      },
      transformIndexHtml(html, context) {
        if (!context.server) return html;
        return renderPage(
          html,
          getPage(new URL(context.originalUrl ?? context.path, siteUrl).pathname),
        );
      },
      generateBundle(_options, bundle) {
        const template = bundle["index.html"];
        if (!template || template.type !== "asset" || typeof template.source !== "string") {
          throw new Error("Vite did not emit the HTML template");
        }
        const html = template.source;
        for (const page of [...pages, notFound]) {
          const source = renderPage(html, page);
          if (page.path === "/") template.source = source;
          else this.emitFile({ type: "asset", fileName: page.file, source });
        }
        this.emitFile({
          type: "asset",
          fileName: "sitemap.xml",
          source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map((page) => `  <url><loc>${siteUrl}${page.path}</loc></url>`).join("\n")}\n</urlset>\n`,
        });
      },
    },
  ],
  build: {
    target: "es2022",
    outDir: "dist",
  },
});
