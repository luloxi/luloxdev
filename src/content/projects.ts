/**
 * Projects structure - copy lives in i18n/messages.ts
 */

export type FocusTopicId =
  | "tokenization"
  | "midnight"
  | "hermes"
  | "lcp"
  | "x402"
  | "erc8004";

export type PastProjectId = "punksociety" | "sami" | "mochi";

export type FocusLink = {
  label: string;
  href: string;
};

export const focusTopics: {
  id: FocusTopicId;
  icon: string;
  /** 1–3 relevant external references shown under each topic */
  links: FocusLink[];
}[] = [
  {
    id: "hermes",
    icon: "/projects/focus/nous.png",
    links: [
      { label: "Hermes Agent", href: "https://hermes-agent.nousresearch.com/" },
      { label: "GitHub", href: "https://github.com/nousresearch/hermes-agent" },
      { label: "Nous Research", href: "https://nousresearch.com/" },
    ],
  },
  {
    id: "lcp",
    icon: "/projects/focus/lcp.svg",
    links: [
      { label: "LCP", href: "https://legalcontextprotocol.org/" },
      {
        label: "Intro (AAA)",
        href: "https://www.adr.org/news-and-insights/introducing-the-legal-context-protocol/",
      },
    ],
  },
  {
    id: "x402",
    icon: "/projects/focus/x402.svg",
    links: [
      { label: "x402", href: "https://x402.org/" },
      { label: "Docs", href: "https://docs.x402.org/" },
      {
        label: "GitHub",
        href: "https://github.com/x402-foundation/x402",
      },
    ],
  },
  {
    id: "erc8004",
    icon: "/projects/focus/erc8004.svg",
    links: [
      {
        label: "EIP-8004",
        href: "https://eips.ethereum.org/EIPS/eip-8004",
      },
      { label: "8004.org", href: "https://www.8004.org/" },
      {
        label: "Magicians",
        href: "https://ethereum-magicians.org/t/erc-8004-trustless-agents/25098",
      },
    ],
  },
  {
    id: "midnight",
    icon: "/projects/focus/midnight.svg",
    links: [
      { label: "Midnight", href: "https://midnight.network/" },
      { label: "Docs", href: "https://docs.midnight.network/" },
      { label: "Midnight Expert", href: "https://midnightntwrk.expert/" },
    ],
  },
  {
    id: "tokenization",
    icon: "/projects/focus/tokenization.svg",
    links: [
      {
        label: "CIP-113",
        href: "https://github.com/cardano-foundation/cip113-programmable-tokens",
      },
      { label: "ERC-3643", href: "https://www.erc3643.org/" },
      {
        label: "EIP-3643",
        href: "https://eips.ethereum.org/EIPS/eip-3643",
      },
    ],
  },
];

export type ProjectStatus = "live" | "disabled" | "archive";

export type TeamMember = {
  name: string;
  href?: string;
};

export type PastProject = {
  id: PastProjectId;
  icon: string;
  github: string;
  /** Public product URL when still up */
  liveUrl?: string;
  status: ProjectStatus;
  /** Team credits (names are language-agnostic) */
  team: TeamMember[];
};

export const pastProjects: PastProject[] = [
  {
    id: "mochi",
    icon: "/projects/mochi.png",
    github: "https://github.com/luloxi/Mochi",
    status: "disabled",
    team: [{ name: "Kathonejo", href: "https://linktr.ee/kathonejo" }],
  },
  {
    id: "sami",
    icon: "/projects/sami.png",
    github: "https://github.com/fabian416/sami",
    status: "disabled",
    team: [
      { name: "Luciano Carreño", href: "https://x.com/lucho_leonel1" },
      { name: "Fabián Díaz", href: "https://x.com/Fabian_diaz222" },
      { name: "Lendoor", href: "https://x.com/LendoorProtocol" },
    ],
  },
  {
    id: "punksociety",
    icon: "/projects/punksociety.svg",
    github: "https://github.com/luloxi/PunkSociety",
    status: "disabled",
    team: [{ name: "Solo" }],
  },
];

export function getPastProject(id: string): PastProject | undefined {
  return pastProjects.find((p) => p.id === id);
}

export const pastProjectIds = pastProjects.map((p) => p.id);
