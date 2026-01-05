"use client";

import { useState } from "react";
import { User, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/lib/hooks/use-auth";
import { useRouter } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export function UserMenu() {
  const { user, signOut, isAuthenticated } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  if (!isAuthenticated) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-9 px-3"
        onClick={() => router.push("/login")}
      >
        ログイン
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center press-effect hover:bg-secondary/80 transition-colors">
          {user?.user_metadata?.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt="avatar"
              className="w-9 h-9 rounded-full"
            />
          ) : (
            <User className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="end">
        <div className="px-2 py-1.5 mb-2 border-b">
          <p className="text-sm font-medium truncate">
            {user?.user_metadata?.full_name || user?.email || "ユーザー"}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {user?.email}
          </p>
        </div>
        <div className="space-y-1">
          <button
            className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-secondary transition-colors"
            onClick={() => {
              setOpen(false);
              // 将来的に設定ページへ遷移
            }}
          >
            <Settings className="w-4 h-4" />
            設定
          </button>
          <button
            className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-destructive/10 text-destructive transition-colors"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4" />
            ログアウト
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
