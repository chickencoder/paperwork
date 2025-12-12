import { NextResponse } from "next/server";
import { getAllArticles, getAllTags } from "@/lib/blog/mdx";

export async function GET() {
  const [articles, tags] = await Promise.all([getAllArticles(), getAllTags()]);

  return NextResponse.json({
    articles,
    tags,
  });
}
