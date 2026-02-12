
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingCart, DollarSign, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  const links = [
    { href: "/inventory", label: "Pantry", icon: Home },
    { href: "/grocery-list", label: "Shop", icon: ShoppingCart },
    { href: "/expenses", label: "Expenses", icon: DollarSign },
    { href: "/ai-chef", label: "AI Chef", icon: Bot },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-background p-2 pb-safe">
      <div className="flex justify-around items-center">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center w-full py-2 text-xs transition-colors",
                isActive
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              <Icon className="h-6 w-6 mb-1" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
