# Interactive Explainer: Quantum Tunneling Through Optimization Barriers

## Overview

This page explains quantum tunneling in the context of optimization, why classical solvers get trapped in local minima, and how quantum systems exploit tunneling to find globally optimal solutions. The centerpiece is an interactive energy landscape visualization where the user can adjust a starting position and watch classical gradient descent get trapped while a quantum path tunnels through barriers to the global optimum.

## Page Structure

### 1. Title and Introduction

**Title:** Quantum Tunneling Through Optimization Barriers

**Subtitle:** How quantum systems escape local minima that trap classical solvers

**Introduction (2 paragraphs):**

Optimization is the mathematical backbone of financial decision-making: portfolio construction, risk allocation, trade execution, and regulatory capital management all reduce to finding the best solution within a space of constraints. Classical optimization algorithms follow the energy landscape downhill. Gradient descent moves in the direction of steepest descent. Simulated annealing adds random perturbations to escape shallow traps. Both methods fail when the landscape contains deep, narrow local minima separated by tall energy barriers from the global optimum.

Quantum tunneling is a physical phenomenon — not a metaphor — in which a quantum particle passes through an energy barrier that it lacks the energy to surmount classically. Quantum annealing hardware exploits this effect to find low-energy states that classical algorithms cannot reach. This page explains how tunneling works, visualizes it against a rugged optimization landscape, and connects it to financial portfolio optimization.

### 2. Section: Classical Optimization and the Local Minimum Trap

**Content (3 paragraphs):**

Define the optimization problem formally. Given an objective function f(x) over a solution space X subject to constraints C, find x* = argmin f(x) subject to x ∈ C. In financial portfolio optimization, x is a vector of asset weights, f(x) is a risk-adjusted return metric (e.g., negative Sharpe ratio or portfolio variance), and C includes budget constraints, sector limits, cardinality bounds, and turnover restrictions.

Explain why constraints create rugged landscapes. Without constraints, mean-variance optimization (Markowitz, 1952 [1]) has a smooth, convex landscape with a unique global minimum. Adding realistic constraints — integer allocation (you cannot hold 3.7 shares), sector limits (no more than 20% in technology), cardinality bounds (hold exactly 50 of 500 candidates), and transaction cost thresholds — transforms the smooth surface into a rugged, multi-modal landscape with exponentially many local minima. Chang et al. [2] showed that cardinality-constrained portfolio optimization is NP-hard, meaning no known polynomial-time algorithm solves all instances.

Describe how classical methods fail. Gradient descent follows the local slope and converges to whatever minimum it encounters first. If the starting point is in the basin of attraction of a suboptimal local minimum, gradient descent converges there and cannot escape. Simulated annealing adds random thermal perturbations that can occasionally jump over low barriers, but the probability of jumping over a barrier of height E falls exponentially as e^(-E/kT) — tall barriers are effectively impassable [3]. For a portfolio of 500 assets with binary inclusion constraints, the landscape contains on the order of 2^500 ≈ 10^150 configurations. The number of local minima grows exponentially with the number of constraints, and the probability that a random starting point leads to the global optimum approaches zero.

**Citations for this section:**

- [1] Markowitz, H. (1952). Portfolio Selection. *Journal of Finance* 7(1):77–91. https://doi.org/10.2307/2975974
- [2] Chang, T.J. et al. (2000). Heuristics for cardinality constrained portfolio optimisation. *Computers & Operations Research* 27(13):1271–1302. https://doi.org/10.1016/S0305-0548(99)00074-X
- [3] Kirkpatrick, S., Gelatt, C.D., Vecchi, M.P. (1983). Optimization by Simulated Annealing. *Science* 220(4598):671–680. https://doi.org/10.1126/science.220.4598.671

### 3. Section: What Is Quantum Tunneling?

**Content (3 paragraphs):**

Explain the physics. In classical mechanics, a particle with energy E encountering a potential barrier of height V > E is reflected — it cannot pass through. In quantum mechanics, the particle's wavefunction does not drop to zero at the barrier; it decays exponentially inside the barrier and emerges on the other side with reduced but non-zero amplitude. The probability of transmission depends on the barrier height, width, and the particle's mass and energy. This is quantum tunneling, first described by Gamow, Gurney, and Condon in 1928 to explain alpha decay [4].

Connect to optimization. In quantum annealing, the objective function is encoded as an Ising Hamiltonian whose ground state (lowest energy configuration) is the optimal solution. The system is initialized in a superposition of all possible configurations and then slowly evolved by reducing a transverse magnetic field. During this evolution, the system can tunnel through energy barriers between local minima rather than having to thermally climb over them. Kadowaki and Nishimori [5] showed that quantum tunneling provides exponential speedup over thermal annealing for certain barrier geometries — specifically, tall, thin barriers that are virtually impassable thermally but transparent to tunneling.

Introduce Quantum Hamiltonian Descent (QHD). Leng et al. [6] formalized the connection between tunneling and optimization by quantizing classical gradient descent using Feynman's path integral formulation. Classical gradient descent computes a single downhill trajectory. QHD computes a path integral over all possible trajectories, including classically prohibited ones that pass through energy barriers. The path integral sums over these trajectories with complex-valued amplitudes, and the constructive interference of tunneling paths directs the system toward the global minimum. Leng's thesis [7] proves that QHD solves problems with exponentially many local minima in polynomial time, establishing a provable separation between quantum and classical optimization.

**Citations for this section:**

- [4] Gamow, G. (1928). Zur Quantentheorie des Atomkernes. *Zeitschrift für Physik* 51(3–4):204–212. https://doi.org/10.1007/BF01343196
- [5] Kadowaki, T. and Nishimori, H. (1998). Quantum annealing in the transverse Ising model. *Physical Review E* 58(5):5355. https://doi.org/10.1103/PhysRevE.58.5355
- [6] Leng, J. et al. (2023). Quantum Hamiltonian Descent. https://arxiv.org/abs/2303.01471
- [7] Leng, J. (2024). Quantum Algorithms for Nonconvex Optimization: Theory and Implementation. PhD Thesis, University of Maryland. https://jiaqileng.github.io/quantum-hamiltonian-descent/paper.html

### 4. Interactive Visualization: Energy Landscape with Classical and Quantum Paths

**Placement:** Full-width, immediately after the QHD explanation.

**Visualization Specification:**

The visualization displays a 2D energy landscape (energy on the y-axis, solution space on the x-axis) with an animated classical gradient descent path and an animated quantum tunneling path.

**Energy landscape function:**

The landscape is a degree-4 polynomial with sinusoidal perturbations to create multiple local minima:

```
E(x) = 0.00012·(x-20)⁴ - 0.012·(x-20)³ + 0.35·(x-20)² - 2.5·(x-20) + 45
        + 8·sin(0.7x) - 3·cos(1.2x)
```

This produces a landscape with:
- A prominent local minimum around x ≈ 22 (where classical solvers typically get trapped)
- A global minimum around x ≈ 38 (the true optimum)
- A tall energy barrier between x ≈ 26 and x ≈ 34
- Several shallower local features that add texture

The exact positions shift slightly depending on the sinusoidal terms; the implementation should numerically scan for the global minimum at initialization.

**Controls:**

1. **Starting position** (range slider, x = 10 to 40, default 22): Sets the initial x-coordinate for both the classical and quantum paths. Most starting positions in the left half of the landscape lead the classical solver to the local minimum rather than the global one.

2. **Show classical path** (checkbox, default checked): Toggles visibility of the classical gradient descent animation.

3. **Show quantum tunneling** (checkbox, default checked): Toggles visibility of the quantum tunneling animation.

**Animation behavior:**

When the visualization loads or the starting position changes, both animations restart from t = 0:

**Classical path (red, #A32D2D):**
- Solid line, lineWidth 2.
- Animates over ~120 frames. At each frame, a gradient descent step is computed: `x_new = x - 0.08 · dE/dx`, where the gradient is estimated numerically via central differences.
- The path traces along the energy surface (the ball rolls downhill).
- After convergence (|gradient| < 0.001 or 2000 iterations), a red circle (r=5) marks the final position.
- A label appears: "Trapped in local minimum" (if the final position is not the global minimum) or "Found optimum" (if it is).

**Quantum path (blue, #185FA5):**
- Dashed line (6px dash, 4px gap), lineWidth 2.
- Animation begins ~40 frames after the classical path starts (giving the classical solver time to get trapped first).
- The path starts at the classical solver's converged local minimum position.
- It follows a horizontal trajectory at the energy level of the local minimum, passing through the barrier region. Small sinusoidal oscillations along the path (amplitude ±3 energy units, frequency 4π over the barrier width) represent the quantum wavefunction's oscillatory decay inside the barrier.
- The path terminates at the global minimum with a downward curve (quadratic interpolation toward the global minimum energy).
- A blue circle (r=5) marks the global minimum. Label: "Global optimum."

**Barrier region highlight:**
- When the quantum path is visible, the area between the energy surface and the tunneling path's energy level (within the barrier region) is filled with a translucent blue (rgba with ~8–12% opacity).
- A label reads "Barrier region" positioned above the shaded area.

**Canvas rendering details:**

- Background: white/near-black respecting `prefers-color-scheme`.
- Horizontal gridlines at energy intervals of 20 units.
- Y-axis label: "Energy". X-axis label: "Solution space".
- The energy function is rendered as a solid path (lineWidth 1.5, dark gray) with a subtle fill below (3–4% opacity).
- A thin zero-energy reference line at y = 0 (though the energy function stays positive).

**Implementation notes for Vite:**

- Use a `<canvas>` element with `requestAnimationFrame`.
- The gradient descent simulation runs in real-time (not precomputed) so the user sees the ball rolling downhill step by step.
- The `findLocalMin(startX)` function runs gradient descent for 2000 steps with step size 0.05 and returns the converged x position.
- The global minimum is precomputed at initialization by scanning E(x) at 0.1 intervals across the full domain.
- Changing the starting position resets the animation counter to 0.

### 5. Section: Experimental Evidence for Quantum Tunneling Advantage

**Content (2–3 paragraphs):**

Cite the D-Wave results. King et al. [8] demonstrated beyond-classical computation on frustrated spin glasses using D-Wave's Advantage quantum annealer, published in Science (2025). The energy landscapes of frustrated spin glasses exhibit exactly the barrier structure that tunneling exploits: deep wells separated by broad plateaus. The QPU achieved median relative error below 1% while generating at least 1,000 samples per second. Classical simulation of the largest instances would require computational resources exceeding annual global electricity consumption. The paper states that the quantum dynamics studied "are responsible for a scaling advantage over classical dynamics in optimization."

Cite the QHDOPT software and experimental results. Leng et al. [9] implemented QHD as the QHDOPT software package, published in the INFORMS Journal on Computing (2024). In experiments on D-Wave hardware, QHD achieved the lowest median time-to-solution among all tested gradient-based solvers for 50–75 dimensional non-convex quadratic programs. The software supports deployment to both annealing and gate-based hardware.

Cite the Anduril defense application as a real-world validation. At Qubits 2026, Anduril Industries and Davidson Technologies demonstrated hybrid quantum-classical optimization for Weapon-Target Assignment — an NP-hard problem structurally isomorphic to portfolio optimization [10, 11]. The collaboration achieved 10× faster time-to-solution and 9–12% improvement in objective value. Critically, classical solvers performed well at small scale but degraded as problem size increased, while the quantum solver maintained advantage — consistent with the theory that tunneling provides its greatest benefit in the large-scale, highly-constrained regime.

**Citations for this section:**

- [8] King, A.D. et al. (2025). Beyond-classical computation in quantum simulation. *Science* 388(6743):199–204. https://arxiv.org/abs/2403.00910
- [9] Leng, J. et al. (2024). QHDOPT: A Software for Nonlinear Optimization with QHD. *INFORMS Journal on Computing* 37(1):107–124. https://pubsonline.informs.org/doi/10.1287/ijoc.2024.0587
- [10] Anduril, Davidson, D-Wave (2026). Quantum Emplacement for Air and Missile Defense Systems. Qubits 2026 Conference. https://www.youtube.com/watch?v=Ac5u3bVFMac
- [11] D-Wave (2026). Anduril, Davidson and D-Wave Collaborate for US Air and Missile Defense. Press Release. https://www.dwavequantum.com/company/newsroom/press-release/anduril-davidson-and-d-wave-collaborate-to-develop-quantum-applications-for-us-air-and-missile-defense/

### 6. Section: Application to Financial Portfolio Optimization

**Content (2 paragraphs):**

Connect tunneling to the specific financial optimization problems described in the visualization. A portfolio of 500 assets with binary inclusion decisions, sector limits, and turnover constraints creates an optimization landscape qualitatively similar to the interactive visualization but in 500 dimensions. Classical solvers (branch-and-bound via Gurobi or CPLEX, or metaheuristics like genetic algorithms) handle moderate instances but degrade as the number of constraints grows. Each additional constraint adds potential local minima to the landscape, increasing the probability that any given starting point leads to a suboptimal trap.

Hybrid quantum-classical solvers address this by using classical heuristics to identify promising regions and quantum sub-problem solving to tunnel through barriers within those regions. D-Wave's Constrained Quadratic Model (CQM) interface supports up to 2 million variables with native equality and inequality constraints, eliminating the manual QUBO penalty-term conversion that previously limited annealer adoption [12]. For State Street, this means portfolio rebalancing under complex regulatory constraints, collateral optimization across custodial accounts, and regulatory capital allocation can all be formulated directly in the CQM framework and solved with quantum tunneling assistance.

**Citations for this section:**

- [12] D-Wave documentation: Models (CQM, NL Solver). https://docs.dwavequantum.com/en/latest/concepts/models.html
- [13] Mugel, S. et al. (2022). Dynamic portfolio optimization with real datasets using quantum processors and quantum-inspired tensor networks. *Physical Review Research* 4, 013006. https://doi.org/10.1103/PhysRevResearch.4.013006 — Demonstrates quantum and quantum-inspired portfolio optimization with cardinality constraints on real market data.

### 7. Footer

Link back to the main research proposal. Links to the other two interactive explainers (Non-Linear Relationships, Hidden Correlations).

## Technical Implementation (Vite)

```
src/
  main.ts              — Entry point
  components/
    LandscapeCanvas.ts  — Canvas rendering (energy surface, paths, annotations)
    GradientDescent.ts  — Classical gradient descent simulation
    TunnelingPath.ts    — Quantum tunneling path computation and animation
    Controls.ts         — Starting position slider, visibility checkboxes
  lib/
    energy.ts           — Energy function E(x), gradient estimation, global min scan
  styles/
    main.css            — Typography, layout, dark mode
  content/
    sections.ts         — Section text content
index.html
```

**Dependencies:** None beyond Vite. The visualization uses only the Canvas 2D API.

**Build:** `npm create vite@latest quantum-tunneling -- --template vanilla-ts`

**Responsive behavior:** Canvas resizes to container width. Controls stack vertically below 480px.

**Accessibility:** Canvas has `role="img"` and `aria-label` summarizing the visualization. An `aria-live="polite"` region announces the outcome when animations complete ("Classical solver converged to local minimum at energy 32. Quantum tunneling reached global minimum at energy 18."). Checkbox and slider inputs have associated `<label>` elements.

## All References

1. Markowitz, H. (1952). Portfolio Selection. *Journal of Finance* 7(1):77–91. https://doi.org/10.2307/2975974
2. Chang, T.J. et al. (2000). Heuristics for cardinality constrained portfolio optimisation. *Computers & Operations Research* 27(13):1271–1302. https://doi.org/10.1016/S0305-0548(99)00074-X
3. Kirkpatrick, S., Gelatt, C.D., Vecchi, M.P. (1983). Optimization by Simulated Annealing. *Science* 220(4598):671–680. https://doi.org/10.1126/science.220.4598.671
4. Gamow, G. (1928). Zur Quantentheorie des Atomkernes. *Zeitschrift für Physik* 51(3–4):204–212. https://doi.org/10.1007/BF01343196
5. Kadowaki, T. and Nishimori, H. (1998). Quantum annealing in the transverse Ising model. *Physical Review E* 58(5):5355. https://doi.org/10.1103/PhysRevE.58.5355
6. Leng, J. et al. (2023). Quantum Hamiltonian Descent. https://arxiv.org/abs/2303.01471
7. Leng, J. (2024). Quantum Algorithms for Nonconvex Optimization: Theory and Implementation. PhD Thesis, University of Maryland. https://jiaqileng.github.io/quantum-hamiltonian-descent/paper.html
8. King, A.D. et al. (2025). Beyond-classical computation in quantum simulation. *Science* 388(6743):199–204. https://arxiv.org/abs/2403.00910
9. Leng, J. et al. (2024). QHDOPT: A Software for Nonlinear Optimization with QHD. *INFORMS Journal on Computing* 37(1):107–124. https://pubsonline.informs.org/doi/10.1287/ijoc.2024.0587
10. Anduril, Davidson, D-Wave (2026). Quantum Emplacement for Air and Missile Defense Systems. Qubits 2026 Conference. https://www.youtube.com/watch?v=Ac5u3bVFMac
11. D-Wave (2026). Anduril, Davidson and D-Wave Collaborate for US Air and Missile Defense. Press Release. https://www.dwavequantum.com/company/newsroom/press-release/anduril-davidson-and-d-wave-collaborate-to-develop-quantum-applications-for-us-air-and-missile-defense/
12. D-Wave documentation: Models (CQM, NL Solver). https://docs.dwavequantum.com/en/latest/concepts/models.html
13. Mugel, S. et al. (2022). Dynamic portfolio optimization with real datasets using quantum processors and quantum-inspired tensor networks. *Physical Review Research* 4, 013006. https://doi.org/10.1103/PhysRevResearch.4.013006
