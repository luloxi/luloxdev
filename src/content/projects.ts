/**
 * Projects structure - copy lives in i18n/messages.ts
 */

export type FocusTopicId =
  | "tokenization"
  | "midnight"
  | "hermes"
  | "lcp";

export type PastProjectId = "punksociety" | "sami" | "mochi";

export const focusTopics: {
  id: FocusTopicId;
  tags: string[];
}[] = [
  {
    id: "tokenization",
    tags: ["CIP-0113", "ERC-3643", "T-REX", "RWA"],
  },
  {
    id: "midnight",
    tags: ["Midnight", "Privacy", "Ambassador"],
  },
  {
    id: "hermes",
    tags: ["Hermes", "Agent", "MCP"],
  },
  {
    id: "lcp",
    tags: ["LCP", "Compliance", "Agentic commerce"],
  },
];

export type PastProject = {
  id: PastProjectId;
  href: string;
  tags: string[];
  icon: string;
};

export const pastProjects: PastProject[] = [
  {
    id: "mochi",
    href: "https://github.com/luloxi/Mochi",
    tags: ["AI Agents", "Avalanche", "Marketplace"],
    icon: "/projects/mochi.png",
  },
  {
    id: "sami",
    href: "https://github.com/luloxi/sami",
    tags: ["AI", "Eliza", "Game"],
    icon: "/projects/sami.png",
  },
  {
    id: "punksociety",
    href: "https://github.com/luloxi/PunkSociety",
    tags: ["Social", "NFT", "USDC", "Scaffold-ETH"],
    icon: "/projects/punksociety.svg",
  },
];
