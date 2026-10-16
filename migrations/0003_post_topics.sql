-- Per-post opt-in research topic explanations (JSON array of topic ids).
ALTER TABLE blog_posts ADD COLUMN topics TEXT NOT NULL DEFAULT '[]';
