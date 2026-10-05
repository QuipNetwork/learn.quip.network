import { onThemeChange } from "../../lib/dark-mode";
import { LandscapeCanvas } from "./LandscapeCanvas";
import { createTunnelingControls } from "./controls";

export function mountQuantumTunneling(container: HTMLElement): () => void {
  const demo = container.querySelector<HTMLElement>('[data-demo="quantum-tunneling"]')!;
  const vizContainer = demo.querySelector<HTMLElement>(".viz-container")!;
  const canvas = new LandscapeCanvas(vizContainer);
  demo.querySelector(".viz-controls-slot")!.replaceChildren(createTunnelingControls(canvas));
  canvas.start();

  const unsubTheme = onThemeChange(() => canvas.redraw());
  return () => {
    canvas.stop();
    unsubTheme();
  };
}
