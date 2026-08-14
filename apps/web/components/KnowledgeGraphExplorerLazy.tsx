"use client";

import dynamic from "next/dynamic";

/** 知识图谱组件较大（~24KB 源码 + 交互逻辑），按需拆包懒加载（FR-10.3） */
const KnowledgeGraphExplorer = dynamic(
  () => import("./KnowledgeGraphExplorer"),
  {
    ssr: false,
    loading: () => (
      <div className="editorial-card flex items-center justify-center py-16 font-sans text-sm text-ink-muted dark:text-gray-400">
        知识图谱加载中…
      </div>
    ),
  }
);

export default KnowledgeGraphExplorer;
