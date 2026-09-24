# CraneAI お問い合わせ管理

## 現在の方式：FormSubmit

2026-09-24 に index.html のお問い合わせフォームを GAS から FormSubmit に切り替えました。

- 送信先: `https://formsubmit.co/crane7112@gmail.com`
- 受信先: `crane7112@gmail.com`
- 件名: `【CraneAI】ホームページからのお問い合わせ`
- メール表示: table
- 送信後: https://yoshikitsurumura.github.io/my_portfolio/pages/thanks.html
- 履歴管理: 受信メール。スプレッドシートへの新規記録は行いません。
- FormSubmit 標準の reCAPTCHA は有効のままです。

### 初回有効化と確認

1. 公開サイトのフォームからテスト送信する。
2. 受信先に届く FormSubmit の確認メールからフォームを有効化する（迷惑メールも確認）。
3. 有効化後にフォームから再度送信し、名前・メールアドレス・本文が届くことを確認する。

確認メールとテスト問い合わせの受信が確認できるまで、メール到着の検証は完了ではありません。

参考: https://formsubmit.co/ / https://formsubmit.co/help

## 旧お問い合わせ用GAS（参照用）

公開フォームからは使用しません。既存のGASデプロイやシートの履歴は削除していません。
- 編集: https://script.google.com/home/projects/1sAIhBgMLlva2ZaAGQkS7kEIgZw6CEC2qveMN5KfIbYLtGr2W1aWCe3ed/edit?hl=ja
- 旧実行URL: https://script.google.com/macros/s/AKfycbxQHIMPXTk3biGle8Rqv5mNddmekbh2B7ZznxPdlyCGXagtW826fec384r1ggfdG1s_Rw/exec
