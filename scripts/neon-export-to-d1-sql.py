#!/usr/bin/env python3
"""Turn the read-only Neon JSON export into a D1 import file, plus per-table hashes.

Usage: python3 scripts/neon-export-to-d1-sql.py <export_dir> <out.sql>
The hash is sha256 over canonical JSON rows (sorted by primary key) so the same
function can be run on the D1 side to prove the copy is identical.
"""
import hashlib, json, sys

BLOG_COLS = ["slug","published_at","cover_image","tags","title_es","title_en","summary_es",
             "summary_en","body_es","body_en","published","updated_at"]
PROJ_COLS = ["id","status","disabled_reason_es","disabled_reason_en","live_url","github","team_json",
             "title_es","title_en","body_es","body_en","paragraphs_es","paragraphs_en","awards_es",
             "awards_en","updated_at"]

def q(v):
    if v is None: return "NULL"
    if isinstance(v, bool): return "1" if v else "0"
    if isinstance(v, int): return str(v)
    return "'" + str(v).replace("'", "''") + "'"

def norm_blog(r):
    r = dict(r)
    r["tags"] = json.dumps(r["tags"] or [], ensure_ascii=False)
    r["published"] = 1 if r["published"] else 0
    return {c: r[c] for c in BLOG_COLS}

def norm_proj(r):
    return {c: r[c] for c in PROJ_COLS}

def table_hash(rows, key):
    rows = sorted(rows, key=lambda r: r[key])
    return hashlib.sha256(json.dumps(rows, ensure_ascii=False, sort_keys=True).encode()).hexdigest()

def main(d, out):
    blog = [norm_blog(r) for r in json.load(open(f"{d}/blog_posts.json"))]
    proj = [norm_proj(r) for r in json.load(open(f"{d}/project_overrides.json"))]
    lines = []
    for name, cols, rows in (("blog_posts", BLOG_COLS, blog), ("project_overrides", PROJ_COLS, proj)):
        for r in rows:
            lines.append(f"INSERT INTO {name} ({', '.join(cols)}) VALUES ({', '.join(q(r[c]) for c in cols)});")
    open(out, "w").write("\n".join(lines) + "\n")
    print(json.dumps({"blog_posts": {"rows": len(blog), "sha256": table_hash(blog, "slug")},
                      "project_overrides": {"rows": len(proj), "sha256": table_hash(proj, "id")}}, indent=1))

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
