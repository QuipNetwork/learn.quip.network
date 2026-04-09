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

function cite(...nums: number[]): HTMLSpanElement {
  const span = document.createElement("span");
  nums.forEach((n, i) => {
    if (i > 0) span.append(", ");
    const a = document.createElement("a");
    a.href = `#ref-${n}`;
    a.className = "cite-link";
    a.textContent = `[${n}]`;
    span.append(a);
  });
  return span;
}

function richPara(
  ...parts: Array<string | HTMLElement>
): HTMLParagraphElement {
  const p = document.createElement("p");
  for (const part of parts) {
    if (typeof part === "string") {
      p.append(document.createTextNode(part));
    } else {
      p.append(part);
    }
  }
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
    "Indirect and Hidden Correlations in Complex Networks";

  const subtitle = el("p", "page-subtitle");
  subtitle.textContent =
    "How influence propagates through intermediaries, " +
    "and why linear models miss it";

  const introBody = el("div", "section-body");
  introBody.append(
    richPara(
      "A hidden or indirect correlation exists when two variables that " +
        "appear uncorrelated connect through one or more " +
        "intermediary nodes. Classical correlation analysis measures " +
        "pairwise linear association and misses these entirely ",
      cite(1, 2),
      ". Even " +
        "multivariate methods like principal component analysis capture " +
        "only linear projections of the data, not the non-linear " +
        "pathways through which influence actually propagates.",
    ),
    richPara(
      "Complex networks are dense with these indirect dependencies. " +
        "In epidemiology, individuals with no direct contact can " +
        "transmit disease through chains of intermediaries, making " +
        "contact tracing through pairwise analysis insufficient. In " +
        "supply chains, a component shortage at one manufacturer " +
        "propagates through distributors and integrators to affect " +
        "companies with no direct supplier relationship. In finance, " +
        "the 2008 crisis demonstrated this: mortgage defaults in " +
        "Nevada propagated through securitization vehicles to affect " +
        "pension funds in Norway with no direct exposure to Nevada " +
        "housing ",
      cite(3, 4, 5),
      ".",
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
    richPara(
      "A direct correlation between two variables A and B means their " +
        "values move together: when A increases, B tends to increase " +
        "(or decrease) proportionally. An indirect correlation means A " +
        "and B connect only through a chain of intermediaries " +
        "A \u2192 C\u2081 \u2192 C\u2082 \u2192 \u2026 \u2192 B. " +
        "The pairwise Pearson correlation between A and B may be near " +
        "zero, yet a shock to A reliably propagates to B through the " +
        "chain. Correlation matrices that rely on historical " +
        "observations routinely underestimate systemic risk in " +
        "networks ",
      cite(2, 3),
      ".",
    ),
    para(
      "The combinatorial challenge is severe. For N nodes, pairwise " +
        "correlation requires checking O(N\u00B2) pairs. But indirect " +
        "paths of length k require checking O(N\u1D4F) possible chains. " +
        "A network of 1,000 nodes \u2014 whether financial " +
        "institutions, species in an ecosystem, or computing nodes " +
        "in a distributed system \u2014 has about 500,000 pairwise " +
        "relationships but roughly 10\u00B9 paths of length 3. " +
        "This exponential blowup is why classical methods either " +
        "ignore indirect correlations or approximate them coarsely.",
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
        "NVIDIA sits at the center as a dominant supplier of high-end AI " +
        "training GPUs. It sells to AI labs (OpenAI, Anthropic, xAI), " +
        "which consume compute through cloud providers (Azure, GCP, " +
        "AWS, Oracle Cloud), which serve enterprises, which bank with " +
        "financial institutions. A disruption at NVIDIA\u2014a fab " +
        "delay, an export restriction, a product recall\u2014propagates " +
        "outward through four hops to reach banks that have zero direct " +
        "business relationship with NVIDIA. The same pattern applies " +
        "to any tiered network: semiconductor supply disruptions " +
        "affecting healthcare equipment availability, or agricultural " +
        "shortages reaching consumer goods through processing and " +
        "distribution intermediaries.",
    ),
    para(
      "Click \u201CPropagate perturbation\u201D to watch a shock " +
        "cascade through the network. Notice that every bank is " +
        "reachable, yet none has a direct edge to NVIDIA. Any network " +
        "analysis that examines only direct connections would assign " +
        "near-zero correlation between NVIDIA and organizations at " +
        "the network periphery \u2014 whether those are banks, " +
        "hospitals dependent on cloud infrastructure, or research " +
        "institutions relying on GPU compute \u2014 until the shock " +
        "actually arrives.",
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
    richPara(
      "Neutral-atom quantum processors offer a natural substrate for " +
        "modeling network propagation ",
      cite(6, 8),
      ". Atoms can be arranged in " +
        "arbitrary 2D and 3D geometries that mirror the topology of a " +
        "complex network. Each atom represents a node; the Rydberg " +
        "interaction between nearby atoms encodes the connection " +
        "strength between nodes. Because the Rydberg interaction " +
        "falls off as 1/r\u2076, distant atoms interact weakly" +
        "\u2014just as distant nodes in a network have attenuated " +
        "influence\u2014but the interaction is still non-zero, " +
        "capturing the indirect correlations that classical models " +
        "discard.",
    ),
    para(
      "When researchers apply a perturbation to one atom (analogous " +
        "to a disruption at a network node), it propagates through " +
        "the array via many-body quantum dynamics. The system " +
        "naturally explores all propagation paths simultaneously, " +
        "including paths of length 3, 4, and beyond that would " +
        "require exponential classical computation to enumerate. " +
        "Measuring the final state of distant atoms reveals the " +
        "aggregate indirect correlation, including non-linear " +
        "amplification and dampening effects at each hop.",
    ),
    richPara(
      "Proof-of-concept experiments on QuEra\u2019s 256-atom Aquila " +
        "processor demonstrate that neutral-atom systems can " +
        "encode graph structures with up to 256 nodes and simulate " +
        "propagation dynamics in microseconds ",
      cite(6),
      ". As atom counts scale " +
        "toward 1,000+ and gate fidelities improve, researchers " +
        "expect these systems to deliver quantitative advantages for " +
        "correlation discovery in systems too large for classical " +
        "brute-force analysis \u2014 whether financial portfolios ",
      cite(7),
      ", epidemiological " +
        "contact networks, or industrial supply chains.",
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
  const refs: Array<{ text: string; url: string }> = [
    {
      text: "Mantegna, R. N. & Stanley, H. E. (2000). An Introduction " +
        "to Econophysics: Correlations and Complexity in Finance. " +
        "Cambridge University Press.",
      url: "https://doi.org/10.1017/CBO9780511755767",
    },
    {
      text: "Kenett, D. Y. et al. (2010). Dominating clasp of the " +
        "financial sector revealed by partial correlation analysis of " +
        "the stock market. PLoS ONE, 5(12), e15032.",
      url: "https://doi.org/10.1371/journal.pone.0015032",
    },
    {
      text: "Billio, M. et al. (2012). Econometric measures of " +
        "connectedness and systemic risk in the finance and insurance " +
        "sectors. Journal of Financial Economics, 104(3), 535\u2013559.",
      url: "https://doi.org/10.1016/j.jfineco.2011.12.010",
    },
    {
      text: "Acemoglu, D. et al. (2015). Systemic risk and stability " +
        "in financial networks. American Economic Review, 105(2), " +
        "564\u2013608.",
      url: "https://doi.org/10.1257/aer.20130456",
    },
    {
      text: "Battiston, S. et al. (2016). The price of complexity in " +
        "financial networks. Proceedings of the National Academy of " +
        "Sciences, 113(36), 10031\u201310036.",
      url: "https://doi.org/10.1073/pnas.1521573113",
    },
    {
      text: "Wurtz, J. et al. (2022). Industry applications of " +
        "neutral-atom quantum computing solving independent set " +
        "problems. arXiv:2205.08500.",
      url: "https://arxiv.org/abs/2205.08500",
    },
    {
      text: "Herman, D. et al. (2023). Quantum computing for finance. " +
        "Nature Reviews Physics, 5, 450\u2013465.",
      url: "https://arxiv.org/abs/2201.02773",
    },
    {
      text: "Bluvstein, D. et al. (2024). Logical quantum processor " +
        "based on reconfigurable atom arrays. Nature, 626, 58\u201365.",
      url: "https://doi.org/10.1038/s41586-023-06927-3",
    },
  ];

  refs.forEach((ref, i) => {
    const li = document.createElement("li");
    li.id = `ref-${i + 1}`;
    li.append(document.createTextNode(ref.text + " "));
    const a = document.createElement("a");
    a.href = ref.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = ref.url;
    li.append(a);
    ol.append(li);
  });

  citations.append(citTitle, ol);

  return { intro, sections, citations };
}
