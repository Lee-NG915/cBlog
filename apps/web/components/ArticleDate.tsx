import { publicationDate } from "@/lib/publication-date";

export default function ArticleDate({ value, edited = false }: { value?: string | null; edited?: boolean }) {
  if (!value || !publicationDate(value)) return null;
  const time = <time dateTime={value} title="UTC+8" data-article-date={edited ? "edited" : "published"}>
    {edited ? "编辑于" : "发布于"} {publicationDate(value, true)}
  </time>;
  return edited ? <footer className="border-t border-line-light pt-5 font-sans text-sm text-ink-muted dark:border-line-dark dark:text-gray-400">{time}</footer>
    : <span className="font-sans text-sm text-ink-soft dark:text-gray-400">{time}</span>;
}
