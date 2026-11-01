import { ReactNode } from "react";

/**
 * 品牌页组件预览容器：禁用内部所有链接与可点击元素的跳转。
 */
export default function ShowcaseSandbox({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`showcase-sandbox ${className}`.trim()}
      {...({ inert: "" } as Record<string, string>)}
      aria-label="静态样式预览"
      data-showcase-preview
    >
      {children}
    </div>
  );
}
