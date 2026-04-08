import type { WaveformCanvas } from "./WaveformCanvas";
import { WAVEFORMS } from "./WaveformCanvas";

interface SliderRef {
  input: HTMLInputElement;
  display: HTMLSpanElement;
  format: (v: number) => string;
}

function createSlider(opts: {
  label: string;
  min: number;
  max: number;
  value: number;
  color?: string;
  formatValue: (v: number) => string;
  onChange: (v: number) => void;
}): { el: HTMLDivElement; ref: SliderRef } {
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
  return {
    el: group,
    ref: { input, display: valueDisplay, format: opts.formatValue },
  };
}

function setSlider(ref: SliderRef, value: number): void {
  ref.input.value = String(value);
  ref.display.textContent = ref.format(value);
  ref.input.dispatchEvent(new Event("input"));
}

function formatPercent(v: number): string {
  return v + "%";
}

function formatSignedPercent(v: number): string {
  if (v > 0) return "+" + v + "%";
  return v + "%";
}

interface Scenario {
  label: string;
  coupling: number;
  perturbation: number;
  signals: number[];
}

const SCENARIOS: Scenario[] = [
  {
    label: "Normal conditions",
    coupling: 0,
    perturbation: 0,
    signals: [0, 0, 0, 0],
  },
  {
    label: "2008 crisis",
    coupling: 85,
    perturbation: -40,
    signals: [-30, 0, -50, -20],
  },
  {
    label: "Housing shock",
    coupling: 60,
    perturbation: -35,
    signals: [-60, 0, 0, 0],
  },
  {
    label: "Credit contagion",
    coupling: 75,
    perturbation: -15,
    signals: [0, 50, -40, -30],
  },
  {
    label: "Stimulus response",
    coupling: 45,
    perturbation: 40,
    signals: [30, 0, 20, 40],
  },
];

export function createControls(canvas: WaveformCanvas): HTMLElement {
  const wrapper = document.createElement("div");

  // Scenario buttons
  const scenarioRow = document.createElement("div");
  scenarioRow.className = "viz-controls";
  scenarioRow.style.borderBottomLeftRadius = "0";
  scenarioRow.style.borderBottomRightRadius = "0";
  scenarioRow.style.marginBottom = "0";
  scenarioRow.style.gap = "var(--spacing-sm)";

  const scenarioLabel = document.createElement("span");
  scenarioLabel.style.fontSize = "0.75rem";
  scenarioLabel.style.fontWeight = "600";
  scenarioLabel.style.color = "var(--color-text-secondary)";
  scenarioLabel.style.textTransform = "uppercase";
  scenarioLabel.style.letterSpacing = "0.05em";
  scenarioLabel.style.whiteSpace = "nowrap";
  scenarioLabel.textContent = "Scenarios";
  scenarioRow.append(scenarioLabel);

  // Collect slider refs so scenarios can set them
  const sliderRefs: {
    coupling?: SliderRef;
    perturbation?: SliderRef;
    signals: SliderRef[];
  } = { signals: [] };

  function applyScenario(s: Scenario): void {
    if (sliderRefs.coupling) setSlider(sliderRefs.coupling, s.coupling);
    if (sliderRefs.perturbation) {
      setSlider(sliderRefs.perturbation, s.perturbation);
    }
    for (let i = 0; i < s.signals.length; i++) {
      const ref = sliderRefs.signals[i];
      if (ref) setSlider(ref, s.signals[i] ?? 0);
    }
  }

  for (const scenario of SCENARIOS) {
    const btn = document.createElement("button");
    btn.className = "btn btn-secondary";
    btn.style.fontSize = "0.75rem";
    btn.style.padding = "4px 10px";
    btn.textContent = scenario.label;
    btn.addEventListener("click", () => applyScenario(scenario));
    scenarioRow.append(btn);
  }

  // Global controls
  const globalRow = document.createElement("div");
  globalRow.className = "viz-controls";
  globalRow.style.borderRadius = "0";
  globalRow.style.marginTop = "0";
  globalRow.style.marginBottom = "0";
  globalRow.style.borderTop = "1px solid var(--color-border)";

  const coupling = createSlider({
    label: "Coupling strength",
    min: 0,
    max: 100,
    value: 0,
    formatValue: formatPercent,
    onChange: (v) => canvas.setCoupling(v / 100),
  });
  sliderRefs.coupling = coupling.ref;

  const perturb = createSlider({
    label: "Global perturbation",
    min: -50,
    max: 50,
    value: 0,
    formatValue: formatSignedPercent,
    onChange: (v) => canvas.setPerturbation(v / 100),
  });
  sliderRefs.perturbation = perturb.ref;

  globalRow.append(coupling.el, perturb.el);

  // Per-signal controls
  const signalRow = document.createElement("div");
  signalRow.className = "viz-controls";
  signalRow.style.marginTop = "0";
  signalRow.style.borderTop = "1px solid var(--color-border)";
  signalRow.style.borderTopLeftRadius = "0";
  signalRow.style.borderTopRightRadius = "0";

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
    slider.el.style.minWidth = "140px";
    sliderRefs.signals.push(slider.ref);
    signalRow.append(slider.el);
  }

  wrapper.append(scenarioRow, globalRow, signalRow);
  return wrapper;
}
