import type { WaveformCanvas } from "./WaveformCanvas";
import { WAVEFORMS } from "./WaveformCanvas";

function createSlider(opts: {
  label: string;
  min: number;
  max: number;
  value: number;
  color?: string;
  formatValue: (v: number) => string;
  onChange: (v: number) => void;
}): HTMLDivElement {
  const group = document.createElement("div");
  group.className = "control-group";

  const labelEl = document.createElement("label");
  if (opts.color) {
    const swatch = document.createElement("span");
    swatch.style.display = "inline-block";
    swatch.style.width = "10px";
    swatch.style.height = "10px";
    swatch.style.borderRadius = "2px";
    swatch.style.backgroundColor = opts.color;
    swatch.style.marginRight = "6px";
    swatch.style.verticalAlign = "middle";
    labelEl.append(swatch);
  }
  labelEl.append(document.createTextNode(opts.label));

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

  // Global controls
  const globalRow = document.createElement("div");
  globalRow.className = "viz-controls";

  const couplingSlider = createSlider({
    label: "Coupling strength",
    min: 0,
    max: 100,
    value: 0,
    formatValue: formatPercent,
    onChange: (v) => canvas.setCoupling(v / 100),
  });

  const perturbSlider = createSlider({
    label: "Global perturbation",
    min: -50,
    max: 50,
    value: 0,
    formatValue: formatSignedPercent,
    onChange: (v) => canvas.setPerturbation(v / 100),
  });

  globalRow.append(couplingSlider, perturbSlider);

  // Per-signal controls
  const signalRow = document.createElement("div");
  signalRow.className = "viz-controls";
  signalRow.style.marginTop = "0";
  signalRow.style.borderTop = "1px solid var(--color-border)";
  signalRow.style.borderTopLeftRadius = "0";
  signalRow.style.borderTopRightRadius = "0";

  // Remove bottom radius from global row to merge visually
  globalRow.style.borderBottomLeftRadius = "0";
  globalRow.style.borderBottomRightRadius = "0";
  globalRow.style.marginBottom = "0";

  for (let i = 0; i < WAVEFORMS.length; i++) {
    const wf = WAVEFORMS[i]!;
    const slider = createSlider({
      label: wf.label,
      min: -80,
      max: 80,
      value: 0,
      color: wf.color,
      formatValue: formatSignedPercent,
      onChange: (v) => canvas.setSignalPerturbation(i, v / 100),
    });
    slider.style.minWidth = "140px";
    signalRow.append(slider);
  }

  wrapper.append(globalRow, signalRow);
  return wrapper;
}
