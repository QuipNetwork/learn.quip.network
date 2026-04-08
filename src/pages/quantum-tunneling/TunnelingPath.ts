import { E } from "./energy";

export interface TunnelPathPoint {
  x: number;
  y: number;
}

export function computeTunnelingPath(
  localMinX: number,
  globalMinX: number,
): TunnelPathPoint[] {
  const points: TunnelPathPoint[] = [];
  const localE = E(localMinX);
  const globalE = E(globalMinX);
  const span = globalMinX - localMinX;
  const dir = span > 0 ? 1 : -1;
  const absSpan = Math.abs(span);

  // Number of samples at ~1px density (assume canvas ~800px for domain 40)
  const steps = Math.max(Math.round(absSpan * 20), 2);

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = localMinX + t * span;

    // Progress through the barrier (0 to 1)
    const barrierT = t;

    // Horizontal at local minimum energy with sinusoidal oscillation
    const oscillation =
      3 * Math.sin(4 * Math.PI * barrierT) * (1 - barrierT);

    // Quadratic descent at the end toward global minimum
    const descent = barrierT * barrierT * (globalE - localE);

    const y = localE + oscillation + descent;
    points.push({ x, y });
  }

  // Ensure exact endpoints
  if (points.length > 0) {
    points[0] = { x: localMinX, y: localE };
    points[points.length - 1] = { x: globalMinX, y: globalE };
  }

  return points;
}
