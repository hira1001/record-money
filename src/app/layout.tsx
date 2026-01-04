import type { Metadata, Viewport } from "next";
import "./globals.css";

// Using system fonts as fallback to ensure reliable builds
// Google Fonts (Geist) will be used when available via CSS fallback
const fontConfig = {
  sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  mono: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace"
};

const geistSans = {
  variable: "--font-geist-sans",
  className: ""
};

const geistMono = {
  variable: "--font-geist-mono",
  className: ""
};

export const metadata: Metadata = {
  title: "RecordMoney - 入力は透明に、資産は鮮明に",
  description:
    "Zero Friction & Zero Cost. AIで自動入力、美しいダッシュボードで資産を可視化。",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RecordMoney",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ffffff",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
              --font-geist-sans: ${fontConfig.sans};
              --font-geist-mono: ${fontConfig.mono};
            }
          `
        }} />
      </head>
      <body className="font-sans antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
