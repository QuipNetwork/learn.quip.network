import { renderBreadcrumbs, renderHead } from "./layout";
import { getPage } from "./site";

type MountFn = (container: HTMLElement) => (() => void) | void;

interface Route {
  path: string;
  mount: MountFn;
}

let routes: Route[] = [];
let cleanup: (() => void) | void;
let container: HTMLElement;

export function registerRoutes(el: HTMLElement, routeList: Route[]): void {
  container = el;
  routes = routeList;

  document.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
      return;
    const link = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[data-link]");
    if (!link || link.hasAttribute("download") || (link.target && link.target !== "_self")) return;
    const url = new URL(link.href);
    if (url.origin !== location.origin || !routes.some((route) => route.path === url.pathname))
      return;
    e.preventDefault();
    const href = link.getAttribute("href");
    if (href && href !== location.pathname) {
      history.pushState(null, "", href);
      navigate();
    }
  });

  window.addEventListener("popstate", () => navigate());
  navigate(true);
}

function navigate(initial = false): void {
  if (cleanup) {
    cleanup();
    cleanup = undefined;
  }

  const path = location.pathname;
  const page = getPage(path);
  const route = routes.find((r) => r.path === page.path);

  if (!route) return;

  if (!initial) {
    container.innerHTML = renderBreadcrumbs(page);
    document.head.querySelectorAll("[data-seo]").forEach((node) => node.remove());
    document.head.insertAdjacentHTML("beforeend", renderHead(page));
  }
  cleanup = route.mount(container);

  document.querySelectorAll<HTMLAnchorElement>(".site-nav a[data-link]").forEach((a) => {
    const active = a.getAttribute("href") === page.path;
    a.classList.toggle("active", active);
    if (active) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });

  if (location.hash) {
    document.getElementById(location.hash.slice(1))?.scrollIntoView();
  } else {
    window.scrollTo(0, 0);
  }
}

export function navigateTo(path: string): void {
  if (path !== location.pathname) {
    history.pushState(null, "", path);
    navigate();
  }
}
