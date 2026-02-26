"use client";

import Giscus from "@giscus/react";
import { useTheme } from "./ThemeProvider";

interface GiscusCommentsProps {
  slug: string;
}

export default function GiscusComments({ slug }: GiscusCommentsProps) {
  const { theme } = useTheme();

  return (
    <section className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        评论
      </h2>
      <Giscus
        id="comments"
        repo="Lee-NG915/cBlog"
        repoId=""
        category="General"
        categoryId=""
        mapping="pathname"
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme={theme === "dark" ? "dark_tritanopia" : "light"}
        lang="zh-CN"
        loading="lazy"
      />
      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
        使用 GitHub 账号登录后即可发表评论。评论数据存储在本仓库的 GitHub
        Discussions 中。
        <br />
        仓库拥有者需要在{" "}
        <a
          href="https://giscus.app/zh-CN"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-600 dark:text-primary-400 hover:underline"
        >
          giscus.app
        </a>{" "}
        完成配置并填入正确的 <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-xs">repoId</code> 和{" "}
        <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-xs">categoryId</code>。
      </p>
    </section>
  );
}
