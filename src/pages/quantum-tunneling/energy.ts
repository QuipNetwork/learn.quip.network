export interface LandscapeParams {
  phases: [number, number, number, number, number];
  amps: [number, number, number, number, number];
  freqs: [number, number, number, number, number];
  tilt: number;
  offset: number;
}

const DEFAULT_PARAMS: LandscapeParams = {
  phases: [(-5 * Math.PI) / 4, 0.5, 0, -0.7, 1.2],
  amps: [10, 4, 2.5, 3, 1.8],
  freqs: [Math.PI / 8, 0.9, 1.6, 1.3, 2.3],
  tilt: -1.6,
  offset: 48,
};

let params: LandscapeParams = { ...DEFAULT_PARAMS };

export function E(x: number): number {
  const t = x - 25;
  const poly =
    0.00008 * t ** 4 + 0.003 * t ** 3 + params.tilt * t + params.offset;
  let waves = 0;
  const { amps, freqs, phases } = params;
  for (let i = 0; i < 5; i++) {
    const fn = i % 2 === 0 ? Math.sin : Math.cos;
    waves +=
      (amps as number[])[i]! *
      fn((freqs as number[])[i]! * x + (phases as number[])[i]!);
  }
  return poly + waves;
}

export function dEdx(x: number): number {
  const h = 0.001;
  return (E(x + h) - E(x - h)) / (2 * h);
}

export function findLocalMin(startX: number): number {
  let x = startX;
  for (let i = 0; i < 2000; i++) {
    const grad = dEdx(x);
    if (Math.abs(grad) < 0.001) break;
    x -= 0.05 * grad;
    x = Math.max(5, Math.min(45, x));
  }
  return x;
}

export function findGlobalMin(): number {
  let bestX = 5;
  let bestE = E(5);
  for (let x = 5; x <= 45; x += 0.1) {
    const e = E(x);
    if (e < bestE) {
      bestE = e;
      bestX = x;
    }
  }
  return bestX;
}

function rand(lo: number, hi: number): number {
  return lo + Math.random() * (hi - lo);
}

export function randomizeLandscape(): void {
  params = {
    phases: [
      rand(-Math.PI, Math.PI),
      rand(-Math.PI, Math.PI),
      rand(-Math.PI, Math.PI),
      rand(-Math.PI, Math.PI),
      rand(-Math.PI, Math.PI),
    ],
    amps: [
      rand(8, 12),
      rand(3, 5),
      rand(1.5, 3.5),
      rand(2, 4),
      rand(1, 2.5),
    ],
    freqs: [
      rand(0.3, 0.5),
      rand(0.7, 1.1),
      rand(1.4, 1.8),
      rand(1.1, 1.5),
      rand(2.0, 2.6),
    ],
    tilt: rand(-2.2, -1.0),
    offset: rand(44, 52),
  };
}

export function resetLandscape(): void {
  params = { ...DEFAULT_PARAMS };
}
