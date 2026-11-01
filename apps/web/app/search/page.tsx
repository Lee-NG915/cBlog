import type { Metadata } from "next";
import PublicSearch, { type SearchEntry } from "@/components/PublicSearch";
import {
  getAllPosts,
  getAllCollections,
  getCollectionNotes,
} from "@/lib/content";
export const metadata: Metadata = {
  title: "搜索手记",
  description: "在公开文章和专栏中寻找关键词、主题与记录。",
  alternates: { canonical: "/search/" },
};
export default async function SearchPage() {
  const posts = await getAllPosts();
  const collections = await getAllCollections();
  const entries: SearchEntry[] = posts.map((p) => ({
    href: `/posts/${p.slug}`,
    title: p.title,
    excerpt: p.excerpt || "",
    group: p.category,
    tags: p.tags,
  }));
  for (const c of collections)
    for (const n of await getCollectionNotes(c.slug))
      entries.push({
        href: `/${c.slug}/${n.slug}`,
        title: n.title,
        excerpt: n.excerpt || "",
        group: c.name,
        tags: [],
      });
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <p className="editorial-label">翻翻这间小书房</p>
        <h1 className="page-title mt-3">搜索手记</h1>
        <p className="mt-4 leading-7 text-ink-muted dark:text-gray-300">
          从文章和专栏里，找到想回看的那一篇。
        </p>
      </header>
      <PublicSearch entries={entries} />
    </div>
  );
}
