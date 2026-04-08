import { onThemeChange } from "../../lib/dark-mode";
import { createNonlinearContent } from "./content";
import { WaveformCanvas } from "./WaveformCanvas";
import { createControls } from "./controls";

export function mountNonlinear(container: HTMLElement): () => void {
  const page = document.createElement("div");
  page.className = "nonlinear-page";

  // Build all content sections
  const content = createNonlinearContent();
  const children = Array.from(content.children);

  // Extract sections by position:
  // 0: title, 1: subtitle, 2: intro, 3: whatIsTitle, 4: whatIsBody,
  // 5: costTitle, 6: costBody, 7: appTitle, 8: appBody, 9: citations
  const preSections = children.slice(0, 5); // title through whatIs
  const postSections = children.slice(5);   // cost, app, citations

  // Add pre-visualization content
  for (const el of preSections) {
    page.append(el);
  }

  // Visualization: controls + canvas
  const vizContainer = document.createElement("div");
  vizContainer.className = "viz-container";

  const canvas = new WaveformCanvas(vizContainer);
  const controls = createControls(canvas);

  page.append(controls, vizContainer);

  // Add post-visualization content
  for (const el of postSections) {
    page.append(el);
  }

  container.append(page);

  // Start animation
  canvas.start();

  // Subscribe to theme changes to trigger redraw
  const unsubTheme = onThemeChange(() => {
    // Canvas redraws each frame, so theme change is picked up
    // automatically on the next rAF tick.
  });

  return () => {
    canvas.stop();
    unsubTheme();
  };
}
