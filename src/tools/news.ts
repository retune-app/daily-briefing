import type { NewsArticle, NewsResponse } from "../types.js";

const NEWSDATA_BASE = "https://newsdata.io/api/1/latest";

interface NewsDataItem {
  title?: string;
  description?: string;
  content?: string;
  source_name?: string;
  source_id?: string;
  link?: string;
  pubDate?: string;
  category?: string[];
}

interface NewsDataResponse {
  status: string;
  totalResults?: number;
  results?: NewsDataItem[] | { message?: string };
}

export async function getTopNews(
  apiKey: string,
  options: { category?: string; country?: string; count?: number } = {}
): Promise<NewsResponse> {
  const { category = "top", country = "us", count = 5 } = options;

  const params = new URLSearchParams({
    apikey: apiKey,
    country,
    category,
    language: "en",
    size: Math.min(count, 10).toString(),
  });

  const url = `${NEWSDATA_BASE}?${params}`;
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`NewsData API failed (${res.status}): ${body}`);
  }

  const data = await res.json() as NewsDataResponse;

  if (data.status !== "success") {
    const msg = Array.isArray(data.results) ? "Unknown error" : (data.results as { message?: string })?.message || "Unknown error";
    throw new Error(`NewsData API error: ${msg}`);
  }

  const rawResults = Array.isArray(data.results) ? data.results : [];

  const articles: NewsArticle[] = rawResults.map((item: NewsDataItem) => ({
    title: item.title || "Untitled",
    description: item.description || item.content?.slice(0, 200) || "",
    source: item.source_name || item.source_id || "Unknown",
    url: item.link || "",
    publishedAt: item.pubDate || "",
    category: item.category?.[0] || category,
  }));

  return {
    articles,
    totalResults: data.totalResults || articles.length,
    query: category,
  };
}

export function formatNewsResponse(news: NewsResponse): string {
  if (news.articles.length === 0) {
    return `No news articles found for "${news.query}".`;
  }

  const lines = [`Top ${news.articles.length} news articles (${news.query})`, ``];

  for (let i = 0; i < news.articles.length; i++) {
    const a = news.articles[i];
    lines.push(`${i + 1}. ${a.title}`);
    if (a.description) lines.push(`   ${a.description.slice(0, 150)}`);
    lines.push(`   Source: ${a.source} | ${a.publishedAt}`);
    if (a.url) lines.push(`   ${a.url}`);
    lines.push(``);
  }

  return lines.join("\n");
}
