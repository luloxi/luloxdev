import { BlogList } from "@/components/views/blog-list";
import type { BlogPost } from "@/content/blog/types";
import { getPublishedPosts } from "@/lib/blog";

// Read D1 on every request: edits in /rothko are visible immediately.
export const dynamic = "force-dynamic";

export default async function BlogPage() {
  let posts: BlogPost[] = [];
  let error = false;
  try {
    posts = await getPublishedPosts();
  } catch (err) {
    console.error("[blog] list", err);
    error = true;
  }
  return <BlogList posts={posts} error={error} />;
}
