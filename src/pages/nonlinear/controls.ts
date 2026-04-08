import type { WaveformCanvas } from "./WaveformCanvas";

function createSlider(opts: {
  label: string;
  min: number;
  max: number;
  value: number;
  formatValue: (v: number) => string;
  onChange: (v: number) => void;
}): HTMLDivElement {
  const group = document.createElement("div");
  group.className = "control-group";

  const labelEl = document.createElement("label");
  labelEl.textContent = opts.label;

  const input = document.createElement("input");
  input.type = "range";
  input.min = String(opts.min);
  input.max = String(opts.max);
  input.value = String(opts.value);

  const valueDisplay = document.createElement("span");
  valueDisplay.className = "control-value";
  valueDisplay.textContent = opts.formatValue(opts.value);

  input.addEventListener("input", () => {
    const v = Number(input.value);
    valueDisplay.textContent = opts.formatValue(v);
    opts.onChange(v);
  });

  group.append(labelEl, input, valueDisplay);
  return group;
}

function formatPercent(v: number): string {
  return v + "%";
}

function formatSignedPercent(v: number): string {
  if (v > 0) return "+" + v + "%";
  return v + "%";
}

export function createControls(canvas: WaveformCanvas): HTMLElement {
  const wrapper = document.createElement("div");
  wrapper.className = "viz-controls";

  const couplingSlider = createSlider({
    label: "Coupling strength",
    min: 0,
    max: 100,
    value: 0,
    formatValue: formatPercent,
    onChange: (v) => canvas.setCoupling(v / 100),
  });

  const perturbSlider = createSlider({
    label: "Perturbation",
    min: -50,
    max: 50,
    value: 0,
    formatValue: formatSignedPercent,
    onChange: (v) => canvas.setPerturbation(v / 100),
  });

  wrapper.append(couplingSlider, perturbSlider);
  return wrapper;
}
