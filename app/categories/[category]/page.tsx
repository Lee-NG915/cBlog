import PostCard from "@/components/PostCard";
import BackButton from "@/components/BackButton";
import { getPostsByCategory, getAllCategories } from "@/lib/posts";
import { notFound } from "next/navigation";

interface CategoryPageProps {
  params: {
    category: string;
  };
}

export async function generateStaticParams() {
  const categories = getAllCategories();
  return categories.map((category) => ({
    category: encodeURIComponent(category.name),
  }));
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const category = decodeURIComponent(params.category);
  const posts = getPostsByCategory(category);
  const allCategories = getAllCategories();

  // 检查分类是否存在
  if (!allCategories.find((c) => c.name === category)) {
    notFound();
  }

  return (
    <>
      <BackButton href="/categories" label="返回分类" />
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900 dark:text-gray-100">
        {category}
      </h1>

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              该分类下还没有文章
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
    </>
  );
}
