export const siteUrl = "https://learn.quip.network";

export interface Page {
  path: string;
  file: string;
  label: string;
  title: string;
  description: string;
  noindex?: boolean;
}

export const pages: Page[] = [
  {
    path: "/",
    file: "index.html",
    label: "Home",
    title: "Quantum Computing for Complex Systems | QUIP",
    description:
      "Explore non-linear relationships, hidden correlations, and quantum tunneling through interactive explanations of quantum computing for complex systems.",
  },
  {
    path: "/nonlinear",
    file: "nonlinear.html",
    label: "Non-Linear Relationships",
    title: "Non-Linear Relationships in Complex Systems | QUIP",
    description:
      "Explore coupled waveforms and non-linear relationships in climate, biology, and financial markets. Read explanations and research references.",
  },
  {
    path: "/hidden-correlations",
    file: "hidden-correlations.html",
    label: "Hidden Correlations",
    title: "Hidden Correlations in Complex Networks | QUIP",
    description:
      "Trace indirect correlations through a GPU supply chain and explore how quantum systems model influence across complex networks, with research references.",
  },
  {
    path: "/quantum-tunneling",
    file: "quantum-tunneling.html",
    label: "Quantum Tunneling",
    title: "Quantum Tunneling Through Optimization Barriers | QUIP",
    description:
      "Compare gradient descent with quantum tunneling, explore local minima and energy barriers, and read research on quantum approaches to optimization.",
  },
];

export const notFound: Page = {
  path: "/404.html",
  file: "404.html",
  label: "Page not found",
  title: "Page Not Found | QUIP",
  description:
    "This page does not exist. Return to the QUIP Research home page to explore quantum computing for complex systems.",
  noindex: true,
};

export function getPage(path: string): Page {
  return (
    pages.find(
      (page) =>
        page.path === path ||
        `/${page.file}` === path ||
        (page.path !== "/" && `${page.path}/` === path),
    ) ?? notFound
  );
}
