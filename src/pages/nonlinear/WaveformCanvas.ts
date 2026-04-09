import { getThemeColors } from "../../lib/dark-mode";
import type { ThemeColors } from "../../lib/dark-mode";

// --- Signal model: 2 waveforms with directional coupling ---

const SIGNAL_A = { label: "Waveform A", color: "#3266ad", freq: 1.0 };
const SIGNAL_B = { label: "Waveform B", color: "#D85A30", freq: 1.0 };

const X_MAX = 6 * Math.PI;
const AMPLITUDE = 90;
const TIME_STEP = 0.015;

export const SIGNALS = [SIGNAL_A, SIGNAL_B] as const;

// --- Shared state managed by the main canvas ---

export class WaveformEngine {
  private time = 0;
  private couplingAB = 0; // A impacts B
  private couplingBA = 0; // B impacts A
  private perturbation = 0;
  private perturbA = 0;
  private perturbB = 0;
  private phaseB = Math.PI / 2; // default 90°
  private updateInterval = 15; // default: 1 hour
  private animId = 0;
  private panels: Array<{ draw: () => void; stop: () => void }> = [];

  setCouplingAB(v: number): void { this.couplingAB = v; }
  setCouplingBA(v: number): void { this.couplingBA = v; }
  setPerturbation(v: number): void { this.perturbation = v; }
  setPerturbA(v: number): void { this.perturbA = v; }
  setPerturbB(v: number): void { this.perturbB = v; }
  setPhaseB(v: number): void { this.phaseB = v; }
  setUpdateInterval(v: number): void { this.updateInterval = v; }
  getUpdateInterval(): number { return this.updateInterval; }

  addPanel(panel: { draw: () => void; stop: () => void }): void {
    this.panels.push(panel);
  }

  start(): void {
    const frame = (): void => {
      this.time += TIME_STEP;
      for (const p of this.panels) p.draw();
      this.animId = requestAnimationFrame(frame);
    };
    this.animId = requestAnimationFrame(frame);
  }

  stop(): void {
    cancelAnimationFrame(this.animId);
    for (const p of this.panels) p.stop();
  }

  // Raw uncoupled signals (for Graph 1)
  rawA(x: number): number {
    const base = Math.sin(SIGNAL_A.freq * x + this.time);
    const perturb = this.perturbation * (
      Math.sin(0.317 * x + this.time * 0.53) +
      0.4 * Math.sin(0.781 * x + this.time * 1.17)
    );
    return (base + perturb) * AMPLITUDE * (1 + this.perturbA);
  }

  rawB(x: number): number {
    const base = Math.sin(SIGNAL_B.freq * x + this.time + this.phaseB);
    const perturb = this.perturbation * (
      Math.sin(0.523 * x + this.time * 0.37) +
      0.4 * Math.sin(0.919 * x + this.time * 0.83)
    );
    return (base + perturb) * AMPLITUDE * (1 + this.perturbB);
  }

  // Coupled signals (for Graph 2)
  // Add a fraction of the other signal directly.
  // In-phase (0°): A + coupling*B ≈ A*(1+coupling) — amplified.
  // Anti-phase (180°): A + coupling*(-A) = A*(1-coupling) — flattens.
  // At 100% coupling + 180° phase, output is zero.
  coupledA(x: number): number {
    return this.rawA(x) + this.couplingBA * this.rawB(x);
  }

  coupledB(x: number): number {
    return this.rawB(x) + this.couplingAB * this.rawA(x);
  }
}

// --- Shared rendering utilities ---

const CANVAS_H = 260;
const LEGEND_H = 28;
const GRID_COUNT = 5;
const MIN_CYCLES = 1.0;

function setupCanvas(
  container: HTMLElement,
  height: number,
  label: string,
): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; dpr: number; ro: ResizeObserver } {
  const dpr = window.devicePixelRatio || 1;
  const canvas = document.createElement("canvas");
  canvas.style.width = "100%";
  canvas.style.height = height + "px";
  canvas.style.display = "block";
  canvas.setAttribute("role", "img");
  canvas.setAttribute("aria-label", label);
  container.append(canvas);

  const ctx = canvas.getContext("2d")!;
  const sync = (): void => {
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  };
  const ro = new ResizeObserver(sync);
  ro.observe(container);
  sync();

  return { canvas, ctx, dpr, ro };
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  w: number,
  plotH: number,
  theme: ThemeColors,
): void {
  ctx.strokeStyle = theme.grid;
  ctx.lineWidth = 1;
  for (let i = 1; i <= GRID_COUNT; i++) {
    const y = (plotH / (GRID_COUNT + 1)) * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = theme.zero;
  ctx.beginPath();
  ctx.moveTo(0, plotH / 2);
  ctx.lineTo(w, plotH / 2);
  ctx.stroke();
  ctx.restore();
}

function drawLegendTwoSignals(
  ctx: CanvasRenderingContext2D,
  w: number,
  plotTop: number,
  legendH: number,
  textColor: string,
  extra?: { dashColor: string; dashLabel: string },
): void {
  const y = plotTop + legendH / 2;
  ctx.font = "11px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";

  // Signal A
  ctx.fillStyle = SIGNAL_A.color;
  ctx.fillRect(12, y - 1.5, 14, 3);
  ctx.fillStyle = textColor;
  ctx.fillText(SIGNAL_A.label, 32, y);

  // Signal B
  ctx.fillStyle = SIGNAL_B.color;
  ctx.fillRect(130, y - 1.5, 14, 3);
  ctx.fillStyle = textColor;
  ctx.fillText(SIGNAL_B.label, 150, y);

  if (extra) {
    ctx.save();
    ctx.setLineDash([5, 3]);
    ctx.strokeStyle = extra.dashColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(260, y);
    ctx.lineTo(274, y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    ctx.fillStyle = textColor;
    ctx.fillText(extra.dashLabel, 280, y);
  }
}

// --- Sinusoidal prediction ---

function fitSinusoid(
  values: number[],
  lo: number,
  hi: number,
  freq: number,
  xPerStep: number,
  xOffset: number,
): { a: number; b: number; c: number } | null {
  const count = hi - lo + 1;
  if (count < 3) return null;

  let sumY = 0;
  for (let j = lo; j <= hi; j++) sumY += values[j] ?? 0;
  const c = sumY / count;

  let sinProj = 0, cosProj = 0, sinNorm = 0, cosNorm = 0;
  for (let j = lo; j <= hi; j++) {
    const x = (j + xOffset) * xPerStep;
    const sv = Math.sin(freq * x);
    const cv = Math.cos(freq * x);
    const r = (values[j] ?? 0) - c;
    sinProj += r * sv;
    cosProj += r * cv;
    sinNorm += sv * sv;
    cosNorm += cv * cv;
  }

  return {
    a: sinNorm > 1e-10 ? sinProj / sinNorm : 0,
    b: cosNorm > 1e-10 ? cosProj / cosNorm : 0,
    c,
  };
}

function predict(
  values: number[],
  win: number,
  freq: number,
  xPerStep: number,
  updateInterval: number,
  xOffset: number,
): number[] {
  const n = values.length;
  const out: number[] = [];
  const evalFit = (
    fit: { a: number; b: number; c: number },
    i: number,
  ): number => {
    const x = (i + xOffset) * xPerStep;
    return fit.a * Math.sin(freq * x) + fit.b * Math.cos(freq * x) + fit.c;
  };

  if (updateInterval <= 0) {
    for (let i = 0; i < n; i++) {
      const lo = Math.max(0, i - win);
      const fit = fitSinusoid(values, lo, i, freq, xPerStep, xOffset);
      out.push(fit ? evalFit(fit, i) : (values[i] ?? 0));
    }
    return out;
  }

  let currentFit: { a: number; b: number; c: number } | null = null;
  for (let i = 0; i < n; i++) {
    if (i % updateInterval === 0) {
      const lo = Math.max(0, i - win);
      currentFit = fitSinusoid(values, lo, i, freq, xPerStep, xOffset);
    }
    out.push(currentFit ? evalFit(currentFit, i) : (values[i] ?? 0));
  }
  return out;
}

function computePrediction(
  values: number[],
  steps: number,
  freq: number,
  xPerStep: number,
  updateInterval: number,
): number[] {
  const wavelengthInSteps = (2 * Math.PI / freq) / xPerStep;
  const win = Math.min(steps, Math.max(40, Math.ceil(wavelengthInSteps * MIN_CYCLES)));
  const pad = win;

  // Extend values left for training history
  // values already includes pad+steps+1 entries with offset -pad
  const all = predict(values, win, freq, xPerStep, updateInterval, -pad);
  return all.slice(pad);
}

// Helper to sample a signal with padding for prediction training
function sampleWithPad(
  fn: (x: number) => number,
  steps: number,
  xPerStep: number,
  freq: number,
  amp: number,
): { all: number[]; pad: number; visible: number[] } {
  const wavelengthInSteps = (2 * Math.PI / freq) / xPerStep;
  const win = Math.min(steps, Math.max(40, Math.ceil(wavelengthInSteps * MIN_CYCLES)));
  const pad = win;
  const all: number[] = [];
  for (let i = -pad; i <= steps; i++) {
    all.push(fn(i * xPerStep) / AMPLITUDE * amp);
  }
  return { all, pad, visible: all.slice(pad) };
}

// --- Graph 1: Unmodified Input (no coupling) ---

export class InputCanvas {
  private c;
  constructor(container: HTMLElement, private engine: WaveformEngine) {
    this.c = setupCanvas(container, CANVAS_H, "Unmodified input signals without coupling");
  }
  stop(): void { this.c.ro.disconnect(); }
  draw(): void {
    const { canvas, ctx } = this.c;
    const w = canvas.clientWidth;
    const h = CANVAS_H;
    const theme = getThemeColors();
    const plotH = h - LEGEND_H;
    const cy = plotH / 2;
    const steps = Math.max(w, 200);

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, w, h);
    drawGrid(ctx, w, plotH, theme);

    // Draw raw A
    ctx.strokeStyle = SIGNAL_A.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const px = (i / steps) * w;
      const x = (i / steps) * X_MAX;
      const y = cy - this.engine.rawA(x) / AMPLITUDE * (plotH * 0.4);
      if (i === 0) ctx.moveTo(px, y); else ctx.lineTo(px, y);
    }
    ctx.stroke();

    // Draw raw B
    ctx.strokeStyle = SIGNAL_B.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const px = (i / steps) * w;
      const x = (i / steps) * X_MAX;
      const y = cy - this.engine.rawB(x) / AMPLITUDE * (plotH * 0.4);
      if (i === 0) ctx.moveTo(px, y); else ctx.lineTo(px, y);
    }
    ctx.stroke();

    drawLegendTwoSignals(ctx, w, plotH, LEGEND_H, theme.text);
  }
}

// --- Graph 2: Coupled Output (with prediction) ---

export class CoupledCanvas {
  private c;
  constructor(container: HTMLElement, private engine: WaveformEngine) {
    this.c = setupCanvas(container, CANVAS_H, "Coupled output signals with linear predictions");
  }
  stop(): void { this.c.ro.disconnect(); }
  draw(): void {
    const { canvas, ctx } = this.c;
    const w = canvas.clientWidth;
    const h = CANVAS_H;
    const theme = getThemeColors();
    const plotH = h - LEGEND_H;
    const cy = plotH / 2;
    const steps = Math.max(w, 200);
    const amp = plotH * 0.4;
    const xPerStep = X_MAX / steps;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, w, h);
    drawGrid(ctx, w, plotH, theme);

    const drawSignal = (
      fn: (x: number) => number,
      freq: number,
      color: string,
    ): void => {
      const { all, pad, visible } = sampleWithPad(fn, steps, xPerStep, freq, amp);

      // Prediction (dashed, behind)
      const pred = computePrediction(all, steps, freq, xPerStep, this.engine.getUpdateInterval());
      ctx.save();
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = theme.textSecondary;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const px = (i / steps) * w;
        const py = cy - (pred[i] ?? 0);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // Actual (solid)
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const px = (i / steps) * w;
        const py = cy - (visible[i] ?? 0);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Suppress unused var
      void pad;
    };

    drawSignal((x) => this.engine.coupledA(x), SIGNAL_A.freq, SIGNAL_A.color);
    drawSignal((x) => this.engine.coupledB(x), SIGNAL_B.freq, SIGNAL_B.color);

    drawLegendTwoSignals(ctx, w, plotH, LEGEND_H, theme.text, {
      dashColor: theme.textSecondary,
      dashLabel: "Linear prediction",
    });
  }
}

// --- Graph 3: Aggregate (with prediction) ---

const AGG_HEIGHT = 200;
const AGG_LEGEND_H = 24;

export class AggregateCanvas {
  private c;
  constructor(container: HTMLElement, private engine: WaveformEngine) {
    this.c = setupCanvas(container, AGG_HEIGHT, "Aggregate signal with linear prediction");
  }
  stop(): void { this.c.ro.disconnect(); }
  draw(): void {
    const { canvas, ctx } = this.c;
    const w = canvas.clientWidth;
    const h = AGG_HEIGHT;
    const theme = getThemeColors();
    const plotH = h - AGG_LEGEND_H;
    const cy = plotH / 2;
    const steps = Math.max(w, 200);
    const amp = plotH * 0.35;
    const xPerStep = X_MAX / steps;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, w, h);

    // Gridlines
    ctx.strokeStyle = theme.grid;
    ctx.lineWidth = 1;
    for (let i = 1; i <= 3; i++) {
      const y = (plotH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = theme.zero;
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(w, cy);
    ctx.stroke();
    ctx.restore();

    // Sum actual and predicted for both signals
    const actualSum: number[] = new Array(steps + 1).fill(0);
    const predSum: number[] = new Array(steps + 1).fill(0);

    const addSignal = (fn: (x: number) => number, freq: number): void => {
      const { all, visible } = sampleWithPad(fn, steps, xPerStep, freq, amp);
      const pred = computePrediction(all, steps, freq, xPerStep, this.engine.getUpdateInterval());
      for (let i = 0; i <= steps; i++) {
        actualSum[i] = (actualSum[i] ?? 0) + (visible[i] ?? 0);
        predSum[i] = (predSum[i] ?? 0) + (pred[i] ?? 0);
      }
    };

    addSignal((x) => this.engine.coupledA(x), SIGNAL_A.freq);
    addSignal((x) => this.engine.coupledB(x), SIGNAL_B.freq);

    // Prediction (dashed)
    ctx.save();
    ctx.setLineDash([8, 5]);
    ctx.strokeStyle = theme.textSecondary;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const px = (i / steps) * w;
      const py = cy - (predSum[i] ?? 0);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Fill
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const px = (i / steps) * w;
      const py = cy - (actualSum[i] ?? 0);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.save();
    ctx.lineTo(w, cy);
    ctx.lineTo(0, cy);
    ctx.closePath();
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = "#3266ad";
    ctx.fill();
    ctx.restore();

    // Actual (solid)
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const px = (i / steps) * w;
      const py = cy - (actualSum[i] ?? 0);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = "#3266ad";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Legend
    const legendY = plotH + AGG_LEGEND_H / 2;
    ctx.font = "11px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";

    ctx.fillStyle = "#3266ad";
    ctx.fillRect(12, legendY - 1.5, 14, 3);
    ctx.fillStyle = theme.text;
    ctx.fillText("Actual aggregate", 32, legendY);

    ctx.save();
    ctx.setLineDash([5, 3]);
    ctx.strokeStyle = theme.textSecondary;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(180, legendY);
    ctx.lineTo(194, legendY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    ctx.fillStyle = theme.text;
    ctx.fillText("Linear prediction", 200, legendY);
  }
}
