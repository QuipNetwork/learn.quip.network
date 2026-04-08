import { onThemeChange } from "../../lib/dark-mode";
import { createTunnelingContent } from "./content";
import { LandscapeCanvas } from "./LandscapeCanvas";
import { createTunnelingControls } from "./controls";

export function mountQuantumTunneling(
  container: HTMLElement,
): () => void {
  const page = document.createElement("div");
  page.className = "tunneling-page";

  // Title
  const title = document.createElement("h1");
  title.className = "page-title";
  title.textContent =
    "Quantum Tunneling Through Optimization Barriers";

  const subtitle = document.createElement("p");
  subtitle.className = "page-subtitle";
  subtitle.textContent =
    "How quantum systems escape local minima that trap classical " +
    "solvers";

  page.append(title, subtitle);

  // Content
  const { intro, sections, citations } = createTunnelingContent();

  page.append(intro);

  // Pull the first two sections (Classical Optimization, What Is QT?)
  // from the sections container
  const allSections = Array.from(sections.children);
  const classicalSection = allSections[0];
  const tunnelingSection = allSections[1];
  const evidenceSection = allSections[2];
  const financeSection = allSections[3];

  if (classicalSection) page.append(classicalSection);
  if (tunnelingSection) page.append(tunnelingSection);

  // Visualization
  const vizContainer = document.createElement("div");
  vizContainer.className = "viz-container";

  const canvas = new LandscapeCanvas(vizContainer);
  const controls = createTunnelingControls(canvas);

  page.append(controls, vizContainer);

  // Remaining sections
  if (evidenceSection) page.append(evidenceSection);
  if (financeSection) page.append(financeSection);

  // Citations
  page.append(citations);

  container.append(page);
  canvas.start();

  // Theme reactivity
  const unsubTheme = onThemeChange(() => {
    canvas.redraw();
  });

  return () => {
    canvas.stop();
    unsubTheme();
  };
}
