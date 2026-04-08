function p(text: string): HTMLParagraphElement {
  const el = document.createElement("p");
  el.textContent = text;
  return el;
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
  title.textContent = "Non-Linear Relationships in Financial Systems";

  const subtitle = document.createElement("p");
  subtitle.className = "page-subtitle";
  subtitle.textContent =
    "Why linear models fail during crises, and what quantum systems offer";

  // --- Introduction ---
  const intro = sectionBody(
    p(
      "A linear relationship means that a change in one variable produces " +
        "a proportional change in another: double the input, double the " +
        "output. Linear regression, the most widely used tool in financial " +
        "modeling, assumes this proportionality holds across all input " +
        "ranges. Most financial relationships violate this assumption. " +
        "Interest rate changes affect bond prices non-linearly through " +
        "convexity. Volatility does not scale linearly with market moves " +
        "due to the leverage effect. Credit default risk grows non-linearly " +
        "with exposure concentration through correlation risk. When " +
        "multiple non-linear variables interact, the combined system " +
        "diverges sharply from any linear approximation.",
    ),
    p(
      "This page illustrates what non-linearity looks like in coupled " +
        "financial systems, explains why the computational cost of " +
        "modeling it is exponential, and describes how quantum systems " +
        "address this through superposition and entanglement.",
    ),
  );

  // --- What Is a Non-Linear Relationship? ---
  const whatIsTitle = sectionTitle("What Is a Non-Linear Relationship?");
  const whatIsBody = sectionBody(
    p(
      "A linear system obeys the superposition principle: the combined " +
        "effect of two inputs equals the sum of their individual effects. " +
        "Doubling interest rates would double bond losses; tripling " +
        "exposure would triple credit risk. No real financial system " +
        "behaves this way. Bond prices are a convex function of yield: a " +
        "100-basis-point rate increase causes a larger price drop than a " +
        "100-basis-point decrease causes a gain. This asymmetry, called " +
        "convexity, is a non-linear relationship between two variables " +
        "that linear models systematically misrepresent.",
    ),
    p(
      "The Black-Scholes model prices options using a non-linear payoff " +
        "function and a log-normal distribution of returns. Even this " +
        "classic model is an approximation: it assumes constant volatility " +
        "and continuous trading, both of which break down during crises. " +
        "Collateralized debt obligations exhibit threshold non-linearity " +
        "through their tranche structure: senior tranches are insensitive " +
        "to losses until a critical attachment point, then collapse " +
        "abruptly. During the 2008 financial crisis, CDO models based on " +
        "Gaussian copulas failed precisely because they underestimated " +
        "these non-linear correlations between mortgage defaults.",
    ),
    p(
      "The visualization below uses coupled waveforms as an analogy. Each " +
        "wave represents a financial variable: housing prices, credit " +
        "spreads, bank equity values, and consumer confidence. When " +
        "coupling is zero, each wave evolves independently and the system " +
        "is approximately linear. As coupling increases, each wave's " +
        "behavior depends on the square of another wave, creating the " +
        "kind of non-linear feedback loops that characterize financial " +
        "crises. The perturbation control adds an external shock, " +
        "analogous to a sudden policy change or market event.",
    ),
  );

  // --- The Computational Cost of Non-Linearity ---
  const costTitle = sectionTitle(
    "The Computational Cost of Non-Linearity",
  );
  const costBody = sectionBody(
    p(
      "When N financial variables interact non-linearly, the state space " +
        "of possible configurations grows as O(2^N) for binary-state " +
        "models or worse for continuous variables. A portfolio of 50 " +
        "assets with pairwise non-linear interactions requires evaluating " +
        "correlations across 2^50 possible portfolio combinations, " +
        "roughly 10^15 states. Classical Monte Carlo methods sample this " +
        "space randomly, but convergence slows dramatically when the " +
        "distribution has fat tails or multimodal structure, exactly the " +
        "conditions that prevail during financial crises.",
    ),
    p(
      "Many financial optimization problems with non-linear constraints " +
        "are NP-hard. Finding the minimum-risk portfolio subject to " +
        "non-linear transaction costs, cardinality constraints, and " +
        "regime-dependent correlations has no known polynomial-time " +
        "algorithm. Classical solvers resort to heuristics that provide " +
        "no guarantee of finding the global optimum.",
    ),
    p(
      "Quantum computers address this through two mechanisms. " +
        "Superposition allows a quantum register of N qubits to represent " +
        "all 2^N states simultaneously, enabling parallel evaluation of " +
        "the entire state space. Entanglement creates correlations " +
        "between qubits that mirror the non-linear correlations between " +
        "financial variables, allowing the quantum system to model " +
        "coupled dynamics natively rather than through exponentially " +
        "many classical simulations.",
    ),
  );

  // --- Application to Financial Analysis ---
  const appTitle = sectionTitle("Application to Financial Analysis");
  const appBody = sectionBody(
    p(
      "Quantum algorithms for financial simulation encode non-linear " +
        "dynamics into Hamiltonian evolution operators. Quantum amplitude " +
        "estimation can price path-dependent derivatives with quadratic " +
        "speedup over classical Monte Carlo, achieving the same accuracy " +
        "with the square root of the number of samples. For portfolio " +
        "optimization, variational quantum eigensolvers map the non-linear " +
        "objective function to a qubit Hamiltonian whose ground state " +
        "encodes the optimal portfolio allocation.",
    ),
    p(
      "The practical advantage depends on the regime. For normally " +
        "distributed returns with linear correlations, classical methods " +
        "remain efficient. The quantum advantage emerges when the system " +
        "exhibits strong non-linearity: fat-tailed distributions, " +
        "regime-switching dynamics, or high-dimensional coupling between " +
        "variables. These are precisely the conditions where classical " +
        "risk models have historically failed, suggesting that quantum " +
        "approaches will provide the greatest value where it is most " +
        "needed.",
    ),
  );

  // --- Citations ---
  const citations = document.createElement("div");
  citations.className = "citations";

  const citTitle = document.createElement("h3");
  citTitle.textContent = "References";
  citations.append(citTitle);

  const ol = document.createElement("ol");
  const refs = [
    "Rebentrost, P., Gupt, B., & Bromley, T. R. (2018). Quantum " +
      "computational finance: Monte Carlo pricing of financial " +
      "derivatives. Physical Review A, 98(2), 022321.",
    "Orus, R., Mugel, S., & Lizaso, E. (2019). Quantum computing for " +
      "finance: Overview and prospects. Reviews in Physics, 4, 100028.",
    "Woerner, S., & Egger, D. J. (2019). Quantum risk analysis. npj " +
      "Quantum Information, 5(1), 15.",
    "Stamatopoulos, N., et al. (2020). Option pricing using quantum " +
      "computers. Quantum, 4, 291.",
    "Herman, D., et al. (2023). Quantum computing for finance. Nature " +
      "Reviews Physics, 5, 450-465.",
    "Egger, D. J., et al. (2020). Quantum computing for finance: " +
      "State-of-the-art and future prospects. IEEE Transactions on " +
      "Quantum Engineering, 1, 1-24.",
    "Chakrabarti, S., et al. (2021). A threshold for quantum advantage " +
      "in derivative pricing. Quantum, 5, 463.",
    "An, D., Linden, N., Liu, J.-P., Montanaro, A., Shao, C., & Wang, " +
      "J. (2021). Quantum-accelerated multilevel Monte Carlo methods for " +
      "stochastic differential equations in mathematical finance. " +
      "Quantum, 5, 481.",
  ];

  for (const ref of refs) {
    const li = document.createElement("li");
    li.textContent = ref;
    ol.append(li);
  }
  citations.append(ol);

  root.append(
    title,
    subtitle,
    intro,
    whatIsTitle,
    whatIsBody,
    costTitle,
    costBody,
    appTitle,
    appBody,
    citations,
  );

  return root;
}
