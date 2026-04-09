function p(text: string): HTMLParagraphElement {
  const el = document.createElement("p");
  el.textContent = text;
  return el;
}

function figure(src: string, alt: string, caption: string): HTMLElement {
  const fig = document.createElement("figure");
  fig.style.cssText =
    "margin:var(--spacing-lg) 0;border:1px solid var(--color-border);" +
    "border-radius:var(--radius);overflow:hidden";

  const img = document.createElement("img");
  img.src = src;
  img.alt = alt;
  img.style.cssText = "width:100%;display:block";

  const cap = document.createElement("figcaption");
  cap.textContent = caption;
  cap.style.cssText =
    "font-size:0.8125rem;color:var(--color-text-secondary);" +
    "padding:var(--spacing-sm) var(--spacing-md);background:var(--color-card)";

  fig.append(img, cap);
  return fig;
}

function sectionTitle(text: string): HTMLHeadingElement {
  const h2 = document.createElement("h2");
  h2.className = "section-title";
  h2.textContent = text;
  return h2;
}

function sectionBody(...children: HTMLElement[]): HTMLDivElement {
  const div = document.createElement("div");
  div.className = "section-body";
  div.append(...children);
  return div;
}

export function createNonlinearContent(): HTMLElement {
  const root = document.createElement("div");

  // --- Title & subtitle ---
  const title = document.createElement("h1");
  title.className = "page-title";
  title.textContent = "Non-Linear Relationships in Complex Systems";

  const subtitle = document.createElement("p");
  subtitle.className = "page-subtitle";
  subtitle.textContent =
    "Why linear models break down in coupled systems, and what " +
    "quantum computers offer";

  // --- Introduction ---
  const intro = sectionBody(
    p(
      "A linear relationship means that a change in one variable " +
        "produces a proportional change in another: double the input, " +
        "double the output. Most real-world systems violate this " +
        "assumption. Weather patterns, biological networks, financial " +
        "markets, and particle interactions all exhibit non-linear " +
        "coupling where small perturbations can cascade into dramatic, " +
        "disproportionate effects. When multiple non-linear variables " +
        "interact, the combined system diverges sharply from any linear " +
        "approximation \u2014 and the computational cost of modeling " +
        "these interactions grows exponentially.",
    ),
    p(
      "This page illustrates what non-linearity looks like in " +
        "coupled systems, explains why modeling it is computationally " +
        "intractable for classical hardware, and describes how quantum " +
        "systems address this through superposition and entanglement. " +
        "The interactive visualization uses coupled waveforms as a " +
        "concrete example, but the underlying dynamics apply to any " +
        "domain with coupled non-linear variables.",
    ),
  );

  // --- What Is a Non-Linear Relationship? ---
  const whatIsTitle = sectionTitle("What Is a Non-Linear Relationship?");
  const whatIsBody = sectionBody(
    p(
      "A function f is linear if f(ax + by) = af(x) + bf(y). Any " +
        "function that violates this property is non-linear. In a " +
        "linear system, the combined effect of two inputs equals the " +
        "sum of their individual effects. In a non-linear system, " +
        "inputs interact: the effect of A depends on the current state " +
        "of B. This coupling means the system cannot be decomposed " +
        "into independent parts and analyzed separately.",
    ),
    p(
      "The visualization below uses coupled waveforms as an analogy. " +
        "Each wave represents a variable in a coupled system. When " +
        "coupling is zero, each wave evolves independently and the " +
        "system is linear \u2014 the combined result is a predictable " +
        "superposition. As coupling increases, each wave\u2019s " +
        "behavior depends on the square of the driving signal, " +
        "creating feedback loops where small phase shifts produce " +
        "constructive interference (amplification by orders of " +
        "magnitude) or destructive interference (amplitude collapse). " +
        "The perturbation control adds an external shock, analogous " +
        "to a sudden stimulus that propagates non-linearly through " +
        "the system.",
    ),
    figure(
      "/nonlinear-dynamics.jpg",
      "Diagram comparing linear regime (independent superposition, " +
        "predictable sum) with non-linear regime (coupled interactions " +
        "producing constructive amplification or destructive collapse)",
      "Linear regime: waveforms combine predictably via superposition. " +
        "Non-linear regime: coupling between signals produces " +
        "amplification or collapse depending on phase relationships.",
    ),
  );

  // --- Where Non-Linearity Matters ---
  const domainsTitle = sectionTitle(
    "Where Non-Linearity Matters",
  );
  const domainsBody = sectionBody(
    p(
      "Non-linear dynamics appear across virtually every scientific " +
        "and engineering domain. In climate science, small changes in " +
        "atmospheric CO\u2082 concentration trigger non-linear feedback " +
        "loops: ice-albedo feedback, water vapor amplification, and " +
        "cloud formation dynamics interact to produce climate " +
        "sensitivity that cannot be predicted by any linear model. " +
        "Lorenz\u2019s foundational work on deterministic chaos showed " +
        "that even simple non-linear atmospheric models exhibit " +
        "sensitive dependence on initial conditions \u2014 the " +
        "\u201Cbutterfly effect\u201D [1].",
    ),
    p(
      "In biology, gene regulatory networks are inherently " +
        "non-linear: transcription factors activate or repress genes " +
        "in switch-like, sigmoidal patterns that create bistable " +
        "states, oscillations, and emergent behavior that cannot be " +
        "captured by linear differential equations [2]. Epidemiological " +
        "models exhibit non-linear transmission dynamics where the " +
        "effective reproduction number depends on population immunity, " +
        "behavioral changes, and network structure simultaneously. " +
        "Materials science contends with non-linear stress-strain " +
        "relationships, phase transitions, and turbulence in fluid " +
        "dynamics \u2014 problems where classical simulation requires " +
        "exponentially fine discretization to capture the relevant " +
        "physics [3].",
    ),
    p(
      "In finance, non-linearity manifests through convexity in bond " +
        "pricing, threshold effects in credit default, and regime-" +
        "switching dynamics where correlations between assets change " +
        "discontinuously during crises. During the 2008 financial " +
        "crisis, the Gaussian copula model assumed linear correlations " +
        "between mortgage default rates; when defaults correlated " +
        "non-linearly across regions, losses cascaded through the " +
        "entire securitization structure [4, 5].",
    ),
    p(
      "Across all these domains, the pattern is the same: models " +
        "that assume linearity fail precisely when accuracy matters " +
        "most \u2014 during phase transitions, cascading failures, " +
        "and regime changes.",
    ),
    figure(
      "/nonlinear-market-dynamics-2.jpeg",
      "Two-panel diagram showing normal conditions with linear " +
        "predictability versus stressed coupling with non-linear " +
        "amplification, collapse, and cross-sector contagion",
      "This figure uses financial markets as one illustration of " +
        "non-linear dynamics. Top: signals combine linearly with " +
        "predictable outcomes. Bottom: a small perturbation triggers " +
        "constructive and destructive interference across coupled " +
        "subsystems \u2014 a pattern common to climate, biological, " +
        "and financial systems alike.",
    ),
  );

  // --- The Computational Cost of Non-Linearity ---
  const costTitle = sectionTitle(
    "The Computational Cost of Non-Linearity",
  );
  const costBody = sectionBody(
    p(
      "When N variables interact non-linearly, the state space of " +
        "possible configurations grows as O(2\u207F) for binary-state " +
        "models or worse for continuous variables. A system of 50 " +
        "coupled variables with pairwise non-linear interactions " +
        "requires evaluating correlations across roughly 10\u00B9\u2075 " +
        "states. Classical Monte Carlo methods sample this space " +
        "randomly, but convergence slows dramatically when the " +
        "distribution has fat tails or multimodal structure \u2014 " +
        "exactly the conditions that prevail in non-linear systems " +
        "under stress.",
    ),
    p(
      "Many optimization problems with non-linear constraints are " +
        "NP-hard. Or\u00FAs, Mugel, and Lizaso proved that forecasting " +
        "financial crashes by computing equilibrium states of financial " +
        "networks is formally NP-hard and mapped it to a spin-1/2 " +
        "quantum Hamiltonian [6]. This result generalizes: finding " +
        "equilibria in any network of non-linearly coupled agents " +
        "shares the same computational structure, whether the agents " +
        "are financial institutions, neurons, or atmospheric cells.",
    ),
    p(
      "Quantum computers address this through two mechanisms. " +
        "Superposition allows N qubits to represent all 2\u207F states " +
        "simultaneously, enabling parallel evaluation of the entire " +
        "interaction space. Entanglement creates correlations between " +
        "qubits that mirror non-linear coupling between variables, " +
        "allowing the quantum system to model coupled dynamics " +
        "natively rather than through exponentially many classical " +
        "simulations. Algorithms like QAOA and quantum annealing " +
        "exploit this structure to find good approximate solutions " +
        "faster than classical heuristics for structured instances " +
        "[7, 8].",
    ),
  );

  // --- Citations ---
  const citations = document.createElement("div");
  citations.className = "citations";

  const citTitle = document.createElement("h3");
  citTitle.textContent = "References";
  citations.append(citTitle);

  const ol = document.createElement("ol");
  const refs: Array<{ text: string; url?: string }> = [
    {
      text: "Lorenz, E.N. (1963). Deterministic nonperiodic flow. " +
        "Journal of the Atmospheric Sciences, 20(2), 130\u2013141.",
      url: "https://doi.org/10.1175/1520-0469(1963)020<0130:DNF>2.0.CO;2",
    },
    {
      text: "Alon, U. (2007). An Introduction to Systems Biology: " +
        "Design Principles of Biological Circuits. Chapman & Hall/CRC.",
      url: "https://doi.org/10.1201/9781420011432",
    },
    {
      text: "Feynman, R. (1982). Simulating physics with computers. " +
        "International Journal of Theoretical Physics, 21(6/7), " +
        "467\u2013488.",
      url: "https://doi.org/10.1007/BF02650179",
    },
    {
      text: "Li, D.X. (2000). On Default Correlation: A Copula " +
        "Function Approach. Journal of Fixed Income, 9(4), 43\u201354.",
      url: "https://doi.org/10.3905/jfi.2000.319253",
    },
    {
      text: "Salmon, F. (2009). Recipe for Disaster: The Formula " +
        "That Killed Wall Street. Wired.",
      url: "https://www.wired.com/2009/02/wp-quant/",
    },
    {
      text: "Or\u00FAs, R., Mugel, S., & Lizaso, E. (2019). " +
        "Forecasting financial crashes with quantum computing. " +
        "Physical Review A, 99, 060301(R).",
      url: "https://arxiv.org/abs/1810.07690",
    },
    {
      text: "Farhi, E., Goldstone, J., & Gutmann, S. (2014). A " +
        "Quantum Approximate Optimization Algorithm.",
      url: "https://arxiv.org/abs/1411.4028",
    },
    {
      text: "Kadowaki, T. & Nishimori, H. (1998). Quantum " +
        "annealing in the transverse Ising model. Physical Review E, " +
        "58(5), 5355.",
      url: "https://doi.org/10.1103/PhysRevE.58.5355",
    },
  ];

  for (const ref of refs) {
    const li = document.createElement("li");
    li.append(document.createTextNode(ref.text + " "));
    if (ref.url) {
      const a = document.createElement("a");
      a.href = ref.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = ref.url;
      li.append(a);
    }
    ol.append(li);
  }
  citations.append(ol);

  root.append(
    title,
    subtitle,
    intro,
    whatIsTitle,
    whatIsBody,
    domainsTitle,
    domainsBody,
    costTitle,
    costBody,
    citations,
  );

  return root;
}
