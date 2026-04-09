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

function refItem(text: string, url: string): HTMLLIElement {
  const li = document.createElement("li");
  const a = document.createElement("a");
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener";
  a.textContent = text;
  li.append(a);
  return li;
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
      "Optimization problems are everywhere: scheduling airline " +
        "crews, routing delivery vehicles, designing drug molecules, " +
        "allocating resources across supply chains, and selecting " +
        "investment portfolios all reduce to finding the best " +
        "solution within a space of constraints. Classical " +
        "optimization algorithms follow the energy landscape " +
        "downhill. Gradient descent moves in the direction of " +
        "steepest descent. Simulated annealing adds random " +
        "perturbations to escape shallow traps. Both methods fail " +
        "when the landscape contains deep, narrow local minima " +
        "separated by tall energy barriers from the global optimum.",
    ),
    p(
      "Quantum tunneling is a physical phenomenon \u2014 not a " +
        "metaphor \u2014 in which a quantum particle passes through " +
        "an energy barrier that it lacks the energy to surmount " +
        "classically. Quantum annealing hardware exploits this " +
        "effect to find low-energy states that classical algorithms " +
        "cannot reach. This page explains how tunneling works, " +
        "visualizes it against a rugged optimization landscape, and " +
        "connects it to real-world combinatorial problems.",
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
        "discrete set of candidate solutions. The vehicle routing " +
        "problem asks for the shortest set of routes serving all " +
        "customers; protein folding seeks the lowest-energy 3D " +
        "conformation; job-shop scheduling minimizes makespan across " +
        "machines. In each case the solution space grows " +
        "exponentially with problem size, and realistic " +
        "constraints \u2014 vehicle capacity, amino acid chemistry, " +
        "machine availability \u2014 transform a smooth surface into " +
        "a rugged landscape with many local minima separated by " +
        "high barriers.",

      "Gradient descent follows the local slope of the energy " +
        "surface. At each step it moves to a neighboring solution " +
        "with lower energy, and it stops when no neighbor improves " +
        "the objective. This greedy strategy is fast but myopic: it " +
        "converges to the nearest local minimum, which may be far " +
        "from the global optimum. Simulated annealing improves on " +
        "gradient descent by occasionally accepting uphill moves, " +
        "with the probability of acceptance decreasing over time " +
        "according to a cooling schedule. The method is provably " +
        "convergent to the global optimum in the limit of " +
        "infinitely slow cooling, but practical cooling schedules " +
        "must be finite, and tall, narrow barriers can trap the " +
        "solver for exponentially long times.",

      "The visualization below shows this failure mode directly. " +
        "The red path traces gradient descent on a rugged energy " +
        "landscape. It rolls downhill and locks into a local " +
        "minimum. The blue dashed path shows the quantum tunneling " +
        "trajectory that passes through the barrier to reach the " +
        "global optimum \u2014 a solution that the classical path " +
        "cannot access without an exponentially unlikely thermal " +
        "fluctuation.",
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
          "demonstrating tunneling effects on their quantum " +
          "annealing processors. In 2016, Denchev et al. showed " +
          "that the D-Wave 2X found the ground state of a " +
          "carefully constructed problem \u2014 a weak-strong " +
          "cluster network \u2014 up to 10^8 times faster than " +
          "simulated annealing, with the speedup attributable to " +
          "multi-qubit tunneling through energy barriers. King " +
          "et al. (2025) demonstrated beyond-classical computation " +
          "on frustrated spin glasses using the Advantage processor, " +
          "published in Science. The QPU achieved median relative " +
          "error below 1% while generating at least 1,000 samples " +
          "per second, with classical simulation of the largest " +
          "instances requiring computational resources exceeding " +
          "annual global electricity consumption.",

        "On the gate-model side, the QHDOPT package (Leng " +
          "et al., 2024) implements Quantum Hamiltonian Descent " +
          "on trapped-ion hardware. Their experiments on " +
          "non-convex optimization problems show QHD escaping " +
          "local minima that trap classical gradient descent, with " +
          "solution quality improving as circuit depth increases. " +
          "At Qubits 2026, Anduril Industries and Davidson " +
          "Technologies demonstrated hybrid quantum-classical " +
          "optimization for Weapon-Target Assignment \u2014 an " +
          "NP-hard problem \u2014 achieving 10\u00D7 faster " +
          "time-to-solution and 9\u201312% improvement in " +
          "objective value on D-Wave hardware.",

        "These results share a pattern: the quantum advantage " +
          "is largest when the energy landscape has tall, narrow " +
          "barriers separating good solutions \u2014 exactly the " +
          "structure found in constrained combinatorial " +
          "optimization. Vehicle routing with capacity constraints, " +
          "protein folding with steric clashes, chip placement " +
          "with thermal limits, and resource allocation under " +
          "budgets all create barrier-rich landscapes where " +
          "tunneling is the natural mechanism for moving between " +
          "feasible basins.",
      ],
    ),
  );

  // Section 4: Applications Across Industries
  sections.append(
    section("Applications Across Industries", [
      "Any optimization problem formulated as a QUBO or Ising " +
        "model encodes its constraints as energy penalties, and " +
        "those penalties create the tall barriers that tunneling " +
        "exploits. In logistics, vehicle routing with time windows " +
        "and capacity limits creates sharp feasibility boundaries " +
        "\u2014 swapping one stop between routes can violate " +
        "multiple constraints simultaneously, forming a barrier " +
        "that classical solvers must climb over. In drug discovery, " +
        "molecular conformation search over rotatable bonds " +
        "produces energy landscapes with exponentially many local " +
        "minima separated by steric clashes. In finance, portfolio " +
        "selection under budget, sector, and cardinality " +
        "constraints creates the same barrier-rich structure.",

      "Hybrid quantum-classical solvers address these problems " +
        "by using classical heuristics to identify promising " +
        "regions and quantum sub-problem solving to tunnel through " +
        "barriers within those regions. D-Wave\u2019s Constrained " +
        "Quadratic Model (CQM) interface supports up to 2 million " +
        "variables with native equality and inequality constraints, " +
        "and applications already span semiconductor manufacturing " +
        "(fab scheduling), telecommunications (network " +
        "optimization), defense (weapon-target assignment), and " +
        "materials science (lattice structure prediction). As " +
        "quantum hardware scales \u2014 the Advantage2 processor " +
        "has over 1,200 qubits with 20-way connectivity \u2014 " +
        "the class of tractable constrained problems grows " +
        "correspondingly.",
    ]),
  );

  // --- Citations ---
  const citations = document.createElement("div");
  citations.className = "citations";

  const citationsTitle = document.createElement("h3");
  citationsTitle.textContent = "References";
  citations.append(citationsTitle);

  const ol = document.createElement("ol");

  ol.append(
    refItem(
      "Kadowaki, T. & Nishimori, H. (1998). Quantum annealing " +
        "in the transverse Ising model. Physical Review E, 58(5), " +
        "5355\u20135363.",
      "https://doi.org/10.1103/PhysRevE.58.5355",
    ),
    refItem(
      "Kirkpatrick, S., Gelatt, C.D., Vecchi, M.P. (1983). " +
        "Optimization by Simulated Annealing. Science, " +
        "220(4598), 671\u2013680.",
      "https://doi.org/10.1126/science.220.4598.671",
    ),
    refItem(
      "Denchev, V. S. et al. (2016). What is the computational " +
        "value of finite-range tunneling? Physical Review X, " +
        "6(3), 031015.",
      "https://doi.org/10.1103/PhysRevX.6.031015",
    ),
    refItem(
      "Albash, T. & Lidar, D. A. (2018). Adiabatic quantum " +
        "computation. Reviews of Modern Physics, 90(1), 015002.",
      "https://doi.org/10.1103/RevModPhys.90.015002",
    ),
    refItem(
      "Leng, J. et al. (2023). Quantum Hamiltonian Descent. " +
        "arXiv:2303.01471.",
      "https://arxiv.org/abs/2303.01471",
    ),
    refItem(
      "Leng, J. et al. (2024). QHDOPT: A Software for " +
        "Nonlinear Optimization with QHD. INFORMS Journal on " +
        "Computing, 37(1), 107\u2013124.",
      "https://pubsonline.informs.org/doi/10.1287/ijoc.2024.0587",
    ),
    refItem(
      "King, A. D. et al. (2025). Beyond-classical computation " +
        "in quantum simulation. Science, 388(6743), 199\u2013204.",
      "https://arxiv.org/abs/2403.00910",
    ),
    refItem(
      "Gamow, G. (1928). Zur Quantentheorie des Atomkernes. " +
        "Zeitschrift f\u00FCr Physik, 51(3\u20134), 204\u2013212.",
      "https://doi.org/10.1007/BF01343196",
    ),
    refItem(
      "Anduril, Davidson, D-Wave (2026). Quantum Emplacement " +
        "for Air and Missile Defense Systems. Qubits 2026.",
      "https://www.youtube.com/watch?v=Ac5u3bVFMac",
    ),
    refItem(
      "D-Wave (2026). Anduril, Davidson and D-Wave Collaborate " +
        "for US Air and Missile Defense. Press Release.",
      "https://www.dwavequantum.com/company/newsroom/press-release/" +
        "anduril-davidson-and-d-wave-collaborate-to-develop-" +
        "quantum-applications-for-us-air-and-missile-defense/",
    ),
    refItem(
      "D-Wave documentation: Models (CQM, NL Solver).",
      "https://docs.dwavequantum.com/en/latest/concepts/models.html",
    ),
    refItem(
      "Mugel, S. et al. (2022). Dynamic portfolio optimization " +
        "with real datasets using quantum processors. Physical " +
        "Review Research, 4, 013006.",
      "https://doi.org/10.1103/PhysRevResearch.4.013006",
    ),
    refItem(
      "Harrigan, M. P. et al. (2021). Quantum approximate " +
        "optimization of non-planar graph problems. Nature " +
        "Physics, 17, 332\u2013336.",
      "https://doi.org/10.1038/s41567-020-01105-y",
    ),
  );

  citations.append(ol);

  return { intro, sections, citations };
}
