import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { getAllArticles, getArticleBySlug } from "@/lib/blog/mdx";
import {
  ArticleHeader,
  ArticleHeroImage,
} from "@/components/blog/article-header";
import { ArticleSidebar } from "@/components/blog/article-sidebar";
import { mdxComponents } from "@/components/blog/mdx-components";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const articles = await getAllArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {
      title: "Article Not Found",
    };
  }

  return {
    title: article.title,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: article.author ? [article.author.name] : undefined,
      images: article.heroImage?.src
        ? [
            {
              url: article.heroImage.src,
              alt: article.heroImage.alt,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
      images: article.heroImage?.src ? [article.heroImage.src] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <article className="pt-16 pb-16 sm:pb-24 px-6 lg:px-12">
      {/* Hero Image - full width */}
      <div className="max-w-7xl mx-auto">
        <ArticleHeroImage heroImage={article.heroImage} />
      </div>

      {/* Content - narrower width */}
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-[1fr_280px] gap-16">
          {/* Main content */}
          <div className="min-w-0">
            <ArticleHeader {...article} />

            <MDXRemote
              source={article.content}
              components={mdxComponents}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkGfm],
                  rehypePlugins: [rehypeSlug],
                },
              }}
            />
          </div>

          {/* Sidebar */}
          <ArticleSidebar />
        </div>
      </div>
    </article>
  );
}
