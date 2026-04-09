import { onThemeChange } from "../../lib/dark-mode";
import { createNonlinearContent } from "./content";
import {
  WaveformEngine, InputCanvas, CoupledCanvas, AggregateCanvas,
} from "./WaveformCanvas";
import { createControls } from "./controls";

function vizHeading(text: string, top?: boolean): HTMLElement {
  const h = document.createElement("h3");
  h.style.cssText =
    "font-size:0.875rem;font-weight:600;color:var(--color-text-secondary);" +
    "margin-bottom:var(--spacing-sm);text-transform:uppercase;" +
    "letter-spacing:0.05em" +
    (top ? "" : ";margin-top:var(--spacing-lg)");
  h.textContent = text;
  return h;
}

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

  for (const el of preSections) page.append(el);

  // Engine drives all three canvases
  const engine = new WaveformEngine();
  const controls = createControls(engine);

  // Graph 1: Unmodified Input
  const input1 = document.createElement("div");
  input1.className = "viz-container";
  const inputCanvas = new InputCanvas(input1, engine);
  engine.addPanel(inputCanvas);

  // Graph 2: Coupled Output with predictions
  const output2 = document.createElement("div");
  output2.className = "viz-container";
  const coupledCanvas = new CoupledCanvas(output2, engine);
  engine.addPanel(coupledCanvas);

  // Caption for prediction
  const caption = document.createElement("p");
  caption.style.cssText =
    "font-size:0.8125rem;color:var(--color-text-secondary);" +
    "margin-bottom:var(--spacing-sm);line-height:1.5";
  caption.textContent =
    "Dashed lines show a least-squares sinusoidal fit " +
    "(y = a\u00B7sin(\u03C9t) + b\u00B7cos(\u03C9t) + c) retrained " +
    "at the configured interval. Under predictable conditions the " +
    "model tracks almost perfectly. With coupling, non-linear " +
    "harmonics appear that a single-frequency model cannot capture.";

  // Graph 3: Aggregate with prediction
  const agg3 = document.createElement("div");
  agg3.className = "viz-container";
  const aggCanvas = new AggregateCanvas(agg3, engine);
  engine.addPanel(aggCanvas);

  page.append(
    controls,
    vizHeading("Unmodified Input (no coupling)", true), input1,
    vizHeading("Coupled Output"), caption, output2,
    vizHeading("Aggregate"), agg3,
  );

  for (const el of postSections) page.append(el);

  container.append(page);
  engine.start();

  const unsubTheme = onThemeChange(() => {
    // Canvases redraw each frame via rAF
  });

  return () => {
    engine.stop();
    unsubTheme();
  };
}
