import { getThemeColors } from "../../lib/dark-mode";

export interface WaveformConfig {
  label: string;
  color: string;
  freq: number;
  gain: number;
}

export const WAVEFORMS: WaveformConfig[] = [
  { label: "Housing market", color: "#3266ad", freq: 1.0, gain: 1.8 },
  { label: "Credit derivatives", color: "#1D9E75", freq: 1.3, gain: -1.4 },
  { label: "Bank equities", color: "#D85A30", freq: 0.7, gain: 1.8 },
  { label: "Consumer lending", color: "#534AB7", freq: 1.6, gain: -1.4 },
];

const CSS_HEIGHT = 300;
const X_MAX = 6 * Math.PI;
const AMPLITUDE = 90;
const GRID_LINES = 5;
const TIME_STEP = 0.015;
const LEGEND_HEIGHT = 32;

export class WaveformCanvas {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animId: number = 0;
  private time: number = 0;
  private coupling: number = 0;
  private perturbation: number = 0;
  private signalPerturbations: number[] = [0, 0, 0, 0];
  private updateInterval: number = 0;
  private dpr: number;
  private resizeObserver: ResizeObserver;
  private gridCanvas: SignalGridCanvas | null = null;

  constructor(container: HTMLElement) {
    this.dpr = window.devicePixelRatio || 1;

    this.canvas = document.createElement("canvas");
    this.canvas.style.width = "100%";
    this.canvas.style.height = CSS_HEIGHT + "px";
    this.canvas.style.display = "block";
    this.canvas.setAttribute("role", "img");
    this.canvas.setAttribute(
      "aria-label",
      "Four coupled financial waveforms showing non-linear interactions",
    );
    container.append(this.canvas);

    const rawCtx = this.canvas.getContext("2d");
    if (!rawCtx) {
      throw new Error("Canvas 2D context unavailable");
    }
    this.ctx = rawCtx;

    this.resizeObserver = new ResizeObserver(() => this.syncSize());
    this.resizeObserver.observe(container);
    this.syncSize();
  }

  setGridCanvas(grid: SignalGridCanvas): void {
    this.gridCanvas = grid;
  }

  private syncSize(): void {
    const cssWidth = this.canvas.clientWidth;
    this.canvas.width = cssWidth * this.dpr;
    this.canvas.height = CSS_HEIGHT * this.dpr;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(this.dpr, this.dpr);
  }

  start(): void {
    const frame = (): void => {
      this.draw();
      this.time += TIME_STEP;
      this.animId = requestAnimationFrame(frame);
    };
    this.animId = requestAnimationFrame(frame);
  }

  stop(): void {
    cancelAnimationFrame(this.animId);
    this.resizeObserver.disconnect();
  }

  setCoupling(v: number): void {
    this.coupling = v;
  }

  setPerturbation(v: number): void {
    this.perturbation = v;
  }

  setSignalPerturbation(index: number, v: number): void {
    if (index >= 0 && index < this.signalPerturbations.length) {
      this.signalPerturbations[index] = v;
    }
  }

  setUpdateInterval(v: number): void {
    this.updateInterval = v;
  }

  getUpdateInterval(): number {
    return this.updateInterval;
  }

  computeYForWaveform(wf: WaveformConfig, x: number): number {
    return this.computeY(wf, x);
  }

  private draw(): void {
    const w = this.canvas.clientWidth;
    const h = CSS_HEIGHT;
    const theme = getThemeColors();
    const plotH = h - LEGEND_HEIGHT;

    this.ctx.clearRect(0, 0, w, h);
    this.ctx.fillStyle = theme.bg;
    this.ctx.fillRect(0, 0, w, h);

    // Gridlines
    this.ctx.strokeStyle = theme.grid;
    this.ctx.lineWidth = 1;
    for (let i = 1; i <= GRID_LINES; i++) {
      const y = (plotH / (GRID_LINES + 1)) * i;
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(w, y);
      this.ctx.stroke();
    }

    // Center zero-line
    this.ctx.save();
    this.ctx.globalAlpha = 0.5;
    this.ctx.strokeStyle = theme.zero;
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(0, plotH / 2);
    this.ctx.lineTo(w, plotH / 2);
    this.ctx.stroke();
    this.ctx.restore();

    // Waveforms
    const cy = plotH / 2;
    const steps = Math.max(w, 200);

    for (const wf of WAVEFORMS) {
      this.ctx.strokeStyle = wf.color;
      this.ctx.lineWidth = 1.8;
      this.ctx.beginPath();

      for (let i = 0; i <= steps; i++) {
        const px = (i / steps) * w;
        const x = (i / steps) * X_MAX;
        const y = cy - this.computeY(wf, x);
        if (i === 0) this.ctx.moveTo(px, y);
        else this.ctx.lineTo(px, y);
      }

      this.ctx.stroke();
    }

    this.drawLegend(w, plotH, theme.text);

    if (this.gridCanvas) {
      this.gridCanvas.draw();
    }
  }

  private drawLegend(w: number, plotTop: number, textColor: string): void {
    const y = plotTop + LEGEND_HEIGHT / 2 + 1;
    const spacing = w / WAVEFORMS.length;

    this.ctx.font = "11px -apple-system, BlinkMacSystemFont, sans-serif";
    this.ctx.textBaseline = "middle";

    for (let i = 0; i < WAVEFORMS.length; i++) {
      const wf = WAVEFORMS[i]!;
      const baseX = spacing * i + spacing / 2;

      const swatchW = 16;
      const swatchH = 3;
      this.ctx.fillStyle = wf.color;
      this.ctx.fillRect(baseX - 44, y - swatchH / 2, swatchW, swatchH);

      this.ctx.fillStyle = textColor;
      this.ctx.textAlign = "left";
      this.ctx.fillText(wf.label, baseX - 24, y);
    }
  }

  private computeY(wf: WaveformConfig, x: number): number {
    const idx = WAVEFORMS.indexOf(wf);
    const sigPerturb = this.signalPerturbations[idx] ?? 0;

    const housing =
      Math.sin(1.0 * x + this.time) +
      this.perturbation * Math.sin(0.3 * x + this.time * 0.5);

    if (wf.freq === 1.0 && wf.color === "#3266ad") {
      return housing * AMPLITUDE * (1 + sigPerturb);
    }

    const base = Math.sin(wf.freq * x + this.time);
    const coupled =
      this.coupling *
      housing *
      housing *
      wf.gain *
      Math.sin(wf.freq * x);
    return (base + coupled) * AMPLITUDE * (1 + sigPerturb);
  }
}

// --- 2x2 grid: each signal with its OLS linear prediction ---

const GRID_HEIGHT = 400;
const CELL_PAD = 8;
const LABEL_H = 20;
// Window must span at least 1 full wavelength to resolve
// the frequency. More cycles improves accuracy but costs
// locality — 1 cycle is sufficient for a pure sinusoid.
const MIN_CYCLES = 1.0;

// Single-bin DFT fit: extract amplitude and phase of the
// dominant frequency, plus DC offset. Numerically stable
// and exact for pure sinusoids of the target frequency.
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
  for (let j = lo; j <= hi; j++) {
    sumY += values[j] ?? 0;
  }
  const c = sumY / count;

  let sinProj = 0, cosProj = 0;
  let sinNorm = 0, cosNorm = 0;
  for (let j = lo; j <= hi; j++) {
    const x = (j + xOffset) * xPerStep;
    const sv = Math.sin(freq * x);
    const cv = Math.cos(freq * x);
    const residual = (values[j] ?? 0) - c;
    sinProj += residual * sv;
    cosProj += residual * cv;
    sinNorm += sv * sv;
    cosNorm += cv * cv;
  }

  const a = sinNorm > 1e-10 ? sinProj / sinNorm : 0;
  const b = cosNorm > 1e-10 ? cosProj / cosNorm : 0;

  return { a, b, c };
}

// Sinusoidal prediction with discrete update intervals.
// The model fits at the start of each segment and extrapolates
// its stale coefficients until the next update — simulating a
// model retrained periodically (e.g., daily or hourly).
// updateInterval = 0 means continuous (fit at every point).
// xOffset: the spatial index of values[0] (e.g., -pad when
// history samples precede the visible range).
function sinusoidalPredict(
  values: number[],
  win: number,
  freq: number,
  xPerStep: number,
  updateInterval: number,
  xOffset: number = 0,
): number[] {
  const n = values.length;
  const half = Math.floor(win / 2);
  const out: number[] = [];

  if (updateInterval <= 0) {
    for (let i = 0; i < n; i++) {
      const lo = Math.max(0, i - half);
      const hi = Math.min(n - 1, i + half);
      const fit = fitSinusoid(values, lo, hi, freq, xPerStep, xOffset);
      if (!fit) {
        out.push(values[i] ?? 0);
        continue;
      }
      const x = (i + xOffset) * xPerStep;
      out.push(fit.a * Math.sin(freq * x) + fit.b * Math.cos(freq * x) + fit.c);
    }
    return out;
  }

  let currentFit: { a: number; b: number; c: number } | null = null;
  for (let i = 0; i < n; i++) {
    if (i % updateInterval === 0) {
      const fitHi = i;
      const fitLo = Math.max(0, fitHi - win);
      currentFit = fitSinusoid(values, fitLo, fitHi, freq, xPerStep, xOffset);
    }
    if (!currentFit) {
      out.push(values[i] ?? 0);
      continue;
    }
    const x = (i + xOffset) * xPerStep;
    out.push(
      currentFit.a * Math.sin(freq * x) +
      currentFit.b * Math.cos(freq * x) +
      currentFit.c,
    );
  }
  return out;
}

export class SignalGridCanvas {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private dpr: number;
  private source: WaveformCanvas;
  private resizeObserver: ResizeObserver;

  constructor(container: HTMLElement, source: WaveformCanvas) {
    this.source = source;
    this.dpr = window.devicePixelRatio || 1;

    this.canvas = document.createElement("canvas");
    this.canvas.style.width = "100%";
    this.canvas.style.height = GRID_HEIGHT + "px";
    this.canvas.style.display = "block";
    this.canvas.setAttribute("role", "img");
    this.canvas.setAttribute(
      "aria-label",
      "2x2 grid showing each signal with its linear regression prediction",
    );
    container.append(this.canvas);

    const rawCtx = this.canvas.getContext("2d");
    if (!rawCtx) {
      throw new Error("Canvas 2D context unavailable");
    }
    this.ctx = rawCtx;

    this.resizeObserver = new ResizeObserver(() => this.syncSize());
    this.resizeObserver.observe(container);
    this.syncSize();
  }

  stop(): void {
    this.resizeObserver.disconnect();
  }

  private syncSize(): void {
    const cssWidth = this.canvas.clientWidth;
    this.canvas.width = cssWidth * this.dpr;
    this.canvas.height = GRID_HEIGHT * this.dpr;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(this.dpr, this.dpr);
  }

  draw(): void {
    const w = this.canvas.clientWidth;
    const h = GRID_HEIGHT;
    const theme = getThemeColors();

    this.ctx.clearRect(0, 0, w, h);
    this.ctx.fillStyle = theme.bg;
    this.ctx.fillRect(0, 0, w, h);

    const cols = 2;
    const rows = 2;
    const cellW = (w - CELL_PAD) / cols;
    const cellH = (h - CELL_PAD) / rows;

    for (let idx = 0; idx < WAVEFORMS.length; idx++) {
      const wf = WAVEFORMS[idx]!;
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const ox = col * (cellW + CELL_PAD);
      const oy = row * (cellH + CELL_PAD);

      this.drawCell(ox, oy, cellW, cellH, wf, theme);
    }

    // Divider lines
    this.ctx.strokeStyle = theme.grid;
    this.ctx.lineWidth = 1;

    // Horizontal divider
    this.ctx.beginPath();
    this.ctx.moveTo(0, Math.floor(h / 2));
    this.ctx.lineTo(w, Math.floor(h / 2));
    this.ctx.stroke();

    // Vertical divider
    this.ctx.beginPath();
    this.ctx.moveTo(Math.floor(w / 2), 0);
    this.ctx.lineTo(Math.floor(w / 2), h);
    this.ctx.stroke();
  }

  private drawCell(
    ox: number,
    oy: number,
    cw: number,
    ch: number,
    wf: WaveformConfig,
    theme: { bg: string; grid: string; zero: string; text: string; textSecondary: string },
  ): void {
    const plotH = ch - LABEL_H;
    const cy = oy + plotH / 2;
    const steps = Math.max(Math.floor(cw), 100);
    const amp = plotH * 0.4;

    // Zero line
    this.ctx.save();
    this.ctx.globalAlpha = 0.3;
    this.ctx.strokeStyle = theme.zero;
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(ox, cy);
    this.ctx.lineTo(ox + cw, cy);
    this.ctx.stroke();
    this.ctx.restore();

    // Compute actual values with extra history before the
    // visible window so the fit has training data at the left edge.
    const xPerStep = X_MAX / steps;
    const wavelengthInSteps = (2 * Math.PI / wf.freq) / xPerStep;
    const win = Math.min(
      steps,
      Math.max(40, Math.ceil(wavelengthInSteps * MIN_CYCLES)),
    );
    const pad = win; // extra samples before visible range

    const allValues: number[] = [];
    for (let i = -pad; i <= steps; i++) {
      const x = i * xPerStep;
      allValues.push(this.source.computeYForWaveform(wf, x) / AMPLITUDE * amp);
    }

    // Actual visible values start at index `pad`
    const actual = allValues.slice(pad);

    // Run prediction on the full range (history + visible).
    // xOffset = -pad so positions map to real spatial coordinates.
    const allPredicted = sinusoidalPredict(
      allValues, win, wf.freq, xPerStep,
      this.source.getUpdateInterval(), -pad,
    );
    // Trim to visible portion
    const predicted = allPredicted.slice(pad);

    // Draw linear prediction (dashed, behind)
    this.ctx.save();
    this.ctx.setLineDash([6, 4]);
    this.ctx.strokeStyle = theme.textSecondary;
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const px = ox + (i / steps) * cw;
      const py = cy - (predicted[i] ?? 0);
      if (i === 0) this.ctx.moveTo(px, py);
      else this.ctx.lineTo(px, py);
    }
    this.ctx.stroke();
    this.ctx.setLineDash([]);
    this.ctx.restore();

    // Draw actual signal (solid, on top)
    this.ctx.strokeStyle = wf.color;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const px = ox + (i / steps) * cw;
      const py = cy - (actual[i] ?? 0);
      if (i === 0) this.ctx.moveTo(px, py);
      else this.ctx.lineTo(px, py);
    }
    this.ctx.stroke();

    // Label
    this.ctx.font = "bold 11px -apple-system, BlinkMacSystemFont, sans-serif";
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "middle";

    // Color dot
    this.ctx.fillStyle = wf.color;
    this.ctx.beginPath();
    this.ctx.arc(ox + 10, oy + plotH + LABEL_H / 2, 4, 0, Math.PI * 2);
    this.ctx.fill();

    // Name
    this.ctx.fillStyle = theme.text;
    this.ctx.fillText(wf.label, ox + 20, oy + plotH + LABEL_H / 2);

    // Legend items on right side
    this.ctx.textAlign = "right";
    const legendX = ox + cw - 8;
    const legendY = oy + plotH + LABEL_H / 2;

    // "Actual" swatch
    this.ctx.fillStyle = wf.color;
    this.ctx.fillRect(legendX - 120, legendY - 1, 12, 2.5);
    this.ctx.fillStyle = theme.textSecondary;
    this.ctx.font = "10px -apple-system, BlinkMacSystemFont, sans-serif";
    this.ctx.textAlign = "left";
    this.ctx.fillText("Actual", legendX - 105, legendY);

    // "Linear" swatch (dashed)
    this.ctx.save();
    this.ctx.setLineDash([4, 2]);
    this.ctx.strokeStyle = theme.textSecondary;
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.moveTo(legendX - 52, legendY);
    this.ctx.lineTo(legendX - 40, legendY);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
    this.ctx.restore();
    this.ctx.fillStyle = theme.textSecondary;
    this.ctx.fillText("Linear", legendX - 37, legendY);
  }
}
