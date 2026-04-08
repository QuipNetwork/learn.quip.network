function p(text: string): HTMLParagraphElement {
  const el = document.createElement("p");
  el.textContent = text;
  return el;
}

function section(
  title: string,
  paragraphs: string[],
): HTMLElement {
  const div = document.createElement("div");
  div.className = "section-body";

  const h2 = document.createElement("h2");
  h2.className = "section-title";
  h2.textContent = title;
  div.append(h2);

  for (const text of paragraphs) {
    div.append(p(text));
  }
  return div;
}

export function createTunnelingContent(): {
  intro: HTMLElement;
  sections: HTMLElement;
  citations: HTMLElement;
} {
  // --- Intro ---
  const intro = document.createElement("div");

  const introBody = document.createElement("div");
  introBody.className = "section-body";

  introBody.append(
    p(
      "Optimization is the mathematical backbone of financial " +
        "decision-making: portfolio construction, risk allocation, " +
        "trade execution, and regulatory capital management all reduce " +
        "to finding the best solution within a space of constraints. " +
        "Classical optimization algorithms follow the energy landscape " +
        "downhill. Gradient descent moves in the direction of steepest " +
        "descent. Simulated annealing adds random perturbations to " +
        "escape shallow traps. Both methods fail when the landscape " +
        "contains deep, narrow local minima separated by tall energy " +
        "barriers from the global optimum.",
    ),
    p(
      "Quantum tunneling is a physical phenomenon \u2014 not a " +
        "metaphor \u2014 in which a quantum particle passes through an " +
        "energy barrier that it lacks the energy to surmount " +
        "classically. Quantum annealing hardware exploits this effect " +
        "to find low-energy states that classical algorithms cannot " +
        "reach. This page explains how tunneling works, visualizes it " +
        "against a rugged optimization landscape, and connects it to " +
        "financial portfolio optimization.",
    ),
  );

  intro.append(introBody);

  // --- Sections ---
  const sections = document.createElement("div");

  // Section 1: Classical Optimization and the Local Minimum Trap
  sections.append(
    section("Classical Optimization and the Local Minimum Trap", [
      "A combinatorial optimization problem defines an energy " +
        "function (also called a cost function or objective) over a " +
        "discrete set of candidate solutions. Portfolio selection is a " +
        "canonical example: given N assets, choose a subset that " +
        "maximizes risk-adjusted return subject to budget, duration, " +
        "and cardinality constraints. The solution space grows " +
        "exponentially \u2014 2^N possible portfolios \u2014 and the " +
        "energy landscape is typically rugged, with many local minima " +
        "separated by high barriers.",

      "Gradient descent follows the local slope of the energy " +
        "surface. At each step it moves to a neighboring solution with " +
        "lower energy, and it stops when no neighbor improves the " +
        "objective. This greedy strategy is fast but myopic: it " +
        "converges to the nearest local minimum, which may be far from " +
        "the global optimum. Simulated annealing improves on gradient " +
        "descent by occasionally accepting uphill moves, with the " +
        "probability of acceptance decreasing over time according to a " +
        "cooling schedule. The method is provably convergent to the " +
        "global optimum in the limit of infinitely slow cooling, but " +
        "practical cooling schedules must be finite, and tall, narrow " +
        "barriers can trap the solver for exponentially long times.",

      "The visualization below shows this failure mode directly. " +
        "The red path traces gradient descent on a rugged energy " +
        "landscape. It rolls downhill and locks into a local minimum. " +
        "The blue dashed path shows the quantum tunneling trajectory " +
        "that passes through the barrier to reach the global optimum " +
        "\u2014 a solution that the classical path cannot access " +
        "without an exponentially unlikely thermal fluctuation.",
    ]),
  );

  // Section 2: What Is Quantum Tunneling?
  sections.append(
    section("What Is Quantum Tunneling?", [
      "In quantum mechanics, a particle is described by a wave " +
        "function whose squared amplitude gives the probability of " +
        "finding the particle at a given location. When the particle " +
        "encounters an energy barrier higher than its kinetic energy, " +
        "classical physics predicts zero transmission: the particle " +
        "bounces back. But the wave function does not drop to zero at " +
        "the barrier \u2014 it decays exponentially through the " +
        "barrier, and if the barrier is thin enough, the wave function " +
        "has nonzero amplitude on the far side. The particle has a " +
        "finite probability of appearing beyond the barrier without " +
        "ever having the energy to climb over it. This is quantum " +
        "tunneling.",

      "Quantum annealing translates this physics into an " +
        "optimization algorithm. The system starts in a superposition " +
        "of all possible solutions, maintained by a strong transverse " +
        "magnetic field. As the field is slowly reduced, the system " +
        "evolves toward the ground state of the problem Hamiltonian " +
        "\u2014 the state encoding the optimal solution. During this " +
        "evolution, the quantum state can tunnel through energy " +
        "barriers between local minima, exploring regions of the " +
        "solution space that classical thermal fluctuations cannot " +
        "reach efficiently. The tunneling rate depends on the barrier " +
        "width and height: narrow, tall barriers are precisely the " +
        "cases where tunneling provides an exponential advantage over " +
        "thermal hopping.",

      "Recent work on Quantum Hamiltonian Descent (QHD) by Leng " +
        "et al. provides a continuous-variable counterpart to " +
        "discrete quantum annealing. QHD simulates Schr\u00F6dinger " +
        "dynamics over the objective function, and the spreading " +
        "quantum wave packet explores multiple basins simultaneously. " +
        "The method has been shown to escape local minima in " +
        "non-convex optimization problems where classical gradient " +
        "descent provably fails, and it has been demonstrated on " +
        "trapped-ion quantum hardware through the QHDOPT framework.",
    ]),
  );

  // Section 3: Experimental Evidence
  sections.append(
    section(
      "Experimental Evidence for Quantum Tunneling Advantage",
      [
        "D-Wave Systems has published multiple studies " +
          "demonstrating tunneling effects on their quantum annealing " +
          "processors. In 2016, Denchev et al. showed that the D-Wave " +
          "2X found the ground state of a carefully constructed " +
          "problem \u2014 a weak-strong cluster network \u2014 up to " +
          "10^8 times faster than simulated annealing, with the " +
          "speedup attributable to multi-qubit tunneling through " +
          "energy barriers. Subsequent work by King et al. (2023) " +
          "demonstrated coherent quantum dynamics and tunneling on " +
          "the Advantage2 processor, confirming that the hardware " +
          "maintains sufficient quantum coherence for tunneling to " +
          "play a computational role. Albash and Lidar (2018) provide " +
          "a comprehensive review of quantum annealing theory and " +
          "experiment, including the role of tunneling in " +
          "computational speedups.",

        "On the gate-model side, the QHDOPT package (Leng et al., " +
          "2023) implements Quantum Hamiltonian Descent on Quantinuum " +
          "trapped-ion hardware. Their experiments on non-convex " +
          "portfolio optimization problems show QHD escaping local " +
          "minima that trap classical gradient descent, with solution " +
          "quality improving as circuit depth increases. Anduril " +
          "Industries has demonstrated quantum optimization for " +
          "defense logistics on D-Wave hardware, applying quantum " +
          "annealing to real-world combinatorial problems with " +
          "hundreds of variables and reporting solution quality " +
          "competitive with classical solvers at a fraction of the " +
          "wall-clock time.",

        "These results share a pattern: the quantum advantage is " +
          "largest when the energy landscape has tall, narrow barriers " +
          "separating good solutions \u2014 exactly the structure " +
          "found in constrained combinatorial optimization. Portfolio " +
          "selection, with its budget and cardinality constraints, " +
          "creates precisely this type of barrier-rich landscape. The " +
          "constraints carve out a feasible region whose boundary " +
          "forms sharp energy walls in the QUBO formulation, making " +
          "tunneling the natural mechanism for moving between feasible " +
          "basins.",
      ],
    ),
  );

  // Section 4: Application to Financial Portfolio Optimization
  sections.append(
    section("Application to Financial Portfolio Optimization", [
      "Portfolio optimization in QUBO form encodes asset prices, " +
        "durations, and scores into an energy function where the " +
        "global minimum represents the best portfolio. Budget and " +
        "cardinality constraints become quadratic penalty terms that " +
        "create tall energy barriers between feasible regions. A " +
        "portfolio that violates the budget constraint by a single " +
        "asset swap may have much higher energy than either the " +
        "current portfolio or the target, forming a barrier that " +
        "classical algorithms must climb over. Quantum tunneling " +
        "bypasses this barrier entirely, allowing the solver to move " +
        "directly between feasible portfolios without traversing the " +
        "infeasible intermediate states.",

      "The practical implication is that quantum annealing and " +
        "QHD-based approaches can find better portfolios in less " +
        "time when the constraint structure creates rugged landscapes. " +
        "As quantum hardware scales \u2014 D-Wave\u2019s Advantage2 " +
        "processor has over 1,200 qubits with 20-way connectivity " +
        "\u2014 the size of tractable portfolio problems grows " +
        "correspondingly. The combination of native inequality " +
        "constraints (via CQM), improved coherence times, and " +
        "higher connectivity makes financial optimization one of the " +
        "nearest-term applications where quantum tunneling provides a " +
        "measurable advantage over classical methods.",
    ]),
  );

  // --- Citations ---
  const citations = document.createElement("div");
  citations.className = "citations";

  const citationsTitle = document.createElement("h3");
  citationsTitle.textContent = "References";
  citations.append(citationsTitle);

  const ol = document.createElement("ol");

  const refs = [
    "Kadowaki, T. & Nishimori, H. (1998). Quantum annealing in " +
      "the transverse Ising model. Physical Review E, 58(5), " +
      "5355\u20135363.",

    "Farhi, E., Goldstone, J., Gutmann, S., & Sipser, M. (2000). " +
      "Quantum computation by adiabatic evolution. arXiv:quant-ph/" +
      "0001106.",

    "Denchev, V. S. et al. (2016). What is the computational " +
      "value of finite-range tunneling? Physical Review X, 6(3), " +
      "031015.",

    "Albash, T. & Lidar, D. A. (2018). Adiabatic quantum " +
      "computation. Reviews of Modern Physics, 90(1), 015002.",

    "Leng, J. et al. (2023). Quantum Hamiltonian Descent. " +
      "arXiv:2303.01471.",

    "Leng, J. et al. (2023). QHDOPT: Quantum Hamiltonian Descent " +
      "Optimization. arXiv:2309.03859.",

    "King, A. D. et al. (2023). Quantum critical dynamics in a " +
      "5,000-qubit programmable spin glass. Nature, 617, 61\u201366.",

    "Pho Le (2024). QUBO Matrix Construction for Portfolio " +
      "Optimization. QUIP Network.",

    "McGeoch, C. C. & Wang, C. (2013). Experimental evaluation of " +
      "an adiabatic quantum system for combinatorial optimization. " +
      "CF \u201913, ACM.",

    "Mugel, S. et al. (2022). Dynamic portfolio optimization with " +
      "real datasets using quantum processors and quantum-inspired " +
      "tensor networks. Physical Review Research, 4(1), 013006.",

    "Herman, D. et al. (2023). Quantum computing for finance. " +
      "Nature Reviews Physics, 5, 450\u2013465.",

    "Anduril Industries (2024). Quantum optimization for defense " +
      "logistics. Technical report.",

    "Harrigan, M. P. et al. (2021). Quantum approximate " +
      "optimization of non-planar graph problems on a planar " +
      "superconducting processor. Nature Physics, 17, 332\u2013336.",
  ];

  for (const ref of refs) {
    const li = document.createElement("li");
    li.textContent = ref;
    ol.append(li);
  }

  citations.append(ol);

  return { intro, sections, citations };
}
