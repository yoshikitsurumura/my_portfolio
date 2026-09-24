/**
 * CraneAI ポートフォリオ お問い合わせフォーム処理
 * 
 * 設定方法:
 * 1. config/gas_links.md の既存のお問い合わせ用プロジェクトを開く
 * 2. 既存のお問い合わせ処理をこのコードで置き換える（doPost を重複させない）
 * 3. 履歴を保存する場合はスクリプトプロパティ CONTACT_SPREADSHEET_ID に既存シートのIDを設定
 * 4. 実行ユーザーが自分、公開範囲が全員の既存ウェブアプリであることを確認
 * 5. 既存デプロイを新しいバージョンに更新して実行URLを維持する
 * 詳しい復旧・確認手順: scripts/gas/README.md
 */

function doPost(e) {
  let contact;
  try {
    contact = validateContact(e);
  } catch (error) {
    return contactResult(false, '入力内容を確認し、お名前・有効なメールアドレス・お問い合わせ内容を入力してください。');
  }

  const { name, email, message } = contact;
  const timestamp = new Date();
  // 記録先が未設定・権限切れでも、通知メールの送信は試みる。
  try {
    saveToSheet(timestamp, name, email, message);
  } catch (error) {
    console.error('Contact sheet write failed:', error);
  }

  try {
    sendNotificationEmail(timestamp, name, email, message);
  } catch (error) {
    console.error('Contact email send failed:', error);
    return contactResult(false, '通知メールを送信できませんでした。お手数ですが crane7112@gmail.com へ直接ご連絡ください。');
  }

  return contactResult(true, 'お問い合わせを送信しました。ご連絡ありがとうございます。');
}

function validateContact(e) {
  const params = (e && e.parameter) || {};
  const name = String(params.name || '').trim();
  const email = String(params.email || '').trim();
  const message = String(params.message || '').trim();
  if (!name || name.length > 200 || !message || message.length > 10000 ||
      email.length > 254 || !/^[^\s@<>,";]+@[^\s@<>,";]+\.[^\s@<>,";]+$/.test(email)) {
    throw new Error('Invalid contact fields');
  }
  return { name, email, message };
}

function escapeContactHtml(value) {
  return String(value).replace(/[&<>"']/g, function (char) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
  });
}

function contactResult(ok, message) {
  // GAS の iframe 内での自動リダイレクトに依存せず、結果と遷移リンクを表示する。
  const destination = ok ? 'pages/thanks.html' : '#contact';
  return HtmlService.createHtmlOutput(`
    <!doctype html>
    <html lang="ja"><head><meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>${ok ? '送信完了' : '送信できませんでした'} | CraneAI</title>
    </head><body style="font-family:sans-serif;max-width:600px;margin:48px auto;padding:24px;line-height:1.8">
      <h1>${ok ? '送信完了' : '送信できませんでした'}</h1>
      <p>${escapeContactHtml(message)}</p>
      <a target="_top" href="https://yoshikitsurumura.github.io/my_portfolio/${destination}">サイトへ戻る</a>
    </body></html>
  `);
}

/**
 * スプレッドシートに問い合わせを記録
 */
function saveToSheet(timestamp, name, email, message) {
  const sheetId = PropertiesService.getScriptProperties().getProperty('CONTACT_SPREADSHEET_ID');
  const ss = sheetId ? SpreadsheetApp.openById(sheetId) : SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error('Set CONTACT_SPREADSHEET_ID in Script Properties to enable contact history.');
  }
  let sheet = ss.getSheetByName('問い合わせ');
  
  // シートがなければ作成
  if (!sheet) {
    sheet = ss.insertSheet('問い合わせ');
    sheet.appendRow(['日時', 'お名前', 'メールアドレス', 'お問い合わせ内容', 'ステータス']);
    sheet.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#00f0ff');
  }
  
  // ユーザー入力を数式として評価させない。
  const textCell = value => /^[=+@-]/.test(value) ? "'" + value : value;
  sheet.appendRow([timestamp, textCell(name), textCell(email), textCell(message), '未対応']);
}

/**
 * 通知メールを送信
 */
function sendNotificationEmail(timestamp, name, email, message) {
  const recipient = 'crane7112@gmail.com'; // ★ 受信先メールアドレス
  
  const subject = '🚨【CraneAI】ホームページからお問い合わせがありました';
  
  const body = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 CraneAI ポートフォリオ お問い合わせ通知
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 受信日時: ${timestamp.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 お問い合わせ内容
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 お名前: ${name}

📧 メールアドレス: ${email}

💬 お問い合わせ内容:
────────────────────────────
${message}
────────────────────────────

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 次のアクション
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

このメールに返信するか、上記メールアドレスに直接連絡してください。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
※ このメールはCraneAIポートフォリオから自動送信されています
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

  // HTML版メール（見やすい）
  const htmlBody = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f1e; color: #fff; padding: 30px; border-radius: 10px;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #00f0ff;">
        <h1 style="color: #00f0ff; margin: 0;">🌐 CraneAI</h1>
        <p style="color: #888; margin: 10px 0 0;">ポートフォリオ お問い合わせ通知</p>
      </div>
      
      <div style="padding: 20px 0;">
        <p style="color: #888; font-size: 14px;">📅 受信日時: ${timestamp.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}</p>
      </div>
      
      <div style="background: #1a1a2e; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #00f0ff; margin-top: 0; font-size: 18px;">📋 お問い合わせ内容</h2>
        
        <table style="width: 100%; color: #fff;">
          <tr>
            <td style="padding: 10px 0; color: #888; width: 120px;">👤 お名前:</td>
            <td style="padding: 10px 0; font-weight: bold;">${escapeContactHtml(name)}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #888;">📧 メール:</td>
            <td style="padding: 10px 0;"><a href="mailto:${escapeContactHtml(email)}" style="color: #00f0ff;">${escapeContactHtml(email)}</a></td>
          </tr>
        </table>
        
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #333;">
          <p style="color: #888; margin-bottom: 10px;">💬 お問い合わせ内容:</p>
          <div style="background: #0f0f1e; padding: 15px; border-radius: 5px; line-height: 1.6;">
            ${escapeContactHtml(message).replace(/\n/g, '<br>')}
          </div>
        </div>
      </div>
      
      <div style="text-align: center; padding-top: 20px;">
        <a href="mailto:${escapeContactHtml(email)}" style="display: inline-block; background: #00f0ff; color: #0f0f1e; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          📩 返信する
        </a>
      </div>
      
      <div style="text-align: center; padding-top: 30px; border-top: 1px solid #333; margin-top: 30px;">
        <p style="color: #666; font-size: 12px;">
          このメールはCraneAIポートフォリオから自動送信されています
        </p>
      </div>
    </div>
  `;

  GmailApp.sendEmail(recipient, subject, body, {
    htmlBody: htmlBody,
    replyTo: email
  });
}

/**
 * テスト用関数（スクリプトエディタから実行して動作確認）
 */
function testDoPost() {
  const testEvent = {
    parameter: {
      name: 'テスト太郎',
      email: 'test@example.com',
      message: 'これはテストメッセージです。\n改行も含めてテストします。'
    }
  };
  const result = doPost(testEvent);
  if (!result.getContent().includes('<h1>送信完了</h1>')) {
    throw new Error('送信テスト失敗。実行ログを確認してください。');
  }
  console.log('メール送信処理が完了しました。受信箱への到着を確認してください。');
}
