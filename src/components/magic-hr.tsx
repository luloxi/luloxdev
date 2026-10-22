/** The blog's glowing cyan divider ("magic" separator), shared by posts and forms. */
export function MagicHr({ className }: { className?: string }) {
  return <hr className={className ? `blog-hr ${className}` : "blog-hr"} />;
}
