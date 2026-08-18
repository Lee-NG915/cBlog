export default function DraftBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block shrink-0 rounded-full border border-amber-300/80 bg-amber-50 px-2.5 py-0.5 font-sans text-xs font-medium text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/50 dark:text-amber-200 ${className}`.trim()}
    >
      草稿
    </span>
  );
}
