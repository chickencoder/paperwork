import type { Metadata } from "next";
import { getAllArticles, getAllTags } from "@/lib/blog/mdx";
import { ArticleCard } from "@/components/blog/article-card";
import { TagFilter } from "@/components/blog/tag-filter";

export const metadata: Metadata = {
  title: "Blog - PDF Tips & Tutorials | Paperwork",
  description:
    "Tips, tutorials, and insights about PDF editing, electronic signatures, and document management.",
};

interface BlogPageProps {
  searchParams: Promise<{ tag?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { tag: activeTag } = await searchParams;
  const [articles, tags] = await Promise.all([getAllArticles(), getAllTags()]);

  const filteredArticles = activeTag
    ? articles.filter((article) => article.tags.includes(activeTag))
    : articles;

  return (
    <div className="pt-24 sm:pt-32 pb-16 sm:pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1
            className="text-4xl sm:text-5xl font-medium text-foreground mb-4 tracking-tight"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Blog
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Tips, tutorials, and insights about PDF editing, electronic
            signatures, and document management.
          </p>
        </div>

        {/* Tag Filter */}
        {tags.length > 0 && (
          <div className="mb-10">
            <TagFilter tags={tags} activeTag={activeTag ?? null} />
          </div>
        )}

        {/* Articles Grid */}
        {filteredArticles.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">
              {activeTag
                ? `No articles found with tag "${activeTag}".`
                : "No articles yet. Check back soon!"}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
