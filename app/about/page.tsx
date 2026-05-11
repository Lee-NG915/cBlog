export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-8 rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-[#242424]">
        <p className="text-sm font-medium text-primary-600 dark:text-primary-400">
          About
        </p>
        <h1 className="mt-2 text-4xl font-bold text-gray-950 dark:text-gray-50">
          关于我
        </h1>
      </header>
      <div className="prose max-w-none rounded-lg border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-[#242424]">
        <p>
          这里记录我的技术实践、学习过程和生活随记。文章会按“技术博客”“学习日志”“生活随记”三个方向组织，方便长期沉淀和回看。
        </p>
        <ul>
          <li>技术博客：工程实践、问题排查、架构取舍和工具链笔记。</li>
          <li>学习日志：阶段性学习记录、读书笔记和知识整理。</li>
          <li>生活随记：日常观察、旅行、兴趣和个人状态记录。</li>
        </ul>
      </div>
    </div>
  );
}
