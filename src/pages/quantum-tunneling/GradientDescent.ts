import { E, dEdx } from "./energy";

export class GradientDescentPath {
  path: Array<{ x: number; y: number }> = [];
  converged = false;
  currentX: number;
  private stepCount = 0;

  constructor(startX: number) {
    this.currentX = startX;
    this.path = [{ x: startX, y: E(startX) }];
  }

  step(): boolean {
    if (this.converged) return false;

    const grad = dEdx(this.currentX);
    if (Math.abs(grad) < 0.001 || this.stepCount >= 2000) {
      this.converged = true;
      return false;
    }

    this.currentX -= 0.08 * grad;
    this.currentX = Math.max(5, Math.min(45, this.currentX));
    this.path.push({ x: this.currentX, y: E(this.currentX) });
    this.stepCount++;
    return true;
  }

  reset(startX: number): void {
    this.currentX = startX;
    this.path = [{ x: startX, y: E(startX) }];
    this.converged = false;
    this.stepCount = 0;
  }
}
