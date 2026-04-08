# Interactive Explainer: Non-Linear Relationships in Financial Systems

## Overview

This page explains non-linear relationships, why they matter for financial modeling, and why quantum computers are well suited to capturing them. The centerpiece is an interactive waveform visualization that lets the user experience how coupled non-linear signals behave under perturbation.

## Page Structure

### 1. Title and Introduction

**Title:** Non-Linear Relationships in Financial Systems

**Subtitle:** Why linear models fail during crises, and what quantum systems offer

**Introduction (2 paragraphs):**

A linear relationship means that a change in one variable produces a proportional change in another: double the input, double the output. Linear regression, the most widely used tool in financial modeling, assumes this proportionality holds across all input ranges. Most financial relationships violate this assumption. Interest rate changes affect bond prices non-linearly through convexity. Volatility does not scale linearly with market moves due to the leverage effect. Credit default risk grows non-linearly with exposure concentration through correlation risk. When multiple non-linear variables interact, the combined system diverges sharply from any linear approximation.

This page illustrates what non-linearity looks like in coupled financial systems, explains why the computational cost of modeling it is exponential, and describes how quantum systems address this through superposition and entanglement.

### 2. Section: What Is a Non-Linear Relationship?

**Content (3–4 paragraphs):**

Define linearity formally: a function f is linear if f(ax + by) = af(x) + bf(y). Any function that violates this property is non-linear. In practice, most real-world systems are non-linear; linearity is a simplifying approximation that works well within narrow ranges but breaks down at extremes.

Explain with a concrete financial example: the Black-Scholes option pricing model assumes log-normal returns (a linear model of log-prices), but observed markets exhibit volatility smiles, fat tails, and regime switches that violate this assumption. During the 2008 financial crisis, the Gaussian copula model used to price CDOs assumed linear correlations between mortgage default rates across regions. When housing prices declined nationally rather than regionally, the actual correlation was far higher than the linear estimate, and losses cascaded through the entire MBS structure [1, 2].

Introduce the wave analogy: consider multiple waveforms with different frequencies and amplitudes. In the linear regime (superposition principle), they combine predictably. But introduce coupling — where the amplitude of one wave depends on the phase of another — and the system becomes non-linear. A small phase shift in one waveform can trigger constructive interference that amplifies others by orders of magnitude, or destructive interference that collapses them. This is the dynamic that unfolds in coupled financial instruments during market stress.

**Citations for this section:**

- [1] Li, D.X. (2000). On Default Correlation: A Copula Function Approach. *Journal of Fixed Income* 9(4):43–54. The original Gaussian copula paper whose linear correlation assumption contributed to the 2008 crisis.
- [2] Salmon, F. (2009). Recipe for Disaster: The Formula That Killed Wall Street. *Wired*. https://www.wired.com/2009/02/wp-quant/
- [3] Cont, R. (2001). Empirical properties of asset returns: stylized facts and statistical issues. *Quantitative Finance* 1(2):223–236. https://doi.org/10.1080/713665670 — Comprehensive survey of non-linear properties in financial returns including fat tails, volatility clustering, and leverage effects.

### 3. Interactive Visualization: Coupled Waveform System

**Placement:** Full-width, immediately after the explanation of wave coupling.

**Visualization Specification:**

The visualization displays four colored waveforms on a canvas, each representing a financial signal:

| Signal | Color | Base Frequency | Interpretation |
|--------|-------|---------------|----------------|
| Housing market | Blue (#3266ad) | 1.0 | The "driver" signal subject to perturbation |
| Credit derivatives | Teal (#1D9E75) | 1.3 | Coupled to housing via securitization |
| Bank equities | Coral (#D85A30) | 0.7 | Coupled to housing via balance sheet exposure |
| Consumer lending | Purple (#534AB7) | 1.6 | Coupled to housing via consumer credit quality |

**Controls:**

1. **Coupling strength** (range slider, 0–100%, default 0%): Controls the non-linear coupling coefficient between the housing signal and all other signals. At 0%, signals are fully independent (linear superposition). At 100%, the amplitude of each non-housing signal depends quadratically on the housing signal's instantaneous value — `amp_i += coupling * housing² * gain_i * sin(freq_i * x)` — producing constructive interference for some signals and destructive interference for others.

2. **Perturbation** (range slider, -50% to +50%, default 0%): Adds a low-frequency perturbation to the housing signal only. At zero coupling, this affects only the housing waveform. At high coupling, the perturbation propagates non-linearly through all signals, amplifying some and collapsing others.

**Behavior:**

- Waveforms animate continuously (time parameter advances at ~0.015 per frame).
- At coupling = 0, all waveforms are smooth sinusoids with stable amplitudes regardless of perturbation.
- As coupling increases, the non-housing waveforms begin to exhibit amplitude modulation driven by the housing signal's instantaneous value.
- At high coupling + high perturbation, the visualization shows dramatic amplification (waveforms exceeding 2–3x their normal amplitude) and destructive collapse (waveforms flattening toward zero) simultaneously, depending on the phase relationship between each signal and the driver.
- The gain coefficients alternate sign (1.8, -1.4, 1.8, -1.4) so that some signals amplify while others collapse under the same perturbation — matching the real-world observation that crises create winners and losers simultaneously.

**Canvas rendering details:**

- Background: white (light mode) or near-black (dark mode), respecting `prefers-color-scheme`.
- Horizontal gridlines at amplitude intervals.
- A zero-line (center) at 50% opacity.
- Each waveform rendered as a continuous path with lineWidth 1.8.
- The x-axis spans 6π radians of the base frequency.
- The y-axis maps amplitude to ±90px from center.

**Implementation notes for Vite:**

- Use a `<canvas>` element with `requestAnimationFrame` for rendering.
- Handle devicePixelRatio for crisp rendering on retina displays.
- Dark mode detection via `matchMedia('(prefers-color-scheme: dark)')`.
- No external libraries needed; vanilla Canvas API is sufficient.

### 4. Section: The Computational Cost of Non-Linearity

**Content (2–3 paragraphs):**

Explain that modeling N coupled non-linear variables requires evaluating an exponentially growing interaction space. For N assets with pairwise non-linear couplings, the state space grows as O(2^N), making exact classical solutions intractable for portfolios of even moderate size. This is the computational signature of NP-hardness: the problem is easy to verify but exponentially expensive to solve.

Cite Orús, Mugel, and Lizaso [4], who proved that forecasting financial crashes by computing equilibrium states of financial networks is formally NP-hard and mapped it to a spin-1/2 quantum Hamiltonian. This means there is no known polynomial-time classical algorithm for the general case. Heuristics (Monte Carlo, simulated annealing) work for small instances but degrade as dimensionality increases — precisely the regime where financial portfolio optimization operates.

Introduce the quantum approach: a quantum processor with N qubits maintains all 2^N states in superposition simultaneously, exploring the full non-linear interaction space in parallel rather than sequentially. Entanglement ensures that correlations between qubits — no matter how non-linear — are maintained throughout the computation. This does not guarantee polynomial-time solutions to NP-hard problems (that would require proving BQP ⊇ NP), but quantum algorithms like QAOA and quantum annealing can find good approximate solutions faster than classical heuristics for structured instances [5, 6].

**Citations for this section:**

- [4] Orús, R., Mugel, S., Lizaso, E. (2019). Forecasting financial crashes with quantum computing. *Physical Review A* 99, 060301(R). https://arxiv.org/abs/1810.07690
- [5] Farhi, E., Goldstone, J., Gutmann, S. (2014). A Quantum Approximate Optimization Algorithm. https://arxiv.org/abs/1411.4028
- [6] Kadowaki, T. and Nishimori, H. (1998). Quantum annealing in the transverse Ising model. *Physical Review E* 58(5):5355. https://doi.org/10.1103/PhysRevE.58.5355

### 5. Section: Application to Financial Analysis

**Content (2 paragraphs):**

For financial institutions, non-linear modeling means quantum systems could evaluate portfolio risk with full non-linear coupling between assets, assess volatility surfaces with regime-dependent dynamics, and model counterparty credit risk where exposure depends non-linearly on market conditions. Takaishi [7] demonstrated that single-qubit quantum circuit learning preserves negative return–volatility correlation and multifractal structure in GARCH volatility modeling — features that classical GARCH implementations struggle to capture.

The critical insight is that quantum advantage may be regime-dependent: comparable to classical methods under normal market conditions, but superior during crises when non-linear couplings dominate. The interactive visualization above demonstrates this directly: at low coupling, the signals are indistinguishable from a linear model; at high coupling with perturbation, the non-linear cascading effects become dramatic and unpredictable by linear extrapolation.

**Citations for this section:**

- [7] Takaishi, T. (2025). Volatility time series modeling by single-qubit quantum circuit learning. https://arxiv.org/abs/2512.10584
- [8] Cont, R. and Bouchaud, J.-P. (2000). Herd behavior and aggregate fluctuations in financial markets. *Macroeconomic Dynamics* 4(2):170–196. https://doi.org/10.1017/S1365100500015029 — Demonstrates how non-linear feedback loops between agents produce fat tails and volatility clustering.

### 6. Footer

Link back to the main research proposal. Links to the other two interactive explainers (Hidden Correlations, Quantum Tunneling).

## Technical Implementation (Vite)

```
src/
  main.ts          — Entry point, mounts the page
  components/
    WaveformCanvas.ts  — Canvas rendering logic (requestAnimationFrame loop)
    Controls.ts        — Slider components for coupling and perturbation
  styles/
    main.css           — Typography, layout, dark mode
  content/
    sections.ts        — Section text content (or use MDX)
index.html         — Shell with root div
```

**Dependencies:** None beyond Vite itself. The visualization uses only the Canvas 2D API.

**Build:** `npm create vite@latest nonlinear-relationships -- --template vanilla-ts`

**Responsive behavior:** Canvas resizes to container width. Controls stack vertically below 480px.

**Accessibility:** Canvas has `role="img"` and `aria-label` describing the visualization. Slider inputs have associated `<label>` elements. All text content is in the DOM (not rendered to canvas) for screen reader access.

## All References

1. Li, D.X. (2000). On Default Correlation: A Copula Function Approach. *Journal of Fixed Income* 9(4):43–54.
2. Salmon, F. (2009). Recipe for Disaster: The Formula That Killed Wall Street. *Wired*. https://www.wired.com/2009/02/wp-quant/
3. Cont, R. (2001). Empirical properties of asset returns: stylized facts and statistical issues. *Quantitative Finance* 1(2):223–236. https://doi.org/10.1080/713665670
4. Orús, R., Mugel, S., Lizaso, E. (2019). Forecasting financial crashes with quantum computing. *Physical Review A* 99, 060301(R). https://arxiv.org/abs/1810.07690
5. Farhi, E., Goldstone, J., Gutmann, S. (2014). A Quantum Approximate Optimization Algorithm. https://arxiv.org/abs/1411.4028
6. Kadowaki, T. and Nishimori, H. (1998). Quantum annealing in the transverse Ising model. *Physical Review E* 58(5):5355. https://doi.org/10.1103/PhysRevE.58.5355
7. Takaishi, T. (2025). Volatility time series modeling by single-qubit quantum circuit learning. https://arxiv.org/abs/2512.10584
8. Cont, R. and Bouchaud, J.-P. (2000). Herd behavior and aggregate fluctuations in financial markets. *Macroeconomic Dynamics* 4(2):170–196. https://doi.org/10.1017/S1365100500015029
