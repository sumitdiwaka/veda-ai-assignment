"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ClipboardList, BookOpen, Wrench } from "lucide-react";
import { clsx } from "clsx";

const tabs = [
  { label: "Home", href: "/", icon: Home },
  { label: "Assignments", href: "/assignments", icon: ClipboardList },
  { label: "Library", href: "/library", icon: BookOpen },
  { label: "AI Toolkit", href: "/toolkit", icon: Wrench },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-primary border-t border-zinc-800 flex items-center justify-around px-2 z-30 md:hidden">
      {tabs.map(({ label, href, icon: Icon }) => {
        const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-1 px-3 py-2"
          >
            <Icon
              size={20}
              className={clsx(isActive ? "text-white" : "text-zinc-500")}
            />
            <span
              className={clsx(
                "text-[10px] font-medium",
                isActive ? "text-white" : "text-zinc-500"
              )}
            >
              {label}
            </span>
            {isActive && (
              <span className="absolute bottom-1 w-8 h-0.5 bg-white rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}