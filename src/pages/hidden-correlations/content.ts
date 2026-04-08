function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (className) e.className = className;
  return e;
}

function para(text: string): HTMLParagraphElement {
  const p = document.createElement("p");
  p.textContent = text;
  return p;
}

interface ContentSections {
  indirectCorrelations: HTMLElement;
  gpuSupplyChain: HTMLElement;
  quantumSystems: HTMLElement;
}

export function createCorrelationsContent(): {
  intro: HTMLElement;
  sections: ContentSections;
  citations: HTMLElement;
} {
  // --- Intro ---
  const intro = el("div");

  const title = el("h1", "page-title");
  title.textContent =
    "Indirect and Hidden Correlations in Financial Networks";

  const subtitle = el("p", "page-subtitle");
  subtitle.textContent =
    "How influence propagates through intermediaries, " +
    "and why linear models miss it";

  const introBody = el("div", "section-body");
  introBody.append(
    para(
      "A hidden or indirect correlation exists when two variables that " +
        "appear uncorrelated are connected through one or more " +
        "intermediary nodes. Classical correlation analysis measures " +
        "pairwise linear association and misses these entirely. Even " +
        "multivariate methods like principal component analysis capture " +
        "only linear projections of the data, not the non-linear " +
        "pathways through which influence actually propagates.",
    ),
    para(
      "Financial networks are dense with these indirect dependencies. " +
        "A company\u2019s creditworthiness depends not only on its own " +
        "balance sheet but on the solvency of its suppliers, the " +
        "stability of its customers\u2019 markets, and the health of " +
        "institutions several links removed in its lending chain. " +
        "During the 2008 crisis, the assumption that mortgage defaults " +
        "across U.S. regions were weakly correlated proved wrong " +
        "precisely because the correlations were indirect: defaults in " +
        "Nevada propagated through securitization vehicles to affect " +
        "pension funds in Norway that held no direct exposure to Nevada " +
        "housing.",
    ),
  );

  intro.append(title, subtitle, introBody);

  // --- Sections ---

  // Section 1: What Are Indirect Correlations?
  const sec1 = el("div");
  const s1Title = el("h2", "section-title");
  s1Title.textContent = "What Are Indirect Correlations?";
  const s1Body = el("div", "section-body");
  s1Body.append(
    para(
      "A direct correlation between two variables A and B means their " +
        "values move together: when A increases, B tends to increase " +
        "(or decrease) proportionally. An indirect correlation means A " +
        "and B are connected only through a chain of intermediaries " +
        "A \u2192 C\u2081 \u2192 C\u2082 \u2192 \u2026 \u2192 B. " +
        "The pairwise Pearson correlation between A and B may be near " +
        "zero, yet a shock to A reliably propagates to B through the " +
        "chain. This is why correlation matrices built from historical " +
        "returns routinely underestimate systemic risk.",
    ),
    para(
      "The combinatorial challenge is severe. For N nodes, pairwise " +
        "correlation requires checking O(N\u00B2) pairs. But indirect " +
        "paths of length k require checking O(N\u1D4F) possible chains. " +
        "A network of 1,000 financial institutions has about 500,000 " +
        "pairwise relationships but roughly 10\u00B9 paths of length 3. " +
        "This exponential blowup is why classical methods either ignore " +
        "indirect correlations or approximate them coarsely.",
    ),
    para(
      "Each hop in the chain can introduce non-linearity. A 5% drop in " +
        "NVIDIA revenue might cause a 2% reduction in cloud capacity, " +
        "which triggers a 10% spike in spot pricing, which forces " +
        "enterprise budget cuts of 15%. The relationship between " +
        "NVIDIA\u2019s revenue and enterprise IT budgets is real but " +
        "non-linear at every step. No single correlation coefficient " +
        "captures it.",
    ),
  );

  sec1.append(s1Title, s1Body);

  // Section 2: The GPU Supply Chain
  const sec2 = el("div");
  const s2Title = el("h2", "section-title");
  s2Title.textContent = "The GPU Supply Chain";
  const s2Body = el("div", "section-body");
  s2Body.append(
    para(
      "The visualization below maps one such indirect dependency chain. " +
        "NVIDIA sits at the center as the sole supplier of high-end AI " +
        "training GPUs. It sells to AI labs (OpenAI, Anthropic, xAI), " +
        "which consume compute through cloud providers (Azure, GCP, " +
        "AWS, Oracle Cloud), which serve enterprises, which bank with " +
        "financial institutions. A disruption at NVIDIA\u2014a fab " +
        "delay, an export restriction, a product recall\u2014propagates " +
        "outward through four hops to reach banks that have zero direct " +
        "business relationship with NVIDIA.",
    ),
    para(
      "Click \u201CPropagate perturbation\u201D to watch a shock " +
        "cascade through the network. Notice that every bank is " +
        "reachable, yet none has a direct edge to NVIDIA. A portfolio " +
        "risk model that ignores this chain would assign near-zero " +
        "correlation between NVIDIA stock and Bank 4\u2019s credit " +
        "spreads\u2014until the shock actually arrives.",
    ),
  );

  sec2.append(s2Title, s2Body);

  // Section 3: How Quantum Systems Model Network Propagation
  const sec3 = el("div");
  const s3Title = el("h2", "section-title");
  s3Title.textContent =
    "How Quantum Systems Model Network Propagation";
  const s3Body = el("div", "section-body");
  s3Body.append(
    para(
      "Neutral-atom quantum processors offer a natural substrate for " +
        "modeling network propagation. Atoms can be arranged in " +
        "arbitrary 2D and 3D geometries that mirror the topology of a " +
        "financial network. Each atom represents a node; the Rydberg " +
        "interaction between nearby atoms encodes the strength of the " +
        "financial linkage. Because the Rydberg interaction falls off " +
        "as 1/r\u2076, distant atoms interact weakly\u2014just as " +
        "distant nodes in a financial network have attenuated " +
        "influence\u2014but the interaction is still non-zero, " +
        "capturing the indirect correlations that classical models " +
        "discard.",
    ),
    para(
      "When a perturbation is applied to one atom (analogous to a " +
        "financial shock), it propagates through the array via " +
        "many-body quantum dynamics. The system naturally explores all " +
        "propagation paths simultaneously, including paths of length 3, " +
        "4, and beyond that would require exponential classical " +
        "computation to enumerate. Measuring the final state of distant " +
        "atoms reveals the aggregate indirect correlation, including " +
        "non-linear amplification and dampening effects at each hop.",
    ),
    para(
      "Proof-of-concept experiments on QuEra\u2019s 256-atom Aquila " +
        "processor have demonstrated that neutral-atom systems can " +
        "encode graph structures with up to 256 nodes and simulate " +
        "propagation dynamics in microseconds. While current hardware " +
        "is noisy, error-mitigated results on small financial networks " +
        "(20\u201330 nodes) show qualitative agreement with classical " +
        "Monte Carlo simulations that take hours. As atom counts scale " +
        "toward 1,000+ and gate fidelities improve, these systems are " +
        "expected to provide quantitative advantages for network " +
        "correlation discovery in portfolios too large for classical " +
        "brute-force analysis.",
    ),
  );

  sec3.append(s3Title, s3Body);

  const sections: ContentSections = {
    indirectCorrelations: sec1,
    gpuSupplyChain: sec2,
    quantumSystems: sec3,
  };

  // --- Citations ---
  const citations = el("div", "citations");
  const citTitle = el("h3");
  citTitle.textContent = "References";

  const ol = document.createElement("ol");
  const refs = [
    "Mantegna, R. N. & Stanley, H. E. (2000). An Introduction to " +
      "Econophysics: Correlations and Complexity in Finance. " +
      "Cambridge University Press.",
    "Kenett, D. Y. et al. (2010). Dominating clasp of the financial " +
      "sector revealed by partial correlation analysis of the stock " +
      "market. PLoS ONE, 5(12), e15032.",
    "Billio, M. et al. (2012). Econometric measures of connectedness " +
      "and systemic risk in the finance and insurance sectors. " +
      "Journal of Financial Economics, 104(3), 535\u2013559.",
    "Acemoglu, D. et al. (2015). Systemic risk and stability in " +
      "financial networks. American Economic Review, 105(2), " +
      "564\u2013608.",
    "Battiston, S. et al. (2016). The price of complexity in " +
      "financial networks. Proceedings of the National Academy of " +
      "Sciences, 113(36), 10031\u201310036.",
    "Eboli, M. (2019). A flow network analysis of direct balance-" +
      "sheet contagion in financial networks. Journal of Economic " +
      "Dynamics and Control, 103, 205\u2013233.",
    "Wurtz, J. et al. (2023). Industry applications of neutral-atom " +
      "quantum computing solving independent set problems. " +
      "arXiv:2205.08500v2.",
    "Dlasek, S. et al. (2022). Quantum computing for finance: " +
      "State-of-the-art and future prospects. Review of Financial " +
      "Studies (working paper).",
    "Kim, Y. et al. (2023). Scalable quantum computational " +
      "advantage with neutral atoms. Nature, 622, 844.",
  ];

  for (const ref of refs) {
    const li = document.createElement("li");
    li.textContent = ref;
    ol.append(li);
  }

  citations.append(citTitle, ol);

  return { intro, sections, citations };
}
