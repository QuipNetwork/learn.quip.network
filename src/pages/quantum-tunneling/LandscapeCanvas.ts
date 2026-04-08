import { getThemeColors } from "../../lib/dark-mode";
import { E, findLocalMin, findGlobalMin } from "./energy";
import { GradientDescentPath } from "./GradientDescent";
import { computeTunnelingPath } from "./TunnelingPath";
import type { TunnelPathPoint } from "./TunnelingPath";

const X_MIN = 5;
const X_MAX = 45;
const E_MIN = 10;
const E_MAX = 80;
const PAD_LEFT = 40;
const PAD_RIGHT = 20;
const PAD_TOP = 20;
const PAD_BOTTOM = 30;
const TUNNEL_DELAY_FRAMES = 40;

export class LandscapeCanvas {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private raf = 0;
  private frame = 0;
  private running = false;

  private startX = 22;
  private showClassical = true;
  private showQuantum = true;

  private gd: GradientDescentPath;
  private tunnelPath: TunnelPathPoint[] = [];
  private localMinX: number;
  private globalMinX: number;

  constructor(container: HTMLElement) {
    this.canvas = document.createElement("canvas");
    container.append(this.canvas);

    const ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable");
    this.ctx = ctx;

    this.globalMinX = findGlobalMin();
    this.localMinX = findLocalMin(this.startX);
    this.gd = new GradientDescentPath(this.startX);
    this.tunnelPath = computeTunnelingPath(
      this.localMinX,
      this.globalMinX,
    );

    this.handleResize = this.handleResize.bind(this);
    window.addEventListener("resize", this.handleResize);
    this.sizeCanvas();
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.tick();
  }

  stop(): void {
    this.running = false;
    if (this.raf) {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
    }
    window.removeEventListener("resize", this.handleResize);
  }

  setStartX(x: number): void {
    this.startX = x;
    this.resetAnimation();
  }

  setShowClassical(v: boolean): void {
    this.showClassical = v;
  }

  setShowQuantum(v: boolean): void {
    this.showQuantum = v;
  }

  /** Re-render one frame on demand (e.g. theme change). */
  redraw(): void {
    this.render();
  }

  private resetAnimation(): void {
    this.frame = 0;
    this.localMinX = findLocalMin(this.startX);
    this.gd = new GradientDescentPath(this.startX);
    this.tunnelPath = computeTunnelingPath(
      this.localMinX,
      this.globalMinX,
    );
  }

  private handleResize(): void {
    this.sizeCanvas();
  }

  private sizeCanvas(): void {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.parentElement?.getBoundingClientRect();
    const w = rect ? rect.width : 800;
    const h = 300;
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  private mapX(x: number): number {
    const w =
      (this.canvas.width / (window.devicePixelRatio || 1)) -
      PAD_LEFT -
      PAD_RIGHT;
    return PAD_LEFT + ((x - X_MIN) / (X_MAX - X_MIN)) * w;
  }

  private mapY(e: number): number {
    const h =
      (this.canvas.height / (window.devicePixelRatio || 1)) -
      PAD_TOP -
      PAD_BOTTOM;
    return PAD_TOP + ((E_MAX - e) / (E_MAX - E_MIN)) * h;
  }

  private tick = (): void => {
    if (!this.running) return;
    this.render();
    this.frame++;
    this.raf = requestAnimationFrame(this.tick);
  };

  private render(): void {
    const ctx = this.ctx;
    const cw =
      this.canvas.width / (window.devicePixelRatio || 1);
    const ch =
      this.canvas.height / (window.devicePixelRatio || 1);
    const theme = getThemeColors();

    // 1. Background
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, cw, ch);

    // 2. Grid lines
    ctx.strokeStyle = theme.grid;
    ctx.lineWidth = 1;
    for (const eVal of [20, 40, 60, 80]) {
      const y = this.mapY(eVal);
      ctx.beginPath();
      ctx.moveTo(PAD_LEFT, y);
      ctx.lineTo(cw - PAD_RIGHT, y);
      ctx.stroke();
    }

    // 3. Axis labels
    ctx.fillStyle = theme.text;
    ctx.font = "11px -apple-system, sans-serif";

    // "Energy" rotated on left
    ctx.save();
    ctx.translate(12, ch / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center";
    ctx.fillText("Energy", 0, 0);
    ctx.restore();

    // "Solution space" on bottom
    ctx.textAlign = "center";
    ctx.fillText("Solution space", cw / 2, ch - 6);

    // Grid value labels
    ctx.fillStyle = theme.textSecondary;
    ctx.font = "10px -apple-system, sans-serif";
    ctx.textAlign = "right";
    for (const eVal of [20, 40, 60, 80]) {
      ctx.fillText(String(eVal), PAD_LEFT - 6, this.mapY(eVal) + 3);
    }

    // 4. Energy surface
    ctx.beginPath();
    let firstY = 0;
    for (let px = 0; px <= 400; px++) {
      const x = X_MIN + (px / 400) * (X_MAX - X_MIN);
      const sx = this.mapX(x);
      const sy = this.mapY(E(x));
      if (px === 0) {
        ctx.moveTo(sx, sy);
        firstY = sy;
      } else {
        ctx.lineTo(sx, sy);
      }
    }
    // Stroke the surface line
    ctx.strokeStyle = "#555";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Subtle fill below the surface
    const lastX = this.mapX(X_MAX);
    const firstX = this.mapX(X_MIN);
    const bottom = this.mapY(E_MIN);
    ctx.lineTo(lastX, bottom);
    ctx.lineTo(firstX, bottom);
    ctx.closePath();
    ctx.fillStyle = "rgba(100, 100, 100, 0.04)";
    ctx.fill();

    // 5. Classical gradient descent path
    if (this.showClassical) {
      // Advance one step per frame (up to 120)
      if (this.frame < 120) {
        this.gd.step();
      }

      if (this.gd.path.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = "#A32D2D";
        ctx.lineWidth = 2;
        for (let i = 0; i < this.gd.path.length; i++) {
          const pt = this.gd.path[i]!;
          const sx = this.mapX(pt.x);
          const sy = this.mapY(pt.y);
          if (i === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.stroke();
      }

      if (this.gd.converged) {
        const last = this.gd.path[this.gd.path.length - 1]!;
        const sx = this.mapX(last.x);
        const sy = this.mapY(last.y);

        // Red dot
        ctx.beginPath();
        ctx.arc(sx, sy, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#A32D2D";
        ctx.fill();

        // Label
        ctx.fillStyle = "#A32D2D";
        ctx.font = "bold 11px -apple-system, sans-serif";
        ctx.textAlign = "center";
        const isGlobal =
          Math.abs(last.x - this.globalMinX) < 2;
        ctx.fillText(
          isGlobal ? "Found optimum" : "Trapped in local minimum",
          sx,
          sy - 12,
        );
      }
    }

    // 6. Quantum tunneling path
    if (this.showQuantum && this.frame > TUNNEL_DELAY_FRAMES) {
      const tp = this.tunnelPath;
      if (tp.length > 1) {
        // Barrier shading: fill between energy surface and tunnel
        // energy level through the barrier region
        const tunnelE = E(this.localMinX);
        const minBarrierX = Math.min(this.localMinX, this.globalMinX);
        const maxBarrierX = Math.max(this.localMinX, this.globalMinX);

        ctx.beginPath();
        let started = false;
        for (let px = 0; px <= 400; px++) {
          const x = X_MIN + (px / 400) * (X_MAX - X_MIN);
          if (x < minBarrierX || x > maxBarrierX) continue;
          const sx = this.mapX(x);
          const surfY = this.mapY(E(x));
          const tunnelY = this.mapY(tunnelE);
          if (surfY < tunnelY) {
            // Surface is above tunnel line (energy is higher)
            if (!started) {
              ctx.moveTo(sx, tunnelY);
              started = true;
            }
            ctx.lineTo(sx, surfY);
          }
        }
        // Close back along tunnel energy level
        if (started) {
          for (let px = 400; px >= 0; px--) {
            const x = X_MIN + (px / 400) * (X_MAX - X_MIN);
            if (x < minBarrierX || x > maxBarrierX) continue;
            const sx = this.mapX(x);
            const surfY = this.mapY(E(x));
            const tunnelY = this.mapY(tunnelE);
            if (surfY < tunnelY) {
              ctx.lineTo(sx, tunnelY);
            }
          }
          ctx.closePath();
          ctx.fillStyle = "rgba(24, 95, 165, 0.10)";
          ctx.fill();

          // "Barrier region" label
          const midX = (minBarrierX + maxBarrierX) / 2;
          const barrierTopE = Math.max(
            ...Array.from({ length: 50 }, (_, i) => {
              const bx =
                minBarrierX +
                (i / 49) * (maxBarrierX - minBarrierX);
              return E(bx);
            }),
          );
          ctx.fillStyle = "#185FA5";
          ctx.font = "bold 10px -apple-system, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(
            "Barrier region",
            this.mapX(midX),
            this.mapY(barrierTopE) - 8,
          );
        }

        // Dashed tunnel path
        ctx.beginPath();
        ctx.setLineDash([6, 4]);
        ctx.strokeStyle = "#185FA5";
        ctx.lineWidth = 2;
        for (let i = 0; i < tp.length; i++) {
          const tpt = tp[i]!;
          const sx = this.mapX(tpt.x);
          const sy = this.mapY(tpt.y);
          if (i === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Blue dot at global minimum
        const gx = this.mapX(this.globalMinX);
        const gy = this.mapY(E(this.globalMinX));
        ctx.beginPath();
        ctx.arc(gx, gy, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#185FA5";
        ctx.fill();

        // Label
        ctx.fillStyle = "#185FA5";
        ctx.font = "bold 11px -apple-system, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Global optimum", gx, gy - 12);
      }
    }
  }
}
