export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-8 border-b border-line-light pb-8 dark:border-line-dark">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-700 dark:text-primary-300">
          About
        </p>
        <h1 className="mt-3 text-5xl font-bold tracking-tight text-ink dark:text-gray-50">
          关于我
        </h1>
      </header>
      <div className="prose rounded-3xl border border-line-light bg-surface-light p-8 dark:border-line-dark dark:bg-surface-dark">
        <p>
          这里记录我的产品分析、工程实践和生活观察。文章会按“产品分析”“工程实践”“生活观察”三个方向组织，方便长期沉淀和回看。
        </p>
        <ul>
          <li>产品分析：从数据、用户行为和业务目标中形成产品判断。</li>
          <li>工程实践：前端工程、部署流程、工具链和架构取舍。</li>
          <li>生活观察：非工作语境下的长期观察、阅读和个人状态。</li>
        </ul>
      </div>
    </div>
  );
}
