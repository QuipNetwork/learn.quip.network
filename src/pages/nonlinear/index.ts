import { onThemeChange } from "../../lib/dark-mode";
import { createNonlinearContent } from "./content";
import {
  WaveformCanvas, SignalGridCanvas, AggregateCanvas,
} from "./WaveformCanvas";
import { createControls } from "./controls";

export function mountNonlinear(container: HTMLElement): () => void {
  const page = document.createElement("div");
  page.className = "nonlinear-page";

  const content = createNonlinearContent();
  const children = Array.from(content.children);

  // 0: title, 1: subtitle, 2: intro, 3: whatIsTitle, 4: whatIsBody,
  // 5: domainsTitle, 6: domainsBody,
  // 7: costTitle, 8: costBody, 9: citations
  const preSections = children.slice(0, 7);
  const postSections = children.slice(7);

  for (const el of preSections) {
    page.append(el);
  }

  // All signals overlay
  const vizLabel = document.createElement("h3");
  vizLabel.style.cssText =
    "font-size:0.875rem;font-weight:600;color:var(--color-text-secondary);" +
    "margin-bottom:var(--spacing-sm);text-transform:uppercase;" +
    "letter-spacing:0.05em";
  vizLabel.textContent = "All Signals";

  const vizContainer = document.createElement("div");
  vizContainer.className = "viz-container";
  const waveCanvas = new WaveformCanvas(vizContainer);
  const controls = createControls(waveCanvas);

  // 2x2 grid: each signal vs its linear prediction
  const gridLabel = document.createElement("h3");
  gridLabel.style.cssText =
    "font-size:0.875rem;font-weight:600;color:var(--color-text-secondary);" +
    "margin-top:var(--spacing-lg);margin-bottom:var(--spacing-xs);" +
    "text-transform:uppercase;letter-spacing:0.05em";
  gridLabel.textContent = "Individual Signals vs. Linear Prediction";

  const gridCaption = document.createElement("p");
  gridCaption.style.cssText =
    "font-size:0.8125rem;color:var(--color-text-secondary);" +
    "margin-bottom:var(--spacing-sm);line-height:1.5";
  gridCaption.textContent =
    "The dashed line is a least-squares sinusoidal fit " +
    "(y = a\u00B7sin(\u03C9t) + b\u00B7cos(\u03C9t) + c) retrained " +
    "at a configurable interval. Under predictable conditions it " +
    "tracks almost perfectly. As coupling increases, non-linear " +
    "harmonics and amplitude modulation appear that a single-" +
    "frequency model cannot capture. Increase the update interval " +
    "to simulate a model retrained hourly or daily \u2014 between " +
    "updates, the prediction is a stale extrapolation that drifts " +
    "further from reality as non-linear effects accumulate.";

  const gridContainer = document.createElement("div");
  gridContainer.className = "viz-container";
  const gridCanvas = new SignalGridCanvas(gridContainer, waveCanvas);
  waveCanvas.setGridCanvas(gridCanvas);

  // Aggregate: sum of all signals vs sum of predictions
  const aggLabel = document.createElement("h3");
  aggLabel.style.cssText =
    "font-size:0.875rem;font-weight:600;color:var(--color-text-secondary);" +
    "margin-top:var(--spacing-lg);margin-bottom:var(--spacing-sm);" +
    "text-transform:uppercase;letter-spacing:0.05em";
  aggLabel.textContent = "Aggregate Portfolio Signal";

  const aggContainer = document.createElement("div");
  aggContainer.className = "viz-container";
  const aggCanvas = new AggregateCanvas(aggContainer, waveCanvas);
  waveCanvas.setAggCanvas(aggCanvas);

  page.append(
    controls, vizLabel, vizContainer,
    gridLabel, gridCaption, gridContainer,
    aggLabel, aggContainer,
  );

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
    gridCanvas.stop();
    aggCanvas.stop();
    unsubTheme();
  };
}
