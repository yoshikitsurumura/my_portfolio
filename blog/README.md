# CraneAI ブログ管理システム

## 概要
ポートフォリオサイトにブログ機能を追加しました。管理画面から記事を作成・管理でき、LocalStorageで保存されます。

## ファイル構成
```
blog/
├── admin.html          # ブログ管理画面
└── README.md          # このファイル
```

## 使い方

### 1. サーバー起動
```bash
cd AI/my_portfolio
python -m http.server 8000
```

### 2. 管理画面にアクセス
- URL: `http://localhost:8000/blog/admin.html`
- トップページまたはブログページのフッターにある「🔒 管理」リンクからもアクセス可能

### 3. 記事作成
1. 「新規作成」タブで記事情報を入力
   - タイトル
   - カテゴリ（AI、業務効率化、Web開発、チュートリアル、その他）
   - タグ（カンマ区切り）
   - 概要
   - 本文（HTML形式）
2. 「記事を保存」ボタンをクリック
3. LocalStorageに自動保存

### 4. 記事確認
- `http://localhost:8000/blog.html` で記事一覧を確認
- 管理画面で保存した記事が自動的に表示される

### 5. 記事管理
- 管理画面の「記事一覧」タブで保存済み記事を確認
- 削除ボタンで不要な記事を削除可能

## 機能

### ✅ 実装済み
- 記事の作成・保存
- 記事の一覧表示
- 記事の削除
- LocalStorageでのデータ永続化
- blog.htmlとの自動連動
- 管理画面へのアクセスリンク（フッター）

### 📝 今後の拡張案
- 記事の編集機能
- 画像アップロード
- マークダウンエディタ
- 記事のプレビュー機能
- JSONエクスポート/インポート
- カテゴリ・タグでのフィルタリング
- 検索機能

## 技術仕様

### データ保存
- **保存先**: ブラウザのLocalStorage
- **キー**: `craneai_blog_posts`
- **形式**: JSON配列

### データ構造
```javascript
{
  id: "タイムスタンプ",
  title: "記事タイトル",
  category: "カテゴリ",
  tags: ["タグ1", "タグ2"],
  summary: "記事の概要",
  content: "本文（HTML）",
  date: "YYYY-MM-DD",
  author: "鶴村佳輝"
}
```

## 注意事項

### LocalStorageの制限
- ブラウザごとに独立したデータ
- ブラウザのキャッシュをクリアするとデータが消える
- 容量制限: 約5-10MB

### 本番環境への移行
LocalStorageは開発・テスト用です。本番環境では以下を検討してください：
1. バックエンドAPI + データベース（PostgreSQL、MongoDB等）
2. Headless CMS（Contentful、Strapi等）
3. 静的サイトジェネレーター（Next.js、Gatsby等）

## トラブルシューティング

### 記事が表示されない
1. ブラウザのコンソール（F12）でエラーを確認
2. LocalStorageを確認: `localStorage.getItem('craneai_blog_posts')`
3. ブラウザをリロード（Ctrl+F5で強制リロード）

### サーバーが起動しない
```bash
# ポート8000が使用中の場合、別のポートを使用
python -m http.server 8080
```

### データが消えた
- LocalStorageはブラウザ依存のため、定期的にバックアップを推奨
- 管理画面でJSONエクスポート機能を追加予定

## 開発者向け

### カスタマイズ
`admin.html`の`<script>`タグ内でJavaScriptをカスタマイズ可能：
- `POSTS_KEY`: LocalStorageのキー名
- `getAllPosts()`: 記事取得
- `saveAllPosts()`: 記事保存

### スタイル変更
`admin.html`の`<style>`タグ内でCSSをカスタマイズ可能

---

**作成日**: 2025年11月3日  
**作成者**: Kiro AI Assistant  
**バージョン**: 1.0.0
