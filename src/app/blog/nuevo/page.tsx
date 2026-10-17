"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { putPost } from "@/components/blog-post-edit";
import { PageShell } from "@/components/page-shell";
import { useLocale } from "@/i18n/locale-provider";

/** Creates an empty draft and opens it in place at /blog/<slug> (admin only). */
export default function NewPostPage() {
  const { t, locale } = useLocale();
  const router = useRouter();
  const started = useRef(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const now = new Date();
    const slug = `borrador-${now.toISOString().slice(0, 10)}-${now.getTime().toString(36).slice(-5)}`;
    void putPost({
      slug,
      publishedAt: now.toISOString().slice(0, 10),
      coverImage: "",
      tags: [],
      topics: [],
      published: false,
      title: { es: "Nuevo artículo", en: "New article" },
      summary: { es: "", en: "" },
      body: { es: "", en: "" },
    }).then((r) => {
      if (r.error === "session" || r.error === "unauthorized") router.replace("/ingresar");
      else if (r.error) setError(r.error);
      else router.replace(`/blog/${r.slug}`);
    });
  }, [router]);
  return (
    <PageShell title={t.blog.title} backHref="/blog" backLabel={t.blog.title}>
      <p className="cp-prose">
        {error
          ? (locale === "es" ? `No se pudo crear el borrador (${error}).` : `Couldn't create the draft (${error}).`)
          : locale === "es" ? "Creando borrador…" : "Creating draft…"}
      </p>
    </PageShell>
  );
}
