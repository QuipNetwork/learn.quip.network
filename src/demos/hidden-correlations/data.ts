export interface GraphNode {
  id: string;
  label: string;
  tier: number;
  angle: number;
  color: string;
}

export interface GraphEdge {
  source: string;
  target: string;
}

export const TIER_RADII = [0, 80, 170, 260, 340];

export const HOP_LABELS = ["Hop 1", "Hop 2", "Hop 3", "Hop 4"];

function deg(d: number): number {
  return (d * Math.PI) / 180;
}

export const NODES: GraphNode[] = [
  // Tier 0 — center
  { id: "nvidia", label: "NVIDIA", tier: 0, angle: 0, color: "#6b7280" },

  // Tier 1 — AI labs
  { id: "openai", label: "OpenAI", tier: 1, angle: deg(90), color: "#3266ad" },
  {
    id: "anthropic",
    label: "Anthropic",
    tier: 1,
    angle: deg(210),
    color: "#3266ad",
  },
  { id: "xai", label: "xAI", tier: 1, angle: deg(330), color: "#3266ad" },

  // Tier 2 — cloud providers
  { id: "azure", label: "Azure", tier: 2, angle: deg(45), color: "#1D9E75" },
  { id: "gcp", label: "GCP", tier: 2, angle: deg(135), color: "#1D9E75" },
  { id: "aws", label: "AWS", tier: 2, angle: deg(225), color: "#1D9E75" },
  {
    id: "oracle",
    label: "Oracle Cloud",
    tier: 2,
    angle: deg(315),
    color: "#1D9E75",
  },

  // Tier 3 — enterprises
  {
    id: "ent-a",
    label: "Enterprise A",
    tier: 3,
    angle: deg(30),
    color: "#D85A30",
  },
  {
    id: "ent-b",
    label: "Enterprise B",
    tier: 3,
    angle: deg(120),
    color: "#D85A30",
  },
  {
    id: "ent-c",
    label: "Enterprise C",
    tier: 3,
    angle: deg(210),
    color: "#D85A30",
  },
  {
    id: "ent-d",
    label: "Enterprise D",
    tier: 3,
    angle: deg(300),
    color: "#D85A30",
  },

  // Tier 4 — banks
  { id: "bank-1", label: "Bank 1", tier: 4, angle: deg(60), color: "#6b7280" },
  {
    id: "bank-2",
    label: "Bank 2",
    tier: 4,
    angle: deg(150),
    color: "#6b7280",
  },
  {
    id: "bank-3",
    label: "Bank 3",
    tier: 4,
    angle: deg(240),
    color: "#6b7280",
  },
  {
    id: "bank-4",
    label: "Bank 4",
    tier: 4,
    angle: deg(330),
    color: "#6b7280",
  },
];

export const EDGES: GraphEdge[] = [
  // Tier 0 -> 1
  { source: "nvidia", target: "openai" },
  { source: "nvidia", target: "anthropic" },
  { source: "nvidia", target: "xai" },

  // Tier 1 -> 2
  { source: "openai", target: "azure" },
  { source: "openai", target: "gcp" },
  { source: "anthropic", target: "gcp" },
  { source: "anthropic", target: "aws" },
  { source: "xai", target: "aws" },
  { source: "xai", target: "oracle" },

  // Tier 2 -> 3
  { source: "azure", target: "ent-a" },
  { source: "azure", target: "ent-b" },
  { source: "gcp", target: "ent-b" },
  { source: "gcp", target: "ent-c" },
  { source: "aws", target: "ent-c" },
  { source: "aws", target: "ent-d" },
  { source: "oracle", target: "ent-d" },

  // Tier 3 -> 4
  { source: "ent-a", target: "bank-1" },
  { source: "ent-b", target: "bank-1" },
  { source: "ent-b", target: "bank-2" },
  { source: "ent-c", target: "bank-3" },
  { source: "ent-d", target: "bank-3" },
  { source: "ent-d", target: "bank-4" },
];
