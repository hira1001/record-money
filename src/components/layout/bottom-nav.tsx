"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BarChart3, CheckCircle, Calendar } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { href: "/", icon: Home, label: "ホーム" },
  { href: "/stats", icon: BarChart3, label: "統計" },
  { href: "/review", icon: CheckCircle, label: "確認" },
  { href: "/transactions", icon: Calendar, label: "履歴" },
];

export function BottomNav() {
  const pathname = usePathname();

  // ログインページでは非表示
  if (pathname === "/login") {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border safe-bottom">
      <div className="max-w-lg mx-auto px-4">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center justify-center w-16 h-full"
              >
                <motion.div
                  className={`flex flex-col items-center gap-1 ${
                    isActive ? "text-foreground" : "text-muted-foreground"
                  }`}
                  whileTap={{ scale: 0.9 }}
                >
                  <div className="relative">
                    <Icon className="w-5 h-5" />
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-foreground"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </div>
                  <span className="text-[10px] font-medium">{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
