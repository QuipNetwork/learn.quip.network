import { getThemeColors } from "../../lib/dark-mode";

interface WaveformConfig {
  label: string;
  color: string;
  freq: number;
  gain: number;
}

const WAVEFORMS: WaveformConfig[] = [
  { label: "Housing", color: "#3266ad", freq: 1.0, gain: 1.8 },
  { label: "Credit", color: "#1D9E75", freq: 1.3, gain: -1.4 },
  { label: "Bank equities", color: "#D85A30", freq: 0.7, gain: 1.8 },
  { label: "Consumer", color: "#534AB7", freq: 1.6, gain: -1.4 },
];

const CSS_HEIGHT = 300;
const X_MAX = 6 * Math.PI;
const AMPLITUDE = 90;
const GRID_LINES = 5;
const TIME_STEP = 0.015;

export class WaveformCanvas {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animId: number = 0;
  private time: number = 0;
  private coupling: number = 0;
  private perturbation: number = 0;
  private dpr: number;
  private resizeObserver: ResizeObserver;

  constructor(container: HTMLElement) {
    this.dpr = window.devicePixelRatio || 1;

    this.canvas = document.createElement("canvas");
    this.canvas.style.width = "100%";
    this.canvas.style.height = CSS_HEIGHT + "px";
    this.canvas.style.display = "block";
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

  private draw(): void {
    const w = this.canvas.clientWidth;
    const h = CSS_HEIGHT;
    const theme = getThemeColors();

    // Clear & fill background
    this.ctx.clearRect(0, 0, w, h);
    this.ctx.fillStyle = theme.bg;
    this.ctx.fillRect(0, 0, w, h);

    // Gridlines
    this.ctx.strokeStyle = theme.grid;
    this.ctx.lineWidth = 1;
    for (let i = 1; i <= GRID_LINES; i++) {
      const y = (h / (GRID_LINES + 1)) * i;
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
    this.ctx.moveTo(0, h / 2);
    this.ctx.lineTo(w, h / 2);
    this.ctx.stroke();
    this.ctx.restore();

    // Waveforms
    const cy = h / 2;
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
  }

  private computeY(wf: WaveformConfig, x: number): number {
    const housing =
      Math.sin(1.0 * x + this.time) +
      this.perturbation * Math.sin(0.3 * x + this.time * 0.5);

    // Housing waveform: just the base housing signal scaled
    if (wf.freq === 1.0 && wf.color === "#3266ad") {
      return housing * AMPLITUDE;
    }

    // Other waveforms: base + coupled non-linear term
    const base = Math.sin(wf.freq * x + this.time);
    const coupled =
      this.coupling *
      housing *
      housing *
      wf.gain *
      Math.sin(wf.freq * x);
    return (base + coupled) * AMPLITUDE;
  }
}
