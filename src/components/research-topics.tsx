"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { focusTopics, type FocusTopicId } from "@/content/projects";
import { useLocale } from "@/i18n/locale-provider";
import { cn } from "@/lib/utils";

const focusAccents: Record<FocusTopicId, string> = {
  tokenization: "var(--section-projects)",
  midnight: "var(--section-about)",
  hermes: "var(--section-tastes)",
  lcp: "var(--section-blog)",
  x402: "var(--section-contact)",
  erc8004: "var(--section-projects)",
};

export function ResearchTopics() {
  const { t } = useLocale();
  const [selected, setSelected] = useState<FocusTopicId>(focusTopics[0].id);
  const activeTopic = focusTopics.find((topic) => topic.id === selected)!;
  const activeCopy = t.projects.focus[selected];
  const activeAccent = focusAccents[selected];

  return (
      <section>
        <h2 className="cp-heading">{t.projects.focusHeading}</h2>

        <div className="focus-topic-grid mt-4">
          {focusTopics.map((topic) => {
            const copy = t.projects.focus[topic.id];
            const accent = focusAccents[topic.id];
            const isActive = selected === topic.id;
            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => setSelected(topic.id)}
                aria-pressed={isActive}
                className={cn(
                  "focus-topic-chip group",
                  isActive && "focus-topic-chip-active",
                )}
                style={{ ["--cp-accent" as string]: accent }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={topic.icon}
                  alt=""
                  width={28}
                  height={28}
                  className="focus-topic-chip-icon"
                />
                <span className="focus-topic-chip-title">{copy.title}</span>
              </button>
            );
          })}
        </div>

        <div
          className="focus-topic-panel cp-panel mt-3"
          style={{ ["--cp-accent" as string]: activeAccent }}
          key={selected}
        >
          <span className="cp-nav-frame" aria-hidden>
            <span className="cp-nav-corner cp-nav-corner-tl" />
            <span className="cp-nav-corner cp-nav-corner-br" />
          </span>
          <div className="cp-panel-inner space-y-3">
            <p className="cp-row-label text-[0.9rem]">{activeCopy.title}</p>
            <p className="cp-prose text-[0.9rem]">{activeCopy.body}</p>
            {activeTopic.links.length > 0 ? (
              <ul className="focus-links">
                {activeTopic.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="focus-link"
                    >
                      <span>{link.label}</span>
                      <ExternalLink
                        className="h-3 w-3 shrink-0 opacity-70"
                        strokeWidth={1.75}
                        aria-hidden
                      />
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </section>

  );
}
