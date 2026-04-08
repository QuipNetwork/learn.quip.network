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
  private dpr: number;
  private resizeObserver: ResizeObserver;
  private combinedCanvas: CombinedCanvas | null = null;

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

  setCombinedCanvas(combined: CombinedCanvas): void {
    this.combinedCanvas = combined;
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

  getTime(): number {
    return this.time;
  }

  getCoupling(): number {
    return this.coupling;
  }

  getPerturbation(): number {
    return this.perturbation;
  }

  computeYForWaveform(wf: WaveformConfig, x: number): number {
    return this.computeY(wf, x);
  }

  private draw(): void {
    const w = this.canvas.clientWidth;
    const h = CSS_HEIGHT;
    const theme = getThemeColors();
    const plotH = h - LEGEND_HEIGHT;

    // Clear & fill background
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

        if (i === 0) {
          this.ctx.moveTo(px, y);
        } else {
          this.ctx.lineTo(px, y);
        }
      }

      this.ctx.stroke();
    }

    // Legend at bottom
    this.drawLegend(w, plotH, theme.text);

    // Update combined canvas
    if (this.combinedCanvas) {
      this.combinedCanvas.draw();
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

      // Color swatch
      const swatchW = 16;
      const swatchH = 3;
      this.ctx.fillStyle = wf.color;
      this.ctx.fillRect(baseX - 44, y - swatchH / 2, swatchW, swatchH);

      // Label
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

const COMBINED_HEIGHT = 200;

export class CombinedCanvas {
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
    this.canvas.style.height = COMBINED_HEIGHT + "px";
    this.canvas.style.display = "block";
    this.canvas.setAttribute("role", "img");
    this.canvas.setAttribute(
      "aria-label",
      "Combined waveform showing the sum of all four financial signals",
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
    this.canvas.height = COMBINED_HEIGHT * this.dpr;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(this.dpr, this.dpr);
  }

  draw(): void {
    const w = this.canvas.clientWidth;
    const h = COMBINED_HEIGHT;
    const theme = getThemeColors();
    const labelH = 24;
    const plotH = h - labelH;

    this.ctx.clearRect(0, 0, w, h);
    this.ctx.fillStyle = theme.bg;
    this.ctx.fillRect(0, 0, w, h);

    // Gridlines
    this.ctx.strokeStyle = theme.grid;
    this.ctx.lineWidth = 1;
    for (let i = 1; i <= 3; i++) {
      const y = (plotH / 4) * i;
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(w, y);
      this.ctx.stroke();
    }

    // Zero line
    this.ctx.save();
    this.ctx.globalAlpha = 0.5;
    this.ctx.strokeStyle = theme.zero;
    this.ctx.beginPath();
    this.ctx.moveTo(0, plotH / 2);
    this.ctx.lineTo(w, plotH / 2);
    this.ctx.stroke();
    this.ctx.restore();

    const steps = Math.max(w, 200);
    const cy = plotH / 2;
    const combinedScale = 0.25;
    const linearColor = "#D85A30";

    // Pre-compute actual combined values for the full x range
    const actualValues: number[] = [];
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * X_MAX;
      let sum = 0;
      for (const wf of WAVEFORMS) {
        sum += this.source.computeYForWaveform(wf, x) * combinedScale;
      }
      actualValues.push(sum);
    }

    // Linear model: sliding-window OLS linear regression.
    // At each point, fit y = mx + b to the previous `win` samples
    // and extrapolate forward by 1 step. This is the most common
    // linear prediction method — it captures trend but cannot track
    // non-linear oscillations or sudden amplitude changes.
    const win = 60;
    const linearValues: number[] = [];
    for (let i = 0; i <= steps; i++) {
      if (i < win) {
        linearValues.push(actualValues[i] ?? 0);
        continue;
      }
      // OLS: fit line to points [i-win, i-1], predict at i
      let sx = 0, sy = 0, sxx = 0, sxy = 0;
      for (let j = 0; j < win; j++) {
        const yj = actualValues[i - win + j] ?? 0;
        sx += j;
        sy += yj;
        sxx += j * j;
        sxy += j * yj;
      }
      const denom = win * sxx - sx * sx;
      const m = denom !== 0 ? (win * sxy - sx * sy) / denom : 0;
      const b = (sy - m * sx) / win;
      linearValues.push(m * win + b); // extrapolate 1 step past window
    }

    // --- Linear prediction (drawn first, behind actual) ---
    this.ctx.save();
    this.ctx.setLineDash([8, 5]);
    this.ctx.strokeStyle = linearColor;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const px = (i / steps) * w;
      const y = cy - (linearValues[i] ?? 0);
      if (i === 0) this.ctx.moveTo(px, y);
      else this.ctx.lineTo(px, y);
    }
    this.ctx.stroke();
    this.ctx.setLineDash([]);
    this.ctx.restore();

    // --- Actual combined waveform ---
    // Fill area between actual and zero
    this.ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const px = (i / steps) * w;
      const y = cy - (actualValues[i] ?? 0);
      if (i === 0) this.ctx.moveTo(px, y);
      else this.ctx.lineTo(px, y);
    }
    this.ctx.save();
    this.ctx.lineTo(w, cy);
    this.ctx.lineTo(0, cy);
    this.ctx.closePath();
    this.ctx.globalAlpha = 0.1;
    this.ctx.fillStyle = "#3266ad";
    this.ctx.fill();
    this.ctx.restore();

    // Stroke the actual combined line
    this.ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const px = (i / steps) * w;
      const y = cy - (actualValues[i] ?? 0);
      if (i === 0) this.ctx.moveTo(px, y);
      else this.ctx.lineTo(px, y);
    }
    this.ctx.strokeStyle = "#3266ad";
    this.ctx.lineWidth = 2.5;
    this.ctx.stroke();

    // --- Legend ---
    const legendY = plotH + labelH / 2;
    this.ctx.font = "11px -apple-system, BlinkMacSystemFont, sans-serif";
    this.ctx.textBaseline = "middle";
    this.ctx.textAlign = "left";

    // Actual combined swatch + label
    const leftX = w / 2 - 120;
    this.ctx.fillStyle = "#3266ad";
    this.ctx.fillRect(leftX - 20, legendY - 1.5, 14, 3);
    this.ctx.fillStyle = theme.text;
    this.ctx.fillText("Actual (non-linear)", leftX, legendY);

    // Linear prediction swatch + label
    const rightX = w / 2 + 40;
    this.ctx.save();
    this.ctx.setLineDash([5, 3]);
    this.ctx.strokeStyle = linearColor;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(rightX - 20, legendY);
    this.ctx.lineTo(rightX - 4, legendY);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
    this.ctx.restore();
    this.ctx.fillStyle = theme.text;
    this.ctx.fillText("Linear prediction", rightX, legendY);
  }
}
