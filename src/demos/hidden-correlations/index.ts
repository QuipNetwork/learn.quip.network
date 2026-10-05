import { EDGES } from "./data";
import { createNetworkSVG } from "./NetworkGraph";
import { PropagationAnimator } from "./Propagation";

export function mountHiddenCorrelations(container: HTMLElement): () => void {
  const demo = container.querySelector<HTMLElement>('[data-demo="hidden-correlations"]')!;
  const vizContainer = demo.querySelector<HTMLElement>(".viz-container")!;

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

  demo.querySelector(".viz-controls-slot")!.replaceChildren(controls);
  demo.append(ariaLive);

  // Cleanup
  return () => {
    animator.reset();
  };
}
