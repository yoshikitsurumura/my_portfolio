/**
 * CraneAI ポートフォリオ お問い合わせフォーム処理
 * 
 * 設定方法:
 * 1. Google Apps Script (https://script.google.com) で新規プロジェクト作成
 * 2. このコードを貼り付け
 * 3. 「デプロイ」→「新しいデプロイ」→「ウェブアプリ」を選択
 * 4. 「アクセスできるユーザー」を「全員」に設定
 * 5. 生成されたURLをindex.htmlのformのaction属性に設定
 */

function doPost(e) {
  try {
    const params = e.parameter;
    const name = params.name || '名前未入力';
    const email = params.email || 'メール未入力';
    const message = params.message || '内容未入力';
    const timestamp = new Date();
    
    // 1. スプレッドシートに記録（履歴管理用）
    saveToSheet(timestamp, name, email, message);
    
    // 2. 自分宛てに通知メール送信
    sendNotificationEmail(timestamp, name, email, message);
    
    // 3. サンクスページへリダイレクト
    return HtmlService.createHtmlOutput(`
      <html>
        <head>
          <meta http-equiv="refresh" content="0;url=https://yoshikitsurumura.github.io/my_portfolio/pages/thanks.html">
        </head>
        <body>
          <p>リダイレクト中...</p>
          <script>window.location.href='https://yoshikitsurumura.github.io/my_portfolio/pages/thanks.html';</script>
        </body>
      </html>
    `);
    
  } catch (error) {
    console.error('Error:', error);
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * スプレッドシートに問い合わせを記録
 */
function saveToSheet(timestamp, name, email, message) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('問い合わせ');
  
  // シートがなければ作成
  if (!sheet) {
    sheet = ss.insertSheet('問い合わせ');
    sheet.appendRow(['日時', 'お名前', 'メールアドレス', 'お問い合わせ内容', 'ステータス']);
    sheet.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#00f0ff');
  }
  
  sheet.appendRow([timestamp, name, email, message, '未対応']);
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

スプレッドシートで管理:
https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit

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
            <td style="padding: 10px 0; font-weight: bold;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #888;">📧 メール:</td>
            <td style="padding: 10px 0;"><a href="mailto:${email}" style="color: #00f0ff;">${email}</a></td>
          </tr>
        </table>
        
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #333;">
          <p style="color: #888; margin-bottom: 10px;">💬 お問い合わせ内容:</p>
          <div style="background: #0f0f1e; padding: 15px; border-radius: 5px; line-height: 1.6;">
            ${message.replace(/\n/g, '<br>')}
          </div>
        </div>
      </div>
      
      <div style="text-align: center; padding-top: 20px;">
        <a href="mailto:${email}" style="display: inline-block; background: #00f0ff; color: #0f0f1e; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
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
    htmlBody: htmlBody
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
  doPost(testEvent);
  console.log('テスト完了！メールとスプレッドシートを確認してください。');
}
