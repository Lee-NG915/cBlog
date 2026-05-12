export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-8 border-b border-line-light pb-8 dark:border-line-dark">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-700 dark:text-primary-300">
          About
        </p>
        <h1 className="mt-3 font-display text-5xl font-bold tracking-[-0.04em] text-ink dark:text-gray-50 sm:text-6xl">
          About
        </h1>
      </header>
      <div className="prose rounded-3xl border border-line-light bg-surface-light p-8 dark:border-line-dark dark:bg-surface-dark">
        <p>
          This is a personal space for product thinking, engineering notes, and long-term learning.
        </p>
        <ul>
          <li>Product: product judgment shaped by data, user behavior, and business goals.</li>
          <li>Engineering: frontend engineering, deployment notes, tooling, and architecture tradeoffs.</li>
          <li>Life: personal observations, reading notes, interests, and life outside work.</li>
        </ul>
      </div>
    </div>
  );
}
