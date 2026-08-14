"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import PostCard from "@/components/PostCard";
import type { PostSummary } from "@/lib/posts";

const DEFAULT_PAGE_SIZE = 6;

interface InfinitePostListProps {
  posts: PostSummary[];
  pageSize?: number;
}

function revealNewItems() {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const items = Array.from(
    document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-revealed)"),
  );

  if (reducedMotion.matches) {
    items.forEach((item) => item.classList.add("is-revealed"));
    return;
  }

  if (!("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-revealed"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.01 },
  );

  items.forEach((item) => {
    const rect = item.getBoundingClientRect();
    const inView = rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
    if (inView) {
      item.classList.add("is-revealed");
    } else {
      observer.observe(item);
    }
  });
}

export default function InfinitePostList({
  posts,
  pageSize = DEFAULT_PAGE_SIZE,
}: InfinitePostListProps) {
  const [visibleCount, setVisibleCount] = useState(
    Math.min(pageSize, posts.length),
  );
  const sentinelRef = useRef<HTMLDivElement>(null);
  const hasMore = visibleCount < posts.length;
  const visiblePosts = posts.slice(0, visibleCount);

  const loadMore = useCallback(() => {
    setVisibleCount((current) => Math.min(current + pageSize, posts.length));
  }, [pageSize, posts.length]);

  useEffect(() => {
    setVisibleCount(Math.min(pageSize, posts.length));
  }, [posts, pageSize]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "240px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  useEffect(() => {
    requestAnimationFrame(revealNewItems);
  }, [visibleCount]);

  if (posts.length === 0) {
    return null;
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visiblePosts.map((post, index) => (
          <PostCard
            key={post.slug}
            post={post}
            revealDelay={(index % 3) * 90}
          />
        ))}
      </div>

      {hasMore && (
        <div
          ref={sentinelRef}
          className="flex items-center justify-center py-10"
          aria-hidden
        >
          <span className="font-sans text-sm text-ink-soft dark:text-gray-500">
            加载更多…
          </span>
        </div>
      )}

      {!hasMore && posts.length > pageSize && (
        <p className="py-8 text-center font-sans text-sm text-ink-soft dark:text-gray-500">
          已展示全部 {posts.length} 篇手记
        </p>
      )}
    </>
  );
}
