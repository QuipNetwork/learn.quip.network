import { createCorrelationsContent } from "./content";
import { EDGES } from "./data";
import { createNetworkSVG } from "./NetworkGraph";
import { PropagationAnimator } from "./Propagation";

export function mountHiddenCorrelations(
  container: HTMLElement,
): () => void {
  const page = document.createElement("div");
  page.className = "correlations-page";

  const { intro, sections, citations } = createCorrelationsContent();

  // 1. Intro
  page.append(intro);

  // 2. "What Are Indirect Correlations?" section
  page.append(sections.indirectCorrelations);

  // 3. "The GPU Supply Chain" section
  page.append(sections.gpuSupplyChain);

  // 4. Visualization
  const vizContainer = document.createElement("div");
  vizContainer.className = "viz-container";

  const svg = createNetworkSVG(vizContainer);
  const animator = new PropagationAnimator(svg, EDGES);

  // Aria live region
  const ariaLive = document.createElement("div");
  ariaLive.className = "viz-aria-live";
  ariaLive.setAttribute("aria-live", "polite");
  ariaLive.setAttribute("role", "status");
  animator.setAriaLive(ariaLive);

  // Controls
  const controls = document.createElement("div");
  controls.className = "viz-controls";

  const btnPropagate = document.createElement("button");
  btnPropagate.className = "btn btn-primary";
  btnPropagate.textContent = "Propagate perturbation";
  btnPropagate.addEventListener("click", () => {
    animator.propagate();
  });

  const btnReset = document.createElement("button");
  btnReset.className = "btn btn-secondary";
  btnReset.textContent = "Reset";
  btnReset.addEventListener("click", () => {
    animator.reset();
  });

  controls.append(btnPropagate, btnReset);

  page.append(controls, vizContainer, ariaLive);

  // 5. "How Quantum Systems Model" section
  page.append(sections.quantumSystems);

  // 6. Citations
  page.append(citations);

  container.append(page);

  // Cleanup
  return () => {
    animator.reset();
  };
}
