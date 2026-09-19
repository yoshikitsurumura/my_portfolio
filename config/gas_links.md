# CraneAI GAS管理リンク

## お問い合わせフォーム用GAS
- **編集**: https://script.google.com/home/projects/1sAIhBgMLlva2ZaAGQkS7kEIgZw6CEC2qveMN5KfIbYLtGr2W1aWCe3ed/edit?hl=ja
- **実行URL**: https://script.google.com/macros/s/AKfycbxQHIMPXTk3biGle8Rqv5mNddmekbh2B7ZznxPdlyCGXagtW826fec384r1ggfdG1s_Rw/exec
- **ソース**: `scripts/gas/gas_contact_form.js`
- **手順書**: `scripts/gas/README.md`

### 疎通確認
上の実行URLをブラウザで開いて `{"status":"ok", ...}` が表示されればデプロイは正常。
表示されない場合は `scripts/gas/README.md` の「メールが届かなくなったときの切り分け」を参照。

### コードを直したら必ずデプロイし直す
保存しただけでは `/exec` に反映されない。
**デプロイ → デプロイを管理 → 編集（鉛筆）→ バージョン: 新バージョン → デプロイ**

## ブログ記事取得用GAS
- **実行URL**: https://script.google.com/macros/s/AKfycbyU4hX9YRcEt-U5jTZP7nGOc7aw5t0mbRjdCuq6Swik1hOYW6Ad195DbkVWJ7Ag_nzp/exec
- **ソース**: `scripts/gas/gas_script.js`
- **利用箇所**: `pages/article.html`

## 更新履歴
- 2024-12-14: 通知メールを改善（絵文字付き件名、整形本文）
- 2024-12-14: サンクスページリダイレクト修正
- 2026-09-19: 通知メールが届かない不具合を修正
  - シート保存の失敗でメール送信が止まらないよう処理順と例外処理を分離
  - `GmailApp` → `MailApp` に変更、`replyTo` で直接返信可能に
  - 受信内容のHTMLエスケープを追加
  - サンクスページへの遷移をサイト側（`assets/js/contact-form.js`）に移動
  - 送信元ページを通知メールとシートに記録
