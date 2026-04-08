import { isDark, toggleTheme } from "./lib/dark-mode";

function el(
  tag: string,
  attrs: Record<string, string>,
  ...children: Array<string | Node>
): HTMLElement {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  for (const c of children) {
    node.append(typeof c === "string" ? document.createTextNode(c) : c);
  }
  return node;
}

function navLink(href: string, text: string): HTMLAnchorElement {
  const a = document.createElement("a");
  a.href = href;
  a.setAttribute("data-link", "");
  a.textContent = text;
  return a;
}

export function createLayout(app: HTMLElement): HTMLElement {
  // Header
  const header = el("header", { class: "site-header" });
  const headerInner = el("div", { class: "site-header-inner" });
  const logo = navLink("/", "QUIP Research");
  logo.className = "site-logo";

  const nav = el("nav", { class: "site-nav" },
    navLink("/nonlinear", "Non-Linear"),
    navLink("/hidden-correlations", "Hidden Correlations"),
    navLink("/quantum-tunneling", "Quantum Tunneling"),
  );

  const toggle = el("button", {
    class: "theme-toggle",
    "aria-label": "Toggle dark mode",
  }, isDark() ? "\u2600\uFE0F" : "\uD83C\uDF19");

  toggle.addEventListener("click", () => {
    toggleTheme();
    toggle.textContent = isDark() ? "\u2600\uFE0F" : "\uD83C\uDF19";
  });

  nav.append(toggle);
  headerInner.append(logo, nav);
  header.append(headerInner);

  // Main content
  const main = document.createElement("main");
  main.id = "page-content";

  // Footer
  const footer = el("footer", { class: "site-footer" });
  const footerInner = el("div", { class: "site-footer-inner" });
  const copy = el("span", {},
    `\u00A9 ${new Date().getFullYear()} QUIP Network`,
  );
  const footerLinks = el("div", { class: "footer-links" },
    navLink("/nonlinear", "Non-Linear"),
    navLink("/hidden-correlations", "Correlations"),
    navLink("/quantum-tunneling", "Tunneling"),
  );
  footerInner.append(copy, footerLinks);
  footer.append(footerInner);

  app.append(header, main, footer);
  return main;
}
