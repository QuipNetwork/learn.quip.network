import { describe, expect, test } from "bun:test";

const origin = "https://learn.quip.network";
const pages = [
  ["/", "index.html", "Quantum Computing for Complex Systems", 0],
  ["/nonlinear", "nonlinear.html", "Non-Linear Relationships in Complex Systems", 8],
  ["/hidden-correlations", "hidden-correlations.html", "Hidden Correlations", 8],
  [
    "/quantum-tunneling",
    "quantum-tunneling.html",
    "Quantum Tunneling Through Optimization Barriers",
    13,
  ],
];

async function inspect(file) {
  const document = Bun.file(`dist/${file}`);
  expect(await document.exists(), `build must serve ${file}`).toBe(true);
  const html = await document.text();
  const nodes = {};
  const rewriter = new HTMLRewriter();
  for (const selector of [
    "title",
    "h1",
    "h2",
    'meta[name="description"]',
    'link[rel="canonical"]',
    'meta[name="robots"]',
    ".citations li",
    "img",
    'script[type="application/ld+json"]',
    "a[href]",
  ]) {
    nodes[selector] = [];
    rewriter.on(selector, {
      element(el) {
        nodes[selector].push({ attrs: Object.fromEntries(el.attributes), text: "" });
      },
      text(text) {
        nodes[selector].at(-1).text += text.text;
      },
    });
  }
  await rewriter.transform(new Response(html)).text();
  return { html, nodes };
}

describe("production search discovery", () => {
  for (const [path, file, heading, citations] of pages) {
    test(`${path} serves its article and metadata before JavaScript`, async () => {
      const { nodes } = await inspect(file);
      expect(nodes.h1).toHaveLength(1);
      expect(nodes.h1[0].text).toContain(heading);
      expect(nodes.title).toHaveLength(1);
      expect(nodes['meta[name="description"]']).toHaveLength(1);
      expect(nodes['meta[name="description"]'][0].attrs.content.length).toBeGreaterThan(50);
      expect(nodes['link[rel="canonical"]']).toHaveLength(1);
      expect(nodes['link[rel="canonical"]'][0].attrs.href).toBe(origin + path);
      expect(nodes['meta[name="robots"]'].some((el) => el.attrs.content.includes("noindex"))).toBe(
        false,
      );
      expect(nodes[".citations li"]).toHaveLength(citations);
      for (const [destination] of pages) {
        expect(nodes["a[href]"].some((el) => el.attrs.href === destination)).toBe(true);
      }
      const data = nodes['script[type="application/ld+json"]'].map((el) => JSON.parse(el.text));
      expect(data).toHaveLength(1);
      expect(data[0]["@type"]).toBe(path === "/" ? "WebSite" : "BreadcrumbList");
      expect(data[0]).not.toHaveProperty("author");
      expect(data[0]).not.toHaveProperty("datePublished");
    });
  }

  test("public pages have distinct titles and descriptions", async () => {
    const documents = await Promise.all(pages.map(([, file]) => inspect(file)));
    expect(new Set(documents.map(({ nodes }) => nodes.title[0].text)).size).toBe(pages.length);
    expect(
      new Set(documents.map(({ nodes }) => nodes['meta[name="description"]'][0].attrs.content))
        .size,
    ).toBe(pages.length);
  });

  test("sitemap lists only existing public canonical URLs", async () => {
    const index = await Bun.file("dist/sitemap-index.xml").text();
    expect(index).toContain(`${origin}/sitemap-0.xml`);
    const sitemap = await Bun.file("dist/sitemap-0.xml").text();
    expect([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]).sort()).toEqual(
      pages.map(([path]) => origin + path).sort(),
    );
    expect(sitemap).not.toContain("lastmod");
    expect(await Bun.file("dist/robots.txt").text()).toContain(`Sitemap: ${origin}/sitemap-index.xml`);
    expect(await Bun.file("dist/_redirects").text()).toContain("/sitemap.xml /sitemap-index.xml 301");
  });

  test("missing pages have a noindex error document and no catch-all success rewrite", async () => {
    const { nodes } = await inspect("404.html");
    expect(nodes.h1[0].text).toBe("Page not found");
    expect(nodes['meta[name="robots"]'][0].attrs.content).toBe("noindex");
    const redirects = await Bun.file("dist/_redirects").text();
    expect(redirects).not.toMatch(/^\/\*\s+\S+\s+200/m);
    for (const [path, file] of pages.slice(1)) {
      expect(redirects).toContain(`${path} /${file} 200`);
    }
    expect(await Bun.file("netlify.toml").text()).not.toContain('to = "/index.html"');
  });

  test("article images reserve space and retain descriptions", async () => {
    const { nodes } = await inspect("nonlinear.html");
    expect(nodes.img).toHaveLength(2);
    for (const { attrs } of nodes.img) {
      expect(attrs.alt.length).toBeGreaterThan(20);
      expect(Number(attrs.width)).toBeGreaterThan(0);
      expect(Number(attrs.height)).toBeGreaterThan(0);
      expect(attrs.src).toMatch(/\.webp$/);
      expect(await Bun.file(`dist${attrs.src}`).exists()).toBe(true);
    }
  });
});
