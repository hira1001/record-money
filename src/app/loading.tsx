import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">読み込み中...</p>
      </div>
    </main>
  );
}

