import { ReactNode } from "react";

interface ShowcaseSectionProps {
  id: string;
  label: string;
  title: string;
  description?: string;
  children: ReactNode;
}

export function ShowcasePanel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`editorial-card overflow-hidden p-5 sm:p-7 ${className}`.trim()}>
      {children}
    </div>
  );
}

export default function ShowcaseSection({
  id,
  label,
  title,
  description,
  children,
}: ShowcaseSectionProps) {
  return (
    <section id={id} className="scroll-mt-28 space-y-6" data-reveal>
      <div>
        <p className="editorial-label">{label}</p>
        <h2 className="mt-2 font-display text-3xl font-semibold tracking-normal text-ink dark:text-gray-50 sm:text-4xl">
          {title}
        </h2>
        {description && (
          <p className="mt-3 max-w-3xl font-sans text-sm leading-7 text-ink-muted dark:text-gray-400">
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}
