import { BlogList } from "@/components/views/blog-list";
import type { BlogPost } from "@/content/blog/types";
import { isAdminRequest } from "@/lib/admin-request";
import { getAllPosts, getPublishedPosts } from "@/lib/blog";

// Read D1 on every request: edits made on the blog are visible immediately.
export const dynamic = "force-dynamic";

export default async function BlogPage() {
  let posts: BlogPost[] = [];
  let error = false;
  try {
    // Admin sees drafts too (muted, "Borrador"); visitors only published.
    posts = (await isAdminRequest()) ? await getAllPosts({ includeDrafts: true }) : await getPublishedPosts();
  } catch (err) {
    console.error("[blog] list", err);
    error = true;
  }
  return <BlogList posts={posts} error={error} />;
}
