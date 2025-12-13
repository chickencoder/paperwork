export interface ArticleFrontmatter {
  title: string;
  slug: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  author: {
    name: string;
    avatar?: string;
  };
  heroImage: {
    src: string;
    alt: string;
  };
  tags: string[];
  featured?: boolean;
  draft?: boolean;
}

export interface Article extends ArticleFrontmatter {
  content: string;
  headings: TableOfContentsItem[];
  readingTime: number;
}

export interface TableOfContentsItem {
  id: string;
  text: string;
  level: number;
}
