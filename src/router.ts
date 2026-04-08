type MountFn = (container: HTMLElement) => (() => void) | void;

interface Route {
  path: string;
  mount: MountFn;
}

let routes: Route[] = [];
let cleanup: (() => void) | void;
let container: HTMLElement;

export function registerRoutes(
  el: HTMLElement,
  routeList: Route[],
): void {
  container = el;
  routes = routeList;

  document.addEventListener("click", (e) => {
    const link = (e.target as HTMLElement).closest<HTMLAnchorElement>(
      "a[data-link]",
    );
    if (!link) return;
    e.preventDefault();
    const href = link.getAttribute("href");
    if (href && href !== location.pathname) {
      history.pushState(null, "", href);
      navigate();
    }
  });

  window.addEventListener("popstate", navigate);
  navigate();
}

function navigate(): void {
  if (cleanup) {
    cleanup();
    cleanup = undefined;
  }

  const path = location.pathname;
  const route = routes.find((r) => r.path === path) ?? routes[0];

  if (!route) return;

  container.innerHTML = "";
  cleanup = route.mount(container);

  document.querySelectorAll<HTMLAnchorElement>(".site-nav a[data-link]")
    .forEach((a) => {
      a.classList.toggle("active", a.getAttribute("href") === path);
    });

  window.scrollTo(0, 0);
}

export function navigateTo(path: string): void {
  if (path !== location.pathname) {
    history.pushState(null, "", path);
    navigate();
  }
}
