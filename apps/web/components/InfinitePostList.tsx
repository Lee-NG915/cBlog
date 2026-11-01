"use client";
import { useState } from "react";
import PostCard from "@/components/PostCard";
import type { PostSummary } from "@/lib/content";
export default function InfinitePostList({
  posts,
  pageSize = 9,
}: {
  posts: PostSummary[];
  pageSize?: number;
}) {
  const [count, setCount] = useState(pageSize);
  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.slice(0, count).map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
      <div className="flex flex-col items-center gap-4 py-8">
        <p role="status" className="text-sm text-ink-muted dark:text-gray-300">
          已展示 {Math.min(count, posts.length)} / {posts.length} 篇手记
        </p>
        {count < posts.length && (
          <button
            className="min-h-11 rounded-full border border-line-light bg-surface-light px-6 py-3 text-sm font-medium dark:border-line-dark dark:bg-surface-dark"
            onClick={() => setCount((n) => n + pageSize)}
          >
            再看 {Math.min(pageSize, posts.length - count)} 篇
          </button>
        )}
      </div>
    </>
  );
}
