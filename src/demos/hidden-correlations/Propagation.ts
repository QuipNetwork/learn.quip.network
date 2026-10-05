import { NODES, TIER_RADII } from "./data";
import type { GraphEdge } from "./data";

const TIER_DELAY_MS = 500;
const EDGE_STAGGER_MS = 50;

export class PropagationAnimator {
  private svg: SVGSVGElement;
  private edges: GraphEdge[];
  private timers: number[] = [];
  private ariaLive: HTMLElement | null = null;

  constructor(svg: SVGSVGElement, edges: GraphEdge[]) {
    this.svg = svg;
    this.edges = edges;
  }

  setAriaLive(el: HTMLElement): void {
    this.ariaLive = el;
  }

  propagate(): void {
    this.reset();

    // Mark source
    const nvidiaGroup = this.svg.querySelector(
      '.graph-node[data-id="nvidia"]',
    );
    if (nvidiaGroup) nvidiaGroup.classList.add("source");

    this.announce("Perturbation started at NVIDIA");

    // Group edges by source tier
    const maxTier = TIER_RADII.length - 1;
    for (let tier = 0; tier < maxTier; tier++) {
      const nodesInTier = new Set(
        NODES.filter((n) => n.tier === tier).map((n) => n.id),
      );
      const tierEdges = this.edges.filter((e) =>
        nodesInTier.has(e.source),
      );

      const baseDel = tier * TIER_DELAY_MS;

      // Light edges
      for (let i = 0; i < tierEdges.length; i++) {
        const edge = tierEdges[i];
        if (!edge) continue;
        const delay = baseDel + i * EDGE_STAGGER_MS;
        this.schedule(delay, () => {
          const line = this.svg.querySelector(
            `.graph-edge[data-source="${edge.source}"]` +
              `[data-target="${edge.target}"]`,
          );
          if (line) line.classList.add("lit");
        });
      }

      // Light target nodes after all edges in this tier
      const edgeDuration =
        tierEdges.length * EDGE_STAGGER_MS;
      const nodeDelay = baseDel + edgeDuration;

      const targetIds = new Set(tierEdges.map((e) => e.target));
      this.schedule(nodeDelay, () => {
        for (const id of targetIds) {
          const g = this.svg.querySelector(
            `.graph-node[data-id="${id}"]`,
          );
          if (g) g.classList.add("lit");
        }
        this.announce(
          `Hop ${tier + 1} complete: ${targetIds.size} nodes reached`,
        );
      });
    }

    // Dim unlit edges after all tiers
    const totalDelay =
      maxTier * TIER_DELAY_MS +
      this.edges.length * EDGE_STAGGER_MS +
      100;
    this.schedule(totalDelay, () => {
      const allEdges = this.svg.querySelectorAll(".graph-edge");
      for (const edge of allEdges) {
        if (!edge.classList.contains("lit")) {
          edge.classList.add("dim");
        }
      }
      this.announce("Propagation complete");
    });
  }

  reset(): void {
    for (const id of this.timers) {
      clearTimeout(id);
    }
    this.timers = [];

    const litNodes = this.svg.querySelectorAll(
      ".graph-node.lit, .graph-node.source",
    );
    for (const el of litNodes) {
      el.classList.remove("lit", "source");
    }

    const litEdges = this.svg.querySelectorAll(
      ".graph-edge.lit, .graph-edge.dim",
    );
    for (const el of litEdges) {
      el.classList.remove("lit", "dim");
    }
  }

  private schedule(delayMs: number, fn: () => void): void {
    const id = window.setTimeout(fn, delayMs);
    this.timers.push(id);
  }

  private announce(msg: string): void {
    if (this.ariaLive) {
      this.ariaLive.textContent = msg;
    }
  }
}
