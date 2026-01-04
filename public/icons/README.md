# PWAアイコンファイル

このディレクトリには以下のPWAアイコンファイルが必要です：

- `icon-192.png` - 192x192ピクセル
- `icon-512.png` - 512x512ピクセル

## アイコンの作成方法

1. デザインツール（Figma、Adobe Illustrator等）でアイコンをデザイン
2. 以下のサイズでエクスポート：
   - 192x192px (icon-192.png)
   - 512x512px (icon-512.png)
3. このディレクトリに配置

## アイコンデザインの要件

- RecordMoneyのブランドカラーを使用
- シンプルで認識しやすいデザイン
- 背景は透明または単色
- マスカブルアイコン対応（安全領域を考慮）

## 一時的な解決策

開発中は、以下のコマンドでプレースホルダーアイコンを生成できます：

```bash
# ImageMagickを使用（インストールが必要）
convert -size 192x192 xc:#0f172a -pointsize 80 -fill white -gravity center -annotate +0+0 "RM" public/icons/icon-192.png
convert -size 512x512 xc:#0f172a -pointsize 200 -fill white -gravity center -annotate +0+0 "RM" public/icons/icon-512.png
```

または、オンラインツール（https://realfavicongenerator.net/ など）を使用してアイコンを生成することもできます。

