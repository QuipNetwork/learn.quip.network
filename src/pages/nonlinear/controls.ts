import type { WaveformEngine } from "./WaveformCanvas";
import { SIGNALS } from "./WaveformCanvas";

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
    swatch.style.cssText =
      "display:inline-block;width:10px;height:10px;border-radius:2px;" +
      "margin-right:6px;vertical-align:middle;background:" + opts.color;
    labelEl.append(swatch);
  }
  labelEl.append(document.createTextNode(opts.label));

  const input = document.createElement("input");
  input.type = "range";
  input.min = String(opts.min);
  input.max = String(opts.max);
  input.value = String(opts.value);

  const display = document.createElement("span");
  display.className = "control-value";
  display.textContent = opts.formatValue(opts.value);

  input.addEventListener("input", () => {
    const v = Number(input.value);
    display.textContent = opts.formatValue(v);
    opts.onChange(v);
  });

  group.append(labelEl, input, display);
  return { el: group, ref: { input, display, format: opts.formatValue } };
}

function setSlider(ref: SliderRef, value: number): void {
  ref.input.value = String(value);
  ref.display.textContent = ref.format(value);
  ref.input.dispatchEvent(new Event("input"));
}

function pct(v: number): string { return v + "%"; }
function signedPct(v: number): string { return (v > 0 ? "+" : "") + v + "%"; }

interface Scenario {
  label: string;
  couplingAB: number;
  couplingBA: number;
  perturbation: number;
  perturbA: number;
  perturbB: number;
  phaseB: number; // degrees
}

const SCENARIOS: Scenario[] = [
  {
    label: "Predictable",
    couplingAB: 0, couplingBA: 0,
    perturbation: 0, perturbA: 0, perturbB: 0, phaseB: 90,
  },
  {
    label: "Amplification",
    couplingAB: 70, couplingBA: 70,
    perturbation: 0, perturbA: 0, perturbB: 0, phaseB: 0,
  },
  {
    label: "Destruction",
    couplingAB: 70, couplingBA: 70,
    perturbation: 0, perturbA: 0, perturbB: 0, phaseB: 180,
  },
  {
    label: "Volatility",
    couplingAB: 60, couplingBA: 35,
    perturbation: -50, perturbA: 20, perturbB: -30, phaseB: 137,
  },
];

const UPDATE_LABELS = [
  "Continuous", "1 hour", "6 hours", "12 hours", "1 day", "1 week",
];
const UPDATE_STEPS = [0, 15, 30, 50, 80, 150];

export function createControls(engine: WaveformEngine): HTMLElement {
  const wrapper = document.createElement("div");

  const refs: Record<string, SliderRef> = {};

  function apply(s: Scenario): void {
    engine.resetModels();
    if (refs["cab"]) setSlider(refs["cab"], s.couplingAB);
    if (refs["cba"]) setSlider(refs["cba"], s.couplingBA);
    if (refs["gp"]) setSlider(refs["gp"], s.perturbation);
    if (refs["ph"]) setSlider(refs["ph"], s.phaseB);
    if (refs["pa"]) setSlider(refs["pa"], s.perturbA);
    if (refs["pb"]) setSlider(refs["pb"], s.perturbB);
  }

  // Row 1: Scenario buttons
  const row1 = document.createElement("div");
  row1.className = "viz-controls";
  row1.style.cssText =
    "border-bottom-left-radius:0;border-bottom-right-radius:0;" +
    "margin-bottom:0;gap:var(--spacing-sm)";

  const label = document.createElement("span");
  label.style.cssText =
    "font-size:0.75rem;font-weight:600;color:var(--color-text-secondary);" +
    "text-transform:uppercase;letter-spacing:0.05em;white-space:nowrap";
  label.textContent = "Scenarios";
  row1.append(label);

  for (const s of SCENARIOS) {
    const btn = document.createElement("button");
    btn.className = "btn btn-secondary";
    btn.style.cssText = "font-size:0.75rem;padding:4px 10px";
    btn.textContent = s.label;
    btn.addEventListener("click", () => apply(s));
    row1.append(btn);
  }

  // Row 2: Coupling + global perturbation + update frequency
  const row2 = document.createElement("div");
  row2.className = "viz-controls";
  row2.style.cssText = "border-radius:0;margin:0;border-top:1px solid var(--color-border)";

  const cab = createSlider({
    label: "A \u2192 B coupling",
    min: 0, max: 100, value: 0,
    formatValue: pct,
    onChange: (v) => engine.setCouplingAB(v / 100),
  });
  refs["cab"] = cab.ref;

  const cba = createSlider({
    label: "B \u2192 A coupling",
    min: 0, max: 100, value: 0,
    formatValue: pct,
    onChange: (v) => engine.setCouplingBA(v / 100),
  });
  refs["cba"] = cba.ref;

  const gp = createSlider({
    label: "Global perturbation",
    min: -50, max: 50, value: 0,
    formatValue: signedPct,
    onChange: (v) => engine.setPerturbation(v / 100),
  });
  refs["gp"] = gp.ref;

  const ph = createSlider({
    label: "Phase offset B",
    min: 0, max: 360, value: 90,
    formatValue: (v) => v + "\u00B0",
    onChange: (v) => engine.setPhaseB(v * Math.PI / 180),
  });
  refs["ph"] = ph.ref;

  const uf = createSlider({
    label: "Model update frequency",
    min: 0, max: UPDATE_LABELS.length - 1, value: 1,
    formatValue: (v) => UPDATE_LABELS[v] ?? "Continuous",
    onChange: (v) => engine.setUpdateInterval(UPDATE_STEPS[v] ?? 0),
  });

  row2.append(cab.el, cba.el, gp.el, ph.el, uf.el);

  // Row 3: Per-signal perturbation
  const row3 = document.createElement("div");
  row3.className = "viz-controls";
  row3.style.cssText =
    "margin-top:0;border-top:1px solid var(--color-border);" +
    "border-top-left-radius:0;border-top-right-radius:0";

  const pa = createSlider({
    label: SIGNALS[0].label,
    min: -80, max: 80, value: 0,
    color: SIGNALS[0].color,
    formatValue: signedPct,
    onChange: (v) => engine.setPerturbA(v / 100),
  });
  refs["pa"] = pa.ref;

  const pb = createSlider({
    label: SIGNALS[1].label,
    min: -80, max: 80, value: 0,
    color: SIGNALS[1].color,
    formatValue: signedPct,
    onChange: (v) => engine.setPerturbB(v / 100),
  });
  refs["pb"] = pb.ref;

  row3.append(pa.el, pb.el);

  wrapper.append(row1, row2, row3);
  return wrapper;
}
