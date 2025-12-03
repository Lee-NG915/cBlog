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
        className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#242424] border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2a2a2a] hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-300 group hover:shadow-sm"
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

