"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          エラーが発生しました
        </h1>
        <p className="text-muted-foreground mb-6">
          申し訳ございません。予期しないエラーが発生しました。
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} variant="default">
            再試行
          </Button>
          <Button asChild variant="outline">
            <Link href="/">ホームに戻る</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

