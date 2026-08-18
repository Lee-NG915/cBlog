"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "仪表盘" },
  { href: "/posts", label: "文章" },
  { href: "/categories", label: "分类" },
  { href: "/collections", label: "专栏" },
  { href: "/publish", label: "发布" },
];

export default function AdminNav() {
  const pathname = usePathname() ?? "/";

  return (
    <nav className="space-y-1">
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`block rounded-md px-3 py-2 text-sm font-medium transition ${
              isActive
                ? "bg-emerald-600 text-white"
                : "text-slate-600 hover:bg-slate-200"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
