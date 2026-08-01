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
  icon: string;
}[] = [
  {
    id: "hermes",
    icon: "/projects/focus/nous.png",
  },
  {
    id: "lcp",
    icon: "/projects/focus/lcp.svg",
  },
  {
    id: "midnight",
    icon: "/projects/focus/midnight.svg",
  },
  {
    id: "tokenization",
    icon: "/projects/focus/tokenization.svg",
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
