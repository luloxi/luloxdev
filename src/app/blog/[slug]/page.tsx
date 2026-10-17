import { notFound } from "next/navigation";
import { BlogPostView } from "@/components/views/blog-post-view";
import { isAdminRequest } from "@/lib/admin-request";
import { getPostBySlug, getPublishedPost } from "@/lib/blog";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  // Admin also opens drafts here (edited in place); visitors only published.
  const post = (await isAdminRequest())
    ? await getPostBySlug(slug, { includeDrafts: true })
    : await getPublishedPost(slug);
  if (!post) notFound();
  return <BlogPostView post={post} />;
}
