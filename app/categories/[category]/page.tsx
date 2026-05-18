import type { Metadata } from "next";
import PostCard from "@/components/PostCard";
import BackButton from "@/components/BackButton";
import { getPostsByCategory, getAllCategories } from "@/lib/posts";
import { notFound } from "next/navigation";
import { siteConfig } from "@/lib/site";

interface CategoryPageProps {
  params: {
    category: string;
  };
}

export async function generateStaticParams() {
  const categories = getAllCategories();
  return categories.map((category) => ({
    category: category.slug,
  }));
}

export function generateMetadata({ params }: CategoryPageProps): Metadata {
  const allCategories = getAllCategories();
  const currentCategory = allCategories.find((c) => c.slug === params.category);

  if (!currentCategory) {
    return {
      title: "阅读路径不存在",
    };
  }

  const canonicalPath = `/categories/${currentCategory.slug}/`;
  const title = currentCategory.name;
  const description = currentCategory.description;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      type: "website",
      url: canonicalPath,
      siteName: siteConfig.title,
      title: `${title} | ${siteConfig.title}`,
      description,
      locale: "zh_CN",
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteConfig.title}`,
      description,
      images: [siteConfig.ogImage],
    },
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const category = params.category;
  const allCategories = getAllCategories();
  const currentCategory = allCategories.find((c) => c.slug === category);

  if (!currentCategory) {
    notFound();
  }

  const posts = getPostsByCategory(currentCategory.slug);

  return (
    <div className="space-y-8">
      <BackButton href="/categories" label="返回路径" />
      <header>
        <p className="editorial-label">
          阅读路径
        </p>
        <h1 className="mt-3 font-display text-5xl font-bold tracking-normal text-ink dark:text-gray-50 sm:text-6xl">
          {currentCategory.name}
        </h1>
        <p className="mt-4 font-sans text-ink-muted dark:text-gray-300">
          共 {posts.length} 篇手记
        </p>
      </header>

        {posts.length === 0 ? (
          <div className="editorial-card py-16 text-center">
            <p className="font-sans text-lg text-ink-muted dark:text-gray-400">
              这个路径下还没有文章。
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
    </div>
  );
}
