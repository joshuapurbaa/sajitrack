"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingCart, Wrench, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { ModeToggle } from "@/components/mode-toggle";

export function DesktopNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const links = [
    { href: "/inventory", label: t.nav.pantry, icon: Home },


    { href: "/tools", label: t.nav.tools, icon: Wrench },
    { href: "/ai-chef", label: t.nav.ai_chef, icon: Bot },
    { href: "/profile", label: t.nav.profile, icon: User },
  ];

  return (
    <nav className="hidden md:flex w-64 flex-col border-r bg-background h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-6 flex justify-between items-center">
        <h1 className="text-xl font-bold">Saji Tracker</h1>
        <ModeToggle />
      </div>
      <div className="flex-1 px-4 space-y-2">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
