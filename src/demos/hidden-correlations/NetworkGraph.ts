import { NODES, EDGES, TIER_RADII, HOP_LABELS } from "./data";
import type { GraphNode } from "./data";

const SVG_NS = "http://www.w3.org/2000/svg";

function svgEl<K extends keyof SVGElementTagNameMap>(
  tag: K,
): SVGElementTagNameMap[K] {
  return document.createElementNS(SVG_NS, tag);
}

function nodePos(node: GraphNode): { x: number; y: number } {
  const r = TIER_RADII[node.tier] ?? 0;
  return {
    x: r * Math.cos(node.angle),
    y: -r * Math.sin(node.angle),
  };
}

function nodeById(id: string): GraphNode {
  const n = NODES.find((n) => n.id === id);
  if (!n) throw new Error(`Unknown node: ${id}`);
  return n;
}

export function createNetworkSVG(container: HTMLElement): SVGSVGElement {
  const svg = svgEl("svg");
  svg.setAttribute("viewBox", "-400 -400 800 800");
  svg.setAttribute("role", "img");
  svg.setAttribute(
    "aria-label",
    "Network graph showing GPU supply chain " +
      "dependencies from NVIDIA through AI labs, cloud providers, " +
      "enterprises, to banks",
  );
  svg.classList.add("network-graph");

  // Ring guides
  for (let i = 1; i < TIER_RADII.length; i++) {
    const radius = TIER_RADII[i];
    if (radius === undefined) continue;
    const circle = svgEl("circle");
    circle.setAttribute("cx", "0");
    circle.setAttribute("cy", "0");
    circle.setAttribute("r", String(radius));
    circle.classList.add("ring-guide");
    if (i === TIER_RADII.length - 1) {
      circle.classList.add("ring-guide-outer");
    }
    svg.append(circle);
  }

  // Edges
  for (const edge of EDGES) {
    const src = nodePos(nodeById(edge.source));
    const tgt = nodePos(nodeById(edge.target));
    const line = svgEl("line");
    line.setAttribute("x1", String(src.x));
    line.setAttribute("y1", String(src.y));
    line.setAttribute("x2", String(tgt.x));
    line.setAttribute("y2", String(tgt.y));
    line.classList.add("graph-edge");
    line.setAttribute("data-source", edge.source);
    line.setAttribute("data-target", edge.target);
    svg.append(line);
  }

  // Nodes
  for (const node of NODES) {
    const pos = nodePos(node);
    const g = svgEl("g");
    g.classList.add("graph-node");
    g.setAttribute("data-id", node.id);
    g.setAttribute("data-tier", String(node.tier));

    if (node.tier === 0) {
      // Center node: circle
      const circle = svgEl("circle");
      circle.setAttribute("cx", String(pos.x));
      circle.setAttribute("cy", String(pos.y));
      circle.setAttribute("r", "28");
      circle.setAttribute("fill", node.color);
      circle.setAttribute("stroke", node.color);
      g.append(circle);
    } else {
      // Other nodes: rounded rect
      const w = node.label.length * 7.5 + 20;
      const h = 26;
      const rect = svgEl("rect");
      rect.setAttribute("x", String(pos.x - w / 2));
      rect.setAttribute("y", String(pos.y - h / 2));
      rect.setAttribute("width", String(w));
      rect.setAttribute("height", String(h));
      rect.setAttribute("rx", "6");
      rect.setAttribute("fill", node.color + "26"); // ~15% opacity
      rect.setAttribute("stroke", node.color);
      g.append(rect);
    }

    const text = svgEl("text");
    text.setAttribute("x", String(pos.x));
    text.setAttribute("y", String(pos.y));
    text.classList.add("graph-label");
    text.textContent = node.label;
    g.append(text);

    svg.append(g);
  }

  // Hop labels between rings
  for (let i = 0; i < HOP_LABELS.length; i++) {
    const r0 = TIER_RADII[i];
    const r1 = TIER_RADII[i + 1];
    const label = HOP_LABELS[i];
    if (r0 === undefined || r1 === undefined || label === undefined) {
      continue;
    }
    const r = (r0 + r1) / 2;
    const text = svgEl("text");
    text.setAttribute("x", String(r));
    text.setAttribute("y", "12");
    text.classList.add("hop-label");
    text.textContent = label;
    svg.append(text);
  }

  // Annotation below outer ring
  const annotation = svgEl("text");
  annotation.setAttribute("x", "0");
  annotation.setAttribute("y", String((TIER_RADII[4] ?? 340) + 30));
  annotation.classList.add("annotation");
  annotation.textContent =
    "Pairwise correlation between center and outer ring: near zero";
  svg.append(annotation);

  container.append(svg);
  return svg;
}
