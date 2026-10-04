import { siteUrl } from "./site";
import type { Page } from "./site";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function renderHead(page: Page): string {
  const canonical = siteUrl + page.path;
  const data =
    page.path === "/"
      ? {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "QUIP Research",
          url: canonical,
        }
      : {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: siteUrl + "/" },
            { "@type": "ListItem", position: 2, name: page.label, item: canonical },
          ],
        };
  return `
    <title data-seo>${escapeHtml(page.title)}</title>
    <meta data-seo name="description" content="${escapeHtml(page.description)}">
    <link data-seo rel="canonical" href="${escapeHtml(canonical)}">
    ${page.noindex ? '<meta data-seo name="robots" content="noindex">' : `<script data-seo type="application/ld+json">${JSON.stringify(data).replaceAll("<", "\\u003c")}</script>`}
  `;
}

export function renderBreadcrumbs(page: Page): string {
  if (page.path === "/" || page.noindex) return "";
  return `<nav class="breadcrumbs" aria-label="Breadcrumb"><ol>
    <li><a href="/" data-link>Home</a></li>
    <li aria-current="page">${escapeHtml(page.label)}</li>
  </ol></nav>`;
}

export function renderLayout(page: Page, content: string): string {
  return `
    <header class="site-header"><div class="site-header-inner">
      <a href="/" data-link class="site-logo">QUIP Research</a>
      <nav class="site-nav" aria-label="Main navigation">
        <a href="/nonlinear" data-link>Non-Linear</a>
        <a href="/hidden-correlations" data-link>Hidden Correlations</a>
        <a href="/quantum-tunneling" data-link>Quantum Tunneling</a>
        <button class="theme-toggle" aria-label="Toggle dark mode" hidden>🌙</button>
      </nav>
    </div></header>
    <main id="page-content">${renderBreadcrumbs(page)}${content}</main>
    <footer class="site-footer"><div class="site-footer-inner">
      <span>© ${new Date().getFullYear()} QUIP Network</span>
      <div class="footer-links">
        <a href="/nonlinear" data-link>Non-Linear</a>
        <a href="/hidden-correlations" data-link>Correlations</a>
        <a href="/quantum-tunneling" data-link>Tunneling</a>
      </div>
    </div></footer>
  `;
}
