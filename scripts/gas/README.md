# お問い合わせGASの復旧

## 確認できたことと未確認のこと

GitHub の既存コードは、シート記録 → メール送信の順で同じ try/catch に入っていました。
シートが見つからない、保存権限がない等の例外が発生するとメール送信に到達しません。
ただし、本番GASのコード・実行ログ・認可状態は未確認です。今回の障害原因がこの不具合であるとはまだ断定できません。

## 変更内容

- シートの保存失敗をログに記録し、メール送信は独立して試みる。
- スクリプトプロパティ `CONTACT_SPREADSHEET_ID` があれば `openById` で既存シートを開く。未設定時は従来の紐づきシートを使う。
- 通知先は既存の `crane7112@gmail.com` のまま。返信先にフォームのメールアドレスを設定。
- 必須入力の検証、HTMLエスケープ、シートへの数式入力防止。
- メール送信に失敗した場合はエラー画面と直接連絡先を表示。内部例外は公開しない。
- GASのiframe内での自動リダイレクトをやめ、結果と明示的なサイトへのリンクを表示。

メール送信の成功はGmailAppが正常終了したことを指し、受信箱への到着保証ではありません。
シート障害時は履歴が残らない場合があります。実行ログを確認してください。
送信上限やGASの認可切れはコードだけでは直せません。自動再送は行いません。

## 本番への反映

1. [既存GASプロジェクト](https://script.google.com/home/projects/1sAIhBgMLlva2ZaAGQkS7kEIgZw6CEC2qveMN5KfIbYLtGr2W1aWCe3ed/edit?hl=ja) を開く。
2. 現在のコードと「実行数」のエラーを確認し、コードを控える。本リポジトリと異なる場合は差分を確認してから反映する。
3. お問い合わせ処理を `gas_contact_form.js` で置き換えて保存する。同じプロジェクトに `doPost` を重複して追加しない。`gas_script.js` はブログ取得用なので置き換え対象外。
4. シート履歴を使う場合は、プロジェクトの設定 → スクリプトプロパティに `CONTACT_SPREADSHEET_ID` を設定する。値は既存の問い合わせ管理スプレッドシートのURLの `/d/` と `/edit` の間のID。所有者がシートにアクセスできることも確認する。
5. メール送信を伴うテストを行うときだけ `testDoPost` をエディタから実行する。必要なら所有者が権限を承認し、通知先への到着と実行ログを確認する。シート保存エラーがあるときはシート設定を直す。
6. 「デプロイ」→「デプロイを管理」からフォームのactionと同じ実行URLの既存デプロイを選ぶ。編集 → バージョン「新バージョン」で更新する。実行ユーザー「自分」、アクセス「全員」が意図した既存設定か確認する。新しいデプロイを増やす必要はない。
7. 公開ページのフォームからテストし、送信結果、通知メール、シート履歴を確認する。実行URLを維持した場合、HTMLの変更は不要。

GitHubへのコミットやPRマージだけではGAS本番に反映されません。

## ローカル回帰テスト

```sh
node --test scripts/gas/gas_contact_form.test.cjs
```

Googleサービスを模したテストです。実際のGoogle認証、デプロイの公開範囲、メール到着は本番で別途確認が必要です。

## 参考

- [SpreadsheetApp](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app#getActiveSpreadsheet())
- [GAS HTMLサービスの制約](https://developers.google.com/apps-script/guides/html/restrictions)
- [ウェブアプリのデプロイ](https://developers.google.com/apps-script/guides/web)
