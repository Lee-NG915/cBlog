import Link from "next/link";

interface BackButtonProps {
  href: string;
  label: string;
}

export default function BackButton({ href, label }: BackButtonProps) {
  return (
    <div className="mb-6">
      <Link
        href={href}
        className="group inline-flex items-center space-x-2 rounded-full border border-line-light bg-surface-light px-4 py-2 font-sans text-sm font-semibold text-ink-muted shadow-editorial-sm transition-all duration-300 hover:border-primary-200 hover:text-primary-800 dark:border-line-dark dark:bg-surface-dark dark:text-gray-300 dark:hover:border-primary-800 dark:hover:text-primary-200"
      >
        <svg
          className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform duration-200"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M15 19l-7-7 7-7" />
        </svg>
        <span>{label}</span>
      </Link>
    </div>
  );
}
