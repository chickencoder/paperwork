"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { ArticleFrontmatter } from "@/lib/blog/types";
import { ArticleCard } from "@/components/blog/article-card";
import { TagFilter } from "@/components/blog/tag-filter";

function BlogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [articles, setArticles] = useState<ArticleFrontmatter[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const activeTag = searchParams.get("tag");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/blog");
        const data = await res.json();
        setArticles(data.articles);
        setTags(data.tags);
      } catch (error) {
        console.error("Failed to fetch blog data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleTagChange = (tag: string | null) => {
    if (tag) {
      router.push(`/blog?tag=${tag}`);
    } else {
      router.push("/blog");
    }
  };

  const filteredArticles = activeTag
    ? articles.filter((article) => article.tags.includes(activeTag))
    : articles;

  return (
    <div className="pt-24 sm:pt-32 pb-16 sm:pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
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
        </motion.div>

        {/* Tag Filter */}
        {tags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mb-10"
          >
            <TagFilter
              tags={tags}
              activeTag={activeTag}
              onTagChange={handleTagChange}
            />
          </motion.div>
        )}

        {/* Articles Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-card rounded-xl border border-border overflow-hidden animate-pulse"
              >
                <div className="aspect-[16/9] bg-muted" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-6 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredArticles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-muted-foreground">
              {activeTag
                ? `No articles found with tag "${activeTag}".`
                : "No articles yet. Check back soon!"}
            </p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article, index) => (
              <ArticleCard key={article.slug} article={article} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BlogPageFallback() {
  return (
    <div className="pt-24 sm:pt-32 pb-16 sm:pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="mb-12">
          <div className="h-12 bg-muted rounded w-32 mb-4 animate-pulse" />
          <div className="h-6 bg-muted rounded w-96 animate-pulse" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-card rounded-xl border border-border overflow-hidden animate-pulse"
            >
              <div className="aspect-[16/9] bg-muted" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-muted rounded w-1/3" />
                <div className="h-6 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function BlogPage() {
  return (
    <Suspense fallback={<BlogPageFallback />}>
      <BlogContent />
    </Suspense>
  );
}
