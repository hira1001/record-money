"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home, BarChart3, ClipboardCheck } from "lucide-react";

const tabs = [
  {
    name: "ホーム",
    path: "/",
    icon: Home,
  },
  {
    name: "統計",
    path: "/stats",
    icon: BarChart3,
  },
  {
    name: "確認",
    path: "/review",
    icon: ClipboardCheck,
  },
];

export function BottomTabBar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
      <div className="mx-auto max-w-lg">
        <div className="bg-white/80 backdrop-blur-xl border-t border-border/50 px-4 pb-safe">
          <div className="flex items-center justify-around h-16">
            {tabs.map((tab) => {
              const active = isActive(tab.path);
              const Icon = tab.icon;

              return (
                <Link
                  key={tab.path}
                  href={tab.path}
                  className="relative flex flex-col items-center justify-center flex-1 h-full press-effect"
                >
                  <div className="relative">
                    {/* Active indicator */}
                    {active && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute -inset-3 bg-foreground/5 rounded-2xl"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}

                    {/* Icon */}
                    <div className="relative">
                      <Icon
                        className={`w-6 h-6 transition-colors ${
                          active
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Label */}
                  <span
                    className={`text-xs mt-1 transition-colors font-medium ${
                      active ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {tab.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
