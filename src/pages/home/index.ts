export function mountHome(container: HTMLElement): void {
  const page = document.createElement("div");
  page.className = "home-page";

  const title = document.createElement("h1");
  title.className = "page-title";
  title.textContent = "Quantum Computing in Finance";

  const subtitle = document.createElement("p");
  subtitle.className = "page-subtitle";
  subtitle.textContent =
    "Interactive explorations of why quantum computers offer" +
    " structural advantages for financial modeling";

  const intro = document.createElement("div");
  intro.className = "section-body";
  const p1 = document.createElement("p");
  p1.textContent =
    "Financial systems exhibit three properties that make them " +
    "fundamentally difficult for classical computers: non-linear " +
    "coupling between variables, indirect correlations that propagate " +
    "through multi-hop networks, and rugged optimization landscapes " +
    "with exponentially many local minima. Each of these properties " +
    "maps to a capability where quantum systems have a structural " +
    "advantage over classical hardware.";
  const p2 = document.createElement("p");
  p2.textContent =
    "The three interactive explainers below illustrate these " +
    "properties, explain the underlying mathematics, and connect them " +
    "to peer-reviewed research on quantum approaches to financial " +
    "computation.";
  intro.append(p1, p2);

  const grid = document.createElement("div");
  grid.className = "card-grid";

  const cards: Array<{
    href: string;
    color: string;
    title: string;
    desc: string;
  }> = [
    {
      href: "/nonlinear",
      color: "var(--color-primary)",
      title: "Non-Linear Relationships",
      desc:
        "Why linear models break down in coupled systems \u2014 from " +
        "climate tipping points to financial crises \u2014 and how " +
        "quantum systems model them.",
    },
    {
      href: "/hidden-correlations",
      color: "var(--color-teal)",
      title: "Hidden Correlations",
      desc:
        "How influence propagates through intermediaries in financial " +
        "networks, invisible to pairwise analysis.",
    },
    {
      href: "/quantum-tunneling",
      color: "var(--color-coral)",
      title: "Quantum Tunneling",
      desc:
        "How quantum systems escape local minima that trap classical " +
        "optimization solvers.",
    },
  ];

  for (const card of cards) {
    const a = document.createElement("a");
    a.href = card.href;
    a.setAttribute("data-link", "");
    a.className = "card";
    a.style.borderTopColor = card.color;

    const h2 = document.createElement("h2");
    h2.textContent = card.title;

    const desc = document.createElement("p");
    desc.textContent = card.desc;

    const arrow = document.createElement("span");
    arrow.className = "card-arrow";
    arrow.textContent = "\u2192";
    arrow.style.color = card.color;

    a.append(h2, desc, arrow);
    grid.append(a);
  }

  page.append(title, subtitle, intro, grid);
  container.append(page);
}
