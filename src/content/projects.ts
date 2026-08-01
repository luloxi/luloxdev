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
  icon: string;
}[] = [
  {
    id: "tokenization",
    tags: ["CIP-0113", "ERC-3643", "T-REX", "RWA"],
    icon: "/projects/focus/tokenization.svg",
  },
  {
    id: "midnight",
    tags: ["Midnight", "Privacy", "Ambassador"],
    icon: "/projects/focus/midnight.svg",
  },
  {
    id: "hermes",
    tags: ["Hermes", "Agent", "MCP"],
    icon: "/projects/focus/nous.png",
  },
  {
    id: "lcp",
    tags: ["LCP", "Compliance", "Agentic commerce"],
    icon: "/projects/focus/lcp.svg",
  },
];

export type PastProject = {
  id: PastProjectId;
  href: string;
  icon: string;
};

export const pastProjects: PastProject[] = [
  {
    id: "mochi",
    href: "https://github.com/luloxi/Mochi",
    icon: "/projects/mochi.png",
  },
  {
    id: "sami",
    href: "https://github.com/luloxi/sami",
    icon: "/projects/sami.png",
  },
  {
    id: "punksociety",
    href: "https://github.com/luloxi/PunkSociety",
    icon: "/projects/punksociety.svg",
  },
];
