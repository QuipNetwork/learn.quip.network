import { onThemeChange } from "../../lib/dark-mode";
import { createNonlinearContent } from "./content";
import { WaveformCanvas, CombinedCanvas } from "./WaveformCanvas";
import { createControls } from "./controls";

export function mountNonlinear(container: HTMLElement): () => void {
  const page = document.createElement("div");
  page.className = "nonlinear-page";

  // Build all content sections
  const content = createNonlinearContent();
  const children = Array.from(content.children);

  // Extract sections by position:
  // 0: title, 1: subtitle, 2: intro, 3: whatIsTitle, 4: whatIsBody,
  // 5: domainsTitle, 6: domainsBody,
  // 7: costTitle, 8: costBody, 9: appTitle, 10: appBody, 11: citations
  const preSections = children.slice(0, 7); // title through domains
  const postSections = children.slice(7); // cost, app, citations

  for (const el of preSections) {
    page.append(el);
  }

  // Individual signals visualization
  const vizLabel = document.createElement("h3");
  vizLabel.className = "viz-label";
  vizLabel.textContent = "Individual Signals";
  vizLabel.style.fontSize = "0.875rem";
  vizLabel.style.fontWeight = "600";
  vizLabel.style.color = "var(--color-text-secondary)";
  vizLabel.style.marginBottom = "var(--spacing-sm)";
  vizLabel.style.textTransform = "uppercase";
  vizLabel.style.letterSpacing = "0.05em";

  const vizContainer = document.createElement("div");
  vizContainer.className = "viz-container";

  const waveCanvas = new WaveformCanvas(vizContainer);
  const controls = createControls(waveCanvas);

  // Combined waveform visualization
  const combinedLabel = document.createElement("h3");
  combinedLabel.className = "viz-label";
  combinedLabel.textContent = "Combined Result";
  combinedLabel.style.fontSize = "0.875rem";
  combinedLabel.style.fontWeight = "600";
  combinedLabel.style.color = "var(--color-text-secondary)";
  combinedLabel.style.marginTop = "var(--spacing-lg)";
  combinedLabel.style.marginBottom = "var(--spacing-sm)";
  combinedLabel.style.textTransform = "uppercase";
  combinedLabel.style.letterSpacing = "0.05em";

  const combinedContainer = document.createElement("div");
  combinedContainer.className = "viz-container";

  const combinedCanvas = new CombinedCanvas(combinedContainer, waveCanvas);
  waveCanvas.setCombinedCanvas(combinedCanvas);

  page.append(controls, vizLabel, vizContainer, combinedLabel, combinedContainer);

  for (const el of postSections) {
    page.append(el);
  }

  container.append(page);

  waveCanvas.start();

  const unsubTheme = onThemeChange(() => {
    // Canvas redraws each frame via rAF
  });

  return () => {
    waveCanvas.stop();
    combinedCanvas.stop();
    unsubTheme();
  };
}
