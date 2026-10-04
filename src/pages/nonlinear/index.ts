import { onThemeChange } from "../../lib/dark-mode";
import content from "./content.html?raw";
import { WaveformEngine, InputCanvas, CoupledCanvas, AggregateCanvas } from "./WaveformCanvas";
import { createControls } from "./controls";

export function mountNonlinear(container: HTMLElement): () => void {
  if (!container.querySelector(".nonlinear-page")) {
    container.insertAdjacentHTML("beforeend", content);
  }
  const demo = container.querySelector<HTMLElement>('[data-demo="nonlinear"]')!;
  const panels = demo.querySelectorAll<HTMLElement>(".viz-container");
  const engine = new WaveformEngine();
  demo.querySelector(".viz-controls-slot")!.replaceChildren(createControls(engine));
  engine.addPanel(new InputCanvas(panels[0]!, engine));
  engine.addPanel(new CoupledCanvas(panels[1]!, engine));
  engine.addPanel(new AggregateCanvas(panels[2]!, engine));
  engine.start();

  const unsubTheme = onThemeChange(() => {
    // Canvases redraw each frame via rAF.
  });
  return () => {
    engine.stop();
    unsubTheme();
  };
}
