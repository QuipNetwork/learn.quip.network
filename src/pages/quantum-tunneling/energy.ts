export function E(x: number): number {
  const t = x - 20;
  return (
    0.00012 * t ** 4 -
    0.012 * t ** 3 +
    0.35 * t ** 2 -
    2.5 * t +
    45 +
    8 * Math.sin(0.7 * x) -
    3 * Math.cos(1.2 * x)
  );
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
