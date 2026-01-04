"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wallet } from "lucide-react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-action/10 via-transparent to-income/5 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="glass-card p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <motion.div
              className="w-16 h-16 rounded-2xl bg-action/20 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
            >
              <Wallet className="w-8 h-8 text-action" />
            </motion.div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gradient mb-2">
              RecordMoney
            </h1>
            <p className="text-muted-foreground text-sm">
              入力は透明に、資産は鮮明に
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-8">
            {[
              "AIがレシートを自動読み取り",
              "銀行・カード通知を自動記録",
              "美しいダッシュボードで資産を可視化",
            ].map((feature, index) => (
              <motion.div
                key={feature}
                className="flex items-center gap-3 text-sm text-muted-foreground"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-action" />
                {feature}
              </motion.div>
            ))}
          </div>

          {/* Login Button */}
          <Button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full h-12 bg-white hover:bg-white/90 text-zinc-900 font-medium"
          >
            {isLoading ? (
              <motion.div
                className="w-5 h-5 border-2 border-zinc-400 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Googleでログイン
              </>
            )}
          </Button>

          {/* Terms */}
          <p className="text-xs text-center text-muted-foreground mt-6">
            ログインすることで、
            <a href="#" className="text-action hover:underline">
              利用規約
            </a>
            と
            <a href="#" className="text-action hover:underline">
              プライバシーポリシー
            </a>
            に同意したものとみなされます。
          </p>
        </Card>
      </motion.div>
    </main>
  );
}
