"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { PageShell } from "@/components/page-shell";
import type { BlogPost } from "@/content/blog/types";
import type {
  PastProject,
  ProjectStatus,
  TeamMember,
} from "@/content/projects";
import { authClient } from "@/lib/auth/client";
import { useLocale } from "@/i18n/locale-provider";

type EditableProject = PastProject & {
  draftStatus: ProjectStatus;
  draftGithub: string;
  draftLiveUrl: string;
  draftTeam: string;
  draftTitleEs: string;
  draftTitleEn: string;
  draftBodyEs: string;
  draftBodyEn: string;
  draftParagraphsEs: string;
  draftParagraphsEn: string;
  draftAwardsEs: string;
  draftAwardsEn: string;
  draftReasonEs: string;
  draftReasonEn: string;
  saving?: boolean;
  saved?: boolean;
};

function teamToText(team: TeamMember[]): string {
  return team
    .map((m) => (m.href ? `${m.name} | ${m.href}` : m.name))
    .join("\n");
}

function textToTeam(text: string): TeamMember[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [namePart, ...rest] = line.split("|");
      const name = (namePart ?? "").trim();
      const href = rest.join("|").trim();
      return href ? { name, href } : { name };
    })
    .filter((m) => m.name);
}

function paragraphsToText(paragraphs: string[]): string {
  return paragraphs.join("\n\n");
}

function textToParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function toDraft(p: PastProject): EditableProject {
  return {
    ...p,
    draftStatus: p.status,
    draftGithub: p.github ?? "",
    draftLiveUrl: p.liveUrl ?? "",
    draftTeam: teamToText(p.team ?? []),
    draftTitleEs: p.copy.es.title,
    draftTitleEn: p.copy.en.title,
    draftBodyEs: p.copy.es.body,
    draftBodyEn: p.copy.en.body,
    draftParagraphsEs: paragraphsToText(p.copy.es.paragraphs),
    draftParagraphsEn: paragraphsToText(p.copy.en.paragraphs),
    draftAwardsEs: p.copy.es.awards,
    draftAwardsEn: p.copy.en.awards,
    draftReasonEs: p.disabledReason?.es ?? "",
    draftReasonEn: p.disabledReason?.en ?? "",
  };
}

export default function AdminPage() {
  const { t } = useLocale();
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[] | null>(null);
  const [projects, setProjects] = useState<EditableProject[] | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const sessionRes = await authClient.getSession();
    const user = sessionRes.data?.user;
    if (!user) {
      router.replace("/auth/sign-in");
      return;
    }
    setEmail(user.email ?? null);

    const [blogRes, projectsRes] = await Promise.all([
      fetch("/api/blog"),
      fetch("/api/projects"),
    ]);

    if (blogRes.status === 401 || projectsRes.status === 401) {
      router.replace("/auth/sign-in?error=forbidden");
      return;
    }

    if (!blogRes.ok) {
      setError(t.blog.adminLoadError);
      return;
    }
    if (!projectsRes.ok) {
      setError(t.projects.adminLoadError);
      return;
    }

    const blogData = (await blogRes.json()) as { posts: BlogPost[] };
    const projectsData = (await projectsRes.json()) as {
      projects: PastProject[];
    };

    setPosts(blogData.posts);
    setProjects(projectsData.projects.map(toDraft));
  }, [router, t.blog.adminLoadError, t.projects.adminLoadError]);

  useEffect(() => {
    void load();
  }, [load]);

  async function signOut() {
    await authClient.signOut();
    router.push("/blog");
  }

  async function remove(slug: string) {
    if (!confirm(t.blog.confirmDelete)) return;
    const res = await fetch(`/api/blog?slug=${encodeURIComponent(slug)}`, {
      method: "DELETE",
    });
    if (res.ok) void load();
  }

  async function togglePublished(post: BlogPost) {
    const next = !post.published;
    setPosts((prev) =>
      prev
        ? prev.map((p) => (p.slug === post.slug ? { ...p, published: next } : p))
        : prev,
    );
    const res = await fetch("/api/blog", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...post, published: next }),
    });
    if (!res.ok) {
      setPosts((prev) =>
        prev
          ? prev.map((p) =>
              p.slug === post.slug ? { ...p, published: post.published } : p,
            )
          : prev,
      );
      setError(t.blog.saveError);
    }
  }

  function updateProjectDraft(
    id: string,
    patch: Partial<
      Pick<
        EditableProject,
        | "draftStatus"
        | "draftGithub"
        | "draftLiveUrl"
        | "draftTeam"
        | "draftTitleEs"
        | "draftTitleEn"
        | "draftBodyEs"
        | "draftBodyEn"
        | "draftParagraphsEs"
        | "draftParagraphsEn"
        | "draftAwardsEs"
        | "draftAwardsEn"
        | "draftReasonEs"
        | "draftReasonEn"
      >
    >,
  ) {
    setProjects((prev) =>
      prev
        ? prev.map((p) => (p.id === id ? { ...p, ...patch, saved: false } : p))
        : prev,
    );
  }

  async function saveProject(project: EditableProject) {
    setProjects((prev) =>
      prev
        ? prev.map((p) =>
            p.id === project.id ? { ...p, saving: true, saved: false } : p,
          )
        : prev,
    );
    setError(null);

    const res = await fetch("/api/projects", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: project.id,
        status: project.draftStatus,
        github: project.draftGithub,
        liveUrl: project.draftLiveUrl,
        team: textToTeam(project.draftTeam),
        disabledReason: {
          es: project.draftReasonEs,
          en: project.draftReasonEn,
        },
        copy: {
          es: {
            title: project.draftTitleEs,
            body: project.draftBodyEs,
            paragraphs: textToParagraphs(project.draftParagraphsEs),
            awards: project.draftAwardsEs,
          },
          en: {
            title: project.draftTitleEn,
            body: project.draftBodyEn,
            paragraphs: textToParagraphs(project.draftParagraphsEn),
            awards: project.draftAwardsEn,
          },
        },
      }),
    });

    if (!res.ok) {
      setProjects((prev) =>
        prev
          ? prev.map((p) =>
              p.id === project.id ? { ...p, saving: false } : p,
            )
          : prev,
      );
      setError(t.projects.adminSaveError);
      return;
    }

    const data = (await res.json()) as { projects: PastProject[] };
    const merged = data.projects.find((p) => p.id === project.id);

    setProjects((prev) =>
      prev
        ? prev.map((p) => {
            if (p.id !== project.id) return p;
            const next = merged ?? p;
            return {
              ...toDraft(next),
              saving: false,
              saved: true,
            };
          })
        : prev,
    );
  }

  const title = t.ui.adminTitle ?? "Rothko";

  return (
    <PageShell
      title={title}
      backHref="/blog"
      backLabel={t.blog.title}
      footerHref="/blog"
      footerLabel={t.blog.backToBlog}
    >
      <div className="space-y-8">
        <div
          className="cp-panel"
          style={{ ["--cp-accent" as string]: "var(--section-blog)" }}
        >
          <span className="cp-nav-frame" aria-hidden>
            <span className="cp-nav-corner cp-nav-corner-tl" />
            <span className="cp-nav-corner cp-nav-corner-br" />
          </span>
          <div className="cp-panel-inner flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] text-[color:var(--cp-accent)]">
                {t.blog.adminAs}
              </p>
              <p className="cp-prose mt-1 text-sm">{email ?? "…"}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/rothko/new" className="blog-admin-btn">
                {t.blog.newPost}
              </Link>
              <button
                type="button"
                onClick={() => void signOut()}
                className="blog-admin-btn-ghost"
              >
                {t.blog.signOut}
              </button>
            </div>
          </div>
        </div>

        {error ? (
          <p className="cp-prose text-[color:var(--section-tastes)]">{error}</p>
        ) : null}

        {/* Projects section */}
        <section className="space-y-3">
          <h2 className="cp-heading">{t.projects.adminSection}</h2>
          <ul className="space-y-3">
            {(projects ?? []).map((project) => {
              const copy = t.projects.past[project.id];
              return (
                <li
                  key={project.id}
                  className="cp-panel"
                  style={{ ["--cp-accent" as string]: "var(--section-projects)" }}
                >
                  <span className="cp-nav-frame" aria-hidden>
                    <span className="cp-nav-corner cp-nav-corner-tl" />
                    <span className="cp-nav-corner cp-nav-corner-br" />
                  </span>
                  <div className="cp-panel-inner space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="cp-row-label text-[0.95rem]">
                          {copy.title}
                        </p>
                        <p className="font-mono text-[11px] text-muted">
                          /projects/{project.id}
                        </p>
                      </div>
                      <Link
                        href={`/projects/${project.id}`}
                        className="blog-admin-btn-ghost"
                      >
                        {t.blog.view}
                      </Link>
                    </div>

                    {/* Status + URLs */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block space-y-1.5">
                        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                          {t.projects.adminStatus}
                        </span>
                        <select
                          value={project.draftStatus}
                          onChange={(e) =>
                            updateProjectDraft(project.id, {
                              draftStatus: e.target.value as ProjectStatus,
                            })
                          }
                          className="blog-field w-full"
                        >
                          <option value="live">{t.projects.statusLive}</option>
                          <option value="disabled">
                            {t.projects.statusDisabled}
                          </option>
                          <option value="archive">
                            {t.projects.statusArchive}
                          </option>
                        </select>
                      </label>

                      <label className="block space-y-1.5">
                        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                          {t.projects.adminLiveUrl}
                        </span>
                        <input
                          type="url"
                          value={project.draftLiveUrl}
                          onChange={(e) =>
                            updateProjectDraft(project.id, {
                              draftLiveUrl: e.target.value,
                            })
                          }
                          className="blog-field w-full"
                          placeholder="https://…"
                        />
                      </label>
                    </div>

                    <label className="block space-y-1.5">
                      <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                        {t.projects.adminGithub}
                      </span>
                      <input
                        type="url"
                        value={project.draftGithub}
                        onChange={(e) =>
                          updateProjectDraft(project.id, {
                            draftGithub: e.target.value,
                          })
                        }
                        className="blog-field w-full"
                        placeholder="https://github.com/…"
                      />
                    </label>

                    <label className="block space-y-1.5">
                      <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                        {t.projects.adminTeam}
                      </span>
                      <textarea
                        value={project.draftTeam}
                        onChange={(e) =>
                          updateProjectDraft(project.id, {
                            draftTeam: e.target.value,
                          })
                        }
                        rows={3}
                        className="blog-field w-full"
                        placeholder={"Nombre | https://…\nOtra persona"}
                      />
                    </label>

                    {/* Copy ES */}
                    <div className="space-y-3 border-t border-[color:var(--border)] pt-4">
                      <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[color:var(--section-projects)]">
                        ES
                      </p>
                      <label className="block space-y-1.5">
                        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                          {t.projects.adminTitleEs}
                        </span>
                        <input
                          type="text"
                          value={project.draftTitleEs}
                          onChange={(e) =>
                            updateProjectDraft(project.id, {
                              draftTitleEs: e.target.value,
                            })
                          }
                          className="blog-field w-full"
                        />
                      </label>
                      <label className="block space-y-1.5">
                        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                          {t.projects.adminBodyEs}
                        </span>
                        <textarea
                          value={project.draftBodyEs}
                          onChange={(e) =>
                            updateProjectDraft(project.id, {
                              draftBodyEs: e.target.value,
                            })
                          }
                          rows={2}
                          className="blog-field w-full"
                        />
                      </label>
                      <label className="block space-y-1.5">
                        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                          {t.projects.adminParagraphsEs}
                        </span>
                        <textarea
                          value={project.draftParagraphsEs}
                          onChange={(e) =>
                            updateProjectDraft(project.id, {
                              draftParagraphsEs: e.target.value,
                            })
                          }
                          rows={5}
                          className="blog-field w-full"
                        />
                      </label>
                      <label className="block space-y-1.5">
                        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                          {t.projects.adminAwardsEs}
                        </span>
                        <input
                          type="text"
                          value={project.draftAwardsEs}
                          onChange={(e) =>
                            updateProjectDraft(project.id, {
                              draftAwardsEs: e.target.value,
                            })
                          }
                          className="blog-field w-full"
                        />
                      </label>
                      <label className="block space-y-1.5">
                        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                          {t.projects.adminReasonEs}
                        </span>
                        <textarea
                          value={project.draftReasonEs}
                          onChange={(e) =>
                            updateProjectDraft(project.id, {
                              draftReasonEs: e.target.value,
                            })
                          }
                          rows={2}
                          className="blog-field w-full"
                          placeholder="Por qué no está en funcionamiento…"
                        />
                      </label>
                    </div>

                    {/* Copy EN */}
                    <div className="space-y-3 border-t border-[color:var(--border)] pt-4">
                      <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[color:var(--section-projects)]">
                        EN
                      </p>
                      <label className="block space-y-1.5">
                        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                          {t.projects.adminTitleEn}
                        </span>
                        <input
                          type="text"
                          value={project.draftTitleEn}
                          onChange={(e) =>
                            updateProjectDraft(project.id, {
                              draftTitleEn: e.target.value,
                            })
                          }
                          className="blog-field w-full"
                        />
                      </label>
                      <label className="block space-y-1.5">
                        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                          {t.projects.adminBodyEn}
                        </span>
                        <textarea
                          value={project.draftBodyEn}
                          onChange={(e) =>
                            updateProjectDraft(project.id, {
                              draftBodyEn: e.target.value,
                            })
                          }
                          rows={2}
                          className="blog-field w-full"
                        />
                      </label>
                      <label className="block space-y-1.5">
                        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                          {t.projects.adminParagraphsEn}
                        </span>
                        <textarea
                          value={project.draftParagraphsEn}
                          onChange={(e) =>
                            updateProjectDraft(project.id, {
                              draftParagraphsEn: e.target.value,
                            })
                          }
                          rows={5}
                          className="blog-field w-full"
                        />
                      </label>
                      <label className="block space-y-1.5">
                        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                          {t.projects.adminAwardsEn}
                        </span>
                        <input
                          type="text"
                          value={project.draftAwardsEn}
                          onChange={(e) =>
                            updateProjectDraft(project.id, {
                              draftAwardsEn: e.target.value,
                            })
                          }
                          className="blog-field w-full"
                        />
                      </label>
                      <label className="block space-y-1.5">
                        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                          {t.projects.adminReasonEn}
                        </span>
                        <textarea
                          value={project.draftReasonEn}
                          onChange={(e) =>
                            updateProjectDraft(project.id, {
                              draftReasonEn: e.target.value,
                            })
                          }
                          rows={2}
                          className="blog-field w-full"
                          placeholder="Why it is not running…"
                        />
                      </label>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        disabled={project.saving}
                        onClick={() => void saveProject(project)}
                        className="blog-admin-btn"
                      >
                        {project.saving
                          ? t.projects.adminSaving
                          : t.projects.adminSave}
                      </button>
                      {project.saved ? (
                        <span className="font-mono text-[11px] text-[color:var(--section-blog)]">
                          {t.projects.adminSaved}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Blog section */}
        <section className="space-y-3">
          <h2 className="cp-heading">{t.blog.adminTitle}</h2>
          <ul className="space-y-2">
            {(posts ?? []).map((post) => (
              <li
                key={post.slug}
                className="cp-panel"
                style={{ ["--cp-accent" as string]: "var(--section-blog)" }}
              >
                <span className="cp-nav-frame" aria-hidden>
                  <span className="cp-nav-corner cp-nav-corner-tl" />
                  <span className="cp-nav-corner cp-nav-corner-br" />
                </span>
                <div className="cp-panel-inner flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="cp-row-label text-[0.9rem]">{post.title.es}</p>
                    <p className="font-mono text-[11px] text-muted">
                      /{post.slug}
                    </p>
                    <p
                      className={
                        post.published
                          ? "mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--section-blog)]"
                          : "mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted"
                      }
                    >
                      {post.published
                        ? t.blog.statusPublished
                        : t.blog.statusDraft}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={post.published}
                      onClick={() => void togglePublished(post)}
                      className={
                        post.published
                          ? "blog-publish-toggle blog-publish-toggle-on"
                          : "blog-publish-toggle"
                      }
                    >
                      <span className="blog-publish-toggle-knob" aria-hidden />
                      <span className="blog-publish-toggle-text">
                        {post.published
                          ? t.blog.statusPublished
                          : t.blog.statusDraft}
                      </span>
                    </button>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="blog-admin-btn-ghost"
                    >
                      {t.blog.view}
                    </Link>
                    <Link
                      href={`/rothko/${post.slug}`}
                      className="blog-admin-btn"
                    >
                      {t.blog.edit}
                    </Link>
                    <button
                      type="button"
                      onClick={() => void remove(post.slug)}
                      className="blog-admin-btn-ghost"
                    >
                      {t.blog.delete}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {posts && posts.length === 0 ? (
            <p className="cp-prose">{t.blog.empty}</p>
          ) : null}
        </section>
      </div>
    </PageShell>
  );
}
