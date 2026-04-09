import { getThemeColors } from "../../lib/dark-mode";
import type { ThemeColors } from "../../lib/dark-mode";

// --- Signal model: 2 waveforms with directional coupling ---

const SIGNAL_A = { label: "Waveform A", color: "#3266ad", freq: 1.0 };
const SIGNAL_B = { label: "Waveform B", color: "#D85A30", freq: 1.0 };

const X_MAX = 6 * Math.PI;
const AMPLITUDE = 90;
const TIME_STEP = 0.015;

export const SIGNALS = [SIGNAL_A, SIGNAL_B] as const;

// --- Prediction model ---
// Trained on historical samples, produces predictions from stale
// coefficients. Fits y = a*sin(ωx) + b*cos(ωx) + c to past data.

interface FitCoeffs { a: number; b: number; c: number }

class PredictionModel {
  private history: number[] = [];
  private xHistory: number[] = [];
  private coeffs: FitCoeffs = { a: 0, b: 0, c: 0 };
  private trained = false;
  private readonly freq: number;
  private readonly maxSamples = 200;

  constructor(freq: number) {
    this.freq = freq;
  }

  // Record a sample from the live signal
  addSample(x: number, value: number): void {
    this.history.push(value);
    this.xHistory.push(x);
    if (this.history.length > this.maxSamples) {
      this.history.shift();
      this.xHistory.shift();
    }
  }

  // Retrain the model on accumulated history
  retrain(): void {
    const n = this.history.length;
    if (n < 3) return;

    let sumY = 0;
    for (let i = 0; i < n; i++) sumY += this.history[i] ?? 0;
    const c = sumY / n;

    let sinProj = 0, cosProj = 0, sinNorm = 0, cosNorm = 0;
    for (let i = 0; i < n; i++) {
      const x = this.xHistory[i] ?? 0;
      const sv = Math.sin(this.freq * x);
      const cv = Math.cos(this.freq * x);
      const r = (this.history[i] ?? 0) - c;
      sinProj += r * sv;
      cosProj += r * cv;
      sinNorm += sv * sv;
      cosNorm += cv * cv;
    }

    this.coeffs = {
      a: sinNorm > 1e-10 ? sinProj / sinNorm : 0,
      b: cosNorm > 1e-10 ? cosProj / cosNorm : 0,
      c,
    };
    this.trained = true;
  }

  // Clear history (e.g., on scenario change)
  reset(): void {
    this.history = [];
    this.xHistory = [];
    this.trained = false;
    this.coeffs = { a: 0, b: 0, c: 0 };
  }

  // Predict signal value at position x using stale coefficients
  predict(x: number): number | null {
    if (!this.trained) return null;
    const { a, b, c } = this.coeffs;
    return a * Math.sin(this.freq * x) + b * Math.cos(this.freq * x) + c;
  }
}

// --- Engine: drives signals + predictions ---

const SAMPLE_POINTS = 16; // spatial sample points per training tick

export class WaveformEngine {
  private time = 0;
  private frameCount = 0;
  private couplingAB = 0;
  private couplingBA = 0;
  private perturbation = 0;
  private perturbA = 0;
  private perturbB = 0;
  private phaseB = Math.PI / 2;
  private updateInterval = 15; // frames between retrains
  private animId = 0;
  private panels: Array<{ draw: () => void; stop: () => void }> = [];

  // Prediction models for coupled signals
  readonly predA = new PredictionModel(SIGNAL_A.freq);
  readonly predB = new PredictionModel(SIGNAL_B.freq);
  readonly predAgg = new PredictionModel(SIGNAL_A.freq);

  setCouplingAB(v: number): void { this.couplingAB = v; }
  setCouplingBA(v: number): void { this.couplingBA = v; }
  setPerturbation(v: number): void { this.perturbation = v; }
  setPerturbA(v: number): void { this.perturbA = v; }
  setPerturbB(v: number): void { this.perturbB = v; }
  setPhaseB(v: number): void { this.phaseB = v; }
  setUpdateInterval(v: number): void { this.updateInterval = Math.max(1, v); }
  getUpdateInterval(): number { return this.updateInterval; }

  resetModels(): void {
    this.predA.reset();
    this.predB.reset();
    this.predAgg.reset();
  }

  addPanel(panel: { draw: () => void; stop: () => void }): void {
    this.panels.push(panel);
  }

  start(): void {
    const frame = (): void => {
      this.time += TIME_STEP;
      this.frameCount++;
      this.updatePredictions();
      for (const p of this.panels) p.draw();
      this.animId = requestAnimationFrame(frame);
    };
    this.animId = requestAnimationFrame(frame);
  }

  stop(): void {
    cancelAnimationFrame(this.animId);
    for (const p of this.panels) p.stop();
  }

  private updatePredictions(): void {
    // Collect samples from the current signal at evenly spaced x positions
    for (let s = 0; s < SAMPLE_POINTS; s++) {
      const x = (s / SAMPLE_POINTS) * X_MAX;
      this.predA.addSample(x + this.time, this.coupledA(x));
      this.predB.addSample(x + this.time, this.coupledB(x));
      this.predAgg.addSample(
        x + this.time,
        this.coupledA(x) + this.coupledB(x),
      );
    }

    // Retrain at the configured interval
    if (this.frameCount % this.updateInterval === 0) {
      this.predA.retrain();
      this.predB.retrain();
      this.predAgg.retrain();
    }
  }

  // Raw uncoupled signals (Graph 1)
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

  // Coupled signals (Graph 2)
  coupledA(x: number): number {
    return this.rawA(x) + this.couplingBA * this.rawB(x);
  }

  coupledB(x: number): number {
    return this.rawB(x) + this.couplingAB * this.rawA(x);
  }

  // Predictions evaluate at x + current time (since model was
  // trained with time-shifted x coordinates)
  predictA(x: number): number | null {
    return this.predA.predict(x + this.time);
  }

  predictB(x: number): number | null {
    return this.predB.predict(x + this.time);
  }

  predictAgg(x: number): number | null {
    return this.predAgg.predict(x + this.time);
  }
}

// --- Shared rendering utilities ---

const CANVAS_H = 260;
const LEGEND_H = 28;
const GRID_COUNT = 5;

function setupCanvas(
  container: HTMLElement,
  height: number,
  label: string,
): {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  dpr: number;
  ro: ResizeObserver;
} {
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

  ctx.fillStyle = SIGNAL_A.color;
  ctx.fillRect(12, y - 1.5, 14, 3);
  ctx.fillStyle = textColor;
  ctx.fillText(SIGNAL_A.label, 32, y);

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

// Draw a prediction line from engine predict function
function drawPrediction(
  ctx: CanvasRenderingContext2D,
  w: number,
  steps: number,
  cy: number,
  amp: number,
  predictFn: (x: number) => number | null,
  color: string,
): void {
  ctx.save();
  ctx.setLineDash([6, 4]);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  let started = false;
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * X_MAX;
    const val = predictFn(x);
    if (val === null) continue;
    const px = (i / steps) * w;
    const py = cy - val / AMPLITUDE * amp;
    if (!started) { ctx.moveTo(px, py); started = true; }
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

// --- Graph 1: Unmodified Input (no coupling) ---

export class InputCanvas {
  private c;
  constructor(container: HTMLElement, private engine: WaveformEngine) {
    this.c = setupCanvas(
      container, CANVAS_H,
      "Unmodified input signals without coupling",
    );
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
      const y = cy - this.engine.rawA(x) / AMPLITUDE * amp;
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
      const y = cy - this.engine.rawB(x) / AMPLITUDE * amp;
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
    this.c = setupCanvas(
      container, CANVAS_H,
      "Coupled output signals with linear predictions",
    );
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

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, w, h);
    drawGrid(ctx, w, plotH, theme);

    // Predictions (dashed, behind)
    drawPrediction(
      ctx, w, steps, cy, amp,
      (x) => this.engine.predictA(x), theme.textSecondary,
    );
    drawPrediction(
      ctx, w, steps, cy, amp,
      (x) => this.engine.predictB(x), theme.textSecondary,
    );

    // Actual coupled A
    ctx.strokeStyle = SIGNAL_A.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const px = (i / steps) * w;
      const x = (i / steps) * X_MAX;
      const y = cy - this.engine.coupledA(x) / AMPLITUDE * amp;
      if (i === 0) ctx.moveTo(px, y); else ctx.lineTo(px, y);
    }
    ctx.stroke();

    // Actual coupled B
    ctx.strokeStyle = SIGNAL_B.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const px = (i / steps) * w;
      const x = (i / steps) * X_MAX;
      const y = cy - this.engine.coupledB(x) / AMPLITUDE * amp;
      if (i === 0) ctx.moveTo(px, y); else ctx.lineTo(px, y);
    }
    ctx.stroke();

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
    this.c = setupCanvas(
      container, AGG_HEIGHT,
      "Aggregate signal with linear prediction",
    );
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

    // Prediction (dashed)
    drawPrediction(
      ctx, w, steps, cy, amp,
      (x) => this.engine.predictAgg(x), theme.textSecondary,
    );

    // Actual aggregate fill
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const px = (i / steps) * w;
      const x = (i / steps) * X_MAX;
      const val = this.engine.coupledA(x) + this.engine.coupledB(x);
      const py = cy - val / AMPLITUDE * amp;
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

    // Actual aggregate line
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const px = (i / steps) * w;
      const x = (i / steps) * X_MAX;
      const val = this.engine.coupledA(x) + this.engine.coupledB(x);
      const py = cy - val / AMPLITUDE * amp;
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
