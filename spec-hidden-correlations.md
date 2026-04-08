# Interactive Explainer: Indirect and Hidden Correlations in Financial Networks

## Overview

This page explains how indirect correlations propagate through financial networks, why pairwise analysis misses them, and how quantum systems — particularly analog neutral-atom processors — can model them. The centerpiece is an interactive network graph that lets the user trigger a perturbation at a source node and watch it propagate through intermediaries to reach apparently uncorrelated entities.

## Page Structure

### 1. Title and Introduction

**Title:** Indirect and Hidden Correlations in Financial Networks

**Subtitle:** How influence propagates through intermediaries, and why linear models miss it

**Introduction (2 paragraphs):**

A hidden or indirect correlation exists when two variables that appear uncorrelated are connected through one or more intermediary nodes. Classical correlation analysis measures pairwise linear association and misses these entirely. Even multivariate methods like principal component analysis capture only linear projections of the data, not the non-linear pathways through which influence actually propagates. Loretan and English [1] formally demonstrated that correlation — a linear measure — "might not appropriately capture any relationship structure that is nonlinear."

Financial networks are dense with these indirect dependencies. A company's creditworthiness depends not only on its own balance sheet but on the solvency of its suppliers, the stability of its customers' markets, and the health of institutions several links removed in its lending chain. During the 2008 crisis, the assumption that mortgage defaults across U.S. regions were weakly correlated proved wrong precisely because the correlations were indirect: defaults in Nevada propagated through securitization vehicles to affect pension funds in Norway that held no direct exposure to Nevada housing [2].

### 2. Section: What Are Indirect Correlations?

**Content (3 paragraphs):**

Define direct versus indirect correlation. A direct correlation means variable A and variable B co-move observably. An indirect correlation means A and B appear uncorrelated in pairwise analysis, but both are connected through a chain of intermediaries A → C → D → B, where each link is a direct relationship. The pairwise correlation between A and B may be near zero, yet a shock to A reliably propagates to B through the chain.

The combinatorial challenge: in a network of N nodes, the number of possible paths of length k is O(N^k). A network of 1,000 financial entities has approximately 10^9 possible 3-hop paths and 10^12 possible 4-hop paths. Exhaustively evaluating all paths to identify which indirect correlations are material is computationally intractable for classical systems. In practice, risk models truncate at direct (1-hop) correlations, occasionally extending to 2-hop for known counterparties. This means all correlations of length 3 or greater are invisible to standard risk frameworks.

The problem is compounded by non-linearity at each hop. The relationship between Entity A and Entity C might be approximately linear under normal conditions but become highly non-linear under stress (a supplier that delivers 95% of the time under normal demand but 40% of the time under surge demand). Each non-linear hop multiplies the divergence between the linear approximation and actual behavior, so the indirect correlation between distant nodes can be orders of magnitude stronger during crises than any pairwise model predicts [3, 4].

**Citations for this section:**

- [1] Loretan, M. and English, W.B. (2000). Evaluating "correlation breakdowns" during periods of market volatility. *BIS Conference Paper No. 8*, Bank for International Settlements. https://www.bis.org/publ/confer08l.pdf
- [2] Brunnermeier, M.K. (2009). Deciphering the Liquidity and Credit Crunch 2007–2008. *Journal of Economic Perspectives* 23(1):77–100. https://doi.org/10.1257/jep.23.1.77
- [3] Battiston, S. et al. (2012). DebtRank: Too Central to Fail? Financial Networks, the FED and Systemic Risk. *Scientific Reports* 2, 541. https://doi.org/10.1038/srep00541 — Introduces DebtRank, a measure of systemic importance based on indirect propagation through financial networks.
- [4] Acemoglu, D., Ozdaglar, A., Tahbaz-Salehi, A. (2015). Systemic Risk and Stability in Financial Networks. *American Economic Review* 105(2):564–608. https://doi.org/10.1257/aer.20130456 — Proves that network topology determines whether small shocks dissipate or cascade.

### 3. Section: A Concrete Example — The GPU Supply Chain

**Content (2 paragraphs):**

Walk through the NVIDIA GPU supply chain as a concrete illustration. NVIDIA's GPU business does not merely affect NVIDIA's shareholders. It propagates through AI companies that depend on GPU supply (training compute is the critical input for foundation model development), which in turn affects cloud providers that host AI inference services (their margins depend on GPU-accelerated workloads), which affects enterprises whose productivity gains depend on AI infrastructure, which ultimately affects the lending and credit relationships of banks that finance those enterprises. A bank with a diversified lending portfolio may show zero direct correlation with NVIDIA, yet a sustained GPU shortage propagates through this chain to increase default risk across its AI-exposed borrowers within 6–12 months.

The indirect path is: NVIDIA → AI companies → Cloud providers → Enterprise borrowers → Lending banks. Each hop involves a different economic mechanism (supply constraint, margin compression, productivity loss, credit deterioration), and each mechanism is non-linear under stress. Standard pairwise correlation between NVIDIA's stock price and a regional bank's loan loss rate would show negligible association — the relationship is real, material, and invisible to linear analysis [5].

**Citations for this section:**

- [5] Carvalho, V.M. and Tahbaz-Salehi, A. (2019). Production Networks: A Primer. *Annual Review of Economics* 11:635–663. https://doi.org/10.1146/annurev-economics-080218-030212 — Survey of how production network structure transmits and amplifies shocks.

### 4. Interactive Visualization: Network Propagation Graph

**Placement:** Full-width, immediately after the GPU supply chain explanation.

**Visualization Specification:**

The visualization displays a network of 16 nodes arranged in concentric rings around a central node, with edges connecting nodes across tiers. Clicking "Propagate perturbation" triggers an animated cascade from the center outward.

**Node layout (concentric rings):**

| Tier | Ring Radius | Nodes | Color Ramp | Interpretation |
|------|-------------|-------|------------|----------------|
| 0 (center) | 0 | NVIDIA | Gray | Source of perturbation |
| 1 | 60px | OpenAI, Anthropic, xAI | Blue | AI companies (direct GPU dependency) |
| 2 | 150px | Azure, GCP, AWS, Oracle Cloud | Teal | Cloud providers (AI hosting) |
| 3 | 240px | Enterprise A–D | Coral | Enterprise borrowers (AI productivity) |
| 4 | 330px (dashed ring) | Lending bank 1–4 | Gray | Banks (credit exposure) |

**Edge connections:**

- Tier 0 → Tier 1: NVIDIA connects to all three AI companies.
- Tier 1 → Tier 2: Each AI company connects to 2 cloud providers (with overlap — Azure appears twice).
- Tier 2 → Tier 3: Each cloud provider connects to 1–2 enterprises.
- Tier 3 → Tier 4: Each enterprise connects to 1–2 banks (with overlap — some banks serve multiple enterprises).

Total: 20 edges. The graph is intentionally not fully connected; the sparse connectivity makes propagation paths visible.

**Controls:**

1. **Propagate perturbation** (button): Triggers the cascade animation from NVIDIA outward.
2. **Reset** (button): Clears all highlighting and returns to the default state.

**Animation behavior:**

When "Propagate" is clicked:

1. **t = 0ms:** The center node (NVIDIA) turns coral/red (fill and stroke change). It receives a `source` class.
2. **t = 200ms:** Edges from NVIDIA to Tier 1 nodes turn coral with increased stroke-width (0.8 → 2px). The animation is sequential per edge with ~50ms stagger.
3. **t = 500ms:** Tier 1 nodes receive coral stroke highlight. Edges from Tier 1 to Tier 2 begin lighting.
4. **t = 1000ms:** Tier 2 nodes highlight. Edges to Tier 3 begin.
5. **t = 1500ms:** Tier 3 nodes highlight. Edges to Tier 4 begin.
6. **t = 2000ms:** Tier 4 nodes highlight. All un-lit edges fade to 15% opacity (class `dim`), making the propagation path visually dominant.

The BFS traversal ensures each node lights exactly once, and edges light in causal order. Timing uses `setTimeout` with cumulative delays per tier (500ms per hop).

**Visual design:**

- Concentric ring guides are drawn as thin (0.5px) circles with the outermost ring dashed (stroke-dasharray: 4 4) to indicate that the outer tier has the weakest direct association.
- A label below the outermost ring reads: "Pairwise correlation between center and outer ring: near zero."
- Hop number labels ("Hop 1", "Hop 2", "Hop 3") appear near the ring boundaries.
- Nodes are rounded rectangles (rx=6) sized to fit their label text (label length × 7.5 + 20px padding). The center node is a circle (r=28).
- Colors follow the palette table above, with light/dark mode variants. Nodes use fill from the 50 stop (light mode) or 800 stop (dark mode) and text from the 800 stop (light) or 100 stop (dark) of their ramp.

**Implementation notes for Vite:**

- Use inline SVG in the HTML (not canvas) for the network graph. SVG provides better interactivity (CSS transitions on stroke, fill, opacity) and accessibility (nodes are DOM elements with labels).
- All transitions use CSS `transition` properties (0.4–0.6s) on the node and edge elements.
- The BFS propagation logic lives in a TypeScript function that walks the edge list and schedules `classList.add('lit')` calls via `setTimeout`.
- Dark mode: detect via `matchMedia` and apply color variants at initialization.

### 5. Section: How Quantum Systems Model Network Propagation

**Content (3 paragraphs):**

Explain that analog neutral-atom quantum processors encode network relationships directly in hardware. Individual atoms are trapped in optical tweezers and can be arranged in arbitrary 2D or 3D geometries. When excited to Rydberg states, atoms experience strong dipole-dipole interactions whose strength falls off as 1/r^6 with distance. Atoms positioned closer together interact more strongly, naturally encoding the idea that closely related entities have stronger correlations. The system evolves under its native Hamiltonian, simultaneously exploring all propagation paths without enumerating them [6, 7].

This is fundamentally different from classical network simulation, which must iterate over paths sequentially or sample them stochastically. The quantum system's evolution inherently accounts for all multi-hop correlations in parallel, including interference effects where two propagation paths to the same node can constructively or destructively combine. Aboussalah, Chi, and Lee [8] built a quantum-classical algorithm for financial network analysis that proved more resilient to financial shocks, delayed cascade failure phase transitions, and reduced total failures at convergence compared to purely classical approaches.

A proof-of-concept with a major European bank used up to 60 neutral-atom qubits on real financial data for derivatives valuation and credit risk assessment, achieving comparable accuracy to classical Random Forest benchmarks with 3.5× faster training [9]. For custodian banks, this capability maps directly to collateral chain analysis (tracing indirect exposure through chains of rehypothecated collateral), counterparty exposure modeling (evaluating how a default propagates through a network of bilateral agreements), and supply-chain risk assessment for the asset classes under custody.

**Citations for this section:**

- [6] Browaeys, A. and Lahaye, T. (2020). Many-body physics with individually controlled Rydberg atoms. *Nature Physics* 16:132–142. https://doi.org/10.1038/s41567-019-0733-z — Review of Rydberg atom interactions and their applications to quantum simulation.
- [7] Henriet, L. et al. (2020). Quantum computing with neutral atoms. *Quantum* 4, 327. https://doi.org/10.22331/q-2020-09-21-327 — Technical overview of neutral-atom quantum computing platforms.
- [8] Aboussalah, A., Chi, Z., Lee, C.G. (2023). Quantum computing reduces systemic risk in financial networks. *Scientific Reports* 13, 3990. https://www.nature.com/articles/s41598-023-30710-z
- [9] Leclerc, L. et al. (2023). Financial risk management on a neutral atom quantum processor. *Physical Review Research* 5, 043117. https://journals.aps.org/prresearch/abstract/10.1103/PhysRevResearch.5.043117

### 6. Footer

Link back to the main research proposal. Links to the other two interactive explainers (Non-Linear Relationships, Quantum Tunneling).

## Technical Implementation (Vite)

```
src/
  main.ts            — Entry point
  components/
    NetworkGraph.ts   — SVG graph rendering, node/edge creation
    Propagation.ts    — BFS traversal and animation scheduling
    Controls.ts       — Propagate/Reset buttons
  data/
    nodes.ts          — Node positions, tiers, labels, colors
    edges.ts          — Edge list (source, target pairs)
  styles/
    main.css          — Typography, layout, dark mode, transition classes
  content/
    sections.ts       — Section text content
index.html
```

**Dependencies:** None beyond Vite. The graph uses inline SVG with CSS transitions.

**Build:** `npm create vite@latest hidden-correlations -- --template vanilla-ts`

**Responsive behavior:** SVG viewBox scales to container. On narrow screens (<480px), the visualization maintains aspect ratio and node labels remain legible because SVG text scales with the viewBox.

**Accessibility:** Each node is a `<g>` with `role="button"` and `aria-label`. The propagation animation is accompanied by an `aria-live="polite"` region that announces each tier as it lights ("Perturbation reached cloud providers — hop 2 of 3"). Button controls have visible labels.

## All References

1. Loretan, M. and English, W.B. (2000). Evaluating "correlation breakdowns" during periods of market volatility. *BIS Conference Paper No. 8*. https://www.bis.org/publ/confer08l.pdf
2. Brunnermeier, M.K. (2009). Deciphering the Liquidity and Credit Crunch 2007–2008. *Journal of Economic Perspectives* 23(1):77–100. https://doi.org/10.1257/jep.23.1.77
3. Battiston, S. et al. (2012). DebtRank: Too Central to Fail? *Scientific Reports* 2, 541. https://doi.org/10.1038/srep00541
4. Acemoglu, D., Ozdaglar, A., Tahbaz-Salehi, A. (2015). Systemic Risk and Stability in Financial Networks. *American Economic Review* 105(2):564–608. https://doi.org/10.1257/aer.20130456
5. Carvalho, V.M. and Tahbaz-Salehi, A. (2019). Production Networks: A Primer. *Annual Review of Economics* 11:635–663. https://doi.org/10.1146/annurev-economics-080218-030212
6. Browaeys, A. and Lahaye, T. (2020). Many-body physics with individually controlled Rydberg atoms. *Nature Physics* 16:132–142. https://doi.org/10.1038/s41567-019-0733-z
7. Henriet, L. et al. (2020). Quantum computing with neutral atoms. *Quantum* 4, 327. https://doi.org/10.22331/q-2020-09-21-327
8. Aboussalah, A., Chi, Z., Lee, C.G. (2023). Quantum computing reduces systemic risk in financial networks. *Scientific Reports* 13, 3990. https://www.nature.com/articles/s41598-023-30710-z
9. Leclerc, L. et al. (2023). Financial risk management on a neutral atom quantum processor. *Physical Review Research* 5, 043117. https://journals.aps.org/prresearch/abstract/10.1103/PhysRevResearch.5.043117
